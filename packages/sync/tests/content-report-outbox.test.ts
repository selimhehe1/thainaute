import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  contentReportAggregateSchema,
  CONTENT_REPORT_CATEGORIES,
  CONTENT_REPORT_IDEMPOTENCY_HEADER,
  CONTENT_REPORT_OUTBOX_LEGACY_FORMAT,
  CONTENT_REPORT_OUTBOX_FORMAT,
  CONTENT_REPORT_PLATFORMS,
  CONTENT_REPORT_REJECTION_REASONS,
  CONTENT_REPORT_RESPONSE_STATUSES,
  MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES,
  ContentReportOutboxAckMismatchError,
  ContentReportOutboxCapacityError,
  ContentReportOutboxCollisionError,
  ContentReportOutboxRejectionMismatchError,
  ackContentReport,
  contentReportHeadersSchema,
  contentReportOutboxSnapshotSchema,
  contentReportRequestSchema,
  contentReportResponseSchema,
  createContentReportOutbox,
  createContentReportOutboxEntry,
  deserializeContentReportOutbox,
  discardRejectedContentReport,
  enqueueContentReport,
  parseContentReportHeaders,
  peekContentReport,
  readContentReportOutboxRejection,
  rejectContentReport,
  serializeContentReportOutbox,
  type ContentReportOutboxEntry,
  type ContentReportRequest,
} from "../src/index";

function uuid(namespace: number, sequence: number): string {
  return `${namespace.toString(16).padStart(8, "0")}-0000-4000-8000-${sequence
    .toString(16)
    .padStart(12, "0")}`;
}

function body(sequence = 1): ContentReportRequest {
  return {
    contentVersionId: uuid(1, sequence),
    exerciseId: uuid(2, sequence),
    category: "pronunciation",
    platform: "web",
  };
}

function entry(
  sequence = 1,
  overrides: Partial<ContentReportOutboxEntry> = {},
): ContentReportOutboxEntry {
  return {
    idempotencyKey: uuid(3, sequence),
    body: body(sequence),
    createdAt: `2026-08-02T10:${String(sequence % 60).padStart(2, "0")}:00.000Z`,
    ...overrides,
  };
}

describe("contrats HTTP du signalement de contenu", () => {
  it.each(CONTENT_REPORT_CATEGORIES)(
    "accepte uniquement la catégorie fermée %s",
    (category) => {
      expect(
        contentReportRequestSchema.safeParse({ ...body(), category }).success,
      ).toBe(true);
    },
  );

  it.each(CONTENT_REPORT_PLATFORMS)(
    "accepte uniquement la plateforme fermée %s",
    (platform) => {
      expect(
        contentReportRequestSchema.safeParse({ ...body(), platform }).success,
      ).toBe(true);
    },
  );

  it("canonicalise les UUID et refuse toute donnée libre ou inconnue", () => {
    expect(
      contentReportRequestSchema.parse({
        ...body(),
        contentVersionId: body().contentVersionId.toUpperCase(),
        exerciseId: body().exerciseId.toUpperCase(),
      }),
    ).toEqual(body());

    for (const forbidden of [
      { details: "texte libre" },
      { email: "personne@example.test" },
      { token: "secret" },
      { audio: "data:audio/wav;base64,sensible" },
      { idempotencyKey: uuid(3, 1) },
    ]) {
      expect(
        contentReportRequestSchema.safeParse({ ...body(), ...forbidden })
          .success,
      ).toBe(false);
    }
  });

  it("refuse les identifiants, catégories, plateformes et formes incomplètes", () => {
    expect(
      contentReportRequestSchema.safeParse({
        ...body(),
        contentVersionId: "version-libre",
      }).success,
    ).toBe(false);
    expect(
      contentReportRequestSchema.safeParse({
        ...body(),
        category: "other",
      }).success,
    ).toBe(false);
    expect(
      contentReportRequestSchema.safeParse({
        ...body(),
        platform: "windows",
      }).success,
    ).toBe(false);
    const withoutExercise = {
      contentVersionId: body().contentVersionId,
      category: body().category,
      platform: body().platform,
    };
    expect(contentReportRequestSchema.safeParse(withoutExercise).success).toBe(
      false,
    );
  });

  it("garde la clé UUID dans l'en-tête séparé du corps", () => {
    const headers = new Headers({
      [CONTENT_REPORT_IDEMPOTENCY_HEADER]: uuid(3, 1).toUpperCase(),
    });

    expect(parseContentReportHeaders(headers)).toEqual({
      idempotencyKey: uuid(3, 1),
    });
    expect(
      contentReportHeadersSchema.safeParse({
        idempotencyKey: uuid(3, 1),
        authorization: "Bearer secret",
      }).success,
    ).toBe(false);
    expect(() => parseContentReportHeaders(new Headers())).toThrow();
    expect(() =>
      parseContentReportHeaders(
        new Headers({ [CONTENT_REPORT_IDEMPOTENCY_HEADER]: "not-a-uuid" }),
      ),
    ).toThrow();
  });

  it.each(CONTENT_REPORT_RESPONSE_STATUSES)(
    "accepte la réponse fermée %s",
    (status) => {
      expect(contentReportResponseSchema.parse({ status })).toEqual({ status });
    },
  );

  it("refuse tout statut ou champ de réponse non prévu", () => {
    expect(
      contentReportResponseSchema.safeParse({ status: "accepted" }).success,
    ).toBe(false);
    expect(
      contentReportResponseSchema.safeParse({
        status: "received",
        message: "texte libre",
      }).success,
    ).toBe(false);
  });

  it("ferme l'agrégat Studio et exige la somme exacte", () => {
    const aggregate = {
      total: 2,
      byCategory: {
        orthography: 0,
        meaning: 0,
        pronunciation: 0,
        tone: 1,
        vowel_length: 0,
        register: 0,
        naturalness: 0,
        audio: 1,
      },
    };
    expect(contentReportAggregateSchema.parse(aggregate)).toEqual(aggregate);
    expect(
      contentReportAggregateSchema.safeParse({ ...aggregate, total: 3 })
        .success,
    ).toBe(false);
    expect(
      contentReportAggregateSchema.safeParse({
        ...aggregate,
        byCategory: { ...aggregate.byCategory, userId: uuid(9, 1) },
      }).success,
    ).toBe(false);
  });
});

describe("outbox locale des signalements", () => {
  it("crée une file vide versionnée et une entrée UTC canonique", () => {
    expect(createContentReportOutbox()).toEqual({
      format: CONTENT_REPORT_OUTBOX_FORMAT,
      entries: [],
      rejection: null,
    });
    expect(
      createContentReportOutboxEntry({
        ...entry(),
        idempotencyKey: entry().idempotencyKey.toUpperCase(),
        body: {
          ...entry().body,
          contentVersionId: entry().body.contentVersionId.toUpperCase(),
        },
        createdAt: "2026-08-02T12:01:00.000+02:00",
      }),
    ).toEqual(entry());
  });

  it("ajoute sans mutation, conserve l'ordre FIFO et permet peek", () => {
    const empty = createContentReportOutbox();
    const first = enqueueContentReport(empty, entry(1));
    const second = enqueueContentReport(first, entry(2));

    expect(empty.entries).toEqual([]);
    expect(first.entries).toEqual([entry(1)]);
    expect(second.entries).toEqual([entry(1), entry(2)]);
    expect(peekContentReport(second)).toEqual(entry(1));
    expect(peekContentReport(empty)).toBeNull();
  });

  it("rend un rejeu clé + corps identique neutre sans remplacer createdAt", () => {
    const queued = enqueueContentReport(createContentReportOutbox(), entry(1));
    const replayed = enqueueContentReport(queued, {
      ...entry(1),
      createdAt: "2026-08-03T10:00:00.000Z",
    });

    expect(replayed).toEqual(queued);
    expect(replayed.entries).toEqual([entry(1)]);
  });

  it.each([
    { contentVersionId: uuid(4, 1) },
    { exerciseId: uuid(5, 1) },
    { category: "tone" as const },
    { platform: "android" as const },
  ])("ferme une collision de clé si le corps diffère : %o", (bodyPatch) => {
    const queued = enqueueContentReport(createContentReportOutbox(), entry(1));
    const collision = { ...entry(1), body: { ...body(), ...bodyPatch } };

    expect(() => enqueueContentReport(queued, collision)).toThrow(
      ContentReportOutboxCollisionError,
    );
    expect(queued.entries).toEqual([entry(1)]);
  });

  it("borne la file à cinquante entrées sans perte silencieuse", () => {
    let snapshot = createContentReportOutbox();
    for (
      let sequence = 1;
      sequence <= MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES;
      sequence += 1
    ) {
      snapshot = enqueueContentReport(snapshot, entry(sequence));
    }

    expect(snapshot.entries).toHaveLength(
      MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES,
    );
    expect(() =>
      enqueueContentReport(
        snapshot,
        entry(MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES + 1),
      ),
    ).toThrow(ContentReportOutboxCapacityError);
    expect(snapshot.entries).toHaveLength(
      MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES,
    );
  });

  it.each(CONTENT_REPORT_RESPONSE_STATUSES)(
    "acquitte exactement la tête après une réponse %s",
    (status) => {
      const queued = enqueueContentReport(
        enqueueContentReport(createContentReportOutbox(), entry(1)),
        entry(2),
      );
      const acknowledged = ackContentReport(queued, entry(1), { status });

      expect(queued.entries).toEqual([entry(1), entry(2)]);
      expect(acknowledged.entries).toEqual([entry(2)]);
    },
  );

  it("refuse un ack vide, hors ordre, modifié ou au statut inconnu", () => {
    const queued = enqueueContentReport(
      enqueueContentReport(createContentReportOutbox(), entry(1)),
      entry(2),
    );

    expect(() =>
      ackContentReport(createContentReportOutbox(), entry(1), {
        status: "received",
      }),
    ).toThrow(ContentReportOutboxAckMismatchError);
    expect(() =>
      ackContentReport(queued, entry(2), { status: "received" }),
    ).toThrow(ContentReportOutboxAckMismatchError);
    expect(() =>
      ackContentReport(
        queued,
        { ...entry(1), createdAt: "2026-08-03T10:00:00.000Z" },
        { status: "duplicate" },
      ),
    ).toThrow(ContentReportOutboxAckMismatchError);
    expect(() =>
      ackContentReport(
        queued,
        {
          ...entry(1),
          body: { ...entry(1).body, category: "naturalness" },
        },
        { status: "received" },
      ),
    ).toThrow(ContentReportOutboxAckMismatchError);
    expect(() =>
      ackContentReport(queued, entry(1), { status: "accepted" } as never),
    ).toThrow();
    expect(queued.entries).toEqual([entry(1), entry(2)]);
  });

  it.each(CONTENT_REPORT_REJECTION_REASONS)(
    "conserve le refus terminal %s sans retirer ni réordonner la tête",
    (reason) => {
      const queued = enqueueContentReport(
        enqueueContentReport(createContentReportOutbox(), entry(1)),
        entry(2),
      );
      const rejected = rejectContentReport(queued, entry(1), {
        reason,
        rejectedAt: "2026-08-02T12:00:00.000Z",
      });

      expect(rejected.entries).toEqual([entry(1), entry(2)]);
      expect(peekContentReport(rejected)).toBeNull();
      expect(readContentReportOutboxRejection(rejected)).toEqual({
        entry: entry(1),
        reason,
        rejectedAt: "2026-08-02T12:00:00.000Z",
      });
      expect(() =>
        ackContentReport(rejected, entry(1), { status: "received" }),
      ).toThrow(ContentReportOutboxAckMismatchError);
      expect(
        rejectContentReport(rejected, entry(1), {
          reason,
          rejectedAt: "2026-08-02T12:00:01.000Z",
        }),
      ).toEqual(rejected);
    },
  );

  it("exige le refus exact pour le retrait puis rend la suite rejouable", () => {
    const rejected = rejectContentReport(
      enqueueContentReport(
        enqueueContentReport(createContentReportOutbox(), entry(1)),
        entry(2),
      ),
      entry(1),
      {
        reason: "invalid_request",
        rejectedAt: "2026-08-02T12:00:00.000Z",
      },
    );
    const exact = readContentReportOutboxRejection(rejected);
    if (exact === null) throw new Error("Expected a durable rejection.");

    expect(() =>
      discardRejectedContentReport(rejected, {
        ...exact,
        reason: "idempotency_key_reused",
      }),
    ).toThrow(ContentReportOutboxRejectionMismatchError);
    expect(() =>
      discardRejectedContentReport(rejected, {
        ...exact,
        rejectedAt: "2026-08-02T12:00:01.000Z",
      }),
    ).toThrow(ContentReportOutboxRejectionMismatchError);
    expect(() =>
      rejectContentReport(rejected, entry(2), {
        reason: "invalid_request",
        rejectedAt: exact.rejectedAt,
      }),
    ).toThrow(ContentReportOutboxRejectionMismatchError);

    const resumed = discardRejectedContentReport(rejected, exact);
    expect(resumed).toEqual({
      format: CONTENT_REPORT_OUTBOX_FORMAT,
      entries: [entry(2)],
      rejection: null,
    });
    expect(peekContentReport(resumed)).toEqual(entry(2));
  });

  it("sérialise et désérialise strictement sans données personnelles", () => {
    const queued = enqueueContentReport(createContentReportOutbox(), entry(1));
    const serialized = serializeContentReportOutbox(queued);

    expect(deserializeContentReportOutbox(serialized)).toEqual(queued);
    expect(serialized).not.toContain("email");
    expect(serialized).not.toContain("token");
    expect(serialized).not.toContain("audio/wav");
    expect(() => deserializeContentReportOutbox("{pas du json")).toThrow(
      "La file de signalements n'est pas un JSON valide.",
    );
    expect(() =>
      deserializeContentReportOutbox(
        JSON.stringify({ ...queued, email: "personne@example.test" }),
      ),
    ).toThrow();
    expect(() =>
      deserializeContentReportOutbox(
        JSON.stringify({
          ...queued,
          entries: [{ ...entry(1), token: "secret" }],
        }),
      ),
    ).toThrow();
    expect(() =>
      deserializeContentReportOutbox(
        JSON.stringify({ ...queued, format: "content-report-outbox-v0" }),
      ),
    ).toThrow();
    expect(() =>
      deserializeContentReportOutbox(
        JSON.stringify({
          ...queued,
          entries: Array.from(
            { length: MAX_PENDING_CONTENT_REPORT_OUTBOX_ENTRIES + 1 },
            (_, index) => entry(index + 1),
          ),
        }),
      ),
    ).toThrow();
  });

  it("migre strictement une file v1 vers v2 sans perte ni réordonnancement", () => {
    const legacy = JSON.stringify({
      format: CONTENT_REPORT_OUTBOX_LEGACY_FORMAT,
      entries: [entry(1), entry(2)],
    });

    expect(deserializeContentReportOutbox(legacy)).toEqual({
      format: CONTENT_REPORT_OUTBOX_FORMAT,
      entries: [entry(1), entry(2)],
      rejection: null,
    });
    expect(
      JSON.parse(
        serializeContentReportOutbox(deserializeContentReportOutbox(legacy)),
      ),
    ).toEqual({
      format: CONTENT_REPORT_OUTBOX_FORMAT,
      entries: [entry(1), entry(2)],
      rejection: null,
    });
    expect(() =>
      deserializeContentReportOutbox(
        JSON.stringify({
          format: CONTENT_REPORT_OUTBOX_LEGACY_FORMAT,
          entries: [entry(1)],
          rejection: null,
        }),
      ),
    ).toThrow();
  });

  it("refuse les doublons de clé dans un snapshot durable", () => {
    expect(
      contentReportOutboxSnapshotSchema.safeParse({
        format: CONTENT_REPORT_OUTBOX_FORMAT,
        entries: [
          entry(1),
          { ...entry(2), idempotencyKey: entry(1).idempotencyKey },
        ],
        rejection: null,
      }).success,
    ).toBe(false);
  });

  it("refuse un snapshot dont le rejet ne correspond pas exactement à la tête", () => {
    expect(
      contentReportOutboxSnapshotSchema.safeParse({
        format: CONTENT_REPORT_OUTBOX_FORMAT,
        entries: [entry(1), entry(2)],
        rejection: {
          entry: entry(2),
          reason: "invalid_request",
          rejectedAt: "2026-08-02T12:00:00.000Z",
        },
      }).success,
    ).toBe(false);
  });
});

describe("propriétés d'idempotence du signalement", () => {
  it("un nombre arbitraire de rejeux exacts ne crée qu'une entrée", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 100 }),
        (sequence, repetitions) => {
          const report = entry(sequence);
          let snapshot = enqueueContentReport(
            createContentReportOutbox(),
            report,
          );

          for (let replay = 0; replay < repetitions; replay += 1) {
            snapshot = enqueueContentReport(snapshot, report);
          }

          expect(snapshot.entries).toEqual([report]);
        },
      ),
    );
  });
});
