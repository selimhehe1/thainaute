import { describe, expect, it } from "vitest";

import { apiResponseHeaders } from "../lib/server/api-http";

describe("en-têtes communs des réponses API", () => {
  it.each([200, 304, 400, 401, 403, 500])(
    "applique le challenge Bearer uniquement au statut 401 (%i)",
    (status) => {
      const headers = apiResponseHeaders(status, {
        ETag: '"sha256-test"',
      });

      expect(headers.get("x-content-type-options")).toBe("nosniff");
      expect(headers.get("etag")).toBe('"sha256-test"');
      expect(headers.get("www-authenticate")).toBe(
        status === 401 ? "Bearer" : null,
      );
    },
  );
});
