import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const expoCliPath = require.resolve("expo/bin/cli");
const mobileRoot = fileURLToPath(new URL("..", import.meta.url));

const expectedActiveAndroidPermissions = new Set([
  "android.permission.INTERNET",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.RECORD_AUDIO",
]);
const expectedBlockedAndroidPermissions = new Set([
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.SYSTEM_ALERT_WINDOW",
  "android.permission.VIBRATE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
]);
const expectedMicrophoneMessage =
  "Autorisez Thaïnaute à utiliser le microphone pour enregistrer votre voix. La réécoute reste locale sur cet appareil.";
const expectedApplicationIdentity = {
  androidPackage: "com.thainaute.app",
  iosBundleIdentifier: "com.thainaute.app",
  name: "Thaïnaute",
  scheme: "thainaute",
  slug: "thainaute",
  version: "0.1.0",
};

function fail(message) {
  throw new Error(`Contrat de configuration native invalide : ${message}`);
}

function assertSameSet(actualValues, expectedValues, label) {
  const actual = new Set(actualValues);
  if (
    actual.size !== expectedValues.size ||
    [...expectedValues].some((value) => !actual.has(value))
  ) {
    fail(`${label} ne respecte plus la liste autorisée.`);
  }
}

const introspection = spawnSync(
  process.execPath,
  [expoCliPath, "config", "--type", "introspect", "--json"],
  {
    cwd: mobileRoot,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
  },
);

if (introspection.status !== 0 || introspection.error !== undefined) {
  fail("l’introspection Expo n’a pas abouti.");
}

let config;
try {
  config = JSON.parse(introspection.stdout);
} catch {
  fail("la sortie d’introspection Expo n’est pas un JSON valide.");
}

for (const [key, expected] of Object.entries({
  name: expectedApplicationIdentity.name,
  scheme: expectedApplicationIdentity.scheme,
  slug: expectedApplicationIdentity.slug,
  version: expectedApplicationIdentity.version,
})) {
  if (config[key] !== expected) {
    fail(`l’identité Expo ${key} doit rester ${expected}.`);
  }
}
if (
  config.ios?.bundleIdentifier !==
  expectedApplicationIdentity.iosBundleIdentifier
) {
  fail("le bundle identifier iOS ne respecte plus le brief.");
}
if (config.android?.package !== expectedApplicationIdentity.androidPackage) {
  fail("le package Android ne respecte plus le brief.");
}

assertSameSet(
  config.android?.permissions ?? [],
  expectedActiveAndroidPermissions,
  "les permissions Android actives",
);
assertSameSet(
  config.android?.blockedPermissions ?? [],
  expectedBlockedAndroidPermissions,
  "les permissions Android bloquées",
);

const manifestPermissions =
  config._internal?.modResults?.android?.manifest?.manifest?.[
    "uses-permission"
  ] ?? [];
const activeManifestPermissions = [];
const removedManifestPermissions = [];
for (const entry of manifestPermissions) {
  const attributes = entry?.$ ?? {};
  const name = attributes["android:name"];
  if (typeof name !== "string") continue;
  if (attributes["tools:node"] === "remove") {
    removedManifestPermissions.push(name);
  } else {
    activeManifestPermissions.push(name);
  }
}

assertSameSet(
  activeManifestPermissions,
  expectedActiveAndroidPermissions,
  "le manifeste Android actif",
);
assertSameSet(
  removedManifestPermissions,
  expectedBlockedAndroidPermissions,
  "les suppressions du manifeste Android",
);

const infoPlist = config.ios?.infoPlist ?? {};
if (infoPlist.NSMicrophoneUsageDescription !== expectedMicrophoneMessage) {
  fail("le motif iOS d’accès au microphone a changé.");
}
if ("NSFaceIDUsageDescription" in infoPlist) {
  fail("Face ID ne doit pas être déclaré sans usage biométrique explicite.");
}
if (
  Array.isArray(infoPlist.UIBackgroundModes) &&
  infoPlist.UIBackgroundModes.includes("audio")
) {
  fail("le mode audio iOS en arrière-plan doit rester désactivé.");
}

console.log(
  "Configuration native validée : microphone local, aucun accès biométrique, stockage externe, overlay, vibration ni audio de fond.",
);
