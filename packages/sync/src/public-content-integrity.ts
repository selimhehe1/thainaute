import {
  publicLessonResponseSchema,
  publicReleaseResponseSchema,
  type PublicLesson,
  type PublicLessonResponse,
  type PublicRelease,
  type PublicReleaseResponse,
} from "@thainaute/content/public";

const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/u;

export type PublicContentSha256Hex = (value: string) => Promise<string>;

export class PublicContentIntegrityError extends Error {
  public constructor() {
    super("L'integrite cryptographique du contenu public est invalide.");
    this.name = "PublicContentIntegrityError";
  }
}

function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Une valeur JSON numerique doit etre finie.");
    }
    return JSON.stringify(value);
  }

  if (typeof value === "string") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeJson(entry)).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Readonly<Record<string, unknown>>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(record[key])}`);
    return `{${entries.join(",")}}`;
  }

  throw new TypeError(
    "La valeur ne peut pas etre representee en JSON canonique.",
  );
}

function canonicalHashMaterial(namespace: string, value: unknown): string {
  return canonicalizeJson({ namespace, value });
}

/** Matiere exacte hachee par le serveur pour le DTO public d'une lecon. */
export function canonicalPublicLessonHashMaterial(
  lesson: PublicLesson,
): string {
  return canonicalHashMaterial("thainaute.public-lesson/v1", lesson);
}

/** Matiere exacte hachee par le serveur pour le manifeste public courant. */
export function canonicalPublicReleaseHashMaterial(
  release: PublicRelease,
): string {
  return canonicalHashMaterial("thainaute.public-release/v1", release);
}

async function verifyDigest(input: {
  readonly material: string;
  readonly expected: string;
  readonly sha256Hex: PublicContentSha256Hex;
}): Promise<void> {
  let actual: string;
  try {
    actual = await input.sha256Hex(input.material);
  } catch {
    throw new PublicContentIntegrityError();
  }
  if (!SHA256_HEX_PATTERN.test(actual) || actual !== input.expected) {
    throw new PublicContentIntegrityError();
  }
}

/** Valide le schema puis recalcule le hash du corps, y compris apres un 304. */
export async function verifyPublicLessonResponseIntegrity(
  input: unknown,
  sha256Hex: PublicContentSha256Hex,
): Promise<PublicLessonResponse> {
  let response: PublicLessonResponse;
  try {
    response = publicLessonResponseSchema.parse(input);
    await verifyDigest({
      material: canonicalPublicLessonHashMaterial(response.lesson),
      expected: response.contentSha256,
      sha256Hex,
    });
  } catch (error) {
    if (error instanceof PublicContentIntegrityError) throw error;
    throw new PublicContentIntegrityError();
  }
  return response;
}

/** Valide le schema puis recalcule le hash du manifeste, cache compris. */
export async function verifyPublicReleaseResponseIntegrity(
  input: unknown,
  sha256Hex: PublicContentSha256Hex,
): Promise<PublicReleaseResponse> {
  let response: PublicReleaseResponse;
  try {
    response = publicReleaseResponseSchema.parse(input);
    await verifyDigest({
      material: canonicalPublicReleaseHashMaterial(response.release),
      expected: response.manifestSha256,
      sha256Hex,
    });
  } catch (error) {
    if (error instanceof PublicContentIntegrityError) throw error;
    throw new PublicContentIntegrityError();
  }
  return response;
}
