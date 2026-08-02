import { describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_CONSENT_SCHEMA_VERSION,
  applyAnalyticsConsentDecision,
  createConsentAwareAnalytics,
  createInitialAnalyticsConsentSnapshot,
  parseAnalyticsConsentSnapshot,
  validateAnalyticsEvent,
  type AnalyticsConsentSnapshot,
  type AnalyticsEvent,
} from "../src";

const GRANTED_AT = "2026-08-02T08:00:00.000Z";
const DENIED_AT = "2026-08-02T08:01:00.000Z";
const LESSON_STARTED: AnalyticsEvent = {
  name: "lesson_started",
  lessonVersionId: "10000000-0000-4000-8000-000000000002",
  platform: "web",
};

describe("snapshot de consentement analytics", () => {
  it("est inconnu et ferme par defaut", () => {
    expect(createInitialAnalyticsConsentSnapshot()).toEqual({
      schemaVersion: ANALYTICS_CONSENT_SCHEMA_VERSION,
      decision: "unknown",
      revision: 0,
      updatedAt: null,
    });
  });

  it("applique des transitions pures avec une revision explicite", () => {
    const initial = createInitialAnalyticsConsentSnapshot();
    const initialBefore = { ...initial };

    const granted = applyAnalyticsConsentDecision(
      initial,
      "granted",
      GRANTED_AT,
    );
    const denied = applyAnalyticsConsentDecision(granted, "denied", DENIED_AT);

    expect(initial).toEqual(initialBefore);
    expect(granted).toEqual({
      schemaVersion: 1,
      decision: "granted",
      revision: 1,
      updatedAt: GRANTED_AT,
    });
    expect(denied).toEqual({
      schemaVersion: 1,
      decision: "denied",
      revision: 2,
      updatedAt: DENIED_AT,
    });
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(granted)).toBe(true);
    expect(Object.isFrozen(denied)).toBe(true);
  });

  it("parse uniquement le schema v1 exact", () => {
    const valid = {
      schemaVersion: 1,
      decision: "granted",
      revision: 4,
      updatedAt: GRANTED_AT,
    };

    expect(parseAnalyticsConsentSnapshot(valid)).toEqual(valid);
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, schemaVersion: 2 }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, decision: "yes" }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, revision: -1 }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, revision: 1.5 }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, updatedAt: "yesterday" }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({ ...valid, unexpected: true }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({
        schemaVersion: 1,
        decision: "granted",
        revision: 0,
        updatedAt: GRANTED_AT,
      }),
    ).toBeNull();
    expect(
      parseAnalyticsConsentSnapshot({
        schemaVersion: 1,
        decision: "unknown",
        revision: 1,
        updatedAt: GRANTED_AT,
      }),
    ).toBeNull();
    expect(parseAnalyticsConsentSnapshot(true)).toBeNull();
  });

  it("refuse les objets a getters ou prototypes inattendus", () => {
    const getter = vi.fn(() => "granted");
    const withGetter = {
      schemaVersion: 1,
      get decision() {
        return getter();
      },
      revision: 1,
      updatedAt: GRANTED_AT,
    };

    expect(parseAnalyticsConsentSnapshot(withGetter)).toBeNull();
    expect(getter).not.toHaveBeenCalled();
    expect(
      parseAnalyticsConsentSnapshot(
        Object.assign(Object.create({ inherited: "secret" }), {
          schemaVersion: 1,
          decision: "granted",
          revision: 1,
          updatedAt: GRANTED_AT,
        }),
      ),
    ).toBeNull();
  });
});

describe("catalogue analytics valide a l'execution", () => {
  it.each<AnalyticsEvent>([
    { name: "onboarding_started", platform: "web" },
    { name: "onboarding_completed", platform: "android" },
    LESSON_STARTED,
    {
      name: "exercise_answered",
      lessonVersionId: "lesson-v1",
      exerciseType: "audio_choice",
      correct: true,
      durationBucket: "under_10s",
      platform: "ios",
    },
    {
      name: "lesson_completed",
      lessonVersionId: "lesson-v1",
      platform: "web",
    },
    {
      name: "review_due",
      lessonVersionId: "lesson-v1",
      platform: "web",
    },
    {
      name: "review_completed",
      lessonVersionId: "lesson-v1",
      platform: "web",
    },
    { name: "content_reported", platform: "ios" },
    { name: "account_export_requested", platform: "web" },
    { name: "account_deletion_requested", platform: "android" },
  ])("accepte l'evenement borne $name", (event) => {
    expect(validateAnalyticsEvent(event)).toBe(true);
  });

  it.each([
    { ...LESSON_STARTED, email: "person@example.test" },
    { ...LESSON_STARTED, text: "texte libre" },
    { ...LESSON_STARTED, transcription: "เสียง" },
    { ...LESSON_STARTED, audio: "base64-secret" },
    { ...LESSON_STARTED, token: "secret-token" },
    { ...LESSON_STARTED, platform: "windows" },
    { ...LESSON_STARTED, lessonVersionId: "contains whitespace" },
    { ...LESSON_STARTED, lessonVersionId: "a".repeat(129) },
    { name: "unknown_event", platform: "web" },
    {
      name: "exercise_answered",
      lessonVersionId: "lesson-v1",
      exerciseType: "free_text",
      correct: true,
      durationBucket: "under_10s",
      platform: "web",
    },
  ])("refuse les champs libres, extras ou valeurs non bornees", (event) => {
    expect(validateAnalyticsEvent(event)).toBe(false);
  });

  it("refuse les getters sans les executer", () => {
    const leaked = vi.fn(() => "person@example.test");
    const event = {
      name: "content_reported",
      platform: "web",
      get email() {
        return leaked();
      },
    };

    expect(validateAnalyticsEvent(event)).toBe(false);
    expect(leaked).not.toHaveBeenCalled();
  });
});

describe("analytics soumis au consentement", () => {
  it("lit dynamiquement le consentement, retire immediatement et ne rejoue rien", () => {
    const capture = vi.fn();
    let consent: AnalyticsConsentSnapshot =
      createInitialAnalyticsConsentSnapshot();
    const analytics = createConsentAwareAnalytics(() => consent, { capture });

    analytics.capture(LESSON_STARTED);
    consent = applyAnalyticsConsentDecision(consent, "granted", GRANTED_AT);
    analytics.capture(LESSON_STARTED);
    consent = applyAnalyticsConsentDecision(consent, "denied", DENIED_AT);
    analytics.capture(LESSON_STARTED);

    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(LESSON_STARTED);
  });

  it("reste compatible avec les appels booleens", () => {
    const deniedCapture = vi.fn();
    const grantedCapture = vi.fn();

    createConsentAwareAnalytics(false, { capture: deniedCapture }).capture(
      LESSON_STARTED,
    );
    createConsentAwareAnalytics(true, { capture: grantedCapture }).capture(
      LESSON_STARTED,
    );

    expect(deniedCapture).not.toHaveBeenCalled();
    expect(grantedCapture).toHaveBeenCalledWith(LESSON_STARTED);
  });

  it("reste ferme si le snapshot dynamique est corrompu ou le lecteur leve", () => {
    const capture = vi.fn();
    const corruptAnalytics = createConsentAwareAnalytics(
      () => ({ decision: "granted" }),
      { capture },
    );
    const throwingAnalytics = createConsentAwareAnalytics(
      () => {
        throw new Error("storage unavailable");
      },
      { capture },
    );

    expect(() => corruptAnalytics.capture(LESSON_STARTED)).not.toThrow();
    expect(() => throwingAnalytics.capture(LESSON_STARTED)).not.toThrow();
    expect(capture).not.toHaveBeenCalled();
  });

  it("ne transmet jamais un evenement invalide meme avec consentement", () => {
    const capture = vi.fn();
    const analytics = createConsentAwareAnalytics(true, { capture });
    const unsafeEvent = {
      ...LESSON_STARTED,
      email: "person@example.test",
    } as unknown as AnalyticsEvent;

    expect(() => analytics.capture(unsafeEvent)).not.toThrow();
    expect(capture).not.toHaveBeenCalled();
  });

  it("ne bloque jamais le produit si le sink est invalide ou leve", () => {
    const invalidSink = createConsentAwareAnalytics(true, null);
    const throwingSink = createConsentAwareAnalytics(true, {
      capture() {
        throw new Error("provider unavailable");
      },
    });
    const rejectingSink = createConsentAwareAnalytics(true, {
      capture: () => Promise.reject(new Error("provider unavailable")),
    });

    expect(() => invalidSink.capture(LESSON_STARTED)).not.toThrow();
    expect(() => throwingSink.capture(LESSON_STARTED)).not.toThrow();
    expect(() => rejectingSink.capture(LESSON_STARTED)).not.toThrow();
  });

  it("transmet une copie validee sans contenu personnel", () => {
    const capture = vi.fn();
    const analytics = createConsentAwareAnalytics(true, { capture });

    analytics.capture({
      name: "account_deletion_requested",
      platform: "android",
    });

    expect(capture).toHaveBeenCalledWith({
      name: "account_deletion_requested",
      platform: "android",
    });
    expect(JSON.stringify(capture.mock.calls)).not.toMatch(
      /email|motivation|experience|goal|token|audio|transcription/i,
    );
    expect(Object.isFrozen(capture.mock.calls[0]?.[0])).toBe(true);
  });

  it("décrit une demande d’export sans identité ni contenu personnel", () => {
    const capture = vi.fn();
    createConsentAwareAnalytics(true, { capture }).capture({
      name: "account_export_requested",
      platform: "web",
    });

    expect(capture).toHaveBeenCalledWith({
      name: "account_export_requested",
      platform: "web",
    });
  });

  it("décrit une demande de suppression avec la seule plateforme", () => {
    const capture = vi.fn();
    createConsentAwareAnalytics(true, { capture }).capture({
      name: "account_deletion_requested",
      platform: "android",
    });

    expect(capture).toHaveBeenCalledWith({
      name: "account_deletion_requested",
      platform: "android",
    });
  });

  it("mesure un signalement sans catégorie, contenu ni identité", () => {
    const capture = vi.fn();
    createConsentAwareAnalytics(true, { capture }).capture({
      name: "content_reported",
      platform: "ios",
    });

    expect(capture).toHaveBeenCalledWith({
      name: "content_reported",
      platform: "ios",
    });
  });

  it("garde les réponses d’onboarding hors du catalogue analytics", () => {
    const capture = vi.fn();
    const analytics = createConsentAwareAnalytics(true, { capture });

    analytics.capture({ name: "onboarding_started", platform: "web" });
    analytics.capture({ name: "onboarding_completed", platform: "android" });

    expect(capture).toHaveBeenNthCalledWith(1, {
      name: "onboarding_started",
      platform: "web",
    });
    expect(capture).toHaveBeenNthCalledWith(2, {
      name: "onboarding_completed",
      platform: "android",
    });
    expect(JSON.stringify(capture.mock.calls)).not.toMatch(
      /motivation|experience|goal/i,
    );
  });
});
