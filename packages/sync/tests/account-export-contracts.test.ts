import { describe, expect, it } from "vitest";

import {
  ACCOUNT_EXPORT_FORMAT,
  accountExportDocumentSchema,
  accountExportIdentitySchema,
} from "../src/index";

const ids = {
  user: "10000000-0000-4000-8000-000000000001",
  device: "20000000-0000-4000-8000-000000000001",
  event: "30000000-0000-4000-8000-000000000001",
  exercise: "40000000-0000-4000-8000-000000000001",
  item: "50000000-0000-4000-8000-000000000001",
  lesson: "60000000-0000-4000-8000-000000000001",
  option: "70000000-0000-4000-8000-000000000001",
  report: "80000000-0000-4000-8000-000000000001",
  associationEvent: "30000000-0000-4000-8000-000000000002",
  wordOrderEvent: "30000000-0000-4000-8000-000000000003",
  recallEvent: "30000000-0000-4000-8000-000000000004",
  promptPair: "90000000-0000-4000-8000-000000000001",
  chosenPair: "90000000-0000-4000-8000-000000000002",
  firstToken: "90000000-0000-4000-8000-000000000003",
  secondToken: "90000000-0000-4000-8000-000000000004",
} as const;

const identity = {
  id: ids.user,
  email: "selim@example.test",
  phone: null,
  providers: ["email"],
  createdAt: "2026-08-01T09:00:00.000Z",
  updatedAt: "2026-08-01T09:05:00.000Z",
  lastSignInAt: "2026-08-02T08:00:00.000Z",
  emailConfirmedAt: "2026-08-01T09:01:00.000Z",
  phoneConfirmedAt: null,
};

const document = {
  format: ACCOUNT_EXPORT_FORMAT,
  exportedAt: "2026-08-02T10:00:00.000Z",
  identity,
  data: {
    profile: {
      createdAt: "2026-08-01T09:00:01.000Z",
      syncRevision: 4,
    },
    devices: [
      {
        id: ids.device,
        platform: "web" as const,
        appVersion: "1.0.0",
        createdAt: "2026-08-01T09:00:02.000Z",
      },
    ],
    attemptEvents: [
      {
        eventId: ids.event,
        deviceId: ids.device,
        exerciseId: ids.exercise,
        itemId: ids.item,
        lessonVersionId: ids.lesson,
        selectedOptionId: ids.option,
        skill: "listening" as const,
        rating: 1 as const,
        answeredAt: "2026-08-01T10:00:00.000Z",
        durationMs: 1_500,
        algorithmVersion: "srs-v0",
        payloadSha256: "a".repeat(64),
        receivedAt: "2026-08-01T10:00:01.000Z",
      },
    ],
    learnerItemStates: [
      {
        itemId: ids.item,
        lessonVersionId: ids.lesson,
        skill: "listening" as const,
        masteryPermille: 500,
        successfulAttempts: 1,
        consecutiveCorrect: 1,
        attemptCount: 1,
        lastEventId: ids.event,
        lastAnsweredAt: "2026-08-01T10:00:00.000Z",
        dueAt: "2026-08-02T10:00:00.000Z",
        algorithmVersion: "srs-v0",
        updatedAt: "2026-08-01T10:00:01.000Z",
      },
    ],
    contentReports: [
      {
        idempotencyKey: ids.report,
        contentVersionId: ids.lesson,
        itemId: ids.item,
        exerciseId: ids.exercise,
        category: "tone" as const,
        platform: "web" as const,
        receivedAt: "2026-08-01T10:05:00.000Z",
      },
    ],
  },
};

describe("contrat de l'export de compte v2", () => {
  it("valide un ancien document v2 à option sans champ answer", () => {
    expect(accountExportDocumentSchema.parse(document)).toEqual(document);
    expect(
      accountExportDocumentSchema.parse(document).data.attemptEvents[0],
    ).not.toHaveProperty("answer");
    expect(
      accountExportDocumentSchema.safeParse({
        ...document,
        serviceRole: "ne-doit-jamais-sortir",
      }).success,
    ).toBe(false);
  });

  it("valide explicitement les réponses association, ordre des mots et rappel", () => {
    const typedAttempts = [
      {
        ...document.data.attemptEvents[0],
        eventId: ids.associationEvent,
        selectedOptionId: null,
        answer: {
          kind: "association" as const,
          pairs: [
            {
              promptPairId: ids.promptPair,
              chosenPairId: ids.chosenPair,
            },
          ],
        },
        answeredAt: "2026-08-01T10:01:00.000Z",
        receivedAt: "2026-08-01T10:01:01.000Z",
      },
      {
        ...document.data.attemptEvents[0],
        eventId: ids.wordOrderEvent,
        selectedOptionId: null,
        answer: {
          kind: "word_order" as const,
          tokenIds: [ids.firstToken, ids.secondToken],
          missedOnce: true,
        },
        answeredAt: "2026-08-01T10:02:00.000Z",
        receivedAt: "2026-08-01T10:02:01.000Z",
      },
      {
        ...document.data.attemptEvents[0],
        eventId: ids.recallEvent,
        selectedOptionId: null,
        answer: { kind: "recall" as const, value: "สวัสดีครับ" },
        answeredAt: "2026-08-01T10:03:00.000Z",
        receivedAt: "2026-08-01T10:03:01.000Z",
      },
    ];
    const candidate = {
      ...document,
      data: {
        ...document.data,
        attemptEvents: [...document.data.attemptEvents, ...typedAttempts],
      },
    };

    expect(accountExportDocumentSchema.parse(candidate)).toEqual(candidate);
  });

  it("refuse les réponses absentes, concurrentes ou malformées", () => {
    const baseTypedAttempt = {
      ...document.data.attemptEvents[0],
      eventId: ids.recallEvent,
      selectedOptionId: null,
      answer: { kind: "recall" as const, value: "สวัสดี" },
      answeredAt: "2026-08-01T10:03:00.000Z",
      receivedAt: "2026-08-01T10:03:01.000Z",
    };
    const acceptsAttempt = (attempt: unknown) =>
      accountExportDocumentSchema.safeParse({
        ...document,
        data: {
          ...document.data,
          attemptEvents: [...document.data.attemptEvents, attempt],
        },
      }).success;

    expect(acceptsAttempt({ ...baseTypedAttempt, answer: null })).toBe(false);
    expect(
      acceptsAttempt({ ...baseTypedAttempt, selectedOptionId: ids.option }),
    ).toBe(false);
    expect(
      acceptsAttempt({
        ...baseTypedAttempt,
        answer: { kind: "recall", value: "" },
      }),
    ).toBe(false);
    expect(
      acceptsAttempt({
        ...baseTypedAttempt,
        answer: {
          kind: "association",
          pairs: [
            {
              promptPairId: ids.promptPair,
              chosenPairId: ids.chosenPair,
            },
            {
              promptPairId: ids.promptPair,
              chosenPairId: ids.firstToken,
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it("ferme les metadata Auth libres et exige des providers canoniques", () => {
    expect(
      accountExportIdentitySchema.safeParse({
        ...identity,
        userMetadata: { texteLibre: "sensible" },
      }).success,
    ).toBe(false);
    expect(
      accountExportIdentitySchema.safeParse({
        ...identity,
        providers: ["google", "email"],
      }).success,
    ).toBe(false);
    expect(
      accountExportIdentitySchema.safeParse({
        ...identity,
        providers: ["email", "email"],
      }).success,
    ).toBe(false);
  });

  it("refuse un ordre instable ou des références tronquées", () => {
    const otherDevice = "20000000-0000-4000-8000-000000000002";
    expect(
      accountExportDocumentSchema.safeParse({
        ...document,
        data: {
          ...document.data,
          devices: [
            { ...document.data.devices[0], id: otherDevice },
            document.data.devices[0],
          ],
        },
      }).success,
    ).toBe(false);
    expect(
      accountExportDocumentSchema.safeParse({
        ...document,
        data: { ...document.data, devices: [] },
      }).success,
    ).toBe(false);
    expect(
      accountExportDocumentSchema.safeParse({
        ...document,
        data: { ...document.data, attemptEvents: [] },
      }).success,
    ).toBe(false);
  });

  it("accepte un compte Auth initial sans profil ni progression", () => {
    expect(
      accountExportDocumentSchema.safeParse({
        ...document,
        data: {
          profile: null,
          devices: [],
          attemptEvents: [],
          learnerItemStates: [],
          contentReports: [],
        },
      }).success,
    ).toBe(true);
  });
});
