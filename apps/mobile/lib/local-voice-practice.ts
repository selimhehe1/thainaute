export const LOCAL_VOICE_MAX_DURATION_MS = 20_000;

export interface LocalVoicePlayerResource {
  pause(): void;
  remove(): void;
}

export interface LocalVoiceFileResource {
  readonly exists: boolean;
  delete(): void;
}

export type LocalVoiceFileFactory = (uri: string) => LocalVoiceFileResource;

export type LocalVoiceRecorderTerminal = "completed" | "discard" | null;

export interface LocalVoiceRecorderTerminalStatus {
  readonly hasError: boolean;
  readonly isFinished: boolean;
  readonly mediaServicesDidReset?: boolean;
  readonly url?: string | null;
}

export interface LocalVoiceRecorderTerminalResult {
  readonly outcome: Exclude<LocalVoiceRecorderTerminal, null>;
  readonly url: string | null;
}

export class LocalVoiceEpochGate {
  private active = true;
  private epoch = 0;

  activate(): void {
    this.active = true;
    this.epoch += 1;
  }

  begin(): number | null {
    if (!this.active) return null;
    this.epoch += 1;
    return this.epoch;
  }

  invalidate(): void {
    this.active = false;
    this.epoch += 1;
  }

  isCurrent(epoch: number): boolean {
    return this.active && this.epoch === epoch;
  }

  supersede(): void {
    this.active = true;
    this.epoch += 1;
  }
}

export class LocalVoiceRecorderTerminalLatch {
  private result: LocalVoiceRecorderTerminalResult | null = null;
  private readonly listeners = new Set<() => void>();

  observe(status: LocalVoiceRecorderTerminalStatus): void {
    const outcome = classifyLocalVoiceRecorderTerminal(status);
    if (outcome === null) return;

    if (outcome === "discard") {
      this.result = { outcome, url: null };
    } else if (this.result?.outcome !== "discard") {
      this.result = { outcome, url: status.url ?? null };
    }

    for (const listener of this.listeners) listener();
  }

  async wait(options: {
    readonly settleMs: number;
    readonly timeoutMs: number;
  }): Promise<LocalVoiceRecorderTerminalResult | null> {
    return await new Promise((resolve) => {
      let settled = false;
      let settleTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: LocalVoiceRecorderTerminalResult | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutTimer);
        if (settleTimer !== null) clearTimeout(settleTimer);
        this.listeners.delete(scheduleSettlement);
        resolve(result);
      };
      const scheduleSettlement = () => {
        if (settleTimer !== null) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => finish(this.result), options.settleMs);
      };
      const timeoutTimer = setTimeout(() => finish(null), options.timeoutMs);

      this.listeners.add(scheduleSettlement);
      if (this.result !== null) scheduleSettlement();
    });
  }
}

export function classifyLocalVoiceRecorderTerminal(
  status: LocalVoiceRecorderTerminalStatus,
): LocalVoiceRecorderTerminal {
  if (status.hasError || status.mediaServicesDidReset === true) {
    return "discard";
  }
  if (status.isFinished) return "completed";
  return null;
}

export function sanitizeLocalVoiceRecorderUri(
  uri: string | null,
  cacheDirectoryUri: string,
): string | null {
  if (uri === null || uri.trim() === "") return null;
  if (uri !== uri.trim()) throw new LocalVoiceResourceError();
  return assertLocalVoiceFileUri(uri, cacheDirectoryUri);
}

export function isMpeg4AudioHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const declaredBoxSize =
    bytes[0]! * 0x1_00_00_00 +
    bytes[1]! * 0x1_00_00 +
    bytes[2]! * 0x1_00 +
    bytes[3]!;

  return (
    declaredBoxSize >= 8 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  );
}

export function isFinitePositiveAudioDuration(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds > 0;
}

export class LocalVoiceResourceError extends Error {
  readonly code: "invalid_file_uri";

  constructor() {
    super("L’enregistrement local ne possède pas une adresse de fichier sûre.");
    this.name = "LocalVoiceResourceError";
    this.code = "invalid_file_uri";
  }
}

export class LocalVoiceDeletionError extends Error {
  constructor() {
    super("La suppression du fichier vocal local n’a pas pu être confirmée.");
    this.name = "LocalVoiceDeletionError";
  }
}

function normalizeFilePath(pathname: string): string {
  const decodedPath = decodeURIComponent(pathname).replaceAll("\\", "/");
  if (decodedPath.includes("\0")) throw new LocalVoiceResourceError();

  const segments: string[] = [];
  for (const segment of decodedPath.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return `/${segments.join("/")}`;
}

function parsePrivateFileUri(uri: string): URL {
  try {
    const parsed = new URL(uri);
    if (
      parsed.protocol === "file:" &&
      parsed.username === "" &&
      parsed.password === "" &&
      parsed.hostname === "" &&
      parsed.pathname.startsWith("/") &&
      parsed.search === "" &&
      parsed.hash === ""
    ) {
      return parsed;
    }
  } catch {
    // The generic error below deliberately avoids echoing a sensitive path.
  }

  throw new LocalVoiceResourceError();
}

export function assertLocalVoiceFileUri(
  uri: string,
  cacheDirectoryUri: string,
): string {
  try {
    const candidatePath = normalizeFilePath(parsePrivateFileUri(uri).pathname);
    const cachePath = normalizeFilePath(
      parsePrivateFileUri(cacheDirectoryUri).pathname,
    );
    const cachePrefix = `${cachePath.replace(/\/$/, "")}/`;

    if (candidatePath.startsWith(cachePrefix)) return uri;
  } catch (error) {
    if (error instanceof LocalVoiceResourceError) throw error;
  }

  throw new LocalVoiceResourceError();
}

export function getLocalVoiceRemainingMs(durationMillis: number): number {
  if (!Number.isFinite(durationMillis) || durationMillis <= 0) {
    return LOCAL_VOICE_MAX_DURATION_MS;
  }

  return Math.max(0, LOCAL_VOICE_MAX_DURATION_MS - Math.floor(durationMillis));
}

export function releaseLocalVoicePlayer(
  player: LocalVoicePlayerResource | null,
): void {
  if (player === null) return;

  try {
    player.pause();
  } catch {
    // remove() is the authoritative SDK 57 resource release operation.
  }
  player.remove();
}

export function deleteLocalVoiceResource({
  uri,
  cacheDirectoryUri,
  player,
  createFile,
}: {
  uri: string;
  cacheDirectoryUri: string;
  player: LocalVoicePlayerResource | null;
  createFile: LocalVoiceFileFactory;
}): void {
  const localUri = assertLocalVoiceFileUri(uri, cacheDirectoryUri);

  // The player must release its file handle before File.delete() is attempted.
  releaseLocalVoicePlayer(player);

  const file = createFile(localUri);
  if (!file.exists) return;

  file.delete();
  if (file.exists) throw new LocalVoiceDeletionError();
}
