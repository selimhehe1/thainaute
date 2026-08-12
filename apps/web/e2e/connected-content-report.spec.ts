import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import { expect, test } from "@playwright/test";
import {
  SyncHttpApiError,
  accountExportDocumentSchema,
  createSyncHttpClient,
} from "@thainaute/sync";
import { createClient } from "@supabase/supabase-js";

import { resolveWebOrigin } from "./origin";

const WEB_ORIGIN = resolveWebOrigin();
const CONTENT_VERSION_ID = "30000000-0000-4000-8000-000000000102";
const ITEM_ID = "30000000-0000-4000-8000-000000000103";
const EXERCISE_ID = "30000000-0000-4000-8000-000000000104";

test.skip(
  process.env.THAINAUTE_CONTENT_REPORT_MODE !== "supabase",
  "Le signalement connecté exige son mode Supabase local isolé.",
);

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`La variable locale ${name} est absente.`);
  }
  return value;
}

async function readLocalOtp(email: string): Promise<string> {
  const query = new URLSearchParams({ query: `to:${email}` });
  const url = `http://127.0.0.1:54324/view/latest.html?${query.toString()}`;
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "text/html" },
        signal: AbortSignal.timeout(1_500),
      });
      if (response.ok) {
        const html = await response.text();
        const match =
          /letter-spacing:\s*8px;[\s\S]*?>\s*(\d{6})\s*<\/p>/iu.exec(html);
        if (match?.[1] !== undefined) return match[1];
      }
    } catch {
      // Mailpit peut indexer le message après la réponse Auth ; polling borné.
    }
    await delay(200);
  }

  throw new Error(
    "Le code OTP local n'a pas été trouvé dans le délai imparti.",
  );
}

async function createPermanentSession(): Promise<{
  readonly accessToken: string;
  readonly userId: string;
}> {
  const email = `connected-report-${randomUUID()}@thainaute.invalid`;
  const client = createClient(
    requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnvironment("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
  const otpRequest = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (otpRequest.error !== null) {
    throw new Error("Le compte local n'a pas pu demander son OTP.");
  }

  const verification = await client.auth.verifyOtp({
    email,
    token: await readLocalOtp(email),
    type: "email",
  });
  if (
    verification.error !== null ||
    verification.data.session === null ||
    verification.data.user === null
  ) {
    throw new Error("Le compte local n'a pas pu ouvrir sa session permanente.");
  }

  return {
    accessToken: verification.data.session.access_token,
    userId: verification.data.user.id.toLowerCase(),
  };
}

test("persiste, rejoue, exporte et masque un signalement structuré", async () => {
  test.setTimeout(45_000);
  const session = await createPermanentSession();
  const client = createSyncHttpClient({
    baseUrl: WEB_ORIGIN,
    allowInsecureHttp: true,
    expectedUserId: session.userId,
    getSession: () => session,
  });

  const idempotencyKey = randomUUID();
  const report = {
    idempotencyKey,
    body: {
      contentVersionId: CONTENT_VERSION_ID,
      exerciseId: EXERCISE_ID,
      category: "tone" as const,
      platform: "web" as const,
    },
    createdAt: new Date().toISOString(),
  };

  await expect(client.sendContentReport(report)).resolves.toEqual({
    status: "received",
  });
  await expect(client.sendContentReport(report)).resolves.toEqual({
    status: "duplicate",
  });

  const collision = await client
    .sendContentReport({
      ...report,
      body: { ...report.body, category: "meaning" },
    })
    .catch((error: unknown) => error);
  expect(collision).toBeInstanceOf(SyncHttpApiError);
  expect(collision).toMatchObject({
    endpoint: "content_report",
    status: 409,
    code: "idempotency_key_reused",
    retryable: false,
  });

  const accountExport = accountExportDocumentSchema.parse(
    await client.getAccountExport(),
  );
  expect(accountExport.format).toBe("thainaute.account-export/v2");
  expect(accountExport.identity.id).toBe(session.userId);
  expect(accountExport.data.profile).toMatchObject({
    syncRevision: 1,
  });
  expect(accountExport.data.devices).toEqual([]);
  expect(accountExport.data.contentReports).toHaveLength(1);
  expect(accountExport.data.contentReports[0]).toMatchObject({
    idempotencyKey,
    contentVersionId: CONTENT_VERSION_ID,
    itemId: ITEM_ID,
    exerciseId: EXERCISE_ID,
    category: "tone",
    platform: "web",
  });

  const directUrl = new URL(
    "/rest/v1/content_reports",
    requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
  );
  directUrl.searchParams.set("select", "user_id,idempotency_key");
  const directRead = await fetch(directUrl, {
    headers: {
      Accept: "application/json",
      apikey: requiredEnvironment("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  const directPayload = await directRead.text();
  expect(directRead.ok).toBe(false);
  expect([401, 403]).toContain(directRead.status);
  expect(directPayload).not.toContain(idempotencyKey);
  expect(directPayload).not.toContain(session.userId);
});
