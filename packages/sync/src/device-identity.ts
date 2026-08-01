import { z } from "zod";

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const sha256HexSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{64}$/u)
  .transform((digest) => digest.toLowerCase());

export type Sha256Hex = (value: string) => Promise<string>;

/**
 * Dérive un UUIDv8 opaque et stable pour un couple installation/compte.
 * L'identifiant d'installation reste local et n'expose aucun lien inter-compte
 * au serveur. Le préfixe versionné évite toute réutilisation dans un autre but.
 */
export async function deriveAccountDeviceId(input: {
  readonly installationId: string;
  readonly userId: string;
  readonly sha256Hex: Sha256Hex;
}): Promise<string> {
  const installationId = canonicalUuidSchema.parse(input.installationId);
  const userId = canonicalUuidSchema.parse(input.userId);
  const digest = sha256HexSchema.parse(
    await input.sha256Hex(
      `thainaute/account-device/v1\u0000${installationId}\u0000${userId}`,
    ),
  );
  const bytes = Array.from({ length: 16 }, (_, index) =>
    Number.parseInt(digest.slice(index * 2, index * 2 + 2), 16),
  );

  const versionByte = bytes[6];
  const variantByte = bytes[8];
  if (versionByte === undefined || variantByte === undefined) {
    throw new Error("Le condensat SHA-256 est incomplet.");
  }
  bytes[6] = (versionByte & 0x0f) | 0x80;
  bytes[8] = (variantByte & 0x3f) | 0x80;

  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return canonicalUuidSchema.parse(
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
  );
}
