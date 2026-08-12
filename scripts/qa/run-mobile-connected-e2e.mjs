#!/usr/bin/env node

/**
 * Recette Android connectée locale.
 *
 * Next.js et Metro sont toujours lancés et possédés par cette recette afin de
 * garantir le code courant et les variables QA ; leurs ports doivent être libres.
 * Leurs commandes sont fixes afin de garantir une écoute strictement loopback.
 * Un build APK alternatif peut être fourni comme tableau JSON sans shell dans
 * THAINAUTE_QA_APK_BUILD_COMMAND_JSON.
 *
 * Le script ne journalise ni email, ni OTP, ni jeton. Les valeurs de connexion
 * passent uniquement par le stdin borné d'un shell ADB. Maestro atteste le
 * focus avant leur saisie ; le handler React les efface avant son premier
 * await et avant le flow suivant.
 * SIGKILL/TerminateProcess restent irrécupérables ; un prochain lancement
 * vérifie ses préconditions et ne nettoie que les ressources qu'il possède.
 */

/* global AbortController, AbortSignal, fetch */

import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { setTimeout as delay } from "node:timers/promises";
import { URL, fileURLToPath, pathToFileURL } from "node:url";

export const FIXTURE_RELEASE_ID = "30000000-0000-4000-8000-000000000001";
export const MOBILE_APP_ID = "com.thainaute.app";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIRECTORY, "../..");
const DEFAULT_APK =
  "apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk";
const DEFAULT_WEB_ORIGIN = "http://127.0.0.1:3000";
const DEFAULT_SUPABASE_ORIGIN = "http://127.0.0.1:54321";
const DEFAULT_MAILPIT_ORIGIN = "http://127.0.0.1:54324";
const DEFAULT_METRO_ORIGIN = "http://127.0.0.1:8081";
const DEFAULT_DEVICE_HOST = "10.0.2.2";
const MAX_CAPTURED_OUTPUT = 2_000_000;
const MAX_FOREGROUND_ACTIVITY_OUTPUT_BYTES = 4_096;
const MAX_AUTH_HIERARCHY_OUTPUT_BYTES = 512 * 1_024;
const METRO_DEBUG_HOST = "127.0.0.1:8081";
const METRO_IPV4_NODE_OPTIONS = "--dns-result-order=ipv4first";
const MAX_METRO_BUNDLE_BYTES = 32 * 1024 * 1024;
// React Native 0.86.2 lit `debug_http_host` dans les SharedPreferences par défaut.
const METRO_PREFERENCES_PATH = "shared_prefs/com.thainaute.app_preferences.xml";
const METRO_PREFERENCES_TEMP_PATH =
  "shared_prefs/.com.thainaute.app_preferences.xml.qa.tmp";
const SECURE_STORE_RELATIVE_PATH = "shared_prefs/SecureStore.xml";
const AUTH_HIERARCHY_PATH = "/data/local/tmp/thainaute-auth-hierarchy.xml";
const MOBILE_DEV_BUNDLE_PATH = "files/BridgelessReactNativeDevBundle.js";
const METRO_PREFERENCES_XML = `<?xml version='1.0' encoding='utf-8' standalone='yes' ?>\n<map>\n    <string name="debug_http_host">${METRO_DEBUG_HOST}</string>\n</map>\n`;
const MAX_PROCESS_INPUT = 65_536;
const MAX_ADB_SENSITIVE_INPUT_SCRIPT_BYTES = 8_192;
const MAX_AUTH_ADMIN_JSON_BYTES = 512 * 1024;
const MAX_MAILPIT_JSON_BYTES = 2 * 1024 * 1024;
const NEXT_TYPES_RELATIVE_PATH = "apps/web/next-env.d.ts";
const WINDOWS_PRIVATE_TEMP_ENV = "THAINAUTE_QA_PRIVATE_TEMP_ROOT";
const SETTINGS_SEARCH_COMPONENT =
  "com.google.android.settings.intelligence/com.google.android.settings.intelligence.modules.search.SearchActivity";
const FOREGROUND_ACTIVITY_PROBE_STDIN = [
  "set -eu",
  "dumpsys window | toybox sed -n -e '/^[[:space:]]*mCurrentFocus=/p' -e '/^[[:space:]]*mFocusedApp=/p'",
  "exit",
  "",
].join("\n");
const ADB_THAINAUTE_FOREGROUND_GUARD_LINES = Object.freeze([
  "foreground=\"$(dumpsys window 2>/dev/null | toybox sed -n -e '/^[[:space:]]*mCurrentFocus=/p' -e '/^[[:space:]]*mFocusedApp=/p')\"",
  "line_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*m(CurrentFocus|FocusedApp)=' || true)\"",
  "current_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*mCurrentFocus=Window\\{[^[:space:]{}]+[[:space:]]+u[0-9]+[[:space:]]+com\\.thainaute\\.app/\\.?[A-Za-z][A-Za-z0-9_.$]*\\}$' || true)\"",
  "focused_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*mFocusedApp=ActivityRecord\\{[^[:space:]{}]+[[:space:]]+u[0-9]+[[:space:]]+com\\.thainaute\\.app/\\.?[A-Za-z][A-Za-z0-9_.$]*([[:space:]]+[^{}]*)?\\}$' || true)\"",
  "[ \"$line_count\" = '2' ]",
  "[ \"$current_count\" = '1' ]",
  "[ \"$focused_count\" = '1' ]",
  "unset foreground line_count current_count focused_count",
]);
const SUPABASE_CLI_PACKAGE_CANDIDATES = Object.freeze({
  darwin: Object.freeze({
    arm64: Object.freeze(["darwin-arm64"]),
    x64: Object.freeze(["darwin-x64"]),
  }),
  linux: Object.freeze({
    arm64: Object.freeze(["linux-arm64", "linux-arm64-musl"]),
    x64: Object.freeze(["linux-x64", "linux-x64-musl"]),
  }),
  win32: Object.freeze({
    arm64: Object.freeze(["windows-arm64"]),
    x64: Object.freeze(["windows-x64"]),
  }),
});
const WINDOWS_PRIVATE_ACL_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
$root = [Environment]::GetEnvironmentVariable('THAINAUTE_QA_PRIVATE_TEMP_ROOT', 'Process')
if ([String]::IsNullOrWhiteSpace($root)) { exit 20 }
$item = Get-Item -LiteralPath $root -Force
if (-not $item.PSIsContainer) { exit 21 }
$currentSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
$systemSid = [Security.Principal.SecurityIdentifier]::new('S-1-5-18')
$inheritance = [Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [Security.AccessControl.InheritanceFlags]::ObjectInherit
$propagation = [Security.AccessControl.PropagationFlags]::None
$allow = [Security.AccessControl.AccessControlType]::Allow
$fullControl = [Security.AccessControl.FileSystemRights]::FullControl
$acl = [Security.AccessControl.DirectorySecurity]::new()
$acl.SetOwner($currentSid)
$acl.SetAccessRuleProtection($true, $false)
[void]$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($currentSid, $fullControl, $inheritance, $propagation, $allow))
[void]$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($systemSid, $fullControl, $inheritance, $propagation, $allow))
Set-Acl -LiteralPath $root -AclObject $acl
$expected = @($currentSid.Value, $systemSid.Value)
$rootAcl = Get-Acl -LiteralPath $root
if (-not $rootAcl.AreAccessRulesProtected) { exit 22 }
$rootRules = @($rootAcl.Access)
if ($rootRules.Count -ne 2) { exit 23 }
$seen = @{}
foreach ($rule in $rootRules) {
  $sid = $rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
  if (-not $expected.Contains($sid) -or $rule.AccessControlType -ne $allow -or $rule.IsInherited -or $rule.InheritanceFlags -ne $inheritance -or $rule.PropagationFlags -ne $propagation -or (($rule.FileSystemRights -band $fullControl) -ne $fullControl)) { exit 24 }
  $seen[$sid] = $true
}
if ($seen.Count -ne 2) { exit 25 }
$probe = Join-Path $root '.thainaute-private-acl-probe'
try {
  [IO.File]::WriteAllBytes($probe, [byte[]]::new(0))
  $probeAcl = Get-Acl -LiteralPath $probe
  $probeRules = @($probeAcl.Access)
  if ($probeRules.Count -ne 2) { exit 26 }
  $probeSeen = @{}
  foreach ($rule in $probeRules) {
    $sid = $rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value
    if (-not $expected.Contains($sid) -or $rule.AccessControlType -ne $allow -or -not $rule.IsInherited -or (($rule.FileSystemRights -band $fullControl) -ne $fullControl)) { exit 27 }
    $probeSeen[$sid] = $true
  }
  if ($probeSeen.Count -ne 2) { exit 28 }
} finally {
  Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue
}
`;

const FLOW_NAMES = Object.freeze({
  authReady: "connected-auth-ready.yaml",
  authEntry: "connected-auth-entry.yaml",
  authCodeReady: "connected-auth-code-ready.yaml",
  authVerify: "connected-auth-verify.yaml",
  authColdLaunch: "connected-auth-cold-launch.yaml",
  authColdOnboarding: "connected-auth-cold-onboarding.yaml",
  authColdAccount: "connected-auth-cold-account.yaml",
  authColdSignedIn: "connected-auth-cold-signed-in.yaml",
  prepareAccount: "connected-prepare-account.yaml",
  prepareOpen: "connected-prepare-open.yaml",
  prepareRoute: "connected-prepare-route.yaml",
  prepareAudio: "connected-prepare-audio.yaml",
  prepareOption: "connected-prepare-option.yaml",
  submitOffline: "connected-submit-offline.yaml",
  pendingAfterRelaunch: "connected-pending-after-relaunch.yaml",
  replayDropped: "connected-replay-dropped.yaml",
  replaySuccess: "connected-replay-success.yaml",
  replayProgress: "connected-replay-progress.yaml",
});

const SAFE_POST_OTP_STATES = Object.freeze([
  "signed_in",
  "provider_stale",
  "verify_in_flight",
  "verify_rejected",
  "otp_idle",
  "provider_loading",
  "root_storage_error",
  "root_resources_error",
  "root_resources_loading",
  "today_loading",
  "today_storage_error",
  "onboarding_redirect",
  "onboarding_loading",
  "onboarding_storage_error",
  "storage_error",
  "unconfigured",
  "development_launcher",
  "metro_unavailable",
  "dev_runtime_error",
  "onboarding",
  "today",
  "account_preview_ready",
  "account_preview_busy",
  "connected_option_ready",
  "connected_option_selected",
  "connected_option_blocked",
  "connected_submit_ready",
  "connected_attempt_pending",
  "connected_result",
  "connected_progress",
  "connected_loading",
  "connected_unavailable",
  "connected_typed_mismatch",
  "connected_lesson",
  "account_without_status_marker",
  "wrong_package",
  "unrecognized",
  "app_blank_or_splash",
  "semantic_unknown",
  "unavailable",
]);
const SAFE_COLD_AUTH_STEPS = Object.freeze([
  "launch",
  "onboarding",
  "account",
  "signed_in",
]);
const SAFE_FOREGROUND_STATES = Object.freeze([
  "thainaute",
  "settings_search",
  "other",
  "unavailable",
]);
const SAFE_CONNECTED_PREPARATION_STAGES = Object.freeze([
  "open",
  "route",
  "audio",
  "option",
  "submit",
  "pending_relaunch",
  "replay_dropped",
  "replay_success",
  "replay_progress",
]);

const runtimeSecrets = new Set();

export class MobileConnectedE2EError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "MobileConnectedE2EError";
  }
}

const SAFE_CLEANUP_STEPS = new Set([
  "application Android",
  "artefacts Maestro",
  "données Android privées",
  "handoff privé",
  "mode avion",
  "reverse Metro",
  "proxy local",
  "proxy Docker local",
  "processus local géré",
  "stack Supabase locale",
  "types Next.js",
]);

export function combineFailureWithCleanup(primaryFailure, cleanupSteps) {
  const steps = Array.from(
    new Set(
      [
        ...(Array.isArray(primaryFailure?.cleanupSteps)
          ? primaryFailure.cleanupSteps
          : []),
        ...(Array.isArray(cleanupSteps) ? cleanupSteps : []),
      ].filter((step) => SAFE_CLEANUP_STEPS.has(step)),
    ),
  );
  if (steps.length === 0) return primaryFailure;
  const cleanupMessage = `Nettoyage local incomplet : ${steps.join(", ")}.`;
  let failure;
  if (primaryFailure instanceof Error) {
    failure = new MobileConnectedE2EError(
      `${primaryFailure.message} ${cleanupMessage}`,
      { cause: primaryFailure },
    );
  } else {
    failure = new MobileConnectedE2EError(cleanupMessage);
  }
  Object.defineProperty(failure, "cleanupSteps", {
    configurable: false,
    enumerable: false,
    value: Object.freeze(steps),
    writable: false,
  });
  return failure;
}

export async function runWithSafeCleanup(operation, cleanup, cleanupStep) {
  if (
    typeof operation !== "function" ||
    typeof cleanup !== "function" ||
    !SAFE_CLEANUP_STEPS.has(cleanupStep)
  ) {
    throw new MobileConnectedE2EError("Nettoyage privé QA invalide.");
  }
  let operationFailed = false;
  let primaryFailure;
  let result;
  try {
    result = await operation();
  } catch (error) {
    operationFailed = true;
    primaryFailure = error;
  }
  try {
    await cleanup();
  } catch {
    throw combineFailureWithCleanup(operationFailed ? primaryFailure : null, [
      cleanupStep,
    ]);
  }
  if (operationFailed) throw primaryFailure;
  return result;
}

function pathIsStrictlyInside(parentDirectory, childPath) {
  const relative = path.relative(
    path.resolve(parentDirectory),
    path.resolve(childPath),
  );
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

export function buildWindowsPrivateAclCommand(rootDirectory, options = {}) {
  const platform = options.platform ?? process.platform;
  if (
    platform !== "win32" ||
    typeof rootDirectory !== "string" ||
    !path.isAbsolute(rootDirectory) ||
    containsCommandControlCharacter(rootDirectory) ||
    !pathIsStrictlyInside(os.tmpdir(), rootDirectory)
  ) {
    throw new MobileConnectedE2EError("Racine temporaire Windows invalide.");
  }
  return Object.freeze({
    command: "powershell.exe",
    args: Object.freeze([
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      WINDOWS_PRIVATE_ACL_SCRIPT,
    ]),
    env: Object.freeze({ [WINDOWS_PRIVATE_TEMP_ENV]: rootDirectory }),
  });
}

export function privateTempEnvironment(
  environment,
  rootDirectory,
  options = {},
) {
  if (
    environment === null ||
    typeof environment !== "object" ||
    typeof rootDirectory !== "string" ||
    !path.isAbsolute(rootDirectory) ||
    containsCommandControlCharacter(rootDirectory) ||
    rootDirectory.includes('"')
  ) {
    throw new MobileConnectedE2EError("Environnement temporaire QA invalide.");
  }
  const next = {
    ...environment,
    TEMP: rootDirectory,
    TMP: rootDirectory,
    TMPDIR: rootDirectory,
  };
  if (options.java === true) {
    const existing = environment.JAVA_TOOL_OPTIONS?.trim() ?? "";
    if (containsCommandControlCharacter(existing)) {
      throw new MobileConnectedE2EError(
        "JAVA_TOOL_OPTIONS est invalide pour la recette QA.",
      );
    }
    const privateJavaTemp = `-Djava.io.tmpdir="${rootDirectory}"`;
    next.JAVA_TOOL_OPTIONS =
      existing === "" ? privateJavaTemp : `${existing} ${privateJavaTemp}`;
  }
  return next;
}

export function formatCliFailure(error, interrupted, secrets = []) {
  if (interrupted) {
    if (Array.isArray(error?.cleanupSteps) && error.cleanupSteps.length > 0) {
      return redactSensitive(
        `Recette interrompue. Nettoyage local incomplet : ${error.cleanupSteps.join(", ")}.`,
        secrets,
      );
    }
    return "Recette interrompue ; nettoyage local terminé.";
  }
  return redactSensitive(
    error instanceof Error
      ? error.message
      : "La recette Android connectée a échoué.",
    secrets,
  );
}

export function terminationSignalsForPlatform(platform = process.platform) {
  return Object.freeze(
    platform === "win32"
      ? ["SIGINT", "SIGTERM", "SIGBREAK"]
      : ["SIGINT", "SIGTERM", "SIGHUP"],
  );
}

export function terminationSignalExitCode(signal) {
  const exitCodes = {
    SIGHUP: 129,
    SIGINT: 130,
    SIGBREAK: 131,
    SIGTERM: 143,
  };
  const exitCode = exitCodes[signal];
  if (exitCode === undefined) {
    throw new MobileConnectedE2EError("Signal d'interruption QA invalide.");
  }
  return exitCode;
}

function privateIpv4(hostname) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)) return false;
  const octets = hostname.split(".").map(Number);
  if (octets.some((value) => value < 0 || value > 255)) return false;
  const [first, second] = octets;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

export function isLoopbackOrRfc1918Hostname(hostnameInput) {
  const hostname = hostnameInput.trim().toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    privateIpv4(hostname)
  );
}

export function requirePrivateOrigin(value, label = "origine QA") {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new MobileConnectedE2EError(`${label} invalide.`);
  }
  if (
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.pathname !== "/" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    !isLoopbackOrRfc1918Hostname(parsed.hostname)
  ) {
    throw new MobileConnectedE2EError(
      `${label} doit rester une origine loopback ou RFC1918 sans identifiants.`,
    );
  }
  return parsed.origin;
}

export function assertNonProduction(environment = process.env) {
  if (environment.NODE_ENV?.trim().toLowerCase() === "production") {
    throw new MobileConnectedE2EError(
      "La recette Android connectée refuse NODE_ENV=production.",
    );
  }
}

function redactKnownValue(value, secret) {
  let result = value;
  for (const candidate of [secret, encodeURIComponent(secret)]) {
    if (candidate.length >= 4)
      result = result.split(candidate).join("[REDACTED]");
  }
  return result;
}

export function redactSensitive(value, secrets = []) {
  let result = String(value ?? "");
  for (const secret of secrets) {
    if (typeof secret === "string" && secret !== "") {
      result = redactKnownValue(result, secret);
    }
  }
  result = result
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[EMAIL]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/giu, "Bearer [TOKEN]")
    .replace(/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+\b/gu, "[TOKEN]")
    .replace(
      /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/gu,
      "[TOKEN]",
    );
  return result;
}

function rememberSecret(value) {
  if (typeof value === "string" && value !== "") runtimeSecrets.add(value);
}

export function maestroEnvironmentWithoutSecrets(environment, secrets = []) {
  if (
    environment === null ||
    typeof environment !== "object" ||
    secrets === null ||
    typeof secrets[Symbol.iterator] !== "function"
  ) {
    throw new MobileConnectedE2EError("Environnement Maestro local invalide.");
  }
  const secretValues = Array.from(secrets);
  if (
    secretValues.some(
      (secret) => typeof secret !== "string" || secret.length < 4,
    )
  ) {
    throw new MobileConnectedE2EError("Environnement Maestro local invalide.");
  }
  const sanitizedEntries = [];
  for (const [name, value] of Object.entries(environment)) {
    if (
      typeof value !== "string" ||
      name.startsWith("MAESTRO_") ||
      /(?:EMAIL|OTP|TOKEN|PASSWORD|SECRET|AUTHORIZATION|API_KEY)/iu.test(
        name,
      ) ||
      secretValues.some((secret) => value.includes(secret))
    ) {
      continue;
    }
    sanitizedEntries.push([name, value]);
  }
  return Object.freeze(Object.fromEntries(sanitizedEntries));
}

function integerFromEnvironment(value, fallback, label, minimum, maximum) {
  if (value === undefined || value.trim() === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new MobileConnectedE2EError(`${label} invalide.`);
  }
  return parsed;
}

function booleanFromEnvironment(value, fallback, label) {
  if (value === undefined || value.trim() === "") return fallback;
  if (value === "1") return true;
  if (value === "0") return false;
  throw new MobileConnectedE2EError(`${label} doit valoir 0 ou 1.`);
}

export function parseCommandHook(value, label) {
  if (value === undefined || value.trim() === "") return null;
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new MobileConnectedE2EError(`${label} doit être un tableau JSON.`);
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    parsed.length > 64 ||
    parsed.some(
      (entry) =>
        typeof entry !== "string" ||
        entry.length === 0 ||
        entry.length > 4_096 ||
        containsCommandControlCharacter(entry),
    )
  ) {
    throw new MobileConnectedE2EError(`${label} est invalide.`);
  }
  return Object.freeze({
    command: parsed[0],
    args: Object.freeze(parsed.slice(1)),
  });
}

function containsCommandControlCharacter(value) {
  return value.includes("\0") || value.includes("\r") || value.includes("\n");
}

function containsWindowsCmdMetacharacter(value) {
  return /[&|<>^%!"()]/u.test(value);
}

function resolveInsideRoot(rootDirectory, input, label) {
  const resolved = path.resolve(rootDirectory, input);
  const relative = path.relative(rootDirectory, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new MobileConnectedE2EError(`${label} doit rester dans le dépôt.`);
  }
  return resolved;
}

export function readRunnerConfig(
  environment = process.env,
  rootDirectory = DEFAULT_ROOT,
) {
  assertNonProduction(environment);
  const root = path.resolve(rootDirectory);
  const webOrigin = requirePrivateOrigin(
    environment.THAINAUTE_QA_WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN,
    "THAINAUTE_QA_WEB_ORIGIN",
  );
  const mailpitOrigin = requirePrivateOrigin(
    environment.THAINAUTE_QA_MAILPIT_ORIGIN ?? DEFAULT_MAILPIT_ORIGIN,
    "THAINAUTE_QA_MAILPIT_ORIGIN",
  );
  const metroOrigin = requirePrivateOrigin(
    environment.THAINAUTE_QA_METRO_ORIGIN ?? DEFAULT_METRO_ORIGIN,
    "THAINAUTE_QA_METRO_ORIGIN",
  );
  const parsedWebOrigin = new URL(webOrigin);
  const webPort = Number(parsedWebOrigin.port);
  if (
    parsedWebOrigin.protocol !== "http:" ||
    parsedWebOrigin.hostname !== "127.0.0.1" ||
    !Number.isInteger(webPort) ||
    webPort < 1_024 ||
    webPort > 65_535 ||
    webPort === 8_081 ||
    (webPort >= 54_320 && webPort <= 54_330)
  ) {
    throw new MobileConnectedE2EError(
      "THAINAUTE_QA_WEB_ORIGIN doit utiliser http://127.0.0.1 et un port local non réservé.",
    );
  }
  if (
    metroOrigin !== DEFAULT_METRO_ORIGIN ||
    mailpitOrigin !== DEFAULT_MAILPIT_ORIGIN
  ) {
    throw new MobileConnectedE2EError(
      "La recette isolée réserve Mailpit sur :54324 et Metro sur :8081 en loopback.",
    );
  }
  const deviceHost =
    environment.THAINAUTE_QA_DEVICE_HOST?.trim() || DEFAULT_DEVICE_HOST;
  if (!isLoopbackOrRfc1918Hostname(deviceHost)) {
    throw new MobileConnectedE2EError(
      "THAINAUTE_QA_DEVICE_HOST doit rester loopback ou RFC1918.",
    );
  }
  if (deviceHost !== DEFAULT_DEVICE_HOST) {
    throw new MobileConnectedE2EError(
      "La recette émulateur réserve l'alias Android 10.0.2.2.",
    );
  }
  const configuredRelease =
    environment.THAINAUTE_PUBLIC_CONTENT_RELEASE_ID?.trim() ||
    FIXTURE_RELEASE_ID;
  if (configuredRelease !== FIXTURE_RELEASE_ID) {
    throw new MobileConnectedE2EError(
      "La recette refuse toute release autre que la fixture technique.",
    );
  }
  const prepareSupabase = booleanFromEnvironment(
    environment.THAINAUTE_QA_PREPARE_SUPABASE,
    true,
    "THAINAUTE_QA_PREPARE_SUPABASE",
  );
  const resetDatabase = booleanFromEnvironment(
    environment.THAINAUTE_QA_RESET_DB,
    true,
    "THAINAUTE_QA_RESET_DB",
  );
  if (!prepareSupabase || !resetDatabase) {
    throw new MobileConnectedE2EError(
      "La recette connectée exige le démarrage et le reset Supabase locaux isolés.",
    );
  }
  if (
    environment.THAINAUTE_QA_WEB_COMMAND_JSON !== undefined ||
    environment.THAINAUTE_QA_METRO_COMMAND_JSON !== undefined
  ) {
    throw new MobileConnectedE2EError(
      "Les commandes Next.js et Metro de la recette QA ne sont pas surchargeables.",
    );
  }
  if (environment.SUPABASE_CLI_BINARY_OVERRIDE !== undefined) {
    throw new MobileConnectedE2EError(
      "Le binaire Supabase QA est résolu et attesté par la recette.",
    );
  }
  return Object.freeze({
    rootDirectory: root,
    webOrigin,
    mailpitOrigin,
    metroOrigin,
    deviceHost,
    serial: environment.ANDROID_SERIAL?.trim() || null,
    apkPath: resolveInsideRoot(
      root,
      environment.THAINAUTE_QA_APK_PATH?.trim() || DEFAULT_APK,
      "THAINAUTE_QA_APK_PATH",
    ),
    apkBuildCommand: parseCommandHook(
      environment.THAINAUTE_QA_APK_BUILD_COMMAND_JSON,
      "THAINAUTE_QA_APK_BUILD_COMMAND_JSON",
    ),
    apkBuildCwd: resolveInsideRoot(
      root,
      environment.THAINAUTE_QA_APK_BUILD_CWD?.trim() || "apps/mobile/android",
      "THAINAUTE_QA_APK_BUILD_CWD",
    ),
    prepareSupabase,
    resetDatabase,
    reuseDebugApk: booleanFromEnvironment(
      environment.THAINAUTE_QA_REUSE_DEBUG_APK,
      false,
      "THAINAUTE_QA_REUSE_DEBUG_APK",
    ),
    startupTimeoutMs: integerFromEnvironment(
      environment.THAINAUTE_QA_STARTUP_TIMEOUT_MS,
      90_000,
      "THAINAUTE_QA_STARTUP_TIMEOUT_MS",
      1_000,
      300_000,
    ),
    commandTimeoutMs: integerFromEnvironment(
      environment.THAINAUTE_QA_COMMAND_TIMEOUT_MS,
      300_000,
      "THAINAUTE_QA_COMMAND_TIMEOUT_MS",
      1_000,
      900_000,
    ),
    proxyPort: integerFromEnvironment(
      environment.THAINAUTE_QA_PROXY_PORT,
      0,
      "THAINAUTE_QA_PROXY_PORT",
      0,
      65_535,
    ),
  });
}

function isPnpmCliPath(value) {
  if (
    typeof value !== "string" ||
    !path.isAbsolute(value) ||
    containsCommandControlCharacter(value)
  ) {
    return false;
  }
  return ["pnpm.cjs", "pnpm.js", "pnpm.mjs"].includes(
    path.basename(value).toLowerCase(),
  );
}

function resolveWindowsPnpmCli(environment = process.env) {
  const candidates = [];
  if (environment.npm_execpath !== undefined) {
    candidates.push(environment.npm_execpath);
  }
  const pathValue = environment.Path ?? environment.PATH ?? "";
  for (const rawDirectory of pathValue.split(path.delimiter)) {
    const directory = rawDirectory.replace(/^"|"$/gu, "").trim();
    if (directory === "") continue;
    candidates.push(
      path.join(directory, "node_modules", "pnpm", "bin", "pnpm.cjs"),
      path.join(directory, "node_modules", "pnpm", "bin", "pnpm.mjs"),
      path.join(directory, "node_modules", "corepack", "dist", "pnpm.js"),
    );
  }
  const resolved = candidates.find(
    (candidate) => isPnpmCliPath(candidate) && existsSync(candidate),
  );
  if (resolved === undefined) {
    throw new MobileConnectedE2EError(
      "Le CLI pnpm JavaScript est introuvable dans l'environnement local.",
    );
  }
  return resolved;
}

export function buildPnpmCommand(args, options = {}) {
  if (
    !Array.isArray(args) ||
    args.some(
      (entry) =>
        typeof entry !== "string" || containsCommandControlCharacter(entry),
    )
  ) {
    throw new MobileConnectedE2EError("Commande pnpm invalide.");
  }
  const platform = options.platform ?? process.platform;
  if (platform !== "win32") {
    return Object.freeze({
      command: "pnpm",
      args: Object.freeze([...args]),
    });
  }
  const pnpmCliPath =
    options.pnpmCliPath ?? resolveWindowsPnpmCli(options.environment);
  const nodeExecutable = options.nodeExecutable ?? process.execPath;
  if (
    !isPnpmCliPath(pnpmCliPath) ||
    typeof nodeExecutable !== "string" ||
    nodeExecutable === "" ||
    containsCommandControlCharacter(nodeExecutable)
  ) {
    throw new MobileConnectedE2EError("Commande pnpm Windows invalide.");
  }
  return Object.freeze({
    command: nodeExecutable,
    args: Object.freeze([pnpmCliPath, ...args]),
  });
}

export function buildAdbCommand(serial, args) {
  if (
    typeof serial !== "string" ||
    !/^emulator-\d+$/u.test(serial) ||
    !Array.isArray(args) ||
    args.some(
      (entry) =>
        typeof entry !== "string" || containsCommandControlCharacter(entry),
    )
  ) {
    throw new MobileConnectedE2EError("Commande ADB invalide.");
  }
  return Object.freeze({
    command: "adb",
    args: Object.freeze(["-s", serial, ...args]),
  });
}

export function buildAdbForegroundActivityProbe(serial) {
  return Object.freeze({
    ...buildAdbCommand(serial, ["shell", "-T"]),
    stdin: FOREGROUND_ACTIVITY_PROBE_STDIN,
  });
}

function canonicalAndroidComponent(packageName, activityName) {
  const canonicalActivity = activityName.startsWith(".")
    ? `${packageName}${activityName}`
    : activityName;
  return `${packageName}/${canonicalActivity}`;
}

export function classifyForegroundAndroidActivity(output) {
  if (
    typeof output !== "string" ||
    Buffer.byteLength(output, "utf8") > MAX_FOREGROUND_ACTIVITY_OUTPUT_BYTES ||
    output.includes("\0")
  ) {
    throw new MobileConnectedE2EError(
      "L'attestation de l'activité Android au premier plan est invalide.",
    );
  }
  const lines = output
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length !== 2) {
    throw new MobileConnectedE2EError(
      "L'attestation de l'activité Android au premier plan est invalide.",
    );
  }

  const components = new Map();
  const componentPattern =
    "([A-Za-z][A-Za-z0-9_.]*)/(\\.?[A-Za-z][A-Za-z0-9_.$]*)";
  const patterns = Object.freeze({
    mCurrentFocus: new RegExp(
      `^mCurrentFocus=Window\\{[^\\s{}]+\\s+u\\d+\\s+${componentPattern}\\}$`,
      "u",
    ),
    mFocusedApp: new RegExp(
      `^mFocusedApp=ActivityRecord\\{[^\\s{}]+\\s+u\\d+\\s+${componentPattern}(?:\\s+[^{}]*)?\\}$`,
      "u",
    ),
  });
  for (const line of lines) {
    const label = line.startsWith("mCurrentFocus=")
      ? "mCurrentFocus"
      : line.startsWith("mFocusedApp=")
        ? "mFocusedApp"
        : null;
    const match = label === null ? null : patterns[label].exec(line);
    if (label === null || match === null || components.has(label)) {
      throw new MobileConnectedE2EError(
        "L'attestation de l'activité Android au premier plan est invalide.",
      );
    }
    components.set(label, canonicalAndroidComponent(match[1], match[2]));
  }

  const currentFocus = components.get("mCurrentFocus");
  const focusedApp = components.get("mFocusedApp");
  if (currentFocus === undefined || currentFocus !== focusedApp) {
    throw new MobileConnectedE2EError(
      "L'attestation de l'activité Android au premier plan est incohérente.",
    );
  }
  if (currentFocus === SETTINGS_SEARCH_COMPONENT) return "settings_search";
  if (currentFocus.startsWith(`${MOBILE_APP_ID}/`)) return "thainaute";
  return "other";
}

export function classifyForegroundAndroidActivitySafely(output, stderr = "") {
  if (typeof stderr !== "string" || stderr.trim() !== "") {
    return "unavailable";
  }
  try {
    return classifyForegroundAndroidActivity(output);
  } catch {
    return "unavailable";
  }
}

async function readForegroundAndroidActivityState(config, serial) {
  const command = buildAdbForegroundActivityProbe(serial);
  try {
    const result = await runProcess({
      ...command,
      cwd: config.rootDirectory,
      env: process.env,
      capture: true,
      captureLimitBytes: MAX_FOREGROUND_ACTIVITY_OUTPUT_BYTES,
      timeoutMs: 10_000,
      label: "L'attestation de l'activité Android au premier plan",
      signal: config.signal,
    });
    return classifyForegroundAndroidActivitySafely(
      result.stdout,
      result.stderr,
    );
  } catch {
    return "unavailable";
  }
}

async function assertThainauteForegroundAfterLaunch(config, serial) {
  if (
    (await readForegroundAndroidActivityState(config, serial)) !== "thainaute"
  ) {
    throw new MobileConnectedE2EError(
      "Thaïnaute n'est pas l'activité Android au premier plan après son lancement.",
    );
  }
}

function androidKeyCodeForCharacter(character) {
  if (/^[a-z]$/u.test(character)) return `KEYCODE_${character.toUpperCase()}`;
  if (/^\d$/u.test(character)) return `KEYCODE_${character}`;
  if (character === "-") return "KEYCODE_MINUS";
  if (character === ".") return "KEYCODE_PERIOD";
  if (character === "@") return "KEYCODE_AT";
  return null;
}

export function buildAdbSensitiveInputCommand(serial, input, value) {
  const validEmail =
    input === "email" &&
    typeof value === "string" &&
    /^mobile-connected-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}@thainaute\.invalid$/u.test(
      value,
    );
  const validOtp =
    input === "otp" && typeof value === "string" && /^\d{6}$/u.test(value);
  if (!validEmail && !validOtp) {
    throw new MobileConnectedE2EError("Saisie Android sensible invalide.");
  }
  const keyCodes = Array.from(value, androidKeyCodeForCharacter);
  if (keyCodes.some((keyCode) => keyCode === null)) {
    throw new MobileConnectedE2EError("Saisie Android sensible invalide.");
  }
  const stdin = [
    "set -eu",
    ...ADB_THAINAUTE_FOREGROUND_GUARD_LINES,
    ...keyCodes.map((keyCode) => `input keyevent ${keyCode}`),
    "input keyevent KEYCODE_ENTER",
    "sleep 1",
    "exit",
    "",
  ].join("\n");
  if (Buffer.byteLength(stdin) > MAX_ADB_SENSITIVE_INPUT_SCRIPT_BYTES) {
    throw new MobileConnectedE2EError("Saisie Android sensible invalide.");
  }
  return Object.freeze({
    ...buildAdbCommand(serial, ["shell", "-T"]),
    stdin,
  });
}

export function secureStoreManifestPreferenceNameFromOrigin(origin) {
  const url = new URL(
    requirePrivateOrigin(origin, "L'origine Supabase Android"),
  );
  const projectReference = url.hostname.split(".")[0];
  if (
    projectReference === undefined ||
    !/^[a-z0-9-]{1,63}$/u.test(projectReference)
  ) {
    throw new MobileConnectedE2EError(
      "L'origine Supabase Android ne permet pas d'attester SecureStore.",
    );
  }
  // Supabase JS 2.111 dérive `sb-<premier segment>-auth-token` et
  // expo-secure-store 15 préfixe la keychain Android par `key_v1-`.
  return `key_v1-sb-${projectReference}-auth-token`;
}

export function buildAdbSecureStoreManifestProbe(serial, preferenceName) {
  if (
    typeof preferenceName !== "string" ||
    !/^key_v1-sb-[a-z0-9-]{1,63}-auth-token$/u.test(preferenceName)
  ) {
    throw new MobileConnectedE2EError(
      "L'attestation du manifeste SecureStore est invalide.",
    );
  }
  const stagingPreferenceName = `${preferenceName}.thainaute_staging_v2`;
  return Object.freeze({
    ...buildAdbCommand(serial, ["shell", "-T"]),
    stdin: [
      "set -eu",
      `if ! run-as ${MOBILE_APP_ID} toybox grep -F -q 'name="${preferenceName}"' ${SECURE_STORE_RELATIVE_PATH}; then`,
      "  exit 1",
      "fi",
      `if run-as ${MOBILE_APP_ID} toybox grep -F -q 'name="${stagingPreferenceName}"' ${SECURE_STORE_RELATIVE_PATH}; then`,
      "  exit 1",
      "fi",
      "exit 0",
      "",
    ].join("\n"),
  });
}

export function buildMaestroCommand(
  flowPath,
  outputDirectory,
  serial,
  platform = process.platform,
) {
  const relativeOutput =
    typeof outputDirectory === "string"
      ? path.relative(path.resolve(os.tmpdir()), path.resolve(outputDirectory))
      : "..";
  if (
    typeof flowPath !== "string" ||
    flowPath === "" ||
    containsCommandControlCharacter(flowPath) ||
    typeof outputDirectory !== "string" ||
    !path.isAbsolute(outputDirectory) ||
    containsCommandControlCharacter(outputDirectory) ||
    typeof serial !== "string" ||
    !/^emulator-\d+$/u.test(serial) ||
    relativeOutput === "" ||
    relativeOutput.startsWith("..") ||
    path.isAbsolute(relativeOutput)
  ) {
    throw new MobileConnectedE2EError("Chemins Maestro invalides.");
  }
  const maestroArgs = [
    "test",
    "--test-output-dir",
    outputDirectory,
    "--debug-output",
    path.join(outputDirectory, "debug"),
    "--flatten-debug-output",
    "--device",
    serial,
    flowPath,
  ];
  if (
    platform === "win32" &&
    maestroArgs.some((entry) => containsWindowsCmdMetacharacter(entry))
  ) {
    throw new MobileConnectedE2EError(
      "Les arguments Maestro Windows contiennent un métacaractère cmd.exe interdit.",
    );
  }
  return Object.freeze({
    command: platform === "win32" ? "cmd.exe" : "maestro",
    args: Object.freeze(
      platform === "win32"
        ? ["/d", "/s", "/c", "maestro.bat", ...maestroArgs]
        : maestroArgs,
    ),
  });
}

function processFailure(label) {
  return new MobileConnectedE2EError(
    `${label} a échoué sans exposer sa sortie.`,
  );
}

function processHasExited(child) {
  return child.exitCode !== null || child.signalCode !== null;
}

async function waitForProcessClose(child, timeoutMs) {
  if (processHasExited(child)) return true;
  return new Promise((resolve) => {
    const onClose = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.removeListener("close", onClose);
      resolve(false);
    }, timeoutMs);
    child.once("close", onClose);
  });
}

function posixProcessGroupExists(pid) {
  try {
    process.kill(-pid, 0);
    return true;
  } catch (error) {
    return error?.code !== "ESRCH";
  }
}

async function waitForPosixProcessGroupExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!posixProcessGroupExists(pid)) return true;
    await delay(50);
  }
  return !posixProcessGroupExists(pid);
}

async function terminateProcessTree(child) {
  if (typeof child.pid !== "number") return;
  if (process.platform === "win32") {
    if (processHasExited(child)) return;
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill.exe",
        ["/PID", String(child.pid), "/T", "/F"],
        { shell: false, windowsHide: true, stdio: "ignore" },
      );
      killer.once("error", resolve);
      killer.once("close", resolve);
    });
    if (!(await waitForProcessClose(child, 2_000))) {
      throw new MobileConnectedE2EError(
        "Un arbre de processus QA Windows n'a pas pu être arrêté.",
      );
    }
    return;
  }
  if (!posixProcessGroupExists(child.pid)) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    // Le groupe a déjà quitté.
  }
  if (await waitForPosixProcessGroupExit(child.pid, 2_000)) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    // Le groupe a quitté entre les deux signaux.
  }
  if (!(await waitForPosixProcessGroupExit(child.pid, 2_000))) {
    throw new MobileConnectedE2EError(
      "Un groupe de processus QA n'a pas pu être arrêté.",
    );
  }
}

async function runProcess(input) {
  const capture = input.capture === true;
  const captureLimitBytes =
    input.captureLimitBytes === undefined
      ? MAX_CAPTURED_OUTPUT
      : input.captureLimitBytes;
  const acceptedExitCodes = input.acceptedExitCodes ?? [0];
  const hasInput =
    typeof input.stdin === "string" || Buffer.isBuffer(input.stdin);
  if (
    (input.stdin !== undefined && !hasInput) ||
    (hasInput && Buffer.byteLength(input.stdin) > MAX_PROCESS_INPUT) ||
    !Number.isSafeInteger(captureLimitBytes) ||
    captureLimitBytes < 1 ||
    captureLimitBytes > MAX_CAPTURED_OUTPUT
  ) {
    throw new MobileConnectedE2EError("Entrée de processus QA invalide.");
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    let terminationStarted = false;
    let timer;
    let abortListener = null;
    let stdout = "";
    let stderr = "";
    let capturedOutputBytes = 0;
    const child = spawn(input.command, input.args, {
      cwd: input.cwd,
      env: input.env,
      shell: false,
      detached: process.platform !== "win32",
      windowsHide: true,
      stdio: [
        hasInput ? "pipe" : "ignore",
        capture ? "pipe" : "ignore",
        capture ? "pipe" : "ignore",
      ],
    });
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (abortListener !== null) {
        input.signal?.removeEventListener("abort", abortListener);
      }
      callback();
    };
    const rejectAfterTermination = () => {
      if (settled || terminationStarted) return;
      terminationStarted = true;
      void terminateProcessTree(child).then(
        () => finish(() => reject(processFailure(input.label))),
        () => finish(() => reject(processFailure(input.label))),
      );
    };
    const append = (current, chunk) => {
      capturedOutputBytes += chunk.length;
      if (capturedOutputBytes > captureLimitBytes) {
        rejectAfterTermination();
        return current;
      }
      return current + chunk.toString("utf8");
    };
    if (capture) {
      child.stdout.on("data", (chunk) => {
        stdout = append(stdout, chunk);
      });
      child.stderr.on("data", (chunk) => {
        stderr = append(stderr, chunk);
      });
    }
    timer = setTimeout(() => {
      rejectAfterTermination();
    }, input.timeoutMs);
    abortListener = rejectAfterTermination;
    if (input.signal !== undefined) {
      input.signal.addEventListener("abort", abortListener, { once: true });
      if (input.signal.aborted) rejectAfterTermination();
    }
    child.once("error", () => {
      if (terminationStarted) return;
      finish(() => reject(processFailure(input.label)));
    });
    child.once("close", (code) => {
      if (terminationStarted) return;
      finish(() => {
        if (typeof code === "number" && acceptedExitCodes.includes(code)) {
          resolve({ stdout, stderr, exitCode: code });
        } else reject(processFailure(input.label));
      });
    });
    if (hasInput) {
      child.stdin.on("error", () => undefined);
      child.stdin.end(input.stdin);
    }
  });
}

function startManagedProcess(input) {
  const child = spawn(input.command, input.args, {
    cwd: input.cwd,
    env: input.env,
    shell: false,
    detached: process.platform !== "win32",
    windowsHide: true,
    stdio: "ignore",
  });
  let resolveExit;
  const managed = {
    child,
    exited: new Promise((resolve) => {
      resolveExit = resolve;
    }),
    failed: false,
    stopping: false,
  };
  child.once("error", () => {
    if (!managed.stopping) managed.failed = true;
    resolveExit();
  });
  child.once("close", () => {
    if (!managed.stopping) managed.failed = true;
    resolveExit();
  });
  return managed;
}

export function managedProcessIsAlive(managed) {
  return (
    managed !== null &&
    typeof managed === "object" &&
    managed.failed !== true &&
    managed.child !== null &&
    typeof managed.child === "object" &&
    !processHasExited(managed.child)
  );
}

function assertManagedProcessAlive(managed, label) {
  if (!managedProcessIsAlive(managed)) {
    throw new MobileConnectedE2EError(
      `Le processus ${label} possédé par la recette s'est arrêté.`,
    );
  }
}

async function stopManagedProcess(managed) {
  if (managed === null) return;
  managed.stopping = true;
  if (typeof managed.child?.pid !== "number") return;
  await terminateProcessTree(managed.child);
}

async function pathIsFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

async function pathIsDirectory(directoryPath) {
  try {
    return (await stat(directoryPath)).isDirectory();
  } catch {
    return false;
  }
}

async function pathExists(inputPath) {
  try {
    await stat(inputPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function removePrivateTempRoot(rootDirectory) {
  await rm(rootDirectory, { recursive: true, force: true });
  if (await pathExists(rootDirectory)) {
    throw new MobileConnectedE2EError(
      "Une racine temporaire privée QA subsiste après nettoyage.",
    );
  }
}

async function ensurePrivateTempRoot(config, rootDirectory) {
  if (!pathIsStrictlyInside(os.tmpdir(), rootDirectory)) {
    throw new MobileConnectedE2EError("Racine temporaire QA hors périmètre.");
  }
  if (process.platform === "win32") {
    const command = buildWindowsPrivateAclCommand(rootDirectory);
    await runProcess({
      ...command,
      env: { ...process.env, ...command.env },
      cwd: config.rootDirectory,
      timeoutMs: 15_000,
      label: "La protection ACL de la racine temporaire QA",
      signal: config.signal,
    });
    return;
  }
  await chmod(rootDirectory, 0o700);
  const metadata = await stat(rootDirectory);
  if (!metadata.isDirectory() || (metadata.mode & 0o777) !== 0o700) {
    throw new MobileConnectedE2EError(
      "La racine temporaire QA n'est pas privée.",
    );
  }
}

export function buildNextTypegenCommand() {
  return buildPnpmCommand([
    "--filter",
    "@thainaute/web",
    "exec",
    "next",
    "typegen",
  ]);
}

export function buildSupabaseIsolatedStartCommand() {
  return buildPnpmCommand([
    "exec",
    "supabase",
    "start",
    "--exclude",
    "studio,logflare,vector",
  ]);
}

function gitNextTypesCleanCommand() {
  return Object.freeze({
    command: "git",
    args: Object.freeze([
      "diff",
      "--quiet",
      "HEAD",
      "--",
      NEXT_TYPES_RELATIVE_PATH,
    ]),
  });
}

export function nextTypesContentIsOwned(initialContent, currentContent) {
  if (typeof initialContent !== "string" || typeof currentContent !== "string")
    return false;
  const developmentContent = initialContent.replace(
    'import "./.next/types/routes.d.ts";',
    'import "./.next/dev/types/routes.d.ts";',
  );
  return (
    developmentContent !== initialContent &&
    (currentContent === initialContent || currentContent === developmentContent)
  );
}

async function assertNextTypesGitClean(config, label) {
  await runProcess({
    ...gitNextTypesCleanCommand(),
    cwd: config.rootDirectory,
    env: process.env,
    timeoutMs: 15_000,
    label,
    signal: config.signal,
  });
}

async function snapshotNextTypes(config) {
  await assertNextTypesGitClean(config, "Le préflight des types Next.js");
  const filePath = path.join(config.rootDirectory, NEXT_TYPES_RELATIVE_PATH);
  const initialContent = await readFile(filePath, "utf8");
  if (!nextTypesContentIsOwned(initialContent, initialContent)) {
    throw new MobileConnectedE2EError(
      "Le fichier de types Next.js n'a pas la forme générée attendue.",
    );
  }
  return Object.freeze({ filePath, initialContent });
}

async function restoreNextTypes(config, snapshot, environment) {
  const currentContent = await readFile(snapshot.filePath, "utf8");
  if (!nextTypesContentIsOwned(snapshot.initialContent, currentContent)) {
    throw new MobileConnectedE2EError(
      "Le fichier de types Next.js a subi une mutation concurrente.",
    );
  }
  const command = buildNextTypegenCommand();
  await runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: environment,
    timeoutMs: config.commandTimeoutMs,
    label: "La restauration officielle des types Next.js",
    signal: undefined,
  });
  await assertNextTypesGitClean(
    { ...config, signal: undefined },
    "L'attestation des types Next.js restaurés",
  );
  if ((await readFile(snapshot.filePath, "utf8")) !== snapshot.initialContent) {
    throw new MobileConnectedE2EError(
      "Les types Next.js restaurés diffèrent de leur état initial.",
    );
  }
}

export async function resolveAndroidSdkDirectory(
  environment = process.env,
  options = {},
) {
  const platform = options.platform ?? process.platform;
  const homeDirectory = options.homeDirectory ?? os.homedir();
  const candidates = [
    environment.ANDROID_HOME,
    environment.ANDROID_SDK_ROOT,
    platform === "win32" && environment.LOCALAPPDATA !== undefined
      ? path.join(environment.LOCALAPPDATA, "Android", "Sdk")
      : null,
    platform === "darwin"
      ? path.join(homeDirectory, "Library", "Android", "sdk")
      : null,
    platform !== "win32" && platform !== "darwin"
      ? path.join(homeDirectory, "Android", "Sdk")
      : null,
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate !== "string" ||
      candidate.trim() === "" ||
      !path.isAbsolute(candidate) ||
      containsCommandControlCharacter(candidate)
    ) {
      continue;
    }
    const resolved = path.resolve(candidate);
    if (await pathIsDirectory(resolved)) return resolved;
  }
  throw new MobileConnectedE2EError(
    "Le SDK Android local est introuvable ; configurez ANDROID_HOME ou ANDROID_SDK_ROOT.",
  );
}

function parseJsonOutput(output, label) {
  const first = output.indexOf("{");
  const last = output.lastIndexOf("}");
  if (first < 0 || last < first)
    throw new MobileConnectedE2EError(`${label} illisible.`);
  try {
    return JSON.parse(output.slice(first, last + 1));
  } catch {
    throw new MobileConnectedE2EError(`${label} illisible.`);
  }
}

function requiredStatusString(status, names, label) {
  for (const name of names) {
    const value = status?.[name];
    if (typeof value === "string" && value !== "") return value;
  }
  throw new MobileConnectedE2EError(
    `${label} absent du statut Supabase local.`,
  );
}

async function readSupabaseLocalStatus(config, environment) {
  const command = buildPnpmCommand([
    "exec",
    "supabase",
    "status",
    "-o",
    "json",
  ]);
  const result = await runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: environment,
    capture: true,
    timeoutMs: config.commandTimeoutMs,
    label: "Le statut Supabase local",
    signal: config.signal,
  });
  const parsed = parseJsonOutput(result.stdout, "Le statut Supabase local");
  const apiOrigin = requirePrivateOrigin(
    requiredStatusString(parsed, ["API_URL"], "L'URL API"),
    "L'URL Supabase locale",
  );
  const mailpitOrigin = requirePrivateOrigin(
    requiredStatusString(
      parsed,
      ["MAILPIT_URL", "INBUCKET_URL"],
      "L'URL Mailpit",
    ),
    "L'URL Mailpit locale",
  );
  const publishableKey = requiredStatusString(
    parsed,
    ["PUBLISHABLE_KEY", "ANON_KEY"],
    "La clé publiable",
  );
  const secretKey = requiredStatusString(
    parsed,
    ["SECRET_KEY", "SERVICE_ROLE_KEY"],
    "La clé serveur locale",
  );
  rememberSecret(publishableKey);
  rememberSecret(secretKey);
  return { apiOrigin, mailpitOrigin, publishableKey, secretKey };
}

function pathIsInsideDirectory(directory, candidate) {
  const relative = path.relative(directory, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

async function readBoundedPackageJson(packagePath) {
  let raw;
  try {
    raw = await readFile(packagePath, "utf8");
  } catch {
    throw new MobileConnectedE2EError(
      "Le paquet Supabase local attendu est illisible.",
    );
  }
  if (Buffer.byteLength(raw) > 65_536) {
    throw new MobileConnectedE2EError(
      "Le paquet Supabase local attendu est invalide.",
    );
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new TypeError("package invalide");
    }
    return parsed;
  } catch {
    throw new MobileConnectedE2EError(
      "Le paquet Supabase local attendu est invalide.",
    );
  }
}

export async function resolveSupabaseGoSidecar(
  rootDirectory = DEFAULT_ROOT,
  options = {},
) {
  const platform = options.platform ?? process.platform;
  const architecture = options.architecture ?? os.arch();
  const candidates = SUPABASE_CLI_PACKAGE_CANDIDATES[platform]?.[architecture];
  if (candidates === undefined) {
    throw new MobileConnectedE2EError(
      "La plateforme du sidecar Supabase QA n'est pas prise en charge.",
    );
  }

  let root;
  try {
    root = await realpath(path.resolve(rootDirectory));
  } catch {
    throw new MobileConnectedE2EError(
      "Le dépôt du sidecar Supabase QA est illisible.",
    );
  }
  const rootRequire = createRequire(path.join(root, "package.json"));
  let shimPackagePath;
  try {
    shimPackagePath = rootRequire.resolve("supabase/package.json");
  } catch {
    throw new MobileConnectedE2EError(
      "Le shim Supabase local attendu est absent.",
    );
  }
  const shimPackage = await readBoundedPackageJson(shimPackagePath);
  if (
    shimPackage.name !== "supabase" ||
    typeof shimPackage.version !== "string" ||
    shimPackage.version === "" ||
    shimPackage.optionalDependencies === null ||
    typeof shimPackage.optionalDependencies !== "object" ||
    Array.isArray(shimPackage.optionalDependencies)
  ) {
    throw new MobileConnectedE2EError(
      "Le shim Supabase local attendu est invalide.",
    );
  }

  const shimRequire = createRequire(shimPackagePath);
  let optionalPackagePath = null;
  let expectedPackageName = null;
  for (const suffix of candidates) {
    const packageName = `@supabase/cli-${suffix}`;
    if (shimPackage.optionalDependencies[packageName] !== shimPackage.version) {
      continue;
    }
    try {
      optionalPackagePath = shimRequire.resolve(`${packageName}/package.json`);
      expectedPackageName = packageName;
      break;
    } catch (error) {
      if (error?.code !== "MODULE_NOT_FOUND") {
        throw new MobileConnectedE2EError(
          "Le sidecar Supabase QA est illisible.",
        );
      }
    }
  }
  if (optionalPackagePath === null || expectedPackageName === null) {
    throw new MobileConnectedE2EError(
      "Le sidecar Supabase QA exact est absent.",
    );
  }
  const optionalPackage = await readBoundedPackageJson(optionalPackagePath);
  if (
    optionalPackage.name !== expectedPackageName ||
    optionalPackage.version !== shimPackage.version ||
    !Array.isArray(optionalPackage.os) ||
    !optionalPackage.os.includes(platform) ||
    !Array.isArray(optionalPackage.cpu) ||
    !optionalPackage.cpu.includes(architecture)
  ) {
    throw new MobileConnectedE2EError(
      "Le sidecar Supabase QA ne correspond pas au shim courant.",
    );
  }

  let binaryPath;
  let packageDirectory;
  try {
    packageDirectory = await realpath(path.dirname(optionalPackagePath));
    binaryPath = await realpath(
      path.join(
        packageDirectory,
        "bin",
        platform === "win32" ? "supabase-go.exe" : "supabase-go",
      ),
    );
  } catch {
    throw new MobileConnectedE2EError(
      "Le binaire du sidecar Supabase QA est absent.",
    );
  }
  const relativeToRoot = path.relative(root, binaryPath);
  const binaryStats = await stat(binaryPath).catch(() => null);
  if (
    !pathIsInsideDirectory(root, packageDirectory) ||
    !pathIsInsideDirectory(packageDirectory, binaryPath) ||
    relativeToRoot.split(path.sep)[0] !== "node_modules" ||
    binaryStats?.isFile() !== true
  ) {
    throw new MobileConnectedE2EError(
      "Le binaire du sidecar Supabase QA sort du node_modules attesté.",
    );
  }
  return binaryPath;
}

async function loadSupabaseDockerGuard(config) {
  const modulePath = resolveInsideRoot(
    config.rootDirectory,
    "scripts/qa/lock-local-supabase-loopback.mjs",
    "Le garde Docker Supabase",
  );
  const module = await import(pathToFileURL(modulePath).href);
  for (const exportName of [
    "attestLocalSupabaseLoopback",
    "createSupabaseLoopbackDockerProxy",
    "dockerProxyEnvironment",
    "purgeLocalSupabaseProjectResources",
  ]) {
    if (typeof module[exportName] !== "function") {
      throw new MobileConnectedE2EError(
        "Le garde Docker Supabase local n'expose pas son contrat attendu.",
      );
    }
  }
  return module;
}

export function assertSupabaseLoopbackAttestation(attestation) {
  if (
    attestation?.lockedContainerCount !== 3 ||
    attestation?.projectContainerCount !== 9
  ) {
    throw new MobileConnectedE2EError(
      "L'attestation loopback de la stack Supabase est incomplète.",
    );
  }
  return true;
}

export function assertSupabaseDockerProxyState(state) {
  const expected = Object.freeze({
    supabase_db_Thainaute: 2,
    supabase_inbucket_Thainaute: 1,
    supabase_kong_Thainaute: 1,
  });
  const expectedUpgradeRoutes = Object.freeze({
    container_attach: 0,
    exec_start: 0,
    other: 0,
  });
  const expectedUpgradeTransport = Object.freeze({
    childErrors: 0,
    downstreamEnds: 0,
    inputFinishes: 0,
    nonzeroExits: 0,
    readableEnds: 0,
    starts: 0,
    zeroExits: 0,
  });
  const rewritten = state?.rewrittenByName;
  const upgradeRoutes = state?.upgradeRoutes;
  const upgradeTransport = state?.upgradeTransport;
  if (
    rewritten === null ||
    typeof rewritten !== "object" ||
    Array.isArray(rewritten) ||
    !Number.isInteger(state?.projectNetworkCreates) ||
    state.projectNetworkCreates < 1 ||
    state?.rewrittenPublicationCreates !== 4 ||
    Object.keys(rewritten).length !== Object.keys(expected).length ||
    Object.entries(expected).some(
      ([name, count]) => rewritten[name] !== count,
    ) ||
    upgradeRoutes === null ||
    typeof upgradeRoutes !== "object" ||
    Array.isArray(upgradeRoutes) ||
    Object.keys(upgradeRoutes).length !==
      Object.keys(expectedUpgradeRoutes).length ||
    Object.entries(expectedUpgradeRoutes).some(
      ([name, count]) => upgradeRoutes[name] !== count,
    ) ||
    upgradeTransport === null ||
    typeof upgradeTransport !== "object" ||
    Array.isArray(upgradeTransport) ||
    Object.keys(upgradeTransport).length !==
      Object.keys(expectedUpgradeTransport).length ||
    Object.entries(expectedUpgradeTransport).some(
      ([name, count]) => upgradeTransport[name] !== count,
    )
  ) {
    throw new MobileConnectedE2EError(
      "Le proxy Docker n'a pas réécrit les créations Supabase attendues.",
    );
  }
  return true;
}

export function supabaseStackIsOwnedAfterPurge(removal) {
  if (
    !Number.isInteger(removal?.removedContainerCount) ||
    removal.removedContainerCount < 0 ||
    !Number.isInteger(removal?.removedNetworkCount) ||
    removal.removedNetworkCount < 0 ||
    !Number.isInteger(removal?.removedVolumeCount) ||
    removal.removedVolumeCount < 0
  ) {
    throw new MobileConnectedE2EError(
      "Le préflight des conteneurs Supabase locaux est invalide.",
    );
  }
  // Une fois les anciens conteneurs supprimés et leur absence attestée, toute
  // stack recréée — même par un start partiellement échoué — appartient au run.
  return true;
}

async function prepareLocalSupabase(config, ownership) {
  const sidecarPath = await resolveSupabaseGoSidecar(config.rootDirectory);
  const guard = await loadSupabaseDockerGuard(config);
  ownership.guard = guard;
  const removal = await guard.purgeLocalSupabaseProjectResources();
  ownership.stackOwned = supabaseStackIsOwnedAfterPurge(removal);
  const baseEnvironment = {
    ...process.env,
    SUPABASE_TELEMETRY_DISABLED: "1",
  };
  delete baseEnvironment.SUPABASE_CLI_BINARY_OVERRIDE;
  const proxy = await guard.createSupabaseLoopbackDockerProxy({
    signal: config.signal,
  });
  return runWithSafeCleanup(
    async () => {
      const proxiedEnvironment = {
        ...guard.dockerProxyEnvironment(baseEnvironment, proxy.dockerHost),
        SUPABASE_CLI_BINARY_OVERRIDE: sidecarPath,
      };
      const startCommand = buildSupabaseIsolatedStartCommand();
      await runProcess({
        ...startCommand,
        cwd: config.rootDirectory,
        env: proxiedEnvironment,
        timeoutMs: config.commandTimeoutMs,
        label: "Le démarrage Supabase local isolé",
        signal: config.signal,
      });
      assertSupabaseLoopbackAttestation(
        await guard.attestLocalSupabaseLoopback({ signal: config.signal }),
      );

      const resetCommand = buildPnpmCommand(["db:reset"]);
      await runProcess({
        ...resetCommand,
        cwd: config.rootDirectory,
        env: proxiedEnvironment,
        timeoutMs: config.commandTimeoutMs,
        label: "Le reset Supabase local isolé",
        signal: config.signal,
      });
      assertSupabaseLoopbackAttestation(
        await guard.attestLocalSupabaseLoopback({ signal: config.signal }),
      );
      assertSupabaseDockerProxyState(proxy.getPublicState());

      const status = await readSupabaseLocalStatus(config, proxiedEnvironment);
      if (
        status.apiOrigin !== DEFAULT_SUPABASE_ORIGIN ||
        status.mailpitOrigin !== config.mailpitOrigin
      ) {
        throw new MobileConnectedE2EError(
          "Les origines Supabase locales ne correspondent pas au contrat QA.",
        );
      }
      const fixtureCommand = buildPnpmCommand([
        "exec",
        "supabase",
        "db",
        "query",
        "--local",
        "--file",
        "supabase/fixtures/connected_sync.sql",
      ]);
      await runProcess({
        ...fixtureCommand,
        cwd: config.rootDirectory,
        env: proxiedEnvironment,
        timeoutMs: config.commandTimeoutMs,
        label: "Le chargement de la fixture connectée",
        signal: config.signal,
      });
      const audioCommand = buildPnpmCommand(["fixture:bootstrap-local-audio"]);
      const audioEnvironment = { ...proxiedEnvironment };
      delete audioEnvironment.SUPABASE_CLI_BINARY_OVERRIDE;
      await runProcess({
        ...audioCommand,
        cwd: config.rootDirectory,
        env: {
          ...audioEnvironment,
          NODE_ENV: "development",
          NEXT_PUBLIC_SUPABASE_URL: status.apiOrigin,
          SUPABASE_SECRET_KEY: status.secretKey,
          THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP: "1",
        },
        timeoutMs: config.commandTimeoutMs,
        label: "Le bootstrap audio local",
        signal: config.signal,
      });
      return status;
    },
    () => proxy.close(),
    "proxy Docker local",
  );
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 2_000) {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal =
    init.signal === undefined || init.signal === null
      ? timeoutSignal
      : AbortSignal.any([init.signal, timeoutSignal]);
  return fetch(url, { ...init, signal });
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw new MobileConnectedE2EError(
      "La recette Android connectée a été interrompue.",
    );
  }
}

async function waitUntil(check, timeoutMs, label, signal) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    throwIfAborted(signal);
    try {
      if (await check()) return;
    } catch {
      // Un serveur local peut être entre son bind et sa readiness.
    }
    await delay(250);
  }
  throw new MobileConnectedE2EError(
    `${label} n'est pas prêt dans le délai imparti.`,
  );
}

async function fixtureWebIsReady(origin) {
  try {
    const response = await fetchWithTimeout(
      new URL("/api/v1/content/releases/current", origin),
    );
    if (!response.ok) return false;
    const payload = await response.json();
    return payload?.release?.releaseId === FIXTURE_RELEASE_ID;
  } catch {
    return false;
  }
}

async function waitForManagedReadiness(
  check,
  timeoutMs,
  label,
  signal,
  managed,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    throwIfAborted(signal);
    assertManagedProcessAlive(managed, label);
    const outcome = await Promise.race([
      Promise.resolve()
        .then(check)
        .then(
          (ready) => ({ kind: "check", ready }),
          () => ({ kind: "check", ready: false }),
        ),
      managed.exited.then(() => ({ kind: "exited", ready: false })),
    ]);
    if (outcome.kind === "exited") {
      assertManagedProcessAlive(managed, label);
    }
    if (outcome.ready) {
      assertManagedProcessAlive(managed, label);
      return;
    }
    await Promise.race([delay(250), managed.exited]);
  }
  throw new MobileConnectedE2EError(
    `${label} n'est pas prêt dans le délai imparti.`,
  );
}

async function waitForFixtureWeb(origin, timeoutMs, signal, managed) {
  await waitForManagedReadiness(
    () => fixtureWebIsReady(origin),
    timeoutMs,
    "Next.js QA",
    signal,
    managed,
  );
}

async function originAlreadyResponds(origin) {
  try {
    await fetchWithTimeout(origin, { redirect: "manual" });
    return true;
  } catch {
    return false;
  }
}

async function waitForMetro(origin, timeoutMs, signal, managed) {
  await waitForManagedReadiness(
    () => metroIsReady(origin),
    timeoutMs,
    "Metro",
    signal,
    managed,
  );
}

async function metroIsReady(origin) {
  try {
    const response = await fetchWithTimeout(new URL("/status", origin));
    return (
      response.ok &&
      (await response.text()).trim() === "packager-status:running"
    );
  } catch {
    return false;
  }
}

function metroAndroidBundleUrl(origin) {
  const url = new URL("/.expo/.virtual-metro-entry.bundle", origin);
  for (const [key, value] of Object.entries({
    platform: "android",
    dev: "true",
    lazy: "true",
    minify: "false",
    app: MOBILE_APP_ID,
    modulesOnly: "false",
    runModule: "true",
  })) {
    url.searchParams.set(key, value);
  }
  return url;
}

export function metroBundleResponseIsValid(input) {
  return (
    input?.ok === true &&
    typeof input.contentType === "string" &&
    input.contentType.toLowerCase().startsWith("application/javascript") &&
    typeof input.filesChangedCount === "string" &&
    /^\d+$/u.test(input.filesChangedCount) &&
    Number.isInteger(input.byteLength) &&
    input.byteLength > 0 &&
    input.byteLength <= MAX_METRO_BUNDLE_BYTES
  );
}

async function prewarmMetroAndroidBundle(config, managed) {
  assertManagedProcessAlive(managed, "Metro");
  const response = await fetchWithTimeout(
    metroAndroidBundleUrl(config.metroOrigin),
    {
      headers: { Accept: "application/javascript" },
      signal: config.signal,
    },
    120_000,
  );
  let byteLength = 0;
  if (response.body !== null) {
    const reader = response.body.getReader();
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        byteLength += chunk.value.byteLength;
        if (byteLength > MAX_METRO_BUNDLE_BYTES) {
          await reader.cancel();
          break;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  assertManagedProcessAlive(managed, "Metro");
  if (
    !metroBundleResponseIsValid({
      ok: response.ok,
      contentType: response.headers.get("content-type"),
      filesChangedCount: response.headers.get("x-metro-files-changed-count"),
      byteLength,
    })
  ) {
    throw new MobileConnectedE2EError(
      "Le bundle Android Metro n'est pas prêt ou dépasse la borne QA.",
    );
  }
}

async function assertOwnedServersReady(config, webProcess, metroProcess) {
  assertManagedProcessAlive(webProcess, "Next.js QA");
  assertManagedProcessAlive(metroProcess, "Metro");
  const [webReady, metroReady] = await Promise.all([
    fixtureWebIsReady(config.webOrigin),
    metroIsReady(config.metroOrigin),
  ]);
  assertManagedProcessAlive(webProcess, "Next.js QA");
  assertManagedProcessAlive(metroProcess, "Metro");
  if (!webReady || !metroReady) {
    throw new MobileConnectedE2EError(
      "Les serveurs QA possédés ne répondent plus avec leur fixture attendue.",
    );
  }
}

export function buildDefaultWebCommand(webOrigin = DEFAULT_WEB_ORIGIN) {
  const port = new URL(webOrigin).port;
  return buildPnpmCommand([
    "--filter",
    "@thainaute/web",
    "exec",
    "next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ]);
}

export function buildDefaultMetroCommand() {
  return buildPnpmCommand([
    "--filter",
    "@thainaute/mobile",
    "exec",
    "expo",
    "start",
    "--dev-client",
    "--port",
    "8081",
    "--clear",
    "--localhost",
  ]);
}

export function metroProcessEnvironment(environment) {
  if (environment === null || typeof environment !== "object") {
    throw new MobileConnectedE2EError("Environnement Metro invalide.");
  }
  return {
    ...environment,
    CI: "1",
    NODE_OPTIONS: METRO_IPV4_NODE_OPTIONS,
  };
}

export function webEnvironment(status, publicOrigin) {
  const pepper = randomBytes(32).toString("base64url");
  rememberSecret(pepper);
  return {
    ...process.env,
    NODE_ENV: "development",
    CI: "1",
    NEXT_TELEMETRY_DISABLED: "1",
    THAINAUTE_PUBLIC_URL: `${publicOrigin}/`,
    THAINAUTE_PUBLIC_INDEXING: "disabled",
    THAINAUTE_RELEASE: "development",
    THAINAUTE_BILLING_MODE: "disabled",
    STRIPE_LIVE_CONFIRMATION: "",
    STRIPE_RESTRICTED_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    STRIPE_PREMIUM_PRICE_ID: "",
    REVENUECAT_WEBHOOK_AUTHORIZATION: "",
    REVENUECAT_WEBHOOK_SIGNING_SECRET: "",
    REVENUECAT_ALLOWED_APP_IDS: "",
    THAINAUTE_SYNC_MODE: "supabase",
    THAINAUTE_PUBLIC_CONTENT_MODE: "supabase",
    THAINAUTE_PUBLIC_CONTENT_RELEASE_ID: FIXTURE_RELEASE_ID,
    THAINAUTE_LANGUAGE_PACK: "thai-fr",
    NEXT_PUBLIC_THAINAUTE_LANGUAGE_PACK: "thai-fr",
    NEXT_PUBLIC_SUPABASE_URL: status.apiOrigin,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.publishableKey,
    SUPABASE_SECRET_KEY: status.secretKey,
    ACCOUNT_DELETION_RECEIPT_PEPPER: pepper,
  };
}

export function originForAndroidHost(originInput, deviceHost) {
  const origin = new URL(requirePrivateOrigin(originInput));
  if (!isLoopbackOrRfc1918Hostname(deviceHost)) {
    throw new MobileConnectedE2EError("Alias Android non privé.");
  }
  origin.hostname = deviceHost;
  return requirePrivateOrigin(origin.origin, "Origine Android");
}

async function listAndroidEmulators(config) {
  const result = await runProcess({
    command: "adb",
    args: ["devices"],
    cwd: config.rootDirectory,
    env: process.env,
    capture: true,
    timeoutMs: 10_000,
    label: "La détection ADB",
    signal: config.signal,
  });
  return result.stdout
    .split(/\r?\n/u)
    .map((line) => /^(emulator-\d+)\s+device\b/u.exec(line)?.[1] ?? null)
    .filter((entry) => entry !== null);
}

async function selectAndroidEmulator(config) {
  const candidates = await listAndroidEmulators(config);
  if (config.serial !== null) {
    if (
      !/^emulator-\d+$/u.test(config.serial) ||
      !candidates.includes(config.serial)
    ) {
      throw new MobileConnectedE2EError(
        "ANDROID_SERIAL doit cibler un unique émulateur Android connecté.",
      );
    }
    return config.serial;
  }
  if (candidates.length !== 1) {
    throw new MobileConnectedE2EError(
      "La recette exige exactement un émulateur Android ou ANDROID_SERIAL.",
    );
  }
  return candidates[0];
}

async function runAdb(config, serial, args, capture = false) {
  const command = buildAdbCommand(serial, args);
  return runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: process.env,
    capture,
    timeoutMs: 30_000,
    label: "La commande ADB locale",
    signal: config.signal,
  });
}

async function submitAndClearSensitiveAndroidInput(
  config,
  serial,
  input,
  value,
) {
  await assertThainauteForegroundAfterLaunch(config, serial);
  const command = buildAdbSensitiveInputCommand(serial, input, value);
  await runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: process.env,
    capture: false,
    timeoutMs: 30_000,
    label: "La saisie Android sensible",
    signal: config.signal,
  });
}

async function readMobileSecureStoreManifest(config, serial, preferenceName) {
  const command = buildAdbSecureStoreManifestProbe(serial, preferenceName);
  const result = await runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: process.env,
    capture: false,
    acceptedExitCodes: [0, 1],
    timeoutMs: 10_000,
    label: "L'attestation du manifeste SecureStore Android",
    signal: config.signal,
  });
  return result.exitCode === 0;
}

async function waitForMobileSecureStoreManifest(
  config,
  serial,
  preferenceName,
) {
  const deadline = Date.now() + 30_000;
  let lastState = "absent";
  while (Date.now() < deadline) {
    throwIfAborted(config.signal);
    try {
      if (await readMobileSecureStoreManifest(config, serial, preferenceName)) {
        return;
      }
      lastState = "absent";
    } catch {
      lastState = "unavailable";
    }
    const waitMs = Math.min(250, deadline - Date.now());
    if (waitMs > 0) {
      await delay(
        waitMs,
        undefined,
        config.signal === undefined ? undefined : { signal: config.signal },
      );
    }
  }
  throw new MobileConnectedE2EError(
    `Le manifeste final de la session Auth est absent de SecureStore (${lastState}).`,
  );
}

export function buildMetroPreferencesWrite(serial) {
  const command = buildAdbCommand(serial, [
    "shell",
    "run-as",
    MOBILE_APP_ID,
    "toybox",
    "dd",
    `of=${METRO_PREFERENCES_TEMP_PATH}`,
  ]);
  return Object.freeze({
    ...command,
    stdin: METRO_PREFERENCES_XML,
  });
}

async function configureMetroPreferences(config, serial) {
  await runAdb(config, serial, [
    "shell",
    "run-as",
    MOBILE_APP_ID,
    "mkdir",
    "-p",
    "shared_prefs",
  ]);
  const writeCommand = buildMetroPreferencesWrite(serial);
  await runProcess({
    ...writeCommand,
    cwd: config.rootDirectory,
    env: process.env,
    timeoutMs: 10_000,
    label: "La configuration Metro privée Android",
    signal: config.signal,
  });
  await runAdb(config, serial, [
    "shell",
    "run-as",
    MOBILE_APP_ID,
    "chmod",
    "600",
    METRO_PREFERENCES_TEMP_PATH,
  ]);
  await runAdb(config, serial, [
    "shell",
    "run-as",
    MOBILE_APP_ID,
    "toybox",
    "mv",
    "-f",
    METRO_PREFERENCES_TEMP_PATH,
    METRO_PREFERENCES_PATH,
  ]);
  const mode = await runAdb(
    config,
    serial,
    [
      "shell",
      "run-as",
      MOBILE_APP_ID,
      "toybox",
      "stat",
      "-c",
      "%a",
      METRO_PREFERENCES_PATH,
    ],
    true,
  );
  const attestation = await runAdb(
    config,
    serial,
    [
      "shell",
      "run-as",
      MOBILE_APP_ID,
      "toybox",
      "sha256sum",
      METRO_PREFERENCES_PATH,
    ],
    true,
  );
  const actualDigest = /^([a-f0-9]{64})\s/u.exec(attestation.stdout)?.[1];
  const expectedDigest = createHash("sha256")
    .update(METRO_PREFERENCES_XML, "utf8")
    .digest("hex");
  if (mode.stdout.trim() !== "600" || actualDigest !== expectedDigest) {
    throw new MobileConnectedE2EError(
      "La configuration Metro privée Android n'est pas attestée.",
    );
  }
}

function mobileDevBundleStatArgs() {
  return [
    "shell",
    "run-as",
    MOBILE_APP_ID,
    "toybox",
    "stat",
    "-c",
    "%s:%Y:%a",
    MOBILE_DEV_BUNDLE_PATH,
  ];
}

function mobileDevBundleStatCommand(serial) {
  return buildAdbCommand(serial, mobileDevBundleStatArgs());
}

export function parseMobileDevBundleMetadata(output, launchEpochSeconds) {
  if (
    typeof output !== "string" ||
    !Number.isSafeInteger(launchEpochSeconds) ||
    launchEpochSeconds <= 0
  ) {
    return null;
  }
  const match = /^(\d+):(\d+):(\d{3,4})\r?\n?$/u.exec(output);
  if (match === null) return null;
  const byteLength = Number(match[1]);
  const modifiedAt = Number(match[2]);
  const mode = match[3];
  if (
    !Number.isSafeInteger(byteLength) ||
    byteLength <= 0 ||
    byteLength > MAX_METRO_BUNDLE_BYTES ||
    !Number.isSafeInteger(modifiedAt) ||
    modifiedAt < launchEpochSeconds ||
    mode !== "600"
  ) {
    return null;
  }
  return Object.freeze({ byteLength, modifiedAt, mode });
}

async function assertMobileDevBundleCacheAbsent(config, serial) {
  const result = await runProcess({
    ...mobileDevBundleStatCommand(serial),
    cwd: config.rootDirectory,
    env: process.env,
    capture: true,
    acceptedExitCodes: [0, 1],
    timeoutMs: 10_000,
    label: "L'absence initiale du bundle Android privé",
    signal: config.signal,
  });
  if (result.exitCode !== 1 || result.stdout !== "") {
    throw new MobileConnectedE2EError(
      "Le cache bundle Android n'est pas vierge après le reset de l'app.",
    );
  }
}

async function readDeviceEpochSeconds(config, serial) {
  const result = await runAdb(config, serial, ["shell", "date", "+%s"], true);
  const value = Number(result.stdout.trim());
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new MobileConnectedE2EError("L'horloge Android est invalide.");
  }
  return value;
}

async function assertMobileDevBundleCache(config, serial, launchEpochSeconds) {
  const result = await runAdb(config, serial, mobileDevBundleStatArgs(), true);
  if (
    parseMobileDevBundleMetadata(result.stdout, launchEpochSeconds) === null
  ) {
    throw new MobileConnectedE2EError(
      "Le GET applicatif du bundle Android n'est pas attesté dans le cache privé.",
    );
  }
}

export function requireSupportedEmulatorAbi(value) {
  const abi = typeof value === "string" ? value.trim() : "";
  if (abi !== "x86_64" && abi !== "arm64-v8a") {
    throw new MobileConnectedE2EError(
      "L'ABI de l'émulateur doit être x86_64 ou arm64-v8a.",
    );
  }
  return abi;
}

async function readEmulatorAbi(config, serial) {
  const result = await runAdb(
    config,
    serial,
    ["shell", "getprop", "ro.product.cpu.abi"],
    true,
  );
  return requireSupportedEmulatorAbi(result.stdout);
}

export function parseMetroReverseState(output) {
  if (typeof output !== "string" || output.length > 65_536) {
    throw new MobileConnectedE2EError("L'état reverse Metro est invalide.");
  }
  let exact = false;
  let conflicting = false;
  for (const line of output.split(/\r?\n/u)) {
    if (line.trim() === "") continue;
    const fields = line.trim().split(/\s+/u);
    if (fields.length < 3) {
      throw new MobileConnectedE2EError("L'état reverse Metro est invalide.");
    }
    const remote = fields.at(-2);
    const local = fields.at(-1);
    if (remote !== "tcp:8081") continue;
    if (local === "tcp:8081") exact = true;
    else conflicting = true;
  }
  if (conflicting) return "conflict";
  return exact ? "exact" : "absent";
}

export function buildMetroReverseAddCommand(serial) {
  return buildAdbCommand(serial, [
    "reverse",
    "--no-rebind",
    "tcp:8081",
    "tcp:8081",
  ]);
}

async function readMetroReverseState(config, serial) {
  const existing = await runAdb(config, serial, ["reverse", "--list"], true);
  return parseMetroReverseState(existing.stdout);
}

export function metroReverseCleanupAction(state) {
  if (state === "absent") return "none";
  if (state === "exact") return "remove";
  if (state === "conflict") return "refuse";
  throw new MobileConnectedE2EError("L'état reverse Metro est invalide.");
}

async function cleanupOwnedMetroReverse(config, serial) {
  const state = await readMetroReverseState(config, serial);
  const action = metroReverseCleanupAction(state);
  if (action === "none") return;
  if (action === "refuse") {
    throw new MobileConnectedE2EError(
      "Le reverse Metro a été modifié par un autre processus.",
    );
  }
  await runAdb(config, serial, ["reverse", "--remove", "tcp:8081"]);
}

async function readAirplaneMode(config, serial) {
  const state = await runAdb(
    config,
    serial,
    ["shell", "settings", "get", "global", "airplane_mode_on"],
    true,
  );
  if (state.stdout.trim() === "1") return true;
  if (state.stdout.trim() === "0") return false;
  throw new MobileConnectedE2EError("L'état réseau Android est illisible.");
}

async function setAirplaneMode(config, serial, enabled) {
  await runAdb(config, serial, [
    "shell",
    "cmd",
    "connectivity",
    "airplane-mode",
    enabled ? "enable" : "disable",
  ]);
  if ((await readAirplaneMode(config, serial)) !== enabled) {
    throw new MobileConnectedE2EError(
      "Le mode hors connexion Android n'est pas attesté.",
    );
  }
}

async function deviceCanReachOrigin(config, serial, originInput) {
  const origin = new URL(requirePrivateOrigin(originInput, "Origine sondée"));
  const port = origin.port || (origin.protocol === "https:" ? "443" : "80");
  const command = buildAdbCommand(serial, [
    "shell",
    "toybox",
    "nc",
    "-z",
    "-w",
    "2",
    origin.hostname.replace(/^\[|\]$/gu, ""),
    port,
  ]);
  const result = await runProcess({
    ...command,
    cwd: config.rootDirectory,
    env: process.env,
    capture: false,
    acceptedExitCodes: [0, 1],
    timeoutMs: 10_000,
    label: "La sonde réseau privée Android",
    signal: config.signal,
  });
  return result.exitCode === 0;
}

async function assertDeviceOriginsReachability(
  config,
  serial,
  origins,
  expectedReachable,
) {
  const stable = await waitForStableReachability(
    origins,
    expectedReachable,
    (origin) => deviceCanReachOrigin(config, serial, origin),
    { signal: config.signal },
  );
  if (!stable) {
    throw new MobileConnectedE2EError(
      expectedReachable
        ? "Une origine locale n'est pas joignable depuis l'émulateur Android."
        : "Une origine locale reste joignable depuis l'émulateur en mode hors connexion.",
    );
  }
}

export async function waitForStableReachability(
  origins,
  expectedReachable,
  probe,
  options = {},
) {
  const {
    signal,
    timeoutMs = 30_000,
    intervalMs = 250,
    requiredStableProbes = 2,
    now = Date.now,
    wait = (milliseconds, currentSignal) =>
      delay(
        milliseconds,
        undefined,
        currentSignal === undefined ? undefined : { signal: currentSignal },
      ),
  } = options;
  if (
    !Array.isArray(origins) ||
    origins.length === 0 ||
    origins.some((origin) => typeof origin !== "string") ||
    typeof expectedReachable !== "boolean" ||
    typeof probe !== "function" ||
    !Number.isInteger(timeoutMs) ||
    timeoutMs < 1 ||
    !Number.isInteger(intervalMs) ||
    intervalMs < 0 ||
    !Number.isInteger(requiredStableProbes) ||
    requiredStableProbes < 2 ||
    typeof now !== "function" ||
    typeof wait !== "function"
  ) {
    throw new MobileConnectedE2EError(
      "La sonde réseau stable Android est invalide.",
    );
  }
  const deadline = now() + timeoutMs;
  let consecutiveMatches = 0;
  do {
    throwIfAborted(signal);
    let allMatched = true;
    for (const origin of origins) {
      if ((await probe(origin)) !== expectedReachable) allMatched = false;
    }
    consecutiveMatches = allMatched ? consecutiveMatches + 1 : 0;
    if (consecutiveMatches >= requiredStableProbes) return true;
    const remainingMs = deadline - now();
    if (remainingMs <= 0) break;
    await wait(Math.min(intervalMs, remainingMs), signal);
  } while (now() < deadline);
  return false;
}

export function buildDefaultApkCommand(
  emulatorAbi,
  platform = process.platform,
) {
  const architecture = requireSupportedEmulatorAbi(emulatorAbi);
  const architectureArgument = `-PreactNativeArchitectures=${architecture}`;
  if (platform === "win32") {
    return {
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "gradlew.bat",
        "--no-daemon",
        ":app:assembleDebug",
        architectureArgument,
      ],
    };
  }
  return {
    command: "./gradlew",
    args: ["--no-daemon", ":app:assembleDebug", architectureArgument],
  };
}

export function parseJavaMajorVersion(output) {
  const match = /(?:java|openjdk)\s+version\s+"?(\d+)(?:[.\s"])/iu.exec(output);
  return match === null ? null : Number(match[1]);
}

async function assertJava17(config, environment) {
  const result = await runProcess({
    command: "java",
    args: ["-version"],
    cwd: config.rootDirectory,
    env: environment,
    capture: true,
    timeoutMs: 10_000,
    label: "Le préflight Java 17",
    signal: config.signal,
  });
  if (parseJavaMajorVersion(`${result.stdout}\n${result.stderr}`) !== 17) {
    throw new MobileConnectedE2EError(
      "Le build Android local exige Java 17 dans JAVA_HOME et PATH.",
    );
  }
}

async function ensureDebugApk(config, environment, emulatorAbi) {
  if (config.reuseDebugApk && (await pathIsFile(config.apkPath))) return;
  if (config.apkBuildCommand !== null) {
    await runProcess({
      ...config.apkBuildCommand,
      cwd: config.apkBuildCwd,
      env: environment,
      timeoutMs: config.commandTimeoutMs,
      label: "Le build APK debug personnalisé",
      signal: config.signal,
    });
    if (!(await pathIsFile(config.apkPath))) {
      throw new MobileConnectedE2EError(
        "L'APK debug attendu n'a pas été produit.",
      );
    }
    return;
  }
  const androidSdkDirectory = await resolveAndroidSdkDirectory(environment);
  const buildEnvironment = {
    ...environment,
    ANDROID_HOME: androidSdkDirectory,
    ANDROID_SDK_ROOT: androidSdkDirectory,
  };
  for (const script of ["config:check", "native:check"]) {
    const gateCommand = buildPnpmCommand([
      "--filter",
      "@thainaute/mobile",
      script,
    ]);
    await runProcess({
      ...gateCommand,
      cwd: config.rootDirectory,
      env: buildEnvironment,
      timeoutMs: config.commandTimeoutMs,
      label: `Le gate mobile ${script}`,
      signal: config.signal,
    });
  }
  await assertJava17(config, buildEnvironment);
  const prebuildCommand = buildPnpmCommand([
    "--filter",
    "@thainaute/mobile",
    "exec",
    "expo",
    "prebuild",
    "--clean",
    "--no-install",
    "--platform",
    "android",
  ]);
  await runProcess({
    ...prebuildCommand,
    cwd: config.rootDirectory,
    env: buildEnvironment,
    timeoutMs: config.commandTimeoutMs,
    label: "Le prebuild Android propre",
    signal: config.signal,
  });
  const command = buildDefaultApkCommand(emulatorAbi);
  await runProcess({
    ...command,
    cwd: config.apkBuildCwd,
    env: buildEnvironment,
    timeoutMs: config.commandTimeoutMs,
    label: "Le build APK debug",
    signal: config.signal,
  });
  if (!(await pathIsFile(config.apkPath))) {
    throw new MobileConnectedE2EError(
      "L'APK debug attendu n'a pas été produit.",
    );
  }
}

async function runMaestro(config, serial, flowName) {
  const flowPath = resolveInsideRoot(
    config.rootDirectory,
    path.join("apps/mobile/maestro", flowName),
    "Le flow Maestro",
  );
  const privateRoot = await mkdtemp(
    path.join(os.tmpdir(), "thainaute-maestro-private-"),
  );
  const outputDirectory = path.join(privateRoot, "maestro-output");
  await runWithSafeCleanup(
    async () => {
      await ensurePrivateTempRoot(config, privateRoot);
      await mkdir(outputDirectory, { mode: 0o700 });
      const command = buildMaestroCommand(flowPath, outputDirectory, serial);
      const maestroEnvironment = privateTempEnvironment(
        {
          ...maestroEnvironmentWithoutSecrets(process.env, runtimeSecrets),
          ANDROID_SERIAL: serial,
          MAESTRO_CLI_NO_ANALYTICS: "1",
        },
        privateRoot,
        { java: true },
      );
      await runProcess({
        ...command,
        cwd: config.rootDirectory,
        env: maestroEnvironment,
        timeoutMs: config.commandTimeoutMs,
        label: `Le flow Maestro ${flowName}`,
        signal: config.signal,
      });
    },
    () => removePrivateTempRoot(privateRoot),
    "artefacts Maestro",
  );
}

export function classifyPreAuthHierarchy(hierarchy) {
  if (typeof hierarchy !== "string") return "unavailable";
  const normalized = hierarchy.normalize("NFC").toLowerCase();
  if (normalized.includes("retrouver sa progression partout.")) {
    return "account";
  }
  if (normalized.includes("un départ simple, pensé pour vous.")) {
    return "onboarding";
  }
  if (
    normalized.includes("development servers") ||
    normalized.includes("enter url manually") ||
    normalized.includes("dev launcher")
  ) {
    return "development_launcher";
  }
  if (
    normalized.includes("unable to load script") ||
    normalized.includes("could not connect to development server") ||
    normalized.includes("unable to connect to metro") ||
    normalized.includes("connection refused")
  ) {
    return "metro_unavailable";
  }
  if (normalized.includes('package="com.thainaute.app"')) {
    return "app_without_expected_text";
  }
  if (normalized.includes('package="com.android.launcher3"')) {
    return "android_launcher";
  }
  return "unrecognized";
}

export function classifyPostOtpHierarchy(hierarchy) {
  if (
    typeof hierarchy !== "string" ||
    Buffer.byteLength(hierarchy, "utf8") > MAX_AUTH_HIERARCHY_OUTPUT_BYTES ||
    hierarchy.includes("\0") ||
    !hierarchy.includes("<hierarchy") ||
    !hierarchy.includes("</hierarchy>")
  ) {
    return "unavailable";
  }
  const normalized = hierarchy.normalize("NFC").toLowerCase();
  if (
    normalized.includes("development servers") ||
    normalized.includes("enter url manually") ||
    normalized.includes("dev launcher")
  ) {
    return "development_launcher";
  }
  if (
    normalized.includes("unable to load script") ||
    normalized.includes("could not connect to development server") ||
    normalized.includes("unable to connect to metro") ||
    normalized.includes("connection refused")
  ) {
    return "metro_unavailable";
  }
  if (
    normalized.includes("copy error") &&
    (normalized.includes("dismiss error") ||
      normalized.includes("reload application"))
  ) {
    return "dev_runtime_error";
  }
  if (!normalized.includes('package="com.thainaute.app"')) {
    return "wrong_package";
  }
  const appNodes =
    normalized.match(/<node\b[^>]*\bpackage="com\.thainaute\.app"[^>]*>/gu) ??
    [];
  const appSurface = appNodes.join(" ");
  if (
    appSurface.includes("router_error_message") &&
    appSurface.includes("router_error_retry")
  ) {
    return "dev_runtime_error";
  }
  if (normalized.includes("préparation des ressources locales…")) {
    return "root_resources_loading";
  }
  if (normalized.includes("ressources locales incomplètes")) {
    return "root_resources_error";
  }
  if (
    normalized.includes("stockage local indisponible") &&
    normalized.includes("mettez") &&
    normalized.includes("application à jour")
  ) {
    return "root_storage_error";
  }
  if (normalized.includes("préparation d’aujourd’hui…")) {
    return "today_loading";
  }
  if (normalized.includes("ouverture de l’onboarding…")) {
    return "onboarding_redirect";
  }
  if (normalized.includes("préparation de votre parcours…")) {
    return "onboarding_loading";
  }
  if (
    normalized.includes("stockage local indisponible") &&
    normalized.includes("réessayez avant de commencer")
  ) {
    return "onboarding_storage_error";
  }
  if (normalized.includes("parcours local indisponible")) {
    return "today_storage_error";
  }
  if (
    appNodes.some((node) =>
      node.includes('content-desc="état du compte : connecté"'),
    )
  ) {
    return "signed_in";
  }
  if (
    appNodes.some((node) =>
      node.includes('content-desc="état du compte : session en vérification"'),
    )
  ) {
    return "provider_loading";
  }
  if (
    appNodes.some((node) =>
      node.includes('content-desc="état du compte : non configuré"'),
    )
  ) {
    return "unconfigured";
  }
  if (
    normalized.includes("account-auth-signed-in") ||
    normalized.includes("account-signed-in-card") ||
    normalized.includes("account-signed-in-heading") ||
    (normalized.includes("votre progression, sous contrôle.") &&
      normalized.includes("compte connecté"))
  ) {
    return "signed_in";
  }
  if (
    normalized.includes("account-email-card") ||
    (normalized.includes("compte connecté sur cet appareil.") &&
      normalized.includes("account-email-input"))
  ) {
    return "provider_stale";
  }
  if (
    normalized.includes("account-otp-verifying-card") ||
    (normalized.includes("account-otp-input") &&
      normalized.includes("vérification"))
  ) {
    return "verify_in_flight";
  }
  if (
    normalized.includes("account-otp-input") &&
    (normalized.includes("le code est invalide ou a expiré.") ||
      normalized.includes("connexion impossible."))
  ) {
    return "verify_rejected";
  }
  if (
    normalized.includes("account-otp-idle-card") ||
    normalized.includes("account-otp-input")
  ) {
    return "otp_idle";
  }
  if (
    appNodes.some((node) =>
      node.includes('content-desc="état du compte : déconnecté"'),
    ) ||
    normalized.includes("account-auth-signed_out") ||
    normalized.includes("account-auth-signed-out")
  ) {
    return "provider_stale";
  }
  if (
    normalized.includes("account-auth-loading") ||
    normalized.includes("vérification de la session")
  ) {
    return "provider_loading";
  }
  if (
    normalized.includes("account-auth-unconfigured") ||
    normalized.includes("compte non configuré ici")
  ) {
    return "unconfigured";
  }
  if (normalized.includes("stockage local indisponible")) {
    return "storage_error";
  }
  if (normalized.includes("un départ simple, pensé pour vous.")) {
    return "onboarding";
  }
  if (appSurface.includes("account-connected-preview-ready")) {
    return "account_preview_ready";
  }
  if (appSurface.includes("account-connected-preview-busy")) {
    return "account_preview_busy";
  }
  if (appSurface.includes("connected-attempt-retry")) {
    return "connected_attempt_pending";
  }
  if (appSurface.includes("connected-progress")) {
    return "connected_progress";
  }
  if (appSurface.includes("connected-attempt-status-result")) {
    return "connected_result";
  }
  if (/connected-option-[0-9]+-selected/u.test(appSurface)) {
    return "connected_option_selected";
  }
  if (/connected-option-[0-9]+-ready/u.test(appSurface)) {
    return "connected_option_ready";
  }
  if (/connected-option-[0-9]+-blocked/u.test(appSurface)) {
    return "connected_option_blocked";
  }
  if (appSurface.includes("connected-attempt-submit-ready")) {
    return "connected_submit_ready";
  }
  if (normalized.includes("chargement de la boucle connectée…")) {
    return "connected_loading";
  }
  if (normalized.includes("boucle connectée indisponible")) {
    return "connected_unavailable";
  }
  if (normalized.includes("cette leçon attend son lecteur dédié.")) {
    return "connected_typed_mismatch";
  }
  if (normalized.includes("boucle technique locale")) {
    return "connected_lesson";
  }
  if (
    normalized.includes("aujourd’hui") ||
    normalized.includes("aujourd'hui")
  ) {
    return "today";
  }
  if (normalized.includes("thaïnaute") && normalized.includes("retour")) {
    return "account_without_status_marker";
  }
  const hasSemanticContent = appNodes.some((node) => {
    for (const match of node.matchAll(
      /\b(?:text|content-desc|resource-id)="([^"]*)"/gu,
    )) {
      if (match[1].trim() !== "") return true;
    }
    return false;
  });
  return hasSemanticContent ? "semantic_unknown" : "app_blank_or_splash";
}

async function readPreAuthDeviceState(config, serial) {
  const cleanupConfig = { ...config, signal: undefined };
  try {
    await runAdb(config, serial, [
      "shell",
      "uiautomator",
      "dump",
      AUTH_HIERARCHY_PATH,
    ]);
    const result = await runAdb(
      config,
      serial,
      ["shell", "cat", AUTH_HIERARCHY_PATH],
      true,
    );
    return classifyPreAuthHierarchy(`${result.stdout}\n${result.stderr}`);
  } catch {
    return "unavailable";
  } finally {
    await runAdb(cleanupConfig, serial, [
      "shell",
      "rm",
      "-f",
      AUTH_HIERARCHY_PATH,
    ]).catch(() => undefined);
  }
}

async function readPostSecretDeviceState(config, serial) {
  const cleanupConfig = { ...config, signal: undefined };
  try {
    await runAdb(config, serial, [
      "shell",
      "uiautomator",
      "dump",
      AUTH_HIERARCHY_PATH,
    ]);
    const result = await runProcess({
      ...buildAdbCommand(serial, ["shell", "cat", AUTH_HIERARCHY_PATH]),
      cwd: config.rootDirectory,
      env: process.env,
      capture: true,
      captureLimitBytes: MAX_AUTH_HIERARCHY_OUTPUT_BYTES,
      timeoutMs: 30_000,
      label: "La classification de l'écran Android",
      signal: config.signal,
    });
    return classifyPostOtpHierarchy(`${result.stdout}\n${result.stderr}`);
  } catch {
    return "unavailable";
  } finally {
    await runAdb(cleanupConfig, serial, [
      "shell",
      "rm",
      "-f",
      AUTH_HIERARCHY_PATH,
    ]).catch(() => undefined);
  }
}

function preAuthFailure(state, cause) {
  const labels = Object.freeze({
    account: "écran compte visible mais non reconnu par Maestro",
    onboarding: "onboarding resté visible après le deep link",
    development_launcher: "launcher de développement visible",
    metro_unavailable: "runtime Metro indisponible",
    app_without_expected_text: "app Thaïnaute visible sans texte attendu",
    android_launcher: "launcher Android visible",
    unrecognized: "écran non reconnu",
    unavailable: "hiérarchie Android indisponible",
  });
  return new MobileConnectedE2EError(
    `Le jalon pré-authentification Android a échoué (${labels[state] ?? labels.unavailable}).`,
    { cause },
  );
}

export function postOtpColdRestoreDiagnosticFailure(
  liveState,
  coldStep,
  foregroundState,
  screenState,
  cause,
) {
  const safeLiveState = SAFE_POST_OTP_STATES.includes(liveState)
    ? liveState
    : "unavailable";
  const safeColdStep = SAFE_COLD_AUTH_STEPS.includes(coldStep)
    ? coldStep
    : "unknown";
  const safeForegroundState = SAFE_FOREGROUND_STATES.includes(foregroundState)
    ? foregroundState
    : "unavailable";
  const safeScreenState = SAFE_POST_OTP_STATES.includes(screenState)
    ? screenState
    : "unavailable";
  const outcome =
    coldStep === "restore_ok"
      ? `live_${safeLiveState}_cold_restore_ok`
      : coldStep === "skipped"
        ? `live_${safeLiveState}_cold_restore_skipped`
        : `live_${safeLiveState}_cold_${safeColdStep}_${safeForegroundState}_${safeScreenState}`;
  return new MobileConnectedE2EError(
    `Le jalon post-OTP Android a échoué (${outcome}).`,
    { cause },
  );
}

export function connectedPreparationFailure(
  stage,
  foregroundState,
  screenState,
  forwardedRequests,
  cause,
) {
  const safeStage = SAFE_CONNECTED_PREPARATION_STAGES.includes(stage)
    ? stage
    : "unknown";
  const safeForegroundState = SAFE_FOREGROUND_STATES.includes(foregroundState)
    ? foregroundState
    : "unavailable";
  const safeScreenState = SAFE_POST_OTP_STATES.includes(screenState)
    ? screenState
    : "unavailable";
  const requestState =
    Number.isSafeInteger(forwardedRequests) && forwardedRequests > 0
      ? "requests_seen"
      : "requests_none";
  return new MobileConnectedE2EError(
    `Le jalon de préparation connectée a échoué (${safeStage}_${safeForegroundState}_${safeScreenState}_${requestState}).`,
    { cause },
  );
}

async function runConnectedPreparationStep({
  config,
  serial,
  proxy,
  flowName,
  stage,
}) {
  try {
    await runMaestro(config, serial, flowName);
  } catch (error) {
    const primary =
      error instanceof Error
        ? error
        : new MobileConnectedE2EError(
            "Un jalon de préparation connectée Android a échoué.",
          );
    const cleanupSteps = Array.isArray(error?.cleanupSteps)
      ? error.cleanupSteps
      : [];
    throwIfColdAuthDiagnosticAborted(config, primary, cleanupSteps);
    const foregroundState = await readForegroundAndroidActivityState(
      config,
      serial,
    );
    throwIfColdAuthDiagnosticAborted(config, primary, cleanupSteps);
    const screenState = await readPostSecretDeviceState(config, serial);
    throwIfColdAuthDiagnosticAborted(config, primary, cleanupSteps);
    const forwardedRequests = proxy.getPublicState().forwardedRequests;
    throw combineFailureWithCleanup(
      connectedPreparationFailure(
        stage,
        foregroundState,
        screenState,
        forwardedRequests,
        primary,
      ),
      cleanupSteps,
    );
  }
}

function throwIfColdAuthDiagnosticAborted(config, livePrimary, cleanupSteps) {
  if (config.signal?.aborted) {
    throw combineFailureWithCleanup(livePrimary, cleanupSteps);
  }
}

async function runColdAuthDiagnosticStep({
  config,
  serial,
  flowName,
  step,
  liveState,
  livePrimary,
  cleanupSteps,
}) {
  throwIfColdAuthDiagnosticAborted(config, livePrimary, cleanupSteps);
  try {
    await runMaestro(config, serial, flowName);
  } catch (stepError) {
    const allCleanupSteps = [
      ...cleanupSteps,
      ...(Array.isArray(stepError?.cleanupSteps) ? stepError.cleanupSteps : []),
    ];
    throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);
    const foregroundState = await readForegroundAndroidActivityState(
      config,
      serial,
    );
    throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);
    const screenState = await readPostSecretDeviceState(config, serial);
    throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);
    const failure =
      foregroundState === "thainaute" && screenState === "signed_in"
        ? postOtpColdRestoreDiagnosticFailure(
            liveState,
            "restore_ok",
            foregroundState,
            screenState,
            livePrimary,
          )
        : postOtpColdRestoreDiagnosticFailure(
            liveState,
            step,
            foregroundState,
            screenState,
            livePrimary,
          );
    throw combineFailureWithCleanup(failure, allCleanupSteps);
  }
  throwIfColdAuthDiagnosticAborted(config, livePrimary, cleanupSteps);
}

function postEmailFailure(state, cause) {
  const labels = Object.freeze({
    otp_idle: "écran OTP rendu mais non focalisé par Maestro",
    verify_in_flight: "écran OTP déjà en vérification",
    provider_stale: "écran email resté affiché",
    provider_loading: "provider Auth encore en chargement",
    root_storage_error: "stockage racine indisponible",
    root_resources_error: "ressources racine indisponibles",
    onboarding: "retour inattendu vers l'onboarding",
    today: "retour inattendu vers l'accueil",
    connected_lesson: "navigation inattendue vers la boucle connectée",
    account_without_status_marker: "écran compte sans marqueur d'état Auth",
    wrong_package: "application Thaïnaute absente de la hiérarchie",
    unrecognized: "état applicatif non reconnu",
    unavailable: "hiérarchie Android indisponible",
  });
  return new MobileConnectedE2EError(
    `Le jalon post-email Android a échoué (${labels[state] ?? labels.unavailable}).`,
    { cause },
  );
}

export function extractOtpFromMailpitHtml(html) {
  if (typeof html !== "string")
    throw new MobileConnectedE2EError("Email local illisible.");
  const match = /letter-spacing:\s*8px;[\s\S]*?>\s*(\d{6})\s*<\/p>/iu.exec(
    html,
  );
  if (match?.[1] === undefined) {
    throw new MobileConnectedE2EError("OTP local absent du message attendu.");
  }
  return match[1];
}

export function mailpitMessageIdsFromPayload(payload) {
  if (
    payload === null ||
    typeof payload !== "object" ||
    !Array.isArray(payload.messages) ||
    payload.messages.length > 100
  ) {
    return null;
  }
  const ids = [];
  for (const message of payload.messages) {
    const id = message?.ID;
    if (typeof id !== "string" || !/^[A-Za-z0-9._~-]{1,256}$/u.test(id)) {
      return null;
    }
    ids.push(id);
  }
  return ids;
}

export function mailpitHtmlFromPayload(payload) {
  const html = payload?.HTML;
  return typeof html === "string" &&
    Buffer.byteLength(html, "utf8") <= MAX_MAILPIT_JSON_BYTES
    ? html
    : null;
}

function validRfc3339Timestamp(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/u.test(
      value,
    ) &&
    !Number.isNaN(Date.parse(value))
  );
}

export function classifyLocalAuthUsers(payload, expectedEmail) {
  if (
    typeof expectedEmail !== "string" ||
    !/^mobile-connected-[0-9a-f-]{36}@thainaute\.invalid$/u.test(
      expectedEmail,
    ) ||
    payload === null ||
    typeof payload !== "object" ||
    !Array.isArray(payload.users)
  ) {
    return "unavailable";
  }
  if (payload.users.length !== 1) return "unexpected";
  const user = payload.users[0];
  if (
    user === null ||
    typeof user !== "object" ||
    user.email !== expectedEmail ||
    user.is_anonymous !== false
  ) {
    return "unexpected";
  }
  const validLastSignIn = validRfc3339Timestamp(user.last_sign_in_at);
  const validEmailConfirmation = validRfc3339Timestamp(user.email_confirmed_at);
  if (validLastSignIn && validEmailConfirmation) {
    return "session_created";
  }
  if (
    (user.last_sign_in_at === null || user.last_sign_in_at === undefined) &&
    (user.email_confirmed_at === null ||
      user.email_confirmed_at === undefined ||
      validEmailConfirmation)
  ) {
    return "pending";
  }
  return "unexpected";
}

async function readBoundedResponseText(response, maximumBytes) {
  if (response.body === null) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, totalBytes).toString("utf8");
}

async function readLocalAuthUserState(
  status,
  expectedEmail,
  signal,
  timeoutMs,
) {
  const url = new URL("/auth/v1/admin/users", status.apiOrigin);
  url.searchParams.set("page", "1");
  url.searchParams.set("per_page", "2");
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/json",
        apikey: status.secretKey,
        Authorization: `Bearer ${status.secretKey}`,
      },
      redirect: "error",
      signal,
    },
    timeoutMs,
  );
  if (!response.ok) return "unavailable";
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) ||
      Number(declaredLength) > MAX_AUTH_ADMIN_JSON_BYTES)
  ) {
    return "unavailable";
  }
  const text = await readBoundedResponseText(
    response,
    MAX_AUTH_ADMIN_JSON_BYTES,
  );
  if (text === null) return "unavailable";
  try {
    return classifyLocalAuthUsers(JSON.parse(text), expectedEmail);
  } catch {
    return "unavailable";
  }
}

async function waitForLocalAuthSession(status, expectedEmail, signal) {
  const deadline = Date.now() + 20_000;
  let state = "unavailable";
  while (Date.now() < deadline) {
    throwIfAborted(signal);
    try {
      const remainingMs = Math.max(1, deadline - Date.now());
      state = await readLocalAuthUserState(
        status,
        expectedEmail,
        signal,
        Math.min(1_500, remainingMs),
      );
      if (state === "session_created") return;
      if (state === "unexpected") break;
    } catch {
      state = "unavailable";
    }
    const waitMs = Math.min(200, deadline - Date.now());
    if (waitMs > 0) {
      await delay(
        waitMs,
        undefined,
        signal === undefined ? undefined : { signal },
      );
    }
  }
  throw new MobileConnectedE2EError(
    `La session Auth locale n'a pas été créée après la soumission OTP (${state}).`,
  );
}

async function fetchMailpitJson(url, signal) {
  const response = await fetchWithTimeout(
    url,
    { headers: { Accept: "application/json" }, signal },
    1_500,
  );
  if (!response.ok) throw new MobileConnectedE2EError("Mailpit indisponible.");
  const declaredLength = response.headers.get("content-length");
  if (
    declaredLength !== null &&
    (!/^\d+$/u.test(declaredLength) ||
      Number(declaredLength) > MAX_MAILPIT_JSON_BYTES)
  ) {
    throw new MobileConnectedE2EError("Réponse Mailpit trop volumineuse.");
  }
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > MAX_MAILPIT_JSON_BYTES) {
    throw new MobileConnectedE2EError("Réponse Mailpit trop volumineuse.");
  }
  return JSON.parse(text);
}

async function readLocalOtp(mailpitOrigin, email, signal) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    throwIfAborted(signal);
    try {
      const searchUrl = new URL("/api/v1/search", mailpitOrigin);
      searchUrl.searchParams.set("query", `to:${email}`);
      const ids = mailpitMessageIdsFromPayload(
        await fetchMailpitJson(searchUrl, signal),
      );
      if (ids !== null) {
        for (const id of ids) {
          const messageUrl = new URL(
            `/api/v1/message/${encodeURIComponent(id)}`,
            mailpitOrigin,
          );
          const html = mailpitHtmlFromPayload(
            await fetchMailpitJson(messageUrl, signal),
          );
          if (html === null) continue;
          try {
            return extractOtpFromMailpitHtml(html);
          } catch {
            // Un autre message local peut ne pas contenir le code attendu.
          }
        }
      }
    } catch {
      // Mailpit indexe parfois le message après la réponse de Supabase Auth.
    }
    await delay(200);
  }
  throw new MobileConnectedE2EError(
    "L'OTP local n'a pas été reçu dans le délai imparti.",
  );
}

function requireNumericState(state, key, expected) {
  if (state?.[key] !== expected) {
    throw new MobileConnectedE2EError(`La preuve proxy ${key} est invalide.`);
  }
}

export function assertFinalFaultProxyState(state) {
  requireNumericState(state, "attemptBatchRequests", 2);
  requireNumericState(state, "committedAttemptBatches", 1);
  requireNumericState(state, "droppedClientResponses", 1);
  requireNumericState(state, "validatedReplays", 1);
  requireNumericState(state, "replayMismatches", 0);
  if (state?.lastReplayMatched !== true) {
    throw new MobileConnectedE2EError("Le rejeu n'est pas octet-identique.");
  }
  if (state?.lastReplayResponseMatched !== true) {
    throw new MobileConnectedE2EError(
      "Le rejeu n'a pas restitué la réponse HTTP enregistrée exacte.",
    );
  }
  if (state?.lastCommittedProjection?.singleStateAttemptCount !== 1) {
    throw new MobileConnectedE2EError(
      "La projection serveur a compté plus d'une tentative.",
    );
  }
  const committed = state.lastCommittedProjection;
  const replay = state?.lastReplayProjection;
  const isSingleAcceptedProjection = (projection) =>
    projection?.resultCount === 1 &&
    projection.acceptedCount === 1 &&
    projection.duplicateCount === 0 &&
    projection.rejectedCount === 0 &&
    projection.stateCount === 1;
  if (
    !isSingleAcceptedProjection(committed) ||
    !isSingleAcceptedProjection(replay)
  ) {
    throw new MobileConnectedE2EError(
      "Le cache idempotent n'a pas restitué exactement une tentative acceptée.",
    );
  }
  const exactProjection = (projection) => ({
    attemptCount: projection?.singleStateAttemptCount,
    masteryPermille: projection?.singleStateMasteryPermille,
    status: projection?.singleStateStatus,
    dueAt: projection?.singleStateDueAt,
  });
  if (
    replay === null ||
    replay === undefined ||
    JSON.stringify(exactProjection(committed)) !==
      JSON.stringify(exactProjection(replay))
  ) {
    throw new MobileConnectedE2EError(
      "Le rejeu n'a pas restitué la projection autoritaire exacte.",
    );
  }
  return true;
}

function handoffExpectedFromProxyState(state) {
  const projection = state?.lastReplayProjection;
  const attemptCount = projection?.singleStateAttemptCount;
  const masteryPermille = projection?.singleStateMasteryPermille;
  const status = projection?.singleStateStatus;
  const dueAt = projection?.singleStateDueAt;
  let canonicalDueAt = false;
  if (typeof dueAt === "string") {
    try {
      canonicalDueAt = new Date(dueAt).toISOString() === dueAt;
    } catch {
      canonicalDueAt = false;
    }
  }
  if (
    attemptCount !== 1 ||
    !Number.isInteger(masteryPermille) ||
    masteryPermille < 0 ||
    masteryPermille > 1_000 ||
    typeof status !== "string" ||
    !/^[a-z_]{1,32}$/u.test(status) ||
    !canonicalDueAt
  ) {
    throw new MobileConnectedE2EError(
      "La projection autoritaire ne permet pas le handoff web.",
    );
  }
  return { attemptCount, masteryPermille, status, dueAt };
}

async function runWebHandoff(config, webEnv, email, finalProxyState) {
  const payload = JSON.stringify({
    schemaVersion: 1,
    syntheticAccountEmail: email,
    expected: handoffExpectedFromProxyState(finalProxyState),
  });
  if (Buffer.byteLength(payload, "utf8") > 2_048) {
    throw new MobileConnectedE2EError(
      "Le handoff web dépasse sa borne privée.",
    );
  }
  const privateRoot = await mkdtemp(
    path.join(os.tmpdir(), "thainaute-mobile-handoff-"),
  );
  const handoffPath = path.join(privateRoot, "handoff-v1.json");
  await runWithSafeCleanup(
    async () => {
      await ensurePrivateTempRoot(config, privateRoot);
      await writeFile(handoffPath, payload, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
      if (process.platform !== "win32") {
        await chmod(handoffPath, 0o600);
        const metadata = await stat(handoffPath);
        if ((metadata.mode & 0o777) !== 0o600) {
          throw new MobileConnectedE2EError("Le handoff web n'est pas privé.");
        }
      }
      const handoffCommand = buildPnpmCommand([
        "--filter",
        "@thainaute/web",
        "exec",
        "playwright",
        "test",
        "e2e/connected-mobile-handoff.spec.ts",
        "--project=chromium",
        "--workers=1",
        "--retries=0",
        "--trace=off",
        "--output",
        path.join(privateRoot, "playwright-output"),
      ]);
      await runProcess({
        ...handoffCommand,
        cwd: config.rootDirectory,
        env: privateTempEnvironment(
          {
            ...webEnv,
            CI: "",
            THAINAUTE_MOBILE_HANDOFF_E2E: "1",
            THAINAUTE_MOBILE_HANDOFF_FILE: handoffPath,
            THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN: config.webOrigin,
          },
          privateRoot,
        ),
        timeoutMs: config.commandTimeoutMs,
        label: "Le handoff Android vers le web",
        signal: config.signal,
      });
      if (await pathIsFile(handoffPath)) {
        throw new MobileConnectedE2EError(
          "Le vérificateur web n'a pas consommé son handoff privé.",
        );
      }
    },
    () => removePrivateTempRoot(privateRoot),
    "handoff privé",
  );
}

async function loadFaultProxy(config) {
  const modulePath = resolveInsideRoot(
    config.rootDirectory,
    "scripts/qa/mobile-connected-fault-proxy.mjs",
    "Le proxy QA",
  );
  const module = await import(pathToFileURL(modulePath).href);
  if (typeof module.createMobileConnectedFaultProxy !== "function") {
    throw new MobileConnectedE2EError(
      "Le proxy QA local n'expose pas son contrat attendu.",
    );
  }
  return module.createMobileConnectedFaultProxy({
    targetOrigin: config.webOrigin,
    listenHost: "127.0.0.1",
    port: config.proxyPort,
    armed: false,
    logger: () => undefined,
  });
}

export function toolPreflightTimeoutMs(label) {
  if (label === "Maestro") return 30_000;
  if (label === "ADB" || label === "pnpm") return 10_000;
  throw new MobileConnectedE2EError("Le préflight d'outil QA est invalide.");
}

async function assertTools(config) {
  const maestroPreflight =
    process.platform === "win32"
      ? ["cmd.exe", ["/d", "/s", "/c", "maestro.bat", "--version"], "Maestro"]
      : ["maestro", ["--version"], "Maestro"];
  const pnpmPreflight = buildPnpmCommand(["--version"]);
  for (const [command, args, label] of [
    ["adb", ["version"], "ADB"],
    maestroPreflight,
    [pnpmPreflight.command, pnpmPreflight.args, "pnpm"],
  ]) {
    await runProcess({
      command,
      args,
      cwd: config.rootDirectory,
      env: process.env,
      timeoutMs: toolPreflightTimeoutMs(label),
      label: `Le préflight ${label}`,
      signal: config.signal,
    });
  }
}

function safeProgress(message) {
  process.stdout.write(`${message}\n`);
}

export async function runMobileConnectedE2E(
  environment = process.env,
  options = {},
) {
  const config = Object.freeze({
    ...readRunnerConfig(environment),
    signal: options.signal,
  });
  const managed = [];
  let proxy = null;
  let serial = null;
  let airplaneModeEnabled = false;
  let metroReverseAdded = false;
  let appMayBeInstalled = false;
  let completedState = null;
  let primaryFailure = null;
  let nextTypesSnapshot = null;
  let nextTypesMayNeedRestore = false;
  let webEnvironmentForCleanup = null;
  let webProcess = null;
  let metroProcess = null;
  const supabaseOwnership = { guard: null, stackOwned: false };

  try {
    safeProgress("[mobile-connected] Préflight local.");
    await assertTools(config);
    nextTypesSnapshot = await snapshotNextTypes(config);
    serial = await selectAndroidEmulator(config);
    const emulatorAbi = await readEmulatorAbi(config, serial);

    safeProgress("[mobile-connected] Reset et fixture Supabase locale.");
    const status = await prepareLocalSupabase(config, supabaseOwnership);
    const webEnv = webEnvironment(status, config.webOrigin);
    webEnvironmentForCleanup = webEnv;
    if (await originAlreadyResponds(config.webOrigin)) {
      throw new MobileConnectedE2EError(
        "L'origine Next.js QA configurée est déjà occupée ; arrêtez ce serveur ou choisissez un autre port loopback.",
      );
    }
    const webCommand = buildDefaultWebCommand(config.webOrigin);
    nextTypesMayNeedRestore = true;
    webProcess = startManagedProcess({
      ...webCommand,
      cwd: config.rootDirectory,
      env: webEnv,
    });
    managed.push(webProcess);
    await waitForFixtureWeb(
      config.webOrigin,
      config.startupTimeoutMs,
      config.signal,
      webProcess,
    );

    proxy = await loadFaultProxy(config);
    const proxyAddress = await proxy.start();
    const proxyOrigin = requirePrivateOrigin(
      proxyAddress.origin,
      "Le proxy QA",
    );
    const deviceApiOrigin = originForAndroidHost(
      proxyOrigin,
      config.deviceHost,
    );
    const deviceSupabaseOrigin = originForAndroidHost(
      status.apiOrigin,
      config.deviceHost,
    );
    const mobileEnv = {
      ...process.env,
      NODE_ENV: "development",
      EXPO_OFFLINE: "1",
      EXPO_NO_TELEMETRY: "1",
      THAINAUTE_LANGUAGE_PACK: "thai-fr",
      EXPO_PUBLIC_API_URL: deviceApiOrigin,
      EXPO_PUBLIC_SUPABASE_URL: deviceSupabaseOrigin,
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.publishableKey,
    };

    const metroReverseState = await readMetroReverseState(config, serial);
    if (metroReverseState === "conflict") {
      throw new MobileConnectedE2EError(
        "Le reverse Metro 8081 existe avec une cible différente.",
      );
    }
    if (metroReverseState === "absent") {
      const reverseCommand = buildMetroReverseAddCommand(serial);
      await runProcess({
        ...reverseCommand,
        cwd: config.rootDirectory,
        env: process.env,
        timeoutMs: 30_000,
        label: "L'ajout du reverse Metro local",
        signal: undefined,
      });
      // --no-rebind rend la prise de possession atomique face à un concurrent.
      // L'appel ignore les signaux : seul son succès permet de réclamer le mapping.
      metroReverseAdded = true;
      throwIfAborted(config.signal);
    }
    if (await metroIsReady(config.metroOrigin)) {
      throw new MobileConnectedE2EError(
        "Metro répond déjà sur le port QA 8081 ; arrêtez-le avant cette recette isolée.",
      );
    }
    const metroCommand = buildDefaultMetroCommand();
    metroProcess = startManagedProcess({
      ...metroCommand,
      cwd: config.rootDirectory,
      env: metroProcessEnvironment(mobileEnv),
    });
    managed.push(metroProcess);
    await waitForMetro(
      config.metroOrigin,
      config.startupTimeoutMs,
      config.signal,
      metroProcess,
    );
    await assertOwnedServersReady(config, webProcess, metroProcess);
    await assertDeviceOriginsReachability(
      config,
      serial,
      [config.metroOrigin],
      true,
    );
    await ensureDebugApk(config, mobileEnv, emulatorAbi);
    await runAdb(config, serial, ["install", "-r", "-t", config.apkPath]);
    await runAdb(config, serial, ["shell", "pm", "path", MOBILE_APP_ID]);
    appMayBeInstalled = true;
    safeProgress(
      `[mobile-connected] Effacement des données privées QA de ${MOBILE_APP_ID}.`,
    );
    await runAdb(config, serial, ["shell", "pm", "clear", MOBILE_APP_ID]);
    await configureMetroPreferences(config, serial);
    await prewarmMetroAndroidBundle(config, metroProcess);
    await assertMobileDevBundleCacheAbsent(config, serial);
    if (await readAirplaneMode(config, serial)) {
      throw new MobileConnectedE2EError(
        "L'émulateur doit être en ligne au début de la recette.",
      );
    }
    await assertDeviceOriginsReachability(
      config,
      serial,
      [deviceApiOrigin, deviceSupabaseOrigin],
      true,
    );
    await assertOwnedServersReady(config, webProcess, metroProcess);

    safeProgress(
      "[mobile-connected] Authentification locale par l'interface Android.",
    );
    const devBundleLaunchEpoch = await readDeviceEpochSeconds(config, serial);
    try {
      await runMaestro(config, serial, FLOW_NAMES.authReady);
    } catch (error) {
      throw preAuthFailure(
        await readPreAuthDeviceState(config, serial),
        error instanceof Error ? error : undefined,
      );
    }
    await assertThainauteForegroundAfterLaunch(config, serial);
    await assertMobileDevBundleCache(config, serial, devBundleLaunchEpoch);
    await runMaestro(config, serial, FLOW_NAMES.authEntry);
    await assertThainauteForegroundAfterLaunch(config, serial);
    const email = `mobile-connected-${randomUUID()}@thainaute.invalid`;
    rememberSecret(email);
    await submitAndClearSensitiveAndroidInput(config, serial, "email", email);
    try {
      await runMaestro(config, serial, FLOW_NAMES.authCodeReady);
    } catch (error) {
      const failure = postEmailFailure(
        await readPostSecretDeviceState(config, serial),
        error instanceof Error ? error : undefined,
      );
      if (Array.isArray(error?.cleanupSteps)) {
        throw combineFailureWithCleanup(failure, error.cleanupSteps);
      }
      throw failure;
    }
    await assertThainauteForegroundAfterLaunch(config, serial);
    const otp = await readLocalOtp(config.mailpitOrigin, email, config.signal);
    rememberSecret(otp);
    const secureStoreManifestPreferenceName =
      secureStoreManifestPreferenceNameFromOrigin(deviceSupabaseOrigin);
    if (
      await readMobileSecureStoreManifest(
        config,
        serial,
        secureStoreManifestPreferenceName,
      )
    ) {
      throw new MobileConnectedE2EError(
        "Une session Auth locale existait avant la soumission OTP.",
      );
    }
    await submitAndClearSensitiveAndroidInput(config, serial, "otp", otp);
    await waitForLocalAuthSession(status, email, config.signal);
    await waitForMobileSecureStoreManifest(
      config,
      serial,
      secureStoreManifestPreferenceName,
    );
    await assertThainauteForegroundAfterLaunch(config, serial);
    try {
      await runMaestro(config, serial, FLOW_NAMES.authVerify);
    } catch (error) {
      const livePrimary =
        error instanceof Error
          ? error
          : new MobileConnectedE2EError("Le jalon Auth Android live a échoué.");
      const liveCleanupSteps = Array.isArray(error?.cleanupSteps)
        ? error.cleanupSteps
        : [];
      throwIfColdAuthDiagnosticAborted(config, livePrimary, liveCleanupSteps);
      const liveState = await readPostSecretDeviceState(config, serial);
      throwIfColdAuthDiagnosticAborted(config, livePrimary, liveCleanupSteps);
      if (liveState === "signed_in") {
        throw combineFailureWithCleanup(
          postOtpColdRestoreDiagnosticFailure(
            liveState,
            "skipped",
            "thainaute",
            liveState,
            livePrimary,
          ),
          liveCleanupSteps,
        );
      }
      await runColdAuthDiagnosticStep({
        config,
        serial,
        flowName: FLOW_NAMES.authColdLaunch,
        step: "launch",
        liveState,
        livePrimary,
        cleanupSteps: liveCleanupSteps,
      });
      await runColdAuthDiagnosticStep({
        config,
        serial,
        flowName: FLOW_NAMES.authColdOnboarding,
        step: "onboarding",
        liveState,
        livePrimary,
        cleanupSteps: liveCleanupSteps,
      });
      await runColdAuthDiagnosticStep({
        config,
        serial,
        flowName: FLOW_NAMES.authColdAccount,
        step: "account",
        liveState,
        livePrimary,
        cleanupSteps: liveCleanupSteps,
      });
      await runColdAuthDiagnosticStep({
        config,
        serial,
        flowName: FLOW_NAMES.authColdSignedIn,
        step: "signed_in",
        liveState,
        livePrimary,
        cleanupSteps: liveCleanupSteps,
      });
      throw combineFailureWithCleanup(
        postOtpColdRestoreDiagnosticFailure(
          liveState,
          "restore_ok",
          "thainaute",
          "signed_in",
          livePrimary,
        ),
        liveCleanupSteps,
      );
    }

    safeProgress(
      "[mobile-connected] Préparation de la fixture et mise hors connexion.",
    );
    await assertOwnedServersReady(config, webProcess, metroProcess);
    await runMaestro(config, serial, FLOW_NAMES.prepareAccount);
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.prepareOpen,
      stage: "open",
    });
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.prepareRoute,
      stage: "route",
    });
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.prepareAudio,
      stage: "audio",
    });
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.prepareOption,
      stage: "option",
    });
    airplaneModeEnabled = true;
    await setAirplaneMode(config, serial, true);
    await assertDeviceOriginsReachability(
      config,
      serial,
      [deviceApiOrigin, deviceSupabaseOrigin],
      false,
    );
    await assertDeviceOriginsReachability(
      config,
      serial,
      [config.metroOrigin],
      true,
    );
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.submitOffline,
      stage: "submit",
    });
    requireNumericState(proxy.getPublicState(), "attemptBatchRequests", 0);

    await runAdb(config, serial, ["shell", "am", "force-stop", MOBILE_APP_ID]);
    await assertOwnedServersReady(config, webProcess, metroProcess);
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.pendingAfterRelaunch,
      stage: "pending_relaunch",
    });
    requireNumericState(proxy.getPublicState(), "attemptBatchRequests", 0);

    safeProgress(
      "[mobile-connected] Reconnexion, réponse perdue puis rejeu identique.",
    );
    await assertOwnedServersReady(config, webProcess, metroProcess);
    await proxy.armNextAttemptBatch();
    await setAirplaneMode(config, serial, false);
    airplaneModeEnabled = false;
    await assertDeviceOriginsReachability(
      config,
      serial,
      [deviceApiOrigin, deviceSupabaseOrigin],
      true,
    );
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.replayDropped,
      stage: "replay_dropped",
    });
    await waitUntil(
      () => {
        const state = proxy.getPublicState();
        return (
          state.attemptBatchRequests === 1 &&
          state.droppedClientResponses === 1 &&
          state.awaitingReplay === true
        );
      },
      30_000,
      "La preuve de réponse perdue après commit",
      config.signal,
    );
    const droppedState = proxy.getPublicState();
    requireNumericState(droppedState, "attemptBatchRequests", 1);
    requireNumericState(droppedState, "droppedClientResponses", 1);
    if (
      droppedState.awaitingReplay !== true ||
      droppedState.faultInjected !== true
    ) {
      throw new MobileConnectedE2EError(
        "La perte de réponse après commit n'est pas attestée.",
      );
    }

    await assertOwnedServersReady(config, webProcess, metroProcess);
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.replaySuccess,
      stage: "replay_success",
    });
    await runConnectedPreparationStep({
      config,
      serial,
      proxy,
      flowName: FLOW_NAMES.replayProgress,
      stage: "replay_progress",
    });
    completedState = proxy.getPublicState();
    assertFinalFaultProxyState(completedState);
    safeProgress(
      "[mobile-connected] Vérification de la même projection sur le web.",
    );
    await assertOwnedServersReady(config, webProcess, metroProcess);
    await runWebHandoff(config, webEnv, email, completedState);
  } catch (error) {
    primaryFailure =
      error instanceof Error
        ? error
        : new MobileConnectedE2EError("La recette Android connectée a échoué.");
  }
  const cleanupFailures = [];
  const cleanupConfig = { ...config, signal: undefined };
  if (serial !== null && appMayBeInstalled) {
    await runAdb(cleanupConfig, serial, [
      "shell",
      "am",
      "force-stop",
      MOBILE_APP_ID,
    ]).catch(() => {
      cleanupFailures.push("application Android");
    });
    await runAdb(cleanupConfig, serial, [
      "shell",
      "pm",
      "clear",
      MOBILE_APP_ID,
    ]).catch(() => {
      cleanupFailures.push("données Android privées");
    });
  }
  if (serial !== null && airplaneModeEnabled) {
    await setAirplaneMode(cleanupConfig, serial, false).catch(() => {
      cleanupFailures.push("mode avion");
    });
  }
  if (serial !== null && metroReverseAdded) {
    await cleanupOwnedMetroReverse(cleanupConfig, serial).catch(() => {
      cleanupFailures.push("reverse Metro");
    });
  }
  if (proxy !== null) {
    await proxy.close().catch(() => {
      cleanupFailures.push("proxy local");
    });
  }
  for (const child of managed.reverse()) {
    await stopManagedProcess(child).catch(() => {
      cleanupFailures.push("processus local géré");
    });
  }
  if (
    nextTypesMayNeedRestore &&
    nextTypesSnapshot !== null &&
    webEnvironmentForCleanup !== null
  ) {
    await restoreNextTypes(
      cleanupConfig,
      nextTypesSnapshot,
      webEnvironmentForCleanup,
    ).catch(() => {
      cleanupFailures.push("types Next.js");
    });
  }
  if (supabaseOwnership.stackOwned && supabaseOwnership.guard !== null) {
    await supabaseOwnership.guard
      .purgeLocalSupabaseProjectResources()
      .catch(() => {
        cleanupFailures.push("stack Supabase locale");
      });
  }
  if (cleanupFailures.length > 0) {
    throw combineFailureWithCleanup(primaryFailure, cleanupFailures);
  }
  if (primaryFailure !== null) throw primaryFailure;
  throwIfAborted(config.signal);
  safeProgress(
    JSON.stringify({
      event: "mobile_connected_e2e_pass",
      offlinePersistence: true,
      restartPersistence: true,
      droppedResponses: completedState.droppedClientResponses,
      validatedReplays: completedState.validatedReplays,
      exactResponseReplay: completedState.lastReplayResponseMatched,
      singleStateAttemptCount:
        completedState.lastCommittedProjection.singleStateAttemptCount,
      webHandoff: true,
    }),
  );
  return completedState;
}

function isMainModule() {
  const entry = process.argv[1];
  return (
    entry !== undefined &&
    import.meta.url === pathToFileURL(path.resolve(entry)).href
  );
}

if (isMainModule()) {
  const abortController = new AbortController();
  const signalHandlers = new Map();
  const removeSignalHandlers = () => {
    for (const [signal, handler] of signalHandlers) {
      process.removeListener(signal, handler);
    }
  };
  const handleSignal = (signal) => {
    const exitCode = terminationSignalExitCode(signal);
    if (!abortController.signal.aborted) {
      process.exitCode = exitCode;
      abortController.abort();
      return;
    }
    removeSignalHandlers();
    process.exit(exitCode);
  };
  for (const signal of terminationSignalsForPlatform()) {
    const handler = () => handleSignal(signal);
    signalHandlers.set(signal, handler);
    process.on(signal, handler);
  }

  runMobileConnectedE2E(process.env, { signal: abortController.signal })
    .catch((error) => {
      const safe = formatCliFailure(
        error,
        abortController.signal.aborted,
        runtimeSecrets,
      );
      process.stderr.write(`[mobile-connected] ${safe}\n`);
      if (!abortController.signal.aborted) process.exitCode = 1;
    })
    .finally(() => {
      removeSignalHandlers();
    });
}
