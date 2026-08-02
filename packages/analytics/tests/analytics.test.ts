import { describe, expect, it, vi } from "vitest";

import { createConsentAwareAnalytics } from "../src";

describe("analytics soumis au consentement", () => {
  it("ne transmet rien sans consentement", () => {
    const capture = vi.fn();
    createConsentAwareAnalytics(false, { capture }).capture({
      name: "lesson_started",
      lessonVersionId: "fixture-v1",
      platform: "web",
    });
    expect(capture).not.toHaveBeenCalled();
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
