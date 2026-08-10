import { readFileSync, rmSync, statSync } from "node:fs";

interface HandoffFileMetadata {
  readonly mode: number;
  readonly size: number;
  isFile(): boolean;
}

interface HandoffFileIo {
  read(path: string): string;
  remove(path: string): void;
  stat(path: string): HandoffFileMetadata;
}

const defaultIo: HandoffFileIo = {
  read: (path) => readFileSync(path, "utf8"),
  remove: (path) => rmSync(path, { force: true }),
  stat: (path) => statSync(path),
};

export function readAndDestroyPrivateHandoffFile(
  handoffPath: string,
  maxBytes: number,
  options: {
    readonly io?: HandoffFileIo;
    readonly platform?: NodeJS.Platform;
  } = {},
): string {
  const io = options.io ?? defaultIo;
  const platform = options.platform ?? process.platform;
  let serialized: string | null = null;
  let primaryFailure: Error | null = null;
  try {
    const metadata = io.stat(handoffPath);
    if (!metadata.isFile() || metadata.size > maxBytes) {
      throw new Error("invalid");
    }
    if (platform !== "win32" && (metadata.mode & 0o077) !== 0) {
      throw new Error("permissions");
    }
    serialized = io.read(handoffPath);
  } catch {
    primaryFailure = new Error("Le fichier de transfert privé est invalide.");
  }

  let cleanupFailed = false;
  try {
    io.remove(handoffPath);
  } catch {
    cleanupFailed = true;
  }
  if (cleanupFailed) {
    const cleanupMessage = "Le fichier de transfert n'a pas pu être détruit.";
    if (primaryFailure !== null) {
      throw new Error(`${primaryFailure.message} ${cleanupMessage}`, {
        cause: primaryFailure,
      });
    }
    throw new Error(cleanupMessage);
  }
  if (primaryFailure !== null) throw primaryFailure;
  if (serialized === null) {
    throw new Error("Le fichier de transfert privé est invalide.");
  }
  return serialized;
}
