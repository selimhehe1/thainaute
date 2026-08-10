import { randomUUID } from "node:crypto";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, relative } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";
import { lessonProgressResponseSchema } from "@thainaute/sync";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { readAndDestroyPrivateHandoffFile } from "./connected-mobile-handoff-file";

const MAILPIT_ORIGIN = "http://127.0.0.1:54324";
const HANDOFF_OPT_IN_ENVIRONMENT = "THAINAUTE_MOBILE_HANDOFF_E2E";
const HANDOFF_FILE_ENVIRONMENT = "THAINAUTE_MOBILE_HANDOFF_FILE";
const MAX_HANDOFF_FILE_BYTES = 2_048;

const expectedProjectionSchema = z.strictObject({
  attemptCount: z.literal(1),
  masteryPermille: z.number().int().min(0).max(1_000),
  status: z.enum(["new", "learning", "confirmed"]),
  dueAt: z.iso
    .datetime({ precision: 3, offset: true })
    .transform((value) => new Date(value).toISOString()),
});

const handoffSchema = z.strictObject({
  schemaVersion: z.literal(1),
  syntheticAccountEmail: z
    .email()
    .max(254)
    .refine(
      (value) => value.toLowerCase().endsWith("@thainaute.invalid"),
      "Le compte de transfert doit être synthétique.",
    ),
  expected: expectedProjectionSchema,
});

type Handoff = z.infer<typeof handoffSchema>;
type ExpectedProjection = z.infer<typeof expectedProjectionSchema>;

const mailpitSearchSchema = z.object({
  messages: z.array(z.object({ ID: z.string().min(1) })),
});
const mailpitMessageSchema = z.object({
  Text: z.string(),
  HTML: z.string(),
});

const attemptVisibilityRowSchema = z.object({
  lesson_version_id: z.uuid(),
});
const stateVisibilityRowSchema = z.object({
  mastery_permille: z.number().int().min(0).max(1_000),
  attempt_count: z.number().int().nonnegative(),
  due_at: z.iso
    .datetime({ offset: true })
    .transform((value) => new Date(value).toISOString()),
});

type RlsRead =
  | { readonly kind: "denied" }
  | { readonly kind: "rows"; readonly rows: readonly unknown[] };

// Playwright 1.62 joint sinon automatiquement un snapshot ARIA à l'échec ;
// le formulaire Auth pourrait y recopier l'adresse synthétique du handoff.
process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";
test.use({ trace: "off", screenshot: "off", video: "off" });

test.skip(
  process.env.THAINAUTE_PUBLIC_CONTENT_MODE !== "supabase" ||
    process.env.THAINAUTE_SYNC_MODE !== "supabase" ||
    process.env[HANDOFF_OPT_IN_ENVIRONMENT] !== "1" ||
    process.env[HANDOFF_FILE_ENVIRONMENT] === undefined,
  "Le transfert mobile exige la stack Supabase locale et son fichier éphémère.",
);

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`La configuration locale ${name} est absente.`);
  }
  return value;
}

/**
 * Consomme un fichier à usage unique situé sous `os.tmpdir()` afin que
 * l'adresse synthétique ne rejoigne ni le dépôt ni les artefacts Playwright.
 *
 * Forme attendue :
 * { schemaVersion: 1, syntheticAccountEmail, expected: {
 *   attemptCount: 1, masteryPermille, status, dueAt
 * } }
 */
function consumeHandoff(): Handoff {
  const configuredPath = requiredEnvironment(HANDOFF_FILE_ENVIRONMENT);
  if (!isAbsolute(configuredPath)) {
    throw new Error("Le fichier de transfert doit utiliser un chemin absolu.");
  }

  let handoffPath: string;
  let temporaryRoot: string;
  try {
    handoffPath = realpathSync(configuredPath);
    temporaryRoot = realpathSync(tmpdir());
  } catch {
    throw new Error("Le fichier de transfert éphémère est inaccessible.");
  }

  const relativePath = relative(temporaryRoot, handoffPath);
  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
    isAbsolute(relativePath)
  ) {
    throw new Error(
      "Le fichier de transfert doit rester dans le répertoire temporaire système.",
    );
  }

  const serialized = readAndDestroyPrivateHandoffFile(
    handoffPath,
    MAX_HANDOFF_FILE_BYTES,
  );

  let payload: unknown;
  try {
    payload = JSON.parse(serialized.replace(/^\uFEFF/u, "")) as unknown;
  } catch {
    throw new Error("Le document de transfert est illisible.");
  }
  const result = handoffSchema.safeParse(payload);
  if (!result.success) {
    throw new Error("Le document de transfert ne respecte pas le contrat v1.");
  }
  return result.data;
}

function projectionMatches(
  actual: ExpectedProjection,
  expected: ExpectedProjection,
): boolean {
  return (
    actual.attemptCount === expected.attemptCount &&
    actual.masteryPermille === expected.masteryPermille &&
    actual.status === expected.status &&
    actual.dueAt === expected.dueAt
  );
}

async function fetchMailpitJson(url: URL): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(1_500),
  });
  if (!response.ok) throw new Error("mailpit_unavailable");
  return response.json() as Promise<unknown>;
}

async function mailpitMessageIds(email: string): Promise<Set<string>> {
  const url = new URL("/api/v1/search", MAILPIT_ORIGIN);
  url.searchParams.set("query", `to:${email}`);
  const result = mailpitSearchSchema.safeParse(await fetchMailpitJson(url));
  if (!result.success) throw new Error("mailpit_invalid");
  return new Set(result.data.messages.map(({ ID }) => ID));
}

function uniqueOtp(
  message: z.infer<typeof mailpitMessageSchema>,
): string | null {
  const canonical = /letter-spacing:\s*8px;[\s\S]*?>\s*(\d{6})\s*<\/p>/iu.exec(
    message.HTML,
  )?.[1];
  if (canonical !== undefined) return canonical;

  const matches = `${message.Text}\n${message.HTML}`.matchAll(
    /(?<!\d)(\d{6})(?!\d)/gu,
  );
  const values = new Set(Array.from(matches, (match) => match[1]));
  if (values.size !== 1) return null;
  return values.values().next().value ?? null;
}

async function readNewLocalOtp(
  email: string,
  previousMessageIds: ReadonlySet<string>,
): Promise<string> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const searchUrl = new URL("/api/v1/search", MAILPIT_ORIGIN);
      searchUrl.searchParams.set("query", `to:${email}`);
      const search = mailpitSearchSchema.safeParse(
        await fetchMailpitJson(searchUrl),
      );
      if (search.success) {
        for (const { ID } of search.data.messages) {
          if (previousMessageIds.has(ID)) continue;
          const messageUrl = new URL(
            `/api/v1/message/${encodeURIComponent(ID)}`,
            MAILPIT_ORIGIN,
          );
          const message = mailpitMessageSchema.safeParse(
            await fetchMailpitJson(messageUrl),
          );
          if (message.success) {
            const otp = uniqueOtp(message.data);
            if (otp !== null) return otp;
          }
        }
      }
    } catch {
      // Mailpit peut indexer le message après la réponse Auth.
    }
    await delay(200);
  }
  throw new Error("Le nouvel OTP local n'a pas été trouvé à temps.");
}

async function signInExistingSyntheticAccount(
  page: Page,
  email: string,
): Promise<void> {
  const previousMessages = await mailpitMessageIds(email);
  await page.goto("/account");
  await page.getByLabel("Adresse email").fill(email);
  await page.getByRole("button", { name: "Recevoir mon code" }).click();
  await expect(
    page.getByText("Code envoyé. Il expire rapidement."),
  ).toBeVisible();
  const otp = await readNewLocalOtp(email, previousMessages);
  await page.getByLabel("Code reçu par email").fill(otp);
  await page.getByRole("button", { name: "Me connecter" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Votre progression, sous votre contrôle.",
    }),
  ).toBeVisible();
}

async function createIsolatedAccountToken(): Promise<string> {
  const email = `mobile-handoff-isolation-${randomUUID()}@thainaute.invalid`;
  const previousMessages = await mailpitMessageIds(email);
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
  const requested = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (requested.error !== null) {
    throw new Error("Le compte d'isolation n'a pas pu demander son OTP.");
  }
  const verified = await client.auth.verifyOtp({
    email,
    token: await readNewLocalOtp(email, previousMessages),
    type: "email",
  });
  if (verified.error !== null || verified.data.session === null) {
    throw new Error("Le compte d'isolation n'a pas pu ouvrir sa session.");
  }
  return verified.data.session.access_token;
}

function bearerToken(authorization: string | undefined): string {
  const match = /^Bearer ([^\s]+)$/u.exec(authorization ?? "");
  if (match?.[1] === undefined) {
    throw new Error("La session web connectée est absente.");
  }
  return match[1];
}

async function readRlsRows(input: {
  readonly table: "attempt_events" | "learner_item_state";
  readonly select: string;
  readonly accessToken?: string;
}): Promise<RlsRead> {
  const url = new URL(
    `/rest/v1/${input.table}`,
    requiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
  );
  url.searchParams.set("select", input.select);
  const headers: Record<string, string> = {
    Accept: "application/json",
    apikey: requiredEnvironment("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
  if (input.accessToken !== undefined) {
    headers.Authorization = `Bearer ${input.accessToken}`;
  }
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(5_000),
  });
  if (response.status === 401 || response.status === 403) {
    return { kind: "denied" };
  }
  if (!response.ok) {
    throw new Error("La lecture RLS locale a échoué.");
  }
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("La lecture RLS locale est mal formée.");
  }
  return { kind: "rows", rows: payload };
}

function requireSingleRlsRow(read: RlsRead, message: string): unknown {
  if (read.kind !== "rows" || read.rows.length !== 1) {
    throw new Error(message);
  }
  return read.rows[0];
}

function requireEmptyRlsRead(read: RlsRead, message: string): void {
  if (read.kind !== "rows" || read.rows.length !== 0) {
    throw new Error(message);
  }
}

function requireAnonymousIsolation(read: RlsRead, message: string): void {
  if (read.kind === "rows" && read.rows.length !== 0) {
    throw new Error(message);
  }
}

function definitionValue(region: Locator, label: string): Locator {
  return region
    .locator("dt")
    .filter({ hasText: new RegExp(`^${label}$`, "u") })
    .locator("..")
    .locator("dd");
}

test("retrouve exactement sur le web la tentative mobile et prouve son isolation RLS", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const handoff = consumeHandoff();
  await signInExistingSyntheticAccount(page, handoff.syntheticAccountEmail);

  const lessonProgressResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      /^\/api\/v1\/progress\/lessons\/[0-9a-f-]+$/u.test(
        new URL(response.url()).pathname,
      ),
  );
  await page.goto("/learn/connected");
  const response = await lessonProgressResponse;
  if (!response.ok()) {
    throw new Error("La progression de la leçon connectée est indisponible.");
  }
  const parsed = lessonProgressResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("La progression de la leçon connectée est mal formée.");
  }
  const firstExercise = parsed.data.exercises[0];
  if (firstExercise === undefined) {
    throw new Error("La leçon connectée ne contient aucun exercice.");
  }
  const actualProjection: ExpectedProjection = {
    attemptCount: firstExercise.attemptCount as 1,
    masteryPermille: firstExercise.masteryPermille,
    status: firstExercise.status,
    dueAt: firstExercise.dueAt ?? "",
  };
  if (!projectionMatches(actualProjection, handoff.expected)) {
    throw new Error("La projection web diffère du résultat mobile attendu.");
  }

  const progressRegion = page.getByRole("region", {
    name: "Maîtrise et prochaine révision",
  });
  await expect(progressRegion).toBeVisible();
  await expect(
    definitionValue(progressRegion, "Maîtrise technique"),
  ).toHaveText(`${Math.round(handoff.expected.masteryPermille / 10)} %`);
  await expect(definitionValue(progressRegion, "Tentatives")).toHaveText("1");
  await expect(definitionValue(progressRegion, "État")).toHaveText(
    handoff.expected.status,
  );
  const dueAtLabel = await page.evaluate(
    (value) =>
      new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value)),
    handoff.expected.dueAt,
  );
  await expect(
    definitionValue(progressRegion, "Prochaine révision"),
  ).toHaveText(dueAtLabel);

  const requestHeaders = await response.request().allHeaders();
  const accountAToken = bearerToken(requestHeaders.authorization);
  const [accountAAttempts, accountAStates] = await Promise.all([
    readRlsRows({
      table: "attempt_events",
      select: "lesson_version_id",
      accessToken: accountAToken,
    }),
    readRlsRows({
      table: "learner_item_state",
      select: "mastery_permille,attempt_count,due_at",
      accessToken: accountAToken,
    }),
  ]);
  const attemptRow = attemptVisibilityRowSchema.safeParse(
    requireSingleRlsRow(
      accountAAttempts,
      "Le compte mobile ne possède pas exactement une tentative.",
    ),
  );
  if (
    !attemptRow.success ||
    attemptRow.data.lesson_version_id.toLowerCase() !==
      parsed.data.lessonVersionId
  ) {
    throw new Error("La tentative mobile ne cible pas la leçon affichée.");
  }
  const stateRow = stateVisibilityRowSchema.safeParse(
    requireSingleRlsRow(
      accountAStates,
      "Le compte mobile ne possède pas exactement une projection.",
    ),
  );
  if (
    !stateRow.success ||
    stateRow.data.attempt_count !== handoff.expected.attemptCount ||
    stateRow.data.mastery_permille !== handoff.expected.masteryPermille ||
    stateRow.data.due_at !== handoff.expected.dueAt
  ) {
    throw new Error("La projection RLS diffère du transfert attendu.");
  }

  const accountBToken = await createIsolatedAccountToken();
  const [accountBAttempts, accountBStates, anonymousAttempts, anonymousStates] =
    await Promise.all([
      readRlsRows({
        table: "attempt_events",
        select: "lesson_version_id",
        accessToken: accountBToken,
      }),
      readRlsRows({
        table: "learner_item_state",
        select: "mastery_permille,attempt_count,due_at",
        accessToken: accountBToken,
      }),
      readRlsRows({
        table: "attempt_events",
        select: "lesson_version_id",
      }),
      readRlsRows({
        table: "learner_item_state",
        select: "mastery_permille,attempt_count,due_at",
      }),
    ]);
  requireEmptyRlsRead(
    accountBAttempts,
    "Le compte B peut lire une tentative qui ne lui appartient pas.",
  );
  requireEmptyRlsRead(
    accountBStates,
    "Le compte B peut lire une projection qui ne lui appartient pas.",
  );
  requireAnonymousIsolation(
    anonymousAttempts,
    "L'anonyme peut lire une tentative de compte.",
  );
  requireAnonymousIsolation(
    anonymousStates,
    "L'anonyme peut lire une projection de compte.",
  );
});
