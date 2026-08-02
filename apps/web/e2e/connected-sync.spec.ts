import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import {
  expect,
  test,
  type Page,
  type Response as PlaywrightResponse,
} from "@playwright/test";
import {
  anonymousProgressFusionMarkerSchema,
  accountExportDocumentSchema,
  accountExportErrorResponseSchema,
  attemptBatchResponseSchema,
  attemptBatchSchema,
  attemptOutboxSnapshotSchema,
  createSyncHttpClient,
  deviceRegistrationResponseSchema,
  progressSnapshotResponseSchema,
  type AttemptOutboxSnapshot,
  type ValidatedAttemptSubmission,
} from "@thainaute/sync";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const WEB_ORIGIN = "http://localhost:3000";
const LEARNING_DATABASE = "thainaute-learning-v1";
const ANONYMOUS_OUTBOX_KEY = "attempts-v1";
const FUSION_MARKER_KEY = "anonymous-progress-fusion-v1";

const CONTENT_VERSION_ID = "30000000-0000-4000-8000-000000000102";
const ITEM_ID = "30000000-0000-4000-8000-000000000103";
const EXERCISE_ID = "30000000-0000-4000-8000-000000000104";
const CORRECT_OPTION_ID = "30000000-0000-4000-8000-000000000201";
const ANONYMOUS_DEVICE_ID = "40000000-0000-4000-8000-000000000001";
const WEB_EVENT_ID = "40000000-0000-4000-8000-000000000002";
const ANDROID_DEVICE_ID = "40000000-0000-4000-8000-000000000003";
const ANDROID_EVENT_ID = "40000000-0000-4000-8000-000000000004";
const ANDROID_IDEMPOTENCY_KEY = "40000000-0000-4000-8000-000000000005";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

const attemptEventRowSchema = z.strictObject({
  event_id: z.uuid(),
  user_id: z.uuid(),
  device_id: z.uuid(),
  exercise_id: z.uuid(),
  item_id: z.uuid(),
  lesson_version_id: z.uuid(),
  selected_option_id: z.uuid(),
  dimension: z.literal("listening"),
  rating: z.literal(1),
  answered_at: z.string().datetime({ offset: true }),
  duration_ms: z.number().int().nonnegative(),
  algorithm_version: z.literal("srs-v0"),
});

type AttemptEventRow = z.infer<typeof attemptEventRowSchema>;

test.skip(
  process.env.THAINAUTE_SYNC_MODE !== "supabase",
  "Le parcours connecté exige la stack Supabase locale isolée.",
);

function accountOutboxKey(userId: string): string {
  return `${ANONYMOUS_OUTBOX_KEY}:account:${userId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function singleItem<T>(items: readonly T[], message: string): T {
  const item = items[0];
  if (items.length !== 1 || item === undefined) throw new Error(message);
  return item;
}

function routeResponse(
  page: Page,
  method: "GET" | "POST",
  path: string,
): Promise<PlaywrightResponse> {
  return page.waitForResponse(
    (response) =>
      response.request().method() === method &&
      new URL(response.url()).pathname === path,
  );
}

async function parseResponse<T>(
  response: PlaywrightResponse,
  schema: z.ZodType<T>,
  message: string,
): Promise<T> {
  if (!response.ok()) throw new Error(message);
  const payload: unknown = await response.json();
  return schema.parse(payload);
}

async function seedAnonymousAttempt(
  page: Page,
  submission: ValidatedAttemptSubmission,
): Promise<void> {
  const snapshot = attemptOutboxSnapshotSchema.parse({
    schemaVersion: 3,
    owner: { kind: "anonymous" },
    syncRevision: 0,
    authoritativeStates: [],
    entries: [{ status: "pending", submission }],
    inFlight: null,
  });

  await page.goto("/");
  await page.evaluate(
    ({ databaseName, key, serializedSnapshot }) =>
      new Promise<void>((resolve, reject) => {
        const openRequest = indexedDB.open(databaseName, 1);
        openRequest.onupgradeneeded = () => {
          const database = openRequest.result;
          if (!database.objectStoreNames.contains("metadata")) {
            database.createObjectStore("metadata", { keyPath: "key" });
          }
          if (!database.objectStoreNames.contains("outbox")) {
            database.createObjectStore("outbox", { keyPath: "key" });
          }
        };
        openRequest.onerror = () =>
          reject(new Error("La base locale de test ne peut pas être ouverte."));
        openRequest.onsuccess = () => {
          const database = openRequest.result;
          const transaction = database.transaction("outbox", "readwrite");
          transaction.objectStore("outbox").put({
            key,
            snapshot: serializedSnapshot,
          });
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => {
            database.close();
            reject(
              new Error("La tentative locale de test ne peut pas être écrite."),
            );
          };
          transaction.onabort = transaction.onerror;
        };
      }),
    {
      databaseName: LEARNING_DATABASE,
      key: ANONYMOUS_OUTBOX_KEY,
      serializedSnapshot: JSON.stringify(snapshot),
    },
  );
}

async function readIndexedDbString(input: {
  readonly page: Page;
  readonly storeName: "metadata" | "outbox";
  readonly key: string;
  readonly field: "snapshot" | "value";
}): Promise<string> {
  return input.page.evaluate(
    ({ databaseName, storeName, key, field }) =>
      new Promise<string>((resolve, reject) => {
        const openRequest = indexedDB.open(databaseName);
        openRequest.onerror = () =>
          reject(new Error("La base locale de test est indisponible."));
        openRequest.onsuccess = () => {
          const database = openRequest.result;
          let transaction: IDBTransaction;
          try {
            transaction = database.transaction(storeName, "readonly");
          } catch {
            database.close();
            reject(new Error("Le stockage local attendu est absent."));
            return;
          }
          const request = transaction.objectStore(storeName).get(key);
          request.onerror = () => {
            database.close();
            reject(new Error("La donnée locale attendue est illisible."));
          };
          request.onsuccess = () => {
            const record: unknown = request.result;
            const value =
              typeof record === "object" && record !== null
                ? (record as Record<string, unknown>)[field]
                : undefined;
            database.close();
            if (typeof value !== "string") {
              reject(new Error("La donnée locale attendue est absente."));
              return;
            }
            resolve(value);
          };
        };
      }),
    {
      databaseName: LEARNING_DATABASE,
      storeName: input.storeName,
      key: input.key,
      field: input.field,
    },
  );
}

async function readOutboxSnapshot(
  page: Page,
  key: string,
): Promise<AttemptOutboxSnapshot> {
  const serialized = await readIndexedDbString({
    page,
    storeName: "outbox",
    key,
    field: "snapshot",
  });
  return attemptOutboxSnapshotSchema.parse(JSON.parse(serialized) as unknown);
}

async function readFusionMarker(page: Page) {
  const serialized = await readIndexedDbString({
    page,
    storeName: "metadata",
    key: FUSION_MARKER_KEY,
    field: "value",
  });
  return anonymousProgressFusionMarkerSchema.parse(
    JSON.parse(serialized) as unknown,
  );
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
      // Mailpit peut ne pas avoir encore indexé le message ; le polling est borné.
    }
    await delay(200);
  }

  throw new Error(
    "Le code OTP local n'a pas été trouvé dans le délai imparti.",
  );
}

async function createLocalAuthenticatedSession(): Promise<{
  readonly accessToken: string;
  readonly userId: string;
}> {
  const email = `connected-export-b-${randomUUID()}@thainaute.invalid`;
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
    throw new Error("Le compte B local n'a pas pu demander son OTP.");
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
    throw new Error("Le compte B local n'a pas pu ouvrir sa session.");
  }
  return {
    accessToken: verification.data.session.access_token,
    userId: verification.data.user.id.toLowerCase(),
  };
}

function bearerSession(authorization: string | undefined): {
  readonly accessToken: string;
  readonly userId: string;
} {
  if (authorization === undefined || !authorization.startsWith("Bearer ")) {
    throw new Error("La requête connectée ne contient pas de session valide.");
  }
  const accessToken = authorization.slice("Bearer ".length);
  const encodedPayload = accessToken.split(".")[1];
  if (encodedPayload === undefined) {
    throw new Error("La session connectée est illisible.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;
  } catch {
    throw new Error("La session connectée est illisible.");
  }
  const subject = isRecord(payload) ? payload.sub : undefined;
  if (typeof subject !== "string" || !UUID_PATTERN.test(subject)) {
    throw new Error("La session connectée ne possède pas de sujet valide.");
  }
  return { accessToken, userId: subject.toLowerCase() };
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`La variable locale ${name} est absente.`);
  }
  return value;
}

async function readAttemptEventsUnderRls(input: {
  readonly accessToken: string;
  readonly eventIds: readonly [string, string];
}): Promise<AttemptEventRow[]> {
  const supabaseUrl = requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = requiredEnvironment(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

  const url = new URL("/rest/v1/attempt_events", supabaseUrl);
  url.searchParams.set(
    "select",
    [
      "event_id",
      "user_id",
      "device_id",
      "exercise_id",
      "item_id",
      "lesson_version_id",
      "selected_option_id",
      "dimension",
      "rating",
      "answered_at",
      "duration_ms",
      "algorithm_version",
    ].join(","),
  );
  url.searchParams.set("event_id", `in.(${input.eventIds.join(",")})`);
  url.searchParams.set("order", "answered_at.asc,event_id.asc");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${input.accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("La relecture RLS locale des tentatives a échoué.");
  }
  const payload: unknown = await response.json();
  return z.array(attemptEventRowSchema).parse(payload);
}

function expectAttemptRow(
  row: AttemptEventRow,
  submission: ValidatedAttemptSubmission,
  userId: string,
): void {
  expect(row).toMatchObject({
    event_id: submission.eventId,
    user_id: userId,
    device_id: submission.deviceId,
    exercise_id: submission.exerciseId,
    item_id: ITEM_ID,
    lesson_version_id: submission.contentVersionId,
    selected_option_id: submission.selectedOptionId,
    dimension: "listening",
    rating: 1,
    duration_ms: submission.durationMs,
    algorithm_version: submission.algorithmVersion,
  });
  expect(new Date(row.answered_at).toISOString()).toBe(submission.answeredAt);
}

test("fusionne puis rejoue une progression sur deux transports et deux navigateurs", async ({
  browser,
  page,
  request,
}) => {
  test.setTimeout(60_000);
  const readinessResponse = await request.get("/api/v1/health/ready");
  expect(readinessResponse.status()).toBe(200);
  expect(await readinessResponse.json()).toMatchObject({
    status: "ok",
    checks: {
      auth: { status: "ok" },
      dataApi: { status: "ok" },
    },
  });

  const webAttempt: ValidatedAttemptSubmission = {
    eventId: WEB_EVENT_ID,
    deviceId: ANONYMOUS_DEVICE_ID,
    exerciseId: EXERCISE_ID,
    selectedOptionId: CORRECT_OPTION_ID,
    answeredAt: new Date(Date.now() - 5_000).toISOString(),
    durationMs: 700,
    contentVersionId: CONTENT_VERSION_ID,
    algorithmVersion: "srs-v0",
  };
  await seedAnonymousAttempt(page, webAttempt);
  await page.goto("/account");

  await expect(
    page.getByRole("heading", { name: "Retrouver sa progression partout." }),
  ).toBeVisible();
  const email = `connected-${randomUUID()}@thainaute.invalid`;
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  await expect(
    page.getByText("Code envoyé. Il expire rapidement."),
  ).toBeVisible();
  const otp = await readLocalOtp(email);
  await page.getByLabel("Code reçu par email").fill(otp);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Votre progression, sous votre contrôle.",
    }),
  ).toBeVisible();

  const registrationPromise = routeResponse(
    page,
    "POST",
    "/api/v1/devices/register",
  );
  const initialSnapshotPromise = routeResponse(
    page,
    "GET",
    "/api/v1/progress/snapshot",
  );
  const webBatchPromise = routeResponse(page, "POST", "/api/v1/attempts/batch");
  await page.getByRole("button", { name: "Fusionner et synchroniser" }).click();
  const [registrationResponse, initialSnapshotResponse, webBatchResponse] =
    await Promise.all([
      registrationPromise,
      initialSnapshotPromise,
      webBatchPromise,
    ]);
  await expect(
    page.getByText("Progression fusionnée et synchronisée."),
  ).toBeVisible();

  const registration = await parseResponse(
    registrationResponse,
    deviceRegistrationResponseSchema,
    "L'enregistrement de l'appareil web a échoué.",
  );
  expect(registration.device).toMatchObject({
    platform: "web",
    appVersion: "0.0.1",
  });
  const initialSnapshot = await parseResponse(
    initialSnapshotResponse,
    progressSnapshotResponseSchema,
    "Le premier snapshot connecté a échoué.",
  );
  expect(initialSnapshot).toEqual({ syncRevision: 0, states: [] });

  const webBatchRequest: unknown = webBatchResponse.request().postDataJSON();
  const submittedWebBatch = attemptBatchSchema.parse(webBatchRequest);
  const submittedWebAttempt = singleItem(
    submittedWebBatch.attempts,
    "La fusion web doit envoyer une tentative.",
  );
  expect(submittedWebAttempt).toEqual({
    ...webAttempt,
    deviceId: registration.device.deviceId,
  });
  const webBatch = await parseResponse(
    webBatchResponse,
    attemptBatchResponseSchema,
    "Le lot web connecté a échoué.",
  );
  expect(webBatch.syncRevision).toBe(1);
  expect(
    singleItem(webBatch.results, "Le lot web doit avoir un résultat."),
  ).toEqual({
    eventId: WEB_EVENT_ID,
    status: "accepted",
    rating: 1,
  });
  expect(
    singleItem(webBatch.states, "Le lot web doit produire un état."),
  ).toMatchObject({
    itemId: ITEM_ID,
    skill: "listening",
    attemptCount: 1,
    successfulAttempts: 1,
    consecutiveCorrect: 1,
    algorithmVersion: "srs-v0",
  });

  const requestHeaders = await webBatchResponse.request().allHeaders();
  const session = bearerSession(requestHeaders.authorization);
  const [anonymousAfterFusion, accountAfterFusion, fusionMarker] =
    await Promise.all([
      readOutboxSnapshot(page, ANONYMOUS_OUTBOX_KEY),
      readOutboxSnapshot(page, accountOutboxKey(session.userId)),
      readFusionMarker(page),
    ]);
  expect(anonymousAfterFusion.entries).toEqual([]);
  expect(fusionMarker).toMatchObject({
    status: "completed",
    targetUserId: session.userId,
    accountDeviceId: registration.device.deviceId,
    eventIds: [WEB_EVENT_ID],
  });
  expect(accountAfterFusion.syncRevision).toBe(1);
  expect(accountAfterFusion.authoritativeStates).toEqual(webBatch.states);
  const fusedEntry = singleItem(
    accountAfterFusion.entries,
    "Le compte doit conserver la tentative web terminale.",
  );
  expect(fusedEntry).toEqual({
    status: "synced",
    submission: submittedWebAttempt,
    serverStatus: "accepted",
    rating: 1,
  });

  const androidClient = createSyncHttpClient({
    baseUrl: WEB_ORIGIN,
    allowInsecureHttp: true,
    expectedUserId: session.userId,
    getSession: () => ({
      accessToken: session.accessToken,
      userId: session.userId,
    }),
  });
  const androidRegistration = await androidClient.registerDevice({
    deviceId: ANDROID_DEVICE_ID,
    platform: "android",
    appVersion: "0.0.1",
  });
  expect(androidRegistration.device).toMatchObject({
    deviceId: ANDROID_DEVICE_ID,
    platform: "android",
  });
  expect(await androidClient.getProgressSnapshot()).toEqual({
    syncRevision: 1,
    states: webBatch.states,
  });

  const androidAttempt: ValidatedAttemptSubmission = {
    ...webAttempt,
    eventId: ANDROID_EVENT_ID,
    deviceId: ANDROID_DEVICE_ID,
    answeredAt: new Date(
      Date.parse(webAttempt.answeredAt) + 1_000,
    ).toISOString(),
    durationMs: 900,
  };
  const preparedAndroidBatch = {
    idempotencyKey: ANDROID_IDEMPOTENCY_KEY,
    batch: { attempts: [androidAttempt] },
  };
  const firstAndroidResponse =
    await androidClient.sendAttemptBatch(preparedAndroidBatch);
  const replayedAndroidResponse =
    await androidClient.sendAttemptBatch(preparedAndroidBatch);
  expect(replayedAndroidResponse).toEqual(firstAndroidResponse);
  expect(firstAndroidResponse.syncRevision).toBe(2);
  expect(
    singleItem(
      firstAndroidResponse.results,
      "Le lot Android doit avoir un résultat.",
    ),
  ).toEqual({
    eventId: ANDROID_EVENT_ID,
    status: "accepted",
    rating: 1,
  });
  expect(
    singleItem(
      firstAndroidResponse.states,
      "Le lot Android doit produire un état.",
    ),
  ).toMatchObject({
    itemId: ITEM_ID,
    skill: "listening",
    attemptCount: 2,
    successfulAttempts: 2,
    consecutiveCorrect: 2,
    algorithmVersion: "srs-v0",
  });
  expect(await androidClient.getProgressSnapshot()).toEqual({
    syncRevision: 2,
    states: firstAndroidResponse.states,
  });

  const authStorageState = await page.context().storageState({
    indexedDB: false,
  });
  const secondContext = await browser.newContext({
    baseURL: WEB_ORIGIN,
    storageState: authStorageState,
  });
  try {
    const secondPage = await secondContext.newPage();
    await secondPage.goto("/account");
    await expect(
      secondPage.getByRole("heading", {
        name: "Votre progression, sous votre contrôle.",
      }),
    ).toBeVisible();
    const secondRegistrationPromise = routeResponse(
      secondPage,
      "POST",
      "/api/v1/devices/register",
    );
    const secondSnapshotPromise = routeResponse(
      secondPage,
      "GET",
      "/api/v1/progress/snapshot",
    );
    await secondPage
      .getByRole("button", { name: "Synchroniser maintenant" })
      .click();
    const [secondRegistrationResponse, secondSnapshotResponse] =
      await Promise.all([secondRegistrationPromise, secondSnapshotPromise]);
    await expect(
      secondPage.getByText("Progression du compte synchronisée."),
    ).toBeVisible();

    const secondRegistration = await parseResponse(
      secondRegistrationResponse,
      deviceRegistrationResponseSchema,
      "L'enregistrement du second navigateur a échoué.",
    );
    expect(secondRegistration.device.deviceId).not.toBe(
      registration.device.deviceId,
    );
    expect(secondRegistration.device.deviceId).not.toBe(ANDROID_DEVICE_ID);
    const secondSnapshot = await parseResponse(
      secondSnapshotResponse,
      progressSnapshotResponseSchema,
      "Le snapshot du second navigateur a échoué.",
    );
    expect(secondSnapshot).toEqual({
      syncRevision: 2,
      states: firstAndroidResponse.states,
    });
    const hydratedLocalSnapshot = await readOutboxSnapshot(
      secondPage,
      accountOutboxKey(session.userId),
    );
    expect(hydratedLocalSnapshot).toMatchObject({
      syncRevision: 2,
      authoritativeStates: firstAndroidResponse.states,
      entries: [],
      inFlight: null,
    });
    const synchronizedMetric = secondPage
      .locator(".accountMetrics > div")
      .filter({ hasText: "états maîtrisés synchronisés" });
    await expect(synchronizedMetric.locator("strong")).toHaveText("1");
  } finally {
    await secondContext.close();
  }

  const rows = await readAttemptEventsUnderRls({
    accessToken: session.accessToken,
    eventIds: [WEB_EVENT_ID, ANDROID_EVENT_ID],
  });
  expect(rows).toHaveLength(2);
  const rowsByEventId = new Map(rows.map((row) => [row.event_id, row]));
  const webRow = rowsByEventId.get(WEB_EVENT_ID);
  const androidRow = rowsByEventId.get(ANDROID_EVENT_ID);
  if (webRow === undefined || androidRow === undefined) {
    throw new Error(
      "Les deux événements attendus ne sont pas visibles sous RLS.",
    );
  }
  expectAttemptRow(webRow, submittedWebAttempt, session.userId);
  expectAttemptRow(androidRow, androidAttempt, session.userId);

  const accountAExportResponse = await request.get("/api/v1/account/export", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });
  expect(accountAExportResponse.status()).toBe(200);
  expect(accountAExportResponse.headers()["cache-control"]).toContain(
    "no-store",
  );
  expect(accountAExportResponse.headers()["content-disposition"]).toBe(
    'attachment; filename="thainaute-account-export-v1.json"',
  );
  const accountAExport = accountExportDocumentSchema.parse(
    await accountAExportResponse.json(),
  );
  expect(accountAExport.identity.id).toBe(session.userId);
  expect(accountAExport.data.profile?.syncRevision).toBe(2);
  expect(
    accountAExport.data.attemptEvents.map((event) => event.eventId),
  ).toEqual([WEB_EVENT_ID, ANDROID_EVENT_ID]);
  expect(accountAExport.data.learnerItemStates).toHaveLength(1);
  expect(accountAExport.data.devices.map((device) => device.id)).toEqual(
    expect.arrayContaining([registration.device.deviceId, ANDROID_DEVICE_ID]),
  );

  const accountBSession = await createLocalAuthenticatedSession();
  const accountBExportResponse = await request.get("/api/v1/account/export", {
    headers: { Authorization: `Bearer ${accountBSession.accessToken}` },
  });
  expect(accountBExportResponse.status()).toBe(200);
  const accountBExport = accountExportDocumentSchema.parse(
    await accountBExportResponse.json(),
  );
  expect(accountBExport.identity.id).toBe(accountBSession.userId);
  expect(accountBExport.data).toEqual({
    profile: null,
    devices: [],
    attemptEvents: [],
    learnerItemStates: [],
  });
  expect(JSON.stringify(accountBExport)).not.toContain(session.userId);
  expect(JSON.stringify(accountBExport)).not.toContain(WEB_EVENT_ID);

  const anonymousExportResponse = await request.get("/api/v1/account/export");
  expect(anonymousExportResponse.status()).toBe(401);
  expect(
    accountExportErrorResponseSchema.parse(await anonymousExportResponse.json())
      .error.code,
  ).toBe("unauthorized");
});
