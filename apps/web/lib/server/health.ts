import { NextResponse } from "next/server";

import { apiResponseHeaders } from "./api-http";

export function healthJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: apiResponseHeaders(status, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
    }),
  });
}
