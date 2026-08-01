const SESSION_CHUNK_CODE_POINTS = 400;
const MAX_SESSION_CHUNKS = 64;

interface SecureKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}

interface ChunkManifest {
  readonly schemaVersion: 1;
  readonly chunkCount: number;
  readonly valueLength: number;
}

function chunkKey(key: string, index: number): string {
  return `${key}.thainaute_chunk_${index}`;
}

function parseManifest(value: string | null): ChunkManifest | null {
  if (value === null) return null;
  try {
    const candidate = JSON.parse(value) as Record<string, unknown>;
    if (
      candidate.schemaVersion !== 1 ||
      !Number.isInteger(candidate.chunkCount) ||
      typeof candidate.chunkCount !== "number" ||
      candidate.chunkCount < 1 ||
      candidate.chunkCount > MAX_SESSION_CHUNKS ||
      !Number.isInteger(candidate.valueLength) ||
      typeof candidate.valueLength !== "number" ||
      candidate.valueLength < 0
    ) {
      return null;
    }
    return {
      schemaVersion: 1,
      chunkCount: candidate.chunkCount,
      valueLength: candidate.valueLength,
    };
  } catch {
    return null;
  }
}

function splitValue(value: string): string[] {
  const codePoints = Array.from(value);
  const chunks: string[] = [];
  for (
    let offset = 0;
    offset < Math.max(1, codePoints.length);
    offset += SESSION_CHUNK_CODE_POINTS
  ) {
    chunks.push(
      codePoints.slice(offset, offset + SESSION_CHUNK_CODE_POINTS).join(""),
    );
  }
  return chunks;
}

async function removeChunks(
  storage: SecureKeyValueStorage,
  key: string,
  count: number,
): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await storage.removeItem(chunkKey(key, index));
  }
}

/**
 * Stocke une session en petits secrets natifs. Le manifeste est écrit en
 * dernier : une interruption rend la session absente, jamais partiellement
 * lisible. Une ancienne valeur monobloc reste lisible jusqu'au prochain refresh.
 */
export function createChunkedSecureSessionStorage(
  storage: SecureKeyValueStorage,
): SecureKeyValueStorage {
  return {
    async getItem(key) {
      const stored = await storage.getItem(key);
      const manifest = parseManifest(stored);
      if (manifest === null) return stored;

      const chunks: string[] = [];
      for (let index = 0; index < manifest.chunkCount; index += 1) {
        const chunk = await storage.getItem(chunkKey(key, index));
        if (chunk === null) return null;
        chunks.push(chunk);
      }
      const value = chunks.join("");
      return value.length === manifest.valueLength ? value : null;
    },

    async removeItem(key) {
      const manifest = parseManifest(await storage.getItem(key));
      await storage.removeItem(key);
      await removeChunks(
        storage,
        key,
        manifest?.chunkCount ?? MAX_SESSION_CHUNKS,
      );
    },

    async setItem(key, value) {
      const chunks = splitValue(value);
      if (chunks.length > MAX_SESSION_CHUNKS) {
        throw new Error("La session chiffrée dépasse la capacité locale.");
      }

      const previousManifest = parseManifest(await storage.getItem(key));
      await storage.removeItem(key);
      await removeChunks(
        storage,
        key,
        previousManifest === null
          ? MAX_SESSION_CHUNKS
          : Math.max(previousManifest.chunkCount, chunks.length),
      );
      for (const [index, chunk] of chunks.entries()) {
        await storage.setItem(chunkKey(key, index), chunk);
      }
      await storage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          chunkCount: chunks.length,
          valueLength: value.length,
        } satisfies ChunkManifest),
      );
    },
  };
}
