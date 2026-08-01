import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { AttemptInfrastructureError } from "../lib/server/attempt-sync/errors";
import { fetchAttemptHistory } from "../lib/server/attempt-sync/supabase-repository";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ITEM_ID = "32000000-0000-4000-8000-000000000001";

function eventRow(sequence: number) {
  const suffix = sequence.toString().padStart(12, "0");
  return {
    event_id: `50000000-0000-4000-8000-${suffix}`,
    user_id: USER_ID,
    device_id: "daaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    exercise_id: "51000000-0000-4000-8000-000000000001",
    item_id: ITEM_ID,
    lesson_version_id: "31000000-0000-4000-8000-000000000001",
    selected_option_id: "52000000-0000-4000-8000-000000000001",
    dimension: "listening",
    rating: 1,
    answered_at: `2026-08-01T10:00:0${sequence}.000Z`,
    duration_ms: 1_000,
    algorithm_version: "srs-v0",
  };
}

function paginatedClient(input: {
  readonly rows: readonly ReturnType<typeof eventRow>[];
  readonly serverPageLimit: number;
  readonly reportedCount?: number;
}) {
  const ranges: Array<readonly [number, number]> = [];
  const selectedOptions: unknown[] = [];
  const itemFilters: unknown[] = [];

  const client = {
    from(table: string) {
      expect(table).toBe("attempt_events");
      const builder = {
        select(_columns: string, options?: unknown) {
          selectedOptions.push(options);
          return builder;
        },
        eq() {
          return builder;
        },
        in(_column: string, values: unknown) {
          itemFilters.push(values);
          return builder;
        },
        order() {
          return builder;
        },
        async range(from: number, to: number) {
          ranges.push([from, to]);
          const pageEnd = Math.min(
            to + 1,
            from + input.serverPageLimit,
            input.rows.length,
          );
          return {
            data: input.rows.slice(from, pageEnd),
            error: null,
            count: input.reportedCount ?? input.rows.length,
          };
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;

  return { client, itemFilters, ranges, selectedOptions };
}

describe("pagination de l'historique autoritaire", () => {
  it("avance selon les lignes reçues même si PostgREST borne les pages", async () => {
    const fake = paginatedClient({
      rows: Array.from({ length: 5 }, (_, index) => eventRow(index + 1)),
      serverPageLimit: 2,
    });

    const events = await fetchAttemptHistory(fake.client, USER_ID, [ITEM_ID]);

    expect(events).toHaveLength(5);
    expect(fake.ranges).toEqual([
      [0, 999],
      [2, 1001],
      [4, 1003],
    ]);
    expect(fake.selectedOptions).toEqual([
      { count: "exact" },
      undefined,
      undefined,
    ]);
    expect(fake.itemFilters).toEqual([[ITEM_ID], [ITEM_ID], [ITEM_ID]]);
  });

  it("ne lance aucune requête sans item autoritaire", async () => {
    const fake = paginatedClient({ rows: [], serverPageLimit: 2 });

    await expect(
      fetchAttemptHistory(fake.client, USER_ID, []),
    ).resolves.toEqual([]);
    expect(fake.ranges).toEqual([]);
  });

  it("échoue fermée au-delà de la borne d'historique", async () => {
    const fake = paginatedClient({
      rows: [eventRow(1)],
      serverPageLimit: 1,
      reportedCount: 20_001,
    });

    await expect(
      fetchAttemptHistory(fake.client, USER_ID, [ITEM_ID]),
    ).rejects.toBeInstanceOf(AttemptInfrastructureError);
  });
});
