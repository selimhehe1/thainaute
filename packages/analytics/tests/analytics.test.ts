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
});
