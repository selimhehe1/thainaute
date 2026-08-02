import { readSupabaseAttemptSyncConfiguration } from "./attempt-sync/runtime";
import { readAccountDeletionConfiguration } from "./account-deletion/runtime";

const LOCAL_PUBLIC_URL = "http://localhost:3000/";
const RELEASE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u;

type Environment = Readonly<Record<string, string | undefined>>;

export type SyncMode = "disabled" | "supabase";

export type RuntimeIssue =
  | "account_deletion_config_missing"
  | "public_indexing_invalid"
  | "public_url_invalid"
  | "release_invalid"
  | "supabase_config_missing"
  | "sync_mode_invalid";

export interface RuntimeDiagnostic {
  readonly ready: boolean;
  readonly release: string;
  readonly publicOrigin: string | null;
  readonly publicIndexing: boolean;
  readonly syncMode: SyncMode | null;
  readonly issues: readonly RuntimeIssue[];
}

function parseOrigin(value: string): URL | null {
  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== "" ||
      url.pathname !== "/" ||
      url.search !== "" ||
      url.hash !== ""
    ) {
      return null;
    }
    return new URL(url.origin);
  } catch {
    return null;
  }
}

function resolveSyncMode(value: string | undefined): SyncMode | null {
  if (value === undefined || value === "" || value === "disabled") {
    return "disabled";
  }
  return value === "supabase" ? "supabase" : null;
}

function hasSupabaseConfiguration(environment: Environment): boolean {
  return readSupabaseAttemptSyncConfiguration(environment) !== null;
}

export function diagnoseRuntime(
  environment: Environment = process.env,
): RuntimeDiagnostic {
  const issues: RuntimeIssue[] = [];
  const releaseCandidate =
    environment.THAINAUTE_RELEASE?.trim() || "development";
  const release = RELEASE_PATTERN.test(releaseCandidate)
    ? releaseCandidate
    : "invalid";
  if (release === "invalid") issues.push("release_invalid");

  const publicUrl = parseOrigin(
    environment.THAINAUTE_PUBLIC_URL?.trim() || LOCAL_PUBLIC_URL,
  );
  if (publicUrl === null) issues.push("public_url_invalid");

  const indexingValue = environment.THAINAUTE_PUBLIC_INDEXING ?? "disabled";
  const publicIndexing = indexingValue === "enabled";
  if (indexingValue !== "enabled" && indexingValue !== "disabled") {
    issues.push("public_indexing_invalid");
  } else if (
    publicIndexing &&
    (publicUrl === null || publicUrl.protocol !== "https:")
  ) {
    issues.push("public_indexing_invalid");
  }

  const syncMode = resolveSyncMode(environment.THAINAUTE_SYNC_MODE);
  if (syncMode === null) {
    issues.push("sync_mode_invalid");
  } else if (
    syncMode === "supabase" &&
    !hasSupabaseConfiguration(environment)
  ) {
    issues.push("supabase_config_missing");
  } else if (
    syncMode === "supabase" &&
    readAccountDeletionConfiguration(environment) === null
  ) {
    issues.push("account_deletion_config_missing");
  }

  return {
    ready: issues.length === 0,
    release,
    publicOrigin: publicUrl?.origin ?? null,
    publicIndexing,
    syncMode,
    issues,
  };
}

export function publicRelease(environment: Environment = process.env): string {
  return diagnoseRuntime(environment).release;
}
