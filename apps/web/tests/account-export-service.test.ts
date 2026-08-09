import { describe, expect, it, vi } from "vitest";
import type {
  AccountExportAttemptEvent,
  AccountExportData,
  AccountExportIdentity,
} from "@thainaute/sync";

import { AccountExportInfrastructureError } from "../lib/server/account-export/errors";
import { createAccountExporter } from "../lib/server/account-export/service";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ACCESS_TOKEN = "header.payload.sensitive-token";
const DEVICE_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const EXERCISE_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ITEM_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const LESSON_VERSION_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const OPTION_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const identity: AccountExportIdentity = {
  id: USER_ID,
  email: "selim@example.test",
  phone: null,
  providers: ["email"],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: null,
  lastSignInAt: "2026-08-02T08:00:00.000Z",
  emailConfirmedAt: "2026-08-01T09:01:00.000Z",
  phoneConfirmedAt: null,
};

function accountData(): AccountExportData {
  const baseAttempt = {
    deviceId: DEVICE_ID,
    exerciseId: EXERCISE_ID,
    itemId: ITEM_ID,
    lessonVersionId: LESSON_VERSION_ID,
    skill: "listening" as const,
    rating: 1 as const,
    durationMs: 1_000,
    algorithmVersion: "srs-v0",
    payloadSha256: "a".repeat(64),
  };
  const attemptEvents: AccountExportAttemptEvent[] = [
    {
      ...baseAttempt,
      eventId: "10000000-0000-4000-8000-000000000011",
      selectedOptionId: OPTION_ID,
      answer: null,
      answeredAt: "2026-08-01T10:00:00.000Z",
      receivedAt: "2026-08-01T10:00:01.000Z",
    },
    {
      ...baseAttempt,
      eventId: "10000000-0000-4000-8000-000000000012",
      selectedOptionId: null,
      answer: {
        kind: "association",
        pairs: [
          {
            promptPairId: "10000000-0000-4000-8000-000000000021",
            chosenPairId: "10000000-0000-4000-8000-000000000022",
          },
        ],
      },
      answeredAt: "2026-08-01T10:01:00.000Z",
      receivedAt: "2026-08-01T10:01:01.000Z",
    },
    {
      ...baseAttempt,
      eventId: "10000000-0000-4000-8000-000000000013",
      selectedOptionId: null,
      answer: {
        kind: "word_order",
        tokenIds: [
          "10000000-0000-4000-8000-000000000023",
          "10000000-0000-4000-8000-000000000024",
        ],
      },
      answeredAt: "2026-08-01T10:02:00.000Z",
      receivedAt: "2026-08-01T10:02:01.000Z",
    },
    {
      ...baseAttempt,
      eventId: "10000000-0000-4000-8000-000000000014",
      selectedOptionId: null,
      answer: { kind: "recall", value: "ขอบคุณครับ" },
      answeredAt: "2026-08-01T10:03:00.000Z",
      receivedAt: "2026-08-01T10:03:01.000Z",
    },
  ];

  return {
    profile: {
      createdAt: "2026-08-01T09:00:01.000Z",
      syncRevision: 4,
    },
    devices: [
      {
        id: DEVICE_ID,
        platform: "web",
        appVersion: "1.0.0",
        createdAt: "2026-08-01T09:00:02.000Z",
      },
    ],
    attemptEvents,
    learnerItemStates: [],
    contentReports: [],
  };
}

describe("service d'export de compte", () => {
  it("dérive le périmètre base du seul utilisateur Auth validé", async () => {
    const signal = new AbortController().signal;
    const verify = vi.fn(() => Promise.resolve(identity));
    const read = vi.fn(() =>
      Promise.resolve({
        profile: null,
        devices: [],
        attemptEvents: [],
        learnerItemStates: [],
        contentReports: [],
      }),
    );
    const exporter = createAccountExporter({
      identityVerifier: { verify },
      repository: { read },
      now: () => new Date("2026-08-02T10:00:00.000Z"),
    });

    await expect(
      exporter({ accessToken: ACCESS_TOKEN, signal }),
    ).resolves.toMatchObject({
      format: "thainaute.account-export/v2",
      exportedAt: "2026-08-02T10:00:00.000Z",
      identity: { id: USER_ID },
    });
    expect(verify).toHaveBeenCalledWith({
      accessToken: ACCESS_TOKEN,
      signal,
    });
    expect(read).toHaveBeenCalledWith({
      userId: USER_ID,
      accessToken: ACCESS_TOKEN,
      signal,
    });
  });

  it("valide et remet les anciennes options et les trois réponses typées", async () => {
    const exporter = createAccountExporter({
      identityVerifier: { verify: () => Promise.resolve(identity) },
      repository: { read: () => Promise.resolve(accountData()) },
      now: () => new Date("2026-08-02T10:00:00.000Z"),
    });

    const exported = await exporter({
      accessToken: ACCESS_TOKEN,
      signal: new AbortController().signal,
    });

    expect(
      exported.data.attemptEvents.map(({ selectedOptionId, answer }) => ({
        selectedOptionId,
        answer,
      })),
    ).toEqual([
      { selectedOptionId: OPTION_ID, answer: null },
      {
        selectedOptionId: null,
        answer: expect.objectContaining({ kind: "association" }),
      },
      {
        selectedOptionId: null,
        answer: expect.objectContaining({ kind: "word_order" }),
      },
      {
        selectedOptionId: null,
        answer: { kind: "recall", value: "ขอบคุณครับ" },
      },
    ]);
  });

  it("refuse les données repository malformées avant de produire un document", async () => {
    const data = accountData();
    const malformedData = {
      ...data,
      attemptEvents: [
        {
          ...data.attemptEvents[0],
          selectedOptionId: null,
          answer: null,
        },
      ],
    } as AccountExportData;
    const exporter = createAccountExporter({
      identityVerifier: { verify: () => Promise.resolve(identity) },
      repository: { read: () => Promise.resolve(malformedData) },
    });

    await expect(
      exporter({
        accessToken: ACCESS_TOKEN,
        signal: new AbortController().signal,
      }),
    ).rejects.toBeInstanceOf(AccountExportInfrastructureError);
  });
});
