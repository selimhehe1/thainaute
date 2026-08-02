import { describe, expect, it } from "vitest";

import { ContentReportInfrastructureError } from "../lib/server/content-report/errors";
import { parseContentReportRpcResult } from "../lib/server/content-report/supabase-repository";

describe("adaptateur Supabase des signalements", () => {
  it.each(["received", "duplicate"] as const)(
    "accepte uniquement le statut RPC %s",
    (status) => {
      expect(parseContentReportRpcResult({ status }, null)).toEqual({ status });
    },
  );

  it("classe la collision et les cibles invalides sans détail SQL", () => {
    expect(parseContentReportRpcResult(null, { code: "TR003" })).toEqual({
      status: "idempotency_conflict",
    });
    expect(parseContentReportRpcResult(null, { code: "TR001" })).toEqual({
      status: "invalid_target",
    });
    expect(parseContentReportRpcResult(null, { code: "TR004" })).toEqual({
      status: "invalid_target",
    });
  });

  it.each([
    [null, { code: "TR002" }],
    [null, { code: "42501" }],
    [{ status: "accepted" }, null],
    [{ status: "received", extra: "leak" }, null],
  ])("ferme les autres réponses RPC %#", (data, error) => {
    expect(() => parseContentReportRpcResult(data, error)).toThrow(
      ContentReportInfrastructureError,
    );
  });
});
