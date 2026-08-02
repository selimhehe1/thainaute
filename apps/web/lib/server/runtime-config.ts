import {
  readSupabaseAttemptSyncConfiguration,
  readSupabaseServerConfiguration,
} from "./attempt-sync/runtime";
import { readAccountDeletionConfiguration } from "./account-deletion/runtime";
import {
  readContentReportConfiguration,
  readContentReportMode,
  type ContentReportMode,
} from "./content-report/runtime";
import {
  readActiveContentReleaseId,
  readPublicContentConfiguration,
  readPublicContentMode,
  type PublicContentMode,
} from "./content-delivery/runtime";
import { readContentStudioConfiguration } from "./content-studio/runtime";

const LOCAL_PUBLIC_URL = "http://localhost:3000/";
const RELEASE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u;

type Environment = Readonly<Record<string, string | undefined>>;

export type SyncMode = "disabled" | "supabase";
export type StudioMode = "disabled" | "fixture";

export type RuntimeIssue =
  | "account_deletion_config_missing"
  | "content_report_config_missing"
  | "content_report_mode_invalid"
  | "content_report_rate_limit_missing"
  | "content_report_sync_required"
  | "public_content_config_missing"
  | "public_content_mode_invalid"
  | "public_content_rate_limit_missing"
  | "public_indexing_invalid"
  | "public_url_invalid"
  | "release_invalid"
  | "sync_release_config_missing"
  | "studio_config_missing"
  | "studio_report_config_missing"
  | "studio_mode_invalid"
  | "supabase_config_missing"
  | "sync_mode_invalid";

export interface RuntimeDiagnostic {
  readonly ready: boolean;
  readonly release: string;
  readonly publicOrigin: string | null;
  readonly publicIndexing: boolean;
  readonly syncMode: SyncMode | null;
  readonly contentReportMode: ContentReportMode | null;
  readonly publicContentMode: PublicContentMode | null;
  readonly studioMode: StudioMode | null;
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

function resolveStudioMode(value: string | undefined): StudioMode | null {
  if (value === undefined || value === "" || value === "disabled") {
    return "disabled";
  }
  return value === "fixture" ? "fixture" : null;
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
  if (
    syncMode === "supabase" &&
    readActiveContentReleaseId(environment) === null
  ) {
    issues.push("sync_release_config_missing");
  }

  const contentReportMode = readContentReportMode(environment);
  if (contentReportMode === null) {
    issues.push("content_report_mode_invalid");
  } else if (contentReportMode === "supabase") {
    if (readContentReportConfiguration(environment) === null) {
      issues.push("content_report_config_missing");
    }
    if (syncMode !== "supabase") {
      issues.push("content_report_sync_required");
    }
    // OPEN-API-001 : le endpoint preview fonctionne, mais ne peut pas être
    // promu tant que ses seuils compte/IP et son comportement de repli restent
    // indécis et non implémentés.
    issues.push("content_report_rate_limit_missing");
  }

  const publicContentMode = readPublicContentMode(environment);
  if (publicContentMode === null) {
    issues.push("public_content_mode_invalid");
  } else if (publicContentMode === "supabase") {
    if (readPublicContentConfiguration(environment) === null) {
      issues.push("public_content_config_missing");
    }
    // OPEN-API-001 couvre aussi les lectures publiques. Le cache réduit la
    // charge normale, mais ne remplace pas une limite autoritaire par IP.
    issues.push("public_content_rate_limit_missing");
  }

  const studioMode = resolveStudioMode(environment.THAINAUTE_STUDIO_MODE);
  if (studioMode === null) {
    issues.push("studio_mode_invalid");
  } else if (
    studioMode === "fixture" &&
    readContentStudioConfiguration(environment) === null
  ) {
    issues.push("studio_config_missing");
  } else if (
    studioMode === "fixture" &&
    readSupabaseServerConfiguration(environment) === null
  ) {
    issues.push("studio_report_config_missing");
  }

  return {
    ready: issues.length === 0,
    release,
    publicOrigin: publicUrl?.origin ?? null,
    publicIndexing,
    syncMode,
    contentReportMode,
    publicContentMode,
    studioMode,
    issues,
  };
}

export function publicRelease(environment: Environment = process.env): string {
  return diagnoseRuntime(environment).release;
}
