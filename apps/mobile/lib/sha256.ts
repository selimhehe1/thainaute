import { CryptoDigestAlgorithm, digestStringAsync } from "expo-crypto";

/** SHA-256 natif; ne journalise jamais la matière hachée. */
export function mobileSha256Hex(value: string): Promise<string> {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, value);
}
