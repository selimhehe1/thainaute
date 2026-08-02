import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SRS_ALGORITHM_VERSION, type AttemptEvent } from "@thainaute/domain";
import {
  attemptBatchResponseSchema,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { z } from "zod";

import { answerKeyIdentity, indexServerAnswerKeys } from "./answer-key-index";
import { hashCanonical } from "./canonical-json";
import { AttemptInfrastructureError } from "./errors";
import type {
  AttemptProjectionWrite,
  AttemptRepository,
  CommitAttemptBatchInput,
  CommitAttemptBatchResult,
  ServerExerciseAnswerKey,
} from "./ports";
import { fetchSupabase } from "./supabase-fetch";
import { verifyPublishedBundleRows } from "../content-delivery/verified-bundle";

const HISTORY_PAGE_SIZE = 1_000;
const MAX_HISTORY_EVENTS = 20_000;

const profileRowSchema = z.strictObject({
  sync_revision: z.number().int().nonnegative(),
});
const deviceRowSchema = z.strictObject({ id: z.uuid() });
const attemptEventRowSchema = z.strictObject({
  event_id: z.uuid(),
  user_id: z.uuid(),
  device_id: z.uuid(),
  exercise_id: z.uuid(),
  item_id: z.uuid(),
  lesson_version_id: z.uuid(),
  selected_option_id: z.uuid(),
  dimension: z.enum(["listening", "reading", "recall", "production", "tone"]),
  rating: z.union([z.literal(0), z.literal(1)]),
  answered_at: z.string().datetime({ offset: true }),
  duration_ms: z.number().int().min(0).max(1_800_000),
  algorithm_version: z.literal(SRS_ALGORITHM_VERSION),
});
const eventIdentityRowSchema = z.strictObject({
  event_id: z.uuid(),
  user_id: z.uuid(),
});
const rpcResultSchema = z
  .strictObject({
    kind: z.enum(["committed", "replayed"]),
    response: attemptBatchResponseSchema,
    syncRevision: z.number().int().positive(),
  })
  .superRefine((result, context) => {
    if (result.response.syncRevision !== result.syncRevision) {
      context.addIssue({
        code: "custom",
        message: "La révision RPC et celle de la réponse divergent.",
        path: ["response", "syncRevision"],
      });
    }
  });

const ATTEMPT_EVENT_COLUMNS = [
  "event_id",
  "user_id",
  "device_id",
  "exercise_id",
  "item_id",
  "lesson_version_id",
  "selected_option_id",
  "dimension",
  "rating",
  "answered_at",
  "duration_ms",
  "algorithm_version",
].join(",");

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function deriveAuthoritativeAttemptScope(
  attempts: readonly ValidatedAttemptSubmission[],
  answerKeys: readonly ServerExerciseAnswerKey[],
): {
  readonly itemIds: readonly string[];
  readonly requestedPairs: ReadonlySet<string>;
} {
  const answerKeysByIdentity = indexServerAnswerKeys(answerKeys);
  const requestedAnswerKeys = attempts.flatMap((attempt) => {
    const answerKey = answerKeysByIdentity.get(answerKeyIdentity(attempt));
    return answerKey === undefined ? [] : [answerKey];
  });

  return {
    itemIds: unique(requestedAnswerKeys.map((answerKey) => answerKey.itemId)),
    requestedPairs: new Set(
      requestedAnswerKeys.map(
        (answerKey) => `${answerKey.itemId}\u0000${answerKey.skill}`,
      ),
    ),
  };
}

function throwDatabaseUnavailable(): never {
  throw new AttemptInfrastructureError("database_unavailable");
}

function parseRows<T>(schema: z.ZodType<T>, value: unknown): T[] {
  const result = z.array(schema).safeParse(value);
  if (!result.success) throwDatabaseUnavailable();
  return result.data;
}

async function readProfileRevision(
  client: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await client
    .from("profiles")
    .select("sync_revision")
    .eq("user_id", userId)
    .maybeSingle();
  if (error !== null || data === null) throwDatabaseUnavailable();
  const profile = profileRowSchema.safeParse(data);
  if (!profile.success) throwDatabaseUnavailable();
  return profile.data.sync_revision;
}

function toAttemptEvent(
  row: z.infer<typeof attemptEventRowSchema>,
): AttemptEvent {
  return {
    eventId: row.event_id,
    userId: row.user_id,
    deviceId: row.device_id,
    exerciseId: row.exercise_id,
    itemId: row.item_id,
    contentVersionId: row.lesson_version_id,
    selectedOptionId: row.selected_option_id,
    skill: row.dimension,
    rating: row.rating,
    answeredAt: new Date(row.answered_at).toISOString(),
    durationMs: row.duration_ms,
    algorithmVersion: row.algorithm_version,
  };
}

export function derivePublishedAnswerKeys(
  rows: unknown,
  activeReleaseId: string,
): ServerExerciseAnswerKey[] {
  const answerKeys: ServerExerciseAnswerKey[] = [];

  for (const { bundle, release } of verifyPublishedBundleRows(rows)) {
    const { lesson } = bundle;
    if (
      release.id !== activeReleaseId.toLowerCase() ||
      lesson.requiredEntitlement !== null
    ) {
      continue;
    }

    const itemIds = new Set(lesson.items.map((item) => item.id));
    for (const exercise of lesson.exercises) {
      const validOptionIds = exercise.options.map((option) => option.id);
      if (
        !itemIds.has(exercise.itemId) ||
        new Set(validOptionIds).size !== validOptionIds.length ||
        !validOptionIds.includes(exercise.correctOptionId)
      ) {
        continue;
      }

      answerKeys.push({
        exerciseId: exercise.id,
        itemId: exercise.itemId,
        correctOptionId: exercise.correctOptionId,
        skill: exercise.skill,
        contentVersionId: lesson.versionId,
        validOptionIds,
        feedback: exercise.feedback,
      });
    }
  }

  return answerKeys;
}

export async function fetchAttemptHistory(
  client: SupabaseClient,
  userId: string,
  itemIds: readonly string[],
): Promise<AttemptEvent[]> {
  if (itemIds.length === 0) return [];

  const rows: unknown[] = [];
  let offset = 0;
  let expectedCount: number | null = null;

  while (offset < MAX_HISTORY_EVENTS) {
    const { data, error, count } = await client
      .from("attempt_events")
      .select(
        ATTEMPT_EVENT_COLUMNS,
        expectedCount === null ? { count: "exact" } : undefined,
      )
      .eq("user_id", userId)
      .in("item_id", itemIds)
      .order("answered_at", { ascending: true })
      .order("event_id", { ascending: true })
      .range(offset, offset + HISTORY_PAGE_SIZE - 1);

    if (error !== null || data === null) {
      throwDatabaseUnavailable();
    }

    if (expectedCount === null) {
      if (
        count === null ||
        !Number.isSafeInteger(count) ||
        count < 0 ||
        count > MAX_HISTORY_EVENTS
      ) {
        throwDatabaseUnavailable();
      }
      expectedCount = count;
    }
    rows.push(...data);
    offset += data.length;

    if (rows.length >= expectedCount) {
      return parseRows(attemptEventRowSchema, rows).map(toAttemptEvent);
    }
    if (data.length === 0) throwDatabaseUnavailable();
  }

  // Ne jamais calculer silencieusement une projection à partir d'un historique tronqué.
  throwDatabaseUnavailable();
}

function projectionPayload(projection: AttemptProjectionWrite) {
  const { state } = projection;
  if (
    state.lastEventId === null ||
    state.lastAnsweredAt === null ||
    state.dueAt === null
  ) {
    throwDatabaseUnavailable();
  }

  return {
    item_id: state.itemId,
    lesson_version_id: projection.contentVersionId,
    dimension: state.skill,
    mastery_permille: state.masteryScore,
    successful_attempts: state.successfulAttempts,
    consecutive_correct: state.consecutiveCorrect,
    attempt_count: state.totalAttempts,
    last_event_id: state.lastEventId,
    last_answered_at: state.lastAnsweredAt,
    due_at: state.dueAt,
    algorithm_version: state.algorithmVersion,
  };
}

function eventPayload(event: AttemptEvent) {
  const payload = {
    event_id: event.eventId,
    device_id: event.deviceId,
    exercise_id: event.exerciseId,
    item_id: event.itemId,
    lesson_version_id: event.contentVersionId,
    selected_option_id: event.selectedOptionId,
    dimension: event.skill,
    rating: event.rating,
    answered_at: event.answeredAt,
    duration_ms: event.durationMs,
    algorithm_version: event.algorithmVersion,
  };

  return {
    ...payload,
    payload_sha256: hashCanonical("thainaute.attempt-event/v1", payload),
  };
}

async function callCommitRpc(
  client: SupabaseClient,
  input: CommitAttemptBatchInput,
): Promise<CommitAttemptBatchResult> {
  const { data, error } = await client.rpc("commit_attempt_batch_v1", {
    p_user_id: input.userId,
    p_idempotency_key: input.idempotencyKey,
    p_request_sha256: input.requestSha256,
    p_expected_revision: input.expectedRevision,
    p_events: input.events.map(eventPayload),
    p_projections: input.projections.map(projectionPayload),
    p_response: input.response,
  });

  if (error !== null) {
    if (error.code === "TS003") return { kind: "idempotency_conflict" };
    if (error.code === "TS004") return { kind: "revision_conflict" };
    if (error.code === "TS005") return { kind: "event_collision" };
    throwDatabaseUnavailable();
  }
  const parsed = rpcResultSchema.safeParse(data);
  if (!parsed.success) throwDatabaseUnavailable();

  return { kind: parsed.data.kind, response: parsed.data.response };
}

export function createSupabaseAttemptRepository(input: {
  readonly url: string;
  readonly secretKey: string;
  readonly releaseId: string;
}): AttemptRepository {
  const client = createClient(input.url, input.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: { fetch: fetchSupabase },
  });

  return {
    async loadSnapshot({ userId, attempts }) {
      const deviceIds = unique(attempts.map((attempt) => attempt.deviceId));
      const contentVersionIds = unique(
        attempts.map((attempt) => attempt.contentVersionId),
      );
      const eventIds = unique(attempts.map((attempt) => attempt.eventId));

      for (let snapshotAttempt = 0; snapshotAttempt < 3; snapshotAttempt += 1) {
        const revisionBefore = await readProfileRevision(client, userId);
        const devicesPromise = client
          .from("devices")
          .select("id")
          .eq("user_id", userId)
          .in("id", deviceIds);
        const lessonsPromise = client
          .from("lesson_versions")
          .select(
            "id,lesson_id,version,release_id,status,title_fr,payload,payload_sha256,published_at,content_releases!inner(id,version,status,published_at)",
          )
          .in("id", contentVersionIds)
          .eq("release_id", input.releaseId)
          .eq("status", "published")
          .eq("content_releases.status", "published");
        const eventIdentityPromise = client
          .from("attempt_events")
          .select("event_id,user_id")
          .in("event_id", eventIds);
        const ownIdentityEventsPromise = client
          .from("attempt_events")
          .select(ATTEMPT_EVENT_COLUMNS)
          .eq("user_id", userId)
          .in("event_id", eventIds);
        const [
          devicesResponse,
          lessonsResponse,
          identityResponse,
          ownIdentityResponse,
        ] = await Promise.all([
          devicesPromise,
          lessonsPromise,
          eventIdentityPromise,
          ownIdentityEventsPromise,
        ]);

        if (
          devicesResponse.error !== null ||
          devicesResponse.data === null ||
          lessonsResponse.error !== null ||
          lessonsResponse.data === null ||
          identityResponse.error !== null ||
          identityResponse.data === null ||
          ownIdentityResponse.error !== null ||
          ownIdentityResponse.data === null
        ) {
          throwDatabaseUnavailable();
        }

        const devices = parseRows(deviceRowSchema, devicesResponse.data);
        const answerKeys = derivePublishedAnswerKeys(
          lessonsResponse.data,
          input.releaseId,
        );
        const { itemIds, requestedPairs } = deriveAuthoritativeAttemptScope(
          attempts,
          answerKeys,
        );
        const history = await fetchAttemptHistory(client, userId, itemIds);
        const revisionAfter = await readProfileRevision(client, userId);
        if (revisionBefore !== revisionAfter) continue;

        const identities = parseRows(
          eventIdentityRowSchema,
          identityResponse.data,
        );
        const ownIdentityEvents = parseRows(
          attemptEventRowSchema,
          ownIdentityResponse.data,
        ).map(toAttemptEvent);
        const collidingEventIds = identities
          .filter((identity) => identity.user_id !== userId)
          .map((identity) => identity.event_id);
        const existingEventMap = new Map(
          [...history, ...ownIdentityEvents]
            .filter(
              (event) =>
                event.userId === userId &&
                (eventIds.includes(event.eventId) ||
                  requestedPairs.has(`${event.itemId}\u0000${event.skill}`)),
            )
            .map((event) => [event.eventId, event]),
        );

        return {
          revision: revisionAfter,
          registeredDeviceIds: devices.map((device) => device.id),
          existingEvents: [...existingEventMap.values()],
          collidingEventIds,
          answerKeys,
        };
      }

      throwDatabaseUnavailable();
    },

    commit(input) {
      return callCommitRpc(client, input);
    },
  };
}
