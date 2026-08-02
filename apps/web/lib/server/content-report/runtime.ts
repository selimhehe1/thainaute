import {
  readSupabaseAttemptSyncConfiguration,
  readSupabaseServerConfiguration,
} from "../attempt-sync/runtime";
import { readAccountDeletionConfiguration } from "../account-deletion/runtime";

type Environment = Readonly<Record<string, string | undefined>>;

export type ContentReportMode = "disabled" | "supabase";

export function readContentReportMode(
  environment: Environment = process.env,
): ContentReportMode | null {
  const value = environment.THAINAUTE_CONTENT_REPORT_MODE;
  if (value === undefined || value === "" || value === "disabled") {
    return "disabled";
  }
  return value === "supabase" ? "supabase" : null;
}

export function readContentReportConfiguration(
  environment: Environment = process.env,
) {
  if (readContentReportMode(environment) !== "supabase") return null;
  return readSupabaseServerConfiguration(environment);
}

/**
 * L'ingestion n'est active que lorsque la base commune (sync, export et
 * suppression) est elle-même active. La readiness seule ne constitue pas une
 * barrière d'autorisation suffisante.
 */
export function readContentReportSubmissionConfiguration(
  environment: Environment = process.env,
) {
  if (readContentReportMode(environment) !== "supabase") return null;
  const configuration = readSupabaseAttemptSyncConfiguration(environment);
  if (
    configuration === null ||
    readAccountDeletionConfiguration(environment) === null
  ) {
    return null;
  }
  return configuration;
}
