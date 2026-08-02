import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  MAX_ACCOUNT_EXPORT_ATTEMPTS,
  MAX_ACCOUNT_EXPORT_DEVICES,
  MAX_ACCOUNT_EXPORT_LEARNER_STATES,
  accountExportDataSchema,
  type AccountExportAttemptEvent,
  type AccountExportData,
  type AccountExportDevice,
  type AccountExportLearnerItemState,
  type AccountExportProfile,
} from "@thainaute/sync";
import { z } from "zod";

import {
  AccountExportApiError,
  AccountExportInfrastructureError,
} from "./errors";
import type { AccountExportRepository } from "./ports";
import { createAccountExportSupabaseFetch } from "./supabase-fetch";

export const ACCOUNT_EXPORT_PAGE_SIZE = 1_000;
const ACCOUNT_EXPORT_READ_ATTEMPTS = 2;

const canonicalUuidSchema = z.uuid().transform((uuid) => uuid.toLowerCase());
const profileRowSchema = z.strictObject({
  user_id: canonicalUuidSchema,
  created_at: z.string(),
  sync_revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
});
const deviceRowSchema = z.strictObject({
  id: canonicalUuidSchema,
  user_id: canonicalUuidSchema,
  platform: z.enum(["web", "ios", "android"]),
  app_version: z.string(),
  created_at: z.string(),
});
const attemptEventRowSchema = z.strictObject({
  event_id: canonicalUuidSchema,
  user_id: canonicalUuidSchema,
  device_id: canonicalUuidSchema,
  exercise_id: canonicalUuidSchema,
  item_id: canonicalUuidSchema,
  lesson_version_id: canonicalUuidSchema,
  selected_option_id: canonicalUuidSchema,
  dimension: z.enum(["listening", "reading", "recall", "production", "tone"]),
  rating: z.union([z.literal(0), z.literal(1)]),
  answered_at: z.string(),
  duration_ms: z.number(),
  algorithm_version: z.string(),
  payload_sha256: z.string(),
  received_at: z.string(),
});
const learnerItemStateRowSchema = z.strictObject({
  user_id: canonicalUuidSchema,
  item_id: canonicalUuidSchema,
  lesson_version_id: canonicalUuidSchema,
  dimension: z.enum(["listening", "reading", "recall", "production", "tone"]),
  mastery_permille: z.number(),
  successful_attempts: z.number(),
  consecutive_correct: z.number(),
  attempt_count: z.number(),
  last_event_id: canonicalUuidSchema,
  last_answered_at: z.string(),
  due_at: z.string(),
  algorithm_version: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof profileRowSchema>;
export type DeviceRow = z.infer<typeof deviceRowSchema>;
export type AttemptEventRow = z.infer<typeof attemptEventRowSchema>;
export type LearnerItemStateRow = z.infer<typeof learnerItemStateRowSchema>;

interface PageResponse {
  readonly data: unknown[] | null;
  readonly error: unknown;
  readonly count: number | null;
}

function throwDatabaseUnavailable(): never {
  throw new AccountExportInfrastructureError("database_unavailable");
}

function validatedPageData(page: PageResponse): unknown[] {
  if (page.error !== null || page.data === null) throwDatabaseUnavailable();
  return page.data;
}

function validatedExpectedCount(count: number | null, maxRows: number): number {
  if (count === null || !Number.isSafeInteger(count) || count < 0) {
    throwDatabaseUnavailable();
  }
  if (count > maxRows) {
    throw new AccountExportApiError("export_capacity_exceeded");
  }
  return count;
}

/** Lit toutes les pages annoncées par `count=exact`, ou refuse le lot entier. */
export async function readBoundedAccountExportPages(input: {
  readonly maxRows: number;
  readonly readPage: (
    from: number,
    to: number,
    includeExactCount: boolean,
  ) => Promise<PageResponse>;
}): Promise<unknown[]> {
  const rows: unknown[] = [];
  let expectedCount: number | null = null;

  while (expectedCount === null || rows.length < expectedCount) {
    const page = await input.readPage(
      rows.length,
      rows.length + ACCOUNT_EXPORT_PAGE_SIZE - 1,
      expectedCount === null,
    );
    const pageData = validatedPageData(page);

    expectedCount ??= validatedExpectedCount(page.count, input.maxRows);

    rows.push(...pageData);
    if (rows.length > input.maxRows) {
      throw new AccountExportApiError("export_capacity_exceeded");
    }
    if (rows.length >= expectedCount) return rows;
    if (pageData.length === 0) throwDatabaseUnavailable();
  }

  return rows;
}

function parseRows<T>(schema: z.ZodType<T>, value: unknown[]): T[] {
  const result = z.array(schema).safeParse(value);
  if (!result.success) throwDatabaseUnavailable();
  return result.data;
}

async function readProfile(
  client: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await client
    .from("profiles")
    .select("user_id,created_at,sync_revision")
    .eq("user_id", userId)
    .maybeSingle();
  if (error !== null) throwDatabaseUnavailable();
  if (data === null) return null;
  const parsed = profileRowSchema.safeParse(data);
  if (!parsed.success || parsed.data.user_id !== userId) {
    throwDatabaseUnavailable();
  }
  return parsed.data;
}

async function readDevices(
  client: SupabaseClient,
  userId: string,
): Promise<DeviceRow[]> {
  const rows = await readBoundedAccountExportPages({
    maxRows: MAX_ACCOUNT_EXPORT_DEVICES,
    readPage: async (from, to, includeExactCount) => {
      const { data, error, count } = await client
        .from("devices")
        .select(
          "id,user_id,platform,app_version,created_at",
          includeExactCount ? { count: "exact" } : undefined,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to);
      return { data, error, count };
    },
  });
  return parseRows(deviceRowSchema, rows);
}

async function readAttemptEvents(
  client: SupabaseClient,
  userId: string,
): Promise<AttemptEventRow[]> {
  const rows = await readBoundedAccountExportPages({
    maxRows: MAX_ACCOUNT_EXPORT_ATTEMPTS,
    readPage: async (from, to, includeExactCount) => {
      const { data, error, count } = await client
        .from("attempt_events")
        .select(
          "event_id,user_id,device_id,exercise_id,item_id,lesson_version_id,selected_option_id,dimension,rating,answered_at,duration_ms,algorithm_version,payload_sha256,received_at",
          includeExactCount ? { count: "exact" } : undefined,
        )
        .eq("user_id", userId)
        .order("answered_at", { ascending: true })
        .order("event_id", { ascending: true })
        .range(from, to);
      return { data, error, count };
    },
  });
  return parseRows(attemptEventRowSchema, rows);
}

async function readLearnerItemStates(
  client: SupabaseClient,
  userId: string,
): Promise<LearnerItemStateRow[]> {
  const rows = await readBoundedAccountExportPages({
    maxRows: MAX_ACCOUNT_EXPORT_LEARNER_STATES,
    readPage: async (from, to, includeExactCount) => {
      const { data, error, count } = await client
        .from("learner_item_state")
        .select(
          "user_id,item_id,lesson_version_id,dimension,mastery_permille,successful_attempts,consecutive_correct,attempt_count,last_event_id,last_answered_at,due_at,algorithm_version,updated_at",
          includeExactCount ? { count: "exact" } : undefined,
        )
        .eq("user_id", userId)
        .order("item_id", { ascending: true })
        .order("dimension", { ascending: true })
        .range(from, to);
      return { data, error, count };
    },
  });
  return parseRows(learnerItemStateRowSchema, rows);
}

function sameProfileRevision(
  before: ProfileRow | null,
  after: ProfileRow | null,
): boolean {
  return (
    (before === null && after === null) ||
    (before !== null &&
      after !== null &&
      before.user_id === after.user_id &&
      before.sync_revision === after.sync_revision)
  );
}

function sameDeviceSnapshot(
  before: readonly DeviceRow[],
  after: readonly DeviceRow[],
): boolean {
  return (
    before.length === after.length &&
    before.every((device, index) => {
      const candidate = after[index];
      return (
        candidate !== undefined &&
        device.id === candidate.id &&
        device.user_id === candidate.user_id &&
        device.platform === candidate.platform &&
        device.app_version === candidate.app_version &&
        device.created_at === candidate.created_at
      );
    })
  );
}

export interface AccountExportSnapshotReader {
  readonly readProfile: () => Promise<ProfileRow | null>;
  readonly readDevices: () => Promise<DeviceRow[]>;
  readonly readAttemptEvents: () => Promise<AttemptEventRow[]>;
  readonly readLearnerItemStates: () => Promise<LearnerItemStateRow[]>;
}

function assertOwnRows<T extends { readonly user_id: string }>(
  rows: readonly T[],
  userId: string,
): void {
  if (rows.some((row) => row.user_id !== userId)) {
    throwDatabaseUnavailable();
  }
}

export function accountExportDataFromRows(input: {
  readonly userId: string;
  readonly profile: ProfileRow | null;
  readonly devices: readonly DeviceRow[];
  readonly attemptEvents: readonly AttemptEventRow[];
  readonly learnerItemStates: readonly LearnerItemStateRow[];
}): AccountExportData {
  if (input.profile !== null && input.profile.user_id !== input.userId) {
    throwDatabaseUnavailable();
  }
  assertOwnRows(input.devices, input.userId);
  assertOwnRows(input.attemptEvents, input.userId);
  assertOwnRows(input.learnerItemStates, input.userId);

  const profile: AccountExportProfile | null =
    input.profile === null
      ? null
      : {
          createdAt: input.profile.created_at,
          syncRevision: input.profile.sync_revision,
        };
  const devices: AccountExportDevice[] = input.devices.map((device) => ({
    id: device.id,
    platform: device.platform,
    appVersion: device.app_version,
    createdAt: device.created_at,
  }));
  const attemptEvents: AccountExportAttemptEvent[] = input.attemptEvents.map(
    (attempt) => ({
      eventId: attempt.event_id,
      deviceId: attempt.device_id,
      exerciseId: attempt.exercise_id,
      itemId: attempt.item_id,
      lessonVersionId: attempt.lesson_version_id,
      selectedOptionId: attempt.selected_option_id,
      skill: attempt.dimension,
      rating: attempt.rating,
      answeredAt: attempt.answered_at,
      durationMs: attempt.duration_ms,
      algorithmVersion: attempt.algorithm_version,
      payloadSha256: attempt.payload_sha256,
      receivedAt: attempt.received_at,
    }),
  );
  const learnerItemStates: AccountExportLearnerItemState[] =
    input.learnerItemStates.map((state) => ({
      itemId: state.item_id,
      lessonVersionId: state.lesson_version_id,
      skill: state.dimension,
      masteryPermille: state.mastery_permille,
      successfulAttempts: state.successful_attempts,
      consecutiveCorrect: state.consecutive_correct,
      attemptCount: state.attempt_count,
      lastEventId: state.last_event_id,
      lastAnsweredAt: state.last_answered_at,
      dueAt: state.due_at,
      algorithmVersion: state.algorithm_version,
      updatedAt: state.updated_at,
    }));

  const result = accountExportDataSchema.safeParse({
    profile,
    devices,
    attemptEvents,
    learnerItemStates,
  });
  if (!result.success) throwDatabaseUnavailable();
  return result.data;
}

export async function readConsistentAccountExportData(input: {
  readonly userId: string;
  readonly reader: AccountExportSnapshotReader;
}): Promise<AccountExportData> {
  for (
    let snapshotAttempt = 0;
    snapshotAttempt < ACCOUNT_EXPORT_READ_ATTEMPTS;
    snapshotAttempt += 1
  ) {
    const profileBefore = await input.reader.readProfile();
    const [devices, attemptEvents, learnerItemStates] = await Promise.all([
      input.reader.readDevices(),
      input.reader.readAttemptEvents(),
      input.reader.readLearnerItemStates(),
    ]);
    const [profileAfter, devicesAfter] = await Promise.all([
      input.reader.readProfile(),
      input.reader.readDevices(),
    ]);
    if (
      !sameProfileRevision(profileBefore, profileAfter) ||
      !sameDeviceSnapshot(devices, devicesAfter)
    ) {
      continue;
    }

    return accountExportDataFromRows({
      userId: input.userId,
      profile: profileBefore,
      devices,
      attemptEvents,
      learnerItemStates,
    });
  }
  throw new AccountExportApiError("concurrent_update");
}

export function createSupabaseAccountExportRepository(input: {
  readonly url: string;
  readonly publishableKey: string;
}): AccountExportRepository {
  return {
    async read({ userId, accessToken, signal }) {
      const client = createClient(input.url, input.publishableKey, {
        accessToken: async () => accessToken,
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: { fetch: createAccountExportSupabaseFetch(signal) },
      });

      try {
        return await readConsistentAccountExportData({
          userId,
          reader: {
            readProfile: () => readProfile(client, userId),
            readDevices: () => readDevices(client, userId),
            readAttemptEvents: () => readAttemptEvents(client, userId),
            readLearnerItemStates: () => readLearnerItemStates(client, userId),
          },
        });
      } catch (error) {
        if (
          error instanceof AccountExportApiError ||
          error instanceof AccountExportInfrastructureError
        ) {
          throw error;
        }
        throw new AccountExportInfrastructureError("database_unavailable");
      }
    },
  };
}
