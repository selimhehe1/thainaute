import { describe, expect, it, vi } from "vitest";

import { AccountExportInfrastructureError } from "../lib/server/account-export/errors";
import {
  readBoundedAccountExportPages,
  readContentReports,
  readConsistentAccountExportData,
  type AccountExportSnapshotReader,
  type ContentReportRow,
  type DeviceRow,
  type ProfileRow,
} from "../lib/server/account-export/supabase-repository";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_USER_ID = "99999999-9999-4999-8999-999999999999";
const PROFILE_CREATED_AT = "2026-08-01T09:00:00.000Z";

function profile(syncRevision: number): ProfileRow {
  return {
    user_id: USER_ID,
    created_at: PROFILE_CREATED_AT,
    sync_revision: syncRevision,
  };
}

function device(appVersion: string): DeviceRow {
  return {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    user_id: USER_ID,
    platform: "web",
    app_version: appVersion,
    created_at: "2026-08-01T09:00:01.000Z",
  };
}

function contentReport(): ContentReportRow {
  return {
    user_id: USER_ID,
    idempotency_key: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    lesson_version_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    item_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    exercise_id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    category: "tone",
    platform: "web",
    received_at: "2026-08-01T09:05:00.000Z",
  };
}

function reader(input: {
  readonly profiles: Array<ProfileRow | null>;
  readonly devices?: DeviceRow[][];
  readonly contentReports?: ContentReportRow[][];
}): AccountExportSnapshotReader {
  const profiles = [...input.profiles];
  const devices = [...(input.devices ?? [[], []])];
  const contentReports = [...(input.contentReports ?? [[]])];
  return {
    readProfile: vi.fn(() => Promise.resolve(profiles.shift() ?? profile(999))),
    readDevices: vi.fn(() => Promise.resolve(devices.shift() ?? [])),
    readAttemptEvents: vi.fn(() => Promise.resolve([])),
    readLearnerItemStates: vi.fn(() => Promise.resolve([])),
    readContentReports: vi.fn(() =>
      Promise.resolve(contentReports.shift() ?? []),
    ),
  };
}

describe("pagination bornée de l'export de compte", () => {
  it("lit toutes les pages annoncées sans troncature", async () => {
    const calls: Array<[number, number, boolean]> = [];
    const rows = Array.from({ length: 1_500 }, (_, index) => ({ index }));

    await expect(
      readBoundedAccountExportPages({
        maxRows: 2_000,
        readPage: (from, to, includeExactCount) => {
          calls.push([from, to, includeExactCount]);
          return Promise.resolve({
            data: rows.slice(from, Math.min(to + 1, rows.length)),
            error: null,
            count: includeExactCount ? rows.length : null,
          });
        },
      }),
    ).resolves.toHaveLength(1_500);

    expect(calls).toEqual([
      [0, 999, true],
      [1_000, 1_999, false],
    ]);
  });

  it("refuse un count au-dessus de la borne avant de produire un résultat", async () => {
    await expect(
      readBoundedAccountExportPages({
        maxRows: 10_000,
        readPage: () =>
          Promise.resolve({ data: [], error: null, count: 10_001 }),
      }),
    ).rejects.toMatchObject({
      name: "AccountExportApiError",
      code: "export_capacity_exceeded",
    });
  });

  it("ferme une page en erreur, sans count exact ou interrompue", async () => {
    const missingCount = readBoundedAccountExportPages({
      maxRows: 10,
      readPage: () => Promise.resolve({ data: [], error: null, count: null }),
    });
    await expect(missingCount).rejects.toBeInstanceOf(
      AccountExportInfrastructureError,
    );

    let call = 0;
    const interrupted = readBoundedAccountExportPages({
      maxRows: 10,
      readPage: () => {
        call += 1;
        return Promise.resolve(
          call === 1
            ? { data: [{}], error: null, count: 2 }
            : { data: [], error: null, count: null },
        );
      },
    });
    await expect(interrupted).rejects.toBeInstanceOf(
      AccountExportInfrastructureError,
    );
  });
});

describe("lecture privilégiée des signalements exportés", () => {
  it("applique le filtre propriétaire avant toute page lue", async () => {
    const range = vi.fn().mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    });
    const secondOrder = vi.fn(() => ({ range }));
    const firstOrder = vi.fn(() => ({ order: secondOrder }));
    const eq = vi.fn(() => ({ order: firstOrder }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    await expect(
      readContentReports(
        { from } as unknown as Parameters<typeof readContentReports>[0],
        USER_ID,
      ),
    ).resolves.toEqual([]);

    expect(from).toHaveBeenCalledWith("content_reports");
    expect(eq).toHaveBeenCalledWith("user_id", USER_ID);
    expect(range).toHaveBeenCalledWith(0, 999);
  });
});

describe("cohérence du snapshot de compte", () => {
  it("relit une fois après changement de révision puis rend la passe stable", async () => {
    const snapshotReader = reader({
      profiles: [profile(1), profile(2), profile(2), profile(2)],
      devices: [[], [], [], []],
    });

    await expect(
      readConsistentAccountExportData({
        userId: USER_ID,
        reader: snapshotReader,
      }),
    ).resolves.toMatchObject({ profile: { syncRevision: 2 } });
    expect(snapshotReader.readAttemptEvents).toHaveBeenCalledTimes(2);
    expect(snapshotReader.readDevices).toHaveBeenCalledTimes(4);
  });

  it("relit aussi après mutation canonique d'un appareil", async () => {
    const snapshotReader = reader({
      profiles: [profile(3), profile(3), profile(3), profile(3)],
      devices: [
        [device("1.0.0")],
        [device("1.1.0")],
        [device("1.1.0")],
        [device("1.1.0")],
      ],
    });

    await expect(
      readConsistentAccountExportData({
        userId: USER_ID,
        reader: snapshotReader,
      }),
    ).resolves.toMatchObject({
      devices: [{ appVersion: "1.1.0" }],
    });
    expect(snapshotReader.readAttemptEvents).toHaveBeenCalledTimes(2);
  });

  it("inclut les signalements du sujet dans la révision stable", async () => {
    const snapshotReader = reader({
      profiles: [profile(4), profile(4)],
      contentReports: [[contentReport()]],
    });

    await expect(
      readConsistentAccountExportData({
        userId: USER_ID,
        reader: snapshotReader,
      }),
    ).resolves.toMatchObject({
      contentReports: [
        {
          idempotencyKey: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
          category: "tone",
          platform: "web",
        },
      ],
    });
  });

  it("refuse toute ligne de signalement d'un autre sujet malgré la clé serveur", async () => {
    const snapshotReader = reader({
      profiles: [profile(4), profile(4)],
      contentReports: [[{ ...contentReport(), user_id: OTHER_USER_ID }]],
    });

    await expect(
      readConsistentAccountExportData({
        userId: USER_ID,
        reader: snapshotReader,
      }),
    ).rejects.toBeInstanceOf(AccountExportInfrastructureError);
  });

  it("renvoie un conflit après deux snapshots mouvants", async () => {
    const snapshotReader = reader({
      profiles: [profile(1), profile(2), profile(3), profile(4)],
      devices: [[], [], [], []],
    });

    await expect(
      readConsistentAccountExportData({
        userId: USER_ID,
        reader: snapshotReader,
      }),
    ).rejects.toMatchObject({
      name: "AccountExportApiError",
      code: "concurrent_update",
    });
  });
});
