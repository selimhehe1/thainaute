import { describe, expect, it, vi } from "vitest";

import { AccountExportInfrastructureError } from "../lib/server/account-export/errors";
import {
  readBoundedAccountExportPages,
  readConsistentAccountExportData,
  type AccountExportSnapshotReader,
  type DeviceRow,
  type ProfileRow,
} from "../lib/server/account-export/supabase-repository";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
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

function reader(input: {
  readonly profiles: Array<ProfileRow | null>;
  readonly devices?: DeviceRow[][];
}): AccountExportSnapshotReader {
  const profiles = [...input.profiles];
  const devices = [...(input.devices ?? [[], []])];
  return {
    readProfile: vi.fn(() => Promise.resolve(profiles.shift() ?? profile(999))),
    readDevices: vi.fn(() => Promise.resolve(devices.shift() ?? [])),
    readAttemptEvents: vi.fn(() => Promise.resolve([])),
    readLearnerItemStates: vi.fn(() => Promise.resolve([])),
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
