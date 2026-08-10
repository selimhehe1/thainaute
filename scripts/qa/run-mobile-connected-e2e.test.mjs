import path from "node:path";
import os from "node:os";
import process from "node:process";
import { mkdtemp, readFile, rm } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { createPlaywrightConfig } from "../../apps/web/playwright.config.ts";

import {
  MobileConnectedE2EError,
  assertFinalFaultProxyState,
  assertNonProduction,
  assertSupabaseDockerProxyState,
  assertSupabaseLoopbackAttestation,
  buildAdbCommand,
  buildAdbForegroundActivityProbe,
  buildAdbSecureStoreManifestProbe,
  buildAdbSensitiveInputCommand,
  buildDefaultApkCommand,
  buildDefaultMetroCommand,
  buildDefaultWebCommand,
  buildMaestroCommand,
  buildMetroPreferencesWrite,
  buildMetroReverseAddCommand,
  buildNextTypegenCommand,
  buildPnpmCommand,
  buildSupabaseIsolatedStartCommand,
  buildWindowsPrivateAclCommand,
  classifyForegroundAndroidActivity,
  classifyForegroundAndroidActivitySafely,
  classifyLocalAuthUsers,
  classifyPostOtpHierarchy,
  classifyPreAuthHierarchy,
  combineFailureWithCleanup,
  connectedPreparationFailure,
  extractOtpFromMailpitHtml,
  formatCliFailure,
  isLoopbackOrRfc1918Hostname,
  managedProcessIsAlive,
  mailpitHtmlFromPayload,
  mailpitMessageIdsFromPayload,
  maestroEnvironmentWithoutSecrets,
  metroBundleResponseIsValid,
  metroProcessEnvironment,
  metroReverseCleanupAction,
  nextTypesContentIsOwned,
  originForAndroidHost,
  parseCommandHook,
  parseJavaMajorVersion,
  parseMobileDevBundleMetadata,
  parseMetroReverseState,
  postOtpColdRestoreDiagnosticFailure,
  privateTempEnvironment,
  readRunnerConfig,
  redactSensitive,
  requireSupportedEmulatorAbi,
  requirePrivateOrigin,
  resolveAndroidSdkDirectory,
  resolveSupabaseGoSidecar,
  runWithSafeCleanup,
  secureStoreManifestPreferenceNameFromOrigin,
  supabaseStackIsOwnedAfterPurge,
  terminationSignalExitCode,
  terminationSignalsForPlatform,
  toolPreflightTimeoutMs,
  waitForStableReachability,
  webEnvironment,
} from "./run-mobile-connected-e2e.mjs";

const ROOT = path.resolve("C:/fixture/thainaute");

function validProxyState() {
  const projection = {
    syncRevision: 1,
    resultCount: 1,
    acceptedCount: 1,
    duplicateCount: 0,
    rejectedCount: 0,
    stateCount: 1,
    singleStateAttemptCount: 1,
    singleStateMasteryPermille: 250,
    singleStateStatus: "learning",
    singleStateDueAt: "2026-08-10T12:00:00.000Z",
  };
  return {
    attemptBatchRequests: 2,
    committedAttemptBatches: 1,
    droppedClientResponses: 1,
    validatedReplays: 1,
    replayMismatches: 0,
    lastReplayMatched: true,
    lastReplayResponseMatched: true,
    lastCommittedProjection: projection,
    lastReplayProjection: { ...projection },
  };
}

describe("garde-fous de la recette Android connectée", () => {
  it("refuse sans ambiguïté un runtime de production", () => {
    expect(() => assertNonProduction({ NODE_ENV: " production " })).toThrow(
      MobileConnectedE2EError,
    );
    expect(() =>
      assertNonProduction({ NODE_ENV: "development" }),
    ).not.toThrow();
  });

  it.each([
    "localhost",
    "127.0.0.1",
    "127.42.0.8",
    "10.0.2.2",
    "172.16.1.1",
    "172.31.255.254",
    "192.168.1.12",
    "[::1]",
  ])("accepte l'hôte privé %s", (hostname) => {
    expect(isLoopbackOrRfc1918Hostname(hostname)).toBe(true);
  });

  it.each(["example.com", "8.8.8.8", "172.15.0.1", "172.32.0.1", "192.0.2.1"])(
    "refuse l'hôte public %s",
    (hostname) => {
      expect(isLoopbackOrRfc1918Hostname(hostname)).toBe(false);
    },
  );

  it("refuse origines publiques, identifiants, chemins et fragments", () => {
    expect(() => requirePrivateOrigin("https://example.com")).toThrow();
    expect(() => requirePrivateOrigin("http://user:pass@127.0.0.1")).toThrow();
    expect(() => requirePrivateOrigin("http://127.0.0.1/private")).toThrow();
    expect(() => requirePrivateOrigin("http://127.0.0.1/#token")).toThrow();
    expect(requirePrivateOrigin("http://10.0.2.2:54321/")).toBe(
      "http://10.0.2.2:54321",
    );
  });

  it("remplace seulement l'hôte par l'alias Android privé", () => {
    expect(originForAndroidHost("http://127.0.0.1:43111", "10.0.2.2")).toBe(
      "http://10.0.2.2:43111",
    );
    expect(() =>
      originForAndroidHost("http://127.0.0.1:43111", "public.example"),
    ).toThrow();
  });

  it("valide toutes les origines et la release dès la lecture de config", () => {
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_WEB_ORIGIN: "https://public.example",
        },
        ROOT,
      ),
    ).toThrow(/loopback ou RFC1918/u);
    const validConfig = readRunnerConfig(
      {
        NODE_ENV: "development",
        THAINAUTE_QA_WEB_ORIGIN: "http://127.0.0.1:3102",
      },
      ROOT,
    );
    expect(validConfig.webOrigin).toBe("http://127.0.0.1:3102");
    expect(validConfig.metroOrigin).toBe("http://127.0.0.1:8081");
    expect(validConfig).not.toHaveProperty("webCommand");
    expect(validConfig).not.toHaveProperty("metroCommand");
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_WEB_ORIGIN: "http://127.0.0.1:8081",
        },
        ROOT,
      ),
    ).toThrow(/port local non réservé/u);
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_PUBLIC_CONTENT_RELEASE_ID:
            "40000000-0000-4000-8000-000000000001",
        },
        ROOT,
      ),
    ).toThrow(/fixture technique/u);
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_METRO_ORIGIN: "http://127.0.0.1:18081",
        },
        ROOT,
      ),
    ).toThrow(/réserve Mailpit/u);
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_MAILPIT_ORIGIN: "http://127.0.0.1:15432",
        },
        ROOT,
      ),
    ).toThrow(/Mailpit/u);
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_PREPARE_SUPABASE: "0",
        },
        ROOT,
      ),
    ).toThrow(/démarrage et le reset Supabase/u);
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          THAINAUTE_QA_RESET_DB: "0",
        },
        ROOT,
      ),
    ).toThrow(/démarrage et le reset Supabase/u);
    for (const forbiddenHook of [
      "THAINAUTE_QA_WEB_COMMAND_JSON",
      "THAINAUTE_QA_METRO_COMMAND_JSON",
    ]) {
      for (const value of ["", '["commande-locale"]']) {
        expect(() =>
          readRunnerConfig(
            {
              NODE_ENV: "development",
              [forbiddenHook]: value,
            },
            ROOT,
          ),
        ).toThrow(/ne sont pas surchargeables/u);
      }
    }
    expect(() =>
      readRunnerConfig(
        {
          NODE_ENV: "development",
          SUPABASE_CLI_BINARY_OVERRIDE: "C:\\externe\\supabase.exe",
        },
        ROOT,
      ),
    ).toThrow(/résolu et attesté/u);
  });
});

describe("commandes et confidentialité", () => {
  it("accorde 30 secondes au JVM Maestro froid sans élargir ADB ni pnpm", () => {
    expect(toolPreflightTimeoutMs("Maestro")).toBe(30_000);
    expect(toolPreflightTimeoutMs("ADB")).toBe(10_000);
    expect(toolPreflightTimeoutMs("pnpm")).toBe(10_000);
    expect(() => toolPreflightTimeoutMs("outil inconnu")).toThrow(
      /préflight d'outil QA/u,
    );
  });

  it("dérive la commande Next.js du port loopback validé", () => {
    expect(
      buildDefaultWebCommand("http://127.0.0.1:3102").args.slice(-9),
    ).toEqual([
      "--filter",
      "@thainaute/web",
      "exec",
      "next",
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3102",
    ]);
  });

  it("démarre Supabase derrière le proxy sans services publiés inutiles", () => {
    expect(buildSupabaseIsolatedStartCommand().args.slice(-5)).toEqual([
      "exec",
      "supabase",
      "start",
      "--exclude",
      "studio,logflare,vector",
    ]);
  });

  it("atteste les trois publications et les créations exactes après reset", () => {
    expect(
      assertSupabaseLoopbackAttestation({
        lockedContainerCount: 3,
        projectContainerCount: 9,
      }),
    ).toBe(true);
    expect(() =>
      assertSupabaseLoopbackAttestation({
        lockedContainerCount: 3,
        projectContainerCount: 8,
      }),
    ).toThrow(/attestation loopback/u);

    const exactState = {
      rewrittenByName: {
        supabase_db_Thainaute: 2,
        supabase_inbucket_Thainaute: 1,
        supabase_kong_Thainaute: 1,
      },
      projectNetworkCreates: 16,
      rewrittenPublicationCreates: 4,
      upgradeRoutes: {
        container_attach: 0,
        exec_start: 0,
        other: 0,
      },
      upgradeTransport: {
        childErrors: 0,
        downstreamEnds: 0,
        inputFinishes: 0,
        nonzeroExits: 0,
        readableEnds: 0,
        starts: 0,
        zeroExits: 0,
      },
    };
    expect(assertSupabaseDockerProxyState(exactState)).toBe(true);
    expect(
      assertSupabaseDockerProxyState({
        ...exactState,
        projectNetworkCreates: 1,
      }),
    ).toBe(true);
    expect(() =>
      assertSupabaseDockerProxyState({
        ...exactState,
        rewrittenByName: {
          ...exactState.rewrittenByName,
          supabase_studio_Thainaute: 1,
        },
      }),
    ).toThrow(/créations Supabase attendues/u);
    expect(() =>
      assertSupabaseDockerProxyState({
        ...exactState,
        rewrittenByName: {
          ...exactState.rewrittenByName,
          supabase_db_Thainaute: 1,
        },
      }),
    ).toThrow(/créations Supabase attendues/u);
    expect(
      supabaseStackIsOwnedAfterPurge({
        removedContainerCount: 0,
        removedNetworkCount: 0,
        removedVolumeCount: 0,
      }),
    ).toBe(true);
    expect(
      supabaseStackIsOwnedAfterPurge({
        removedContainerCount: 9,
        removedNetworkCount: 1,
        removedVolumeCount: 3,
      }),
    ).toBe(true);
    expect(() =>
      supabaseStackIsOwnedAfterPurge({
        removedContainerCount: -1,
        removedNetworkCount: 0,
        removedVolumeCount: 0,
      }),
    ).toThrow(/préflight des conteneurs/u);
    expect(() =>
      assertSupabaseDockerProxyState({
        ...exactState,
        projectNetworkCreates: 0,
      }),
    ).toThrow(/créations Supabase attendues/u);
    expect(() =>
      assertSupabaseDockerProxyState({
        ...exactState,
        upgradeTransport: {
          ...exactState.upgradeTransport,
          nonzeroExits: 1,
        },
      }),
    ).toThrow(/créations Supabase attendues/u);
    expect(() =>
      assertSupabaseDockerProxyState({
        ...exactState,
        upgradeRoutes: {
          ...exactState.upgradeRoutes,
          exec_start: 1,
        },
      }),
    ).toThrow(/créations Supabase attendues/u);
  });

  it("résout le sidecar Go exact du shim Supabase courant", async () => {
    const sidecar = await resolveSupabaseGoSidecar(path.resolve("."));
    expect(path.isAbsolute(sidecar)).toBe(true);
    expect(path.relative(path.resolve("."), sidecar).split(path.sep)[0]).toBe(
      "node_modules",
    );
    expect(path.basename(sidecar)).toBe(
      process.platform === "win32" ? "supabase-go.exe" : "supabase-go",
    );
    expect(() =>
      resolveSupabaseGoSidecar(path.resolve("."), {
        platform: "plateforme-inconnue",
        architecture: "x64",
      }),
    ).rejects.toThrow(/pas prise en charge/u);
  });

  it("garde le proxy Docker sur start, reset, status et fixture avant bootstrap", async () => {
    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const sidecar = source.indexOf(
      "await resolveSupabaseGoSidecar(config.rootDirectory)",
    );
    const purge = source.indexOf(
      "purgeLocalSupabaseProjectResources()",
      sidecar,
    );
    const ownership = source.indexOf(
      "ownership.stackOwned = supabaseStackIsOwnedAfterPurge(removal);",
    );
    const proxy = source.indexOf("createSupabaseLoopbackDockerProxy({");
    const start = source.indexOf(
      "const startCommand = buildSupabaseIsolatedStartCommand();",
      proxy,
    );
    const firstAttestation = source.indexOf(
      "await guard.attestLocalSupabaseLoopback",
      start,
    );
    const reset = source.indexOf(
      'const resetCommand = buildPnpmCommand(["db:reset"]);',
      firstAttestation,
    );
    const secondAttestation = source.indexOf(
      "await guard.attestLocalSupabaseLoopback",
      firstAttestation + 1,
    );
    const status = source.indexOf(
      "const status = await readSupabaseLocalStatus(",
      secondAttestation,
    );
    const fixture = source.indexOf(
      "const fixtureCommand = buildPnpmCommand([",
      status,
    );
    const audio = source.indexOf(
      "const audioCommand = buildPnpmCommand([",
      fixture,
    );
    const proxyClose = source.indexOf("() => proxy.close()", audio);
    const ownedCleanup = source.indexOf(
      "if (supabaseOwnership.stackOwned && supabaseOwnership.guard !== null)",
      proxyClose,
    );
    expect([
      sidecar,
      purge,
      ownership,
      proxy,
      start,
      firstAttestation,
      reset,
      secondAttestation,
      status,
      fixture,
      audio,
      proxyClose,
      ownedCleanup,
    ]).not.toContain(-1);
    expect(sidecar).toBeLessThan(purge);
    expect(purge).toBeLessThan(ownership);
    expect(ownership).toBeLessThan(proxy);
    expect(proxy).toBeLessThan(start);
    expect(start).toBeLessThan(firstAttestation);
    expect(firstAttestation).toBeLessThan(reset);
    expect(reset).toBeLessThan(secondAttestation);
    expect(secondAttestation).toBeLessThan(status);
    expect(status).toBeLessThan(fixture);
    expect(fixture).toBeLessThan(audio);
    expect(audio).toBeLessThan(proxyClose);
    expect(proxyClose).toBeLessThan(ownedCleanup);
    const proxiedEnvironmentUses = source
      .slice(start, proxyClose)
      .match(/env: proxiedEnvironment/gu);
    expect(proxiedEnvironmentUses).toHaveLength(3);
    expect(source.slice(proxy, start)).toContain(
      "SUPABASE_CLI_BINARY_OVERRIDE: sidecarPath",
    );
    expect(source.slice(audio, proxyClose)).toContain(
      "delete audioEnvironment.SUPABASE_CLI_BINARY_OVERRIDE",
    );
    expect(source).toContain(
      '.purgeLocalSupabaseProjectResources()\n      .catch(() => {\n        cleanupFailures.push("stack Supabase locale")',
    );
  });

  it("branche Playwright sur le Next loopback possédé sans webServer implicite", () => {
    const external = createPlaywrightConfig({
      THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN: "http://127.0.0.1:3102",
    });
    expect(external.use?.baseURL).toBe("http://127.0.0.1:3102");
    expect(external.webServer).toBeUndefined();

    const standalone = createPlaywrightConfig({});
    expect(standalone.use?.baseURL).toBe("http://127.0.0.1:3000");
    expect(standalone.webServer).toMatchObject({
      command: "pnpm exec next dev --hostname 127.0.0.1 --port 3000",
      reuseExistingServer: false,
      url: "http://127.0.0.1:3000",
    });
    expect(() =>
      createPlaywrightConfig({
        THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN: "http://192.168.1.2:3102",
      }),
    ).toThrow(/loopback canonique/u);
    expect(() =>
      createPlaywrightConfig({
        THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN: "http://127.0.0.1:3102/chemin",
      }),
    ).toThrow(/loopback canonique/u);
  });

  it("isole les temporaires Windows sans placer leur chemin dans PowerShell argv", () => {
    const privateRoot = path.join(
      os.tmpdir(),
      "thainaute-private-acl-contract",
    );
    const command = buildWindowsPrivateAclCommand(privateRoot, {
      platform: "win32",
    });
    expect(command.command).toBe("powershell.exe");
    expect(JSON.stringify(command.args)).not.toContain(privateRoot);
    expect(command.env).toEqual({
      THAINAUTE_QA_PRIVATE_TEMP_ROOT: privateRoot,
    });
    const script = command.args.at(-1);
    expect(script).toContain("SetAccessRuleProtection($true, $false)");
    expect(script).toContain("S-1-5-18");
    expect(script).toContain("$probeAcl = Get-Acl");
    expect(() =>
      buildWindowsPrivateAclCommand(path.resolve(ROOT, "temp"), {
        platform: "win32",
      }),
    ).toThrow(/temporaire Windows/u);
  });

  it("enferme TEMP/TMP et compose le java.io.tmpdir sans perdre native-access", () => {
    const privateRoot = path.join(os.tmpdir(), "thainaute-private-env");
    const environment = privateTempEnvironment(
      { JAVA_TOOL_OPTIONS: "--enable-native-access=ALL-UNNAMED" },
      privateRoot,
      { java: true },
    );
    expect(environment.TEMP).toBe(privateRoot);
    expect(environment.TMP).toBe(privateRoot);
    expect(environment.TMPDIR).toBe(privateRoot);
    expect(environment.JAVA_TOOL_OPTIONS).toBe(
      `--enable-native-access=ALL-UNNAMED -Djava.io.tmpdir="${privateRoot}"`,
    );
  });

  it("utilise typegen officiel sans écraser une mutation concurrente", async () => {
    expect(buildNextTypegenCommand().args.slice(-5)).toEqual([
      "--filter",
      "@thainaute/web",
      "exec",
      "next",
      "typegen",
    ]);
    const initial =
      '/// <reference types="next" />\nimport "./.next/types/routes.d.ts";\n';
    const development = initial.replace(
      ".next/types/routes.d.ts",
      ".next/dev/types/routes.d.ts",
    );
    expect(nextTypesContentIsOwned(initial, initial)).toBe(true);
    expect(nextTypesContentIsOwned(initial, development)).toBe(true);
    expect(
      nextTypesContentIsOwned(initial, `${development}// concurrent`),
    ).toBe(false);

    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const preflight = source.indexOf(
      "nextTypesSnapshot = await snapshotNextTypes(config);",
    );
    const nextStart = source.indexOf("webProcess = startManagedProcess(");
    const processCleanup = source.indexOf(
      "for (const child of managed.reverse())",
    );
    const typesCleanup = source.indexOf("await restoreNextTypes(");
    expect([preflight, nextStart, processCleanup, typesCleanup]).not.toContain(
      -1,
    );
    expect(preflight).toBeLessThan(nextStart);
    expect(processCleanup).toBeLessThan(typesCleanup);
    expect(source).toContain('cleanupFailures.push("types Next.js")');
    expect(source).toContain(
      "THAINAUTE_PLAYWRIGHT_EXTERNAL_ORIGIN: config.webOrigin",
    );
    const cleanupFailure = combineFailureWithCleanup(null, ["types Next.js"]);
    expect(formatCliFailure(cleanupFailure, true)).toBe(
      "Recette interrompue. Nettoyage local incomplet : types Next.js.",
    );
  });

  it("parse un hook en argv sans shell", () => {
    expect(parseCommandHook('["pnpm","dev:web"]', "hook")).toEqual({
      command: "pnpm",
      args: ["dev:web"],
    });
    expect(() => parseCommandHook('"pnpm dev:web"', "hook")).toThrow();
    expect(() => parseCommandHook('["pnpm","arg\\nsecret"]', "hook")).toThrow();
  });

  it("lance le CLI pnpm Windows directement avec Node", () => {
    const cliPath = path.resolve("fixture-tools/pnpm.mjs");
    expect(
      buildPnpmCommand(["--filter", "@thainaute/web", "dev"], {
        platform: "win32",
        pnpmCliPath: cliPath,
        nodeExecutable: "node.exe",
      }),
    ).toEqual({
      command: "node.exe",
      args: [cliPath, "--filter", "@thainaute/web", "dev"],
    });
    expect(buildPnpmCommand(["--version"], { platform: "linux" })).toEqual({
      command: "pnpm",
      args: ["--version"],
    });
    expect(() =>
      buildPnpmCommand(["--version"], {
        platform: "win32",
        pnpmCliPath: path.resolve("fixture-tools/pnpm.cmd"),
      }),
    ).toThrow(/pnpm Windows/u);
  });

  it("cible le debug build Expo et configure le host Metro privé de React Native", () => {
    const metroCommand = buildDefaultMetroCommand();
    expect(metroCommand.args.slice(-10)).toEqual([
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
    const preferenceWrite = buildMetroPreferencesWrite("emulator-5554");
    expect(preferenceWrite.command).toBe("adb");
    expect(preferenceWrite.args).toEqual([
      "-s",
      "emulator-5554",
      "shell",
      "run-as",
      "com.thainaute.app",
      "toybox",
      "dd",
      "of=shared_prefs/.com.thainaute.app_preferences.xml.qa.tmp",
    ]);
    expect(preferenceWrite.stdin).toContain(
      '<string name="debug_http_host">127.0.0.1:8081</string>',
    );
    expect(JSON.stringify(preferenceWrite)).not.toContain("setprop");
    expect(
      metroProcessEnvironment({ NODE_OPTIONS: "--inspect", SAFE_VALUE: "1" }),
    ).toEqual({
      NODE_OPTIONS: "--dns-result-order=ipv4first",
      SAFE_VALUE: "1",
      CI: "1",
    });
  });

  it("borne le bundle Metro et atteste son cache Android privé", () => {
    expect(
      metroBundleResponseIsValid({
        ok: true,
        contentType: "application/javascript; charset=UTF-8",
        filesChangedCount: "1681",
        byteLength: 9_085_517,
      }),
    ).toBe(true);
    expect(
      metroBundleResponseIsValid({
        ok: false,
        contentType: "application/javascript",
        filesChangedCount: "0",
        byteLength: 1,
      }),
    ).toBe(false);
    expect(
      metroBundleResponseIsValid({
        ok: true,
        contentType: "application/json",
        filesChangedCount: "0",
        byteLength: 1,
      }),
    ).toBe(false);
    expect(
      parseMobileDevBundleMetadata("9085643:1786292595:600\r\n", 1786292593),
    ).toEqual({
      byteLength: 9_085_643,
      modifiedAt: 1_786_292_595,
      mode: "600",
    });
    expect(
      parseMobileDevBundleMetadata("9085643:1786292592:600\n", 1786292593),
    ).toBeNull();
    expect(
      parseMobileDevBundleMetadata("9085643:1786292595:644\n", 1786292593),
    ).toBeNull();
  });

  it("ordonne reset, préférence, compilation, GET applicatif puis UI", async () => {
    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const reset = source.indexOf(
      'await runAdb(config, serial, ["shell", "pm", "clear", MOBILE_APP_ID]);',
    );
    const preference = source.indexOf(
      "await configureMetroPreferences(config, serial);",
      reset,
    );
    const compilation = source.indexOf(
      "await prewarmMetroAndroidBundle(config, metroProcess);",
      preference,
    );
    const emptyCache = source.indexOf(
      "await assertMobileDevBundleCacheAbsent(config, serial);",
      compilation,
    );
    const launch = source.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authReady);",
      emptyCache,
    );
    const downloadedCache = source.indexOf(
      "await assertMobileDevBundleCache(",
      launch,
    );
    expect([
      reset,
      preference,
      compilation,
      emptyCache,
      launch,
      downloadedCache,
    ]).not.toContain(-1);
    expect(reset).toBeLessThan(preference);
    expect(preference).toBeLessThan(compilation);
    expect(compilation).toBeLessThan(emptyCache);
    expect(emptyCache).toBeLessThan(launch);
    expect(launch).toBeLessThan(downloadedCache);
  });

  it("préserve un reverse Metro existant et ne réclame son cleanup qu'après succès", async () => {
    expect(parseMetroReverseState("UsbFfs tcp:8081 tcp:8081\r\n")).toBe(
      "exact",
    );
    expect(parseMetroReverseState("host tcp:8081 tcp:8081\n")).toBe("exact");
    expect(parseMetroReverseState("UsbFfs tcp:8081 tcp:9999\n")).toBe(
      "conflict",
    );
    expect(parseMetroReverseState("UsbFfs tcp:9000 tcp:9000\n")).toBe("absent");
    expect(() => parseMetroReverseState("tcp:8081\n")).toThrow(
      /reverse Metro/u,
    );
    expect(buildMetroReverseAddCommand("emulator-5554")).toEqual({
      command: "adb",
      args: [
        "-s",
        "emulator-5554",
        "reverse",
        "--no-rebind",
        "tcp:8081",
        "tcp:8081",
      ],
    });
    expect(metroReverseCleanupAction("exact")).toBe("remove");
    expect(metroReverseCleanupAction("absent")).toBe("none");
    expect(metroReverseCleanupAction("conflict")).toBe("refuse");
    expect(() => metroReverseCleanupAction("inconnu")).toThrow(
      /reverse Metro/u,
    );
    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const absentState = source.indexOf('if (metroReverseState === "absent")');
    const mutation = source.indexOf("await runProcess({", absentState);
    const ownership = source.indexOf("metroReverseAdded = true;", mutation);
    const nextPhase = source.indexOf(
      "if (await metroIsReady(config.metroOrigin))",
      ownership,
    );
    expect([absentState, ownership, mutation, nextPhase]).not.toContain(-1);
    expect(absentState).toBeLessThan(mutation);
    expect(mutation).toBeLessThan(ownership);
    expect(source.slice(absentState, ownership)).toContain("signal: undefined");
    const cleanup = source.indexOf(
      "async function cleanupOwnedMetroReverse(config, serial)",
    );
    const cleanupRead = source.indexOf(
      "await readMetroReverseState(config, serial)",
      cleanup,
    );
    const cleanupDecision = source.indexOf(
      "metroReverseCleanupAction(state)",
      cleanupRead,
    );
    const cleanupRemove = source.indexOf('"--remove", "tcp:8081"', cleanupRead);
    expect([
      cleanup,
      cleanupRead,
      cleanupDecision,
      cleanupRemove,
    ]).not.toContain(-1);
    expect(cleanupRead).toBeLessThan(cleanupDecision);
    expect(cleanupDecision).toBeLessThan(cleanupRemove);
    expect(source).toContain(
      "await cleanupOwnedMetroReverse(cleanupConfig, serial).catch",
    );
  });

  it("exige deux rondes réseau complètes et stables après une transition radio", async () => {
    const observations = [true, true, true, false, true, true, true, true];
    let clock = 0;
    const origins = ["http://10.0.2.2:54321", "http://10.0.2.2:54324"];
    const stable = await waitForStableReachability(
      origins,
      true,
      async () => observations.shift(),
      {
        timeoutMs: 1_000,
        intervalMs: 10,
        now: () => clock,
        wait: async (milliseconds) => {
          clock += milliseconds;
        },
      },
    );
    expect(stable).toBe(true);
    expect(observations).toHaveLength(0);

    const timedOut = await waitForStableReachability(
      [origins[0]],
      false,
      async () => true,
      {
        timeoutMs: 20,
        intervalMs: 10,
        now: () => clock,
        wait: async (milliseconds) => {
          clock += milliseconds;
        },
      },
    );
    expect(timedOut).toBe(false);
  });

  it("conserve l'erreur primaire et seulement les labels sûrs du cleanup", () => {
    const primary = new MobileConnectedE2EError("Erreur primaire attestée.");
    const combined = combineFailureWithCleanup(primary, [
      "reverse Metro",
      "détail externe interdit",
      "reverse Metro",
    ]);
    expect(combined).toBeInstanceOf(MobileConnectedE2EError);
    expect(combined.cause).toBe(primary);
    expect(combined.message).toContain("Erreur primaire attestée.");
    expect(combined.message).toContain("reverse Metro");
    expect(combined.message).not.toContain("détail externe interdit");
    expect(combineFailureWithCleanup(primary, [])).toBe(primary);
    expect(
      formatCliFailure(combined, true, ["Erreur primaire attestée."]),
    ).toBe("Recette interrompue. Nettoyage local incomplet : reverse Metro.");
    expect(
      formatCliFailure(new MobileConnectedE2EError("interruption"), true),
    ).toContain("nettoyage local terminé");
  });

  it.each(["artefacts Maestro", "handoff privé"])(
    "préserve l'erreur primaire sous interruption si le cleanup %s échoue",
    async (cleanupStep) => {
      const primary = new MobileConnectedE2EError(
        "Erreur primaire avec secret-interdit.",
      );
      let failure;
      try {
        await runWithSafeCleanup(
          async () => {
            throw primary;
          },
          async () => {
            throw new Error("sortie cleanup sensible");
          },
          cleanupStep,
        );
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(MobileConnectedE2EError);
      expect(failure.cause).toBe(primary);
      expect(failure.cleanupSteps).toEqual([cleanupStep]);
      const message = formatCliFailure(failure, true, ["secret-interdit"]);
      expect(message).toBe(
        `Recette interrompue. Nettoyage local incomplet : ${cleanupStep}.`,
      );
      expect(message).not.toContain("secret-interdit");
      expect(message).not.toContain("sortie cleanup sensible");
    },
  );

  it("fusionne les échecs de cleanup imbriqués sous interruption", () => {
    const primary = new MobileConnectedE2EError("primaire sensible");
    const maestroCleanup = combineFailureWithCleanup(primary, [
      "artefacts Maestro",
    ]);
    const outerCleanup = combineFailureWithCleanup(maestroCleanup, [
      "données Android privées",
      "artefacts Maestro",
    ]);
    expect(outerCleanup.cleanupSteps).toEqual([
      "artefacts Maestro",
      "données Android privées",
    ]);
    expect(formatCliFailure(outerCleanup, true)).toBe(
      "Recette interrompue. Nettoyage local incomplet : artefacts Maestro, données Android privées.",
    );
  });

  it("détecte un serveur possédé sorti et couvre les signaux portables", () => {
    expect(
      managedProcessIsAlive({
        child: { exitCode: null, signalCode: null },
        failed: false,
      }),
    ).toBe(true);
    expect(
      managedProcessIsAlive({
        child: { exitCode: 0, signalCode: null },
        failed: true,
      }),
    ).toBe(false);
    expect(terminationSignalsForPlatform("win32")).toEqual([
      "SIGINT",
      "SIGTERM",
      "SIGBREAK",
    ]);
    expect(terminationSignalsForPlatform("linux")).toEqual([
      "SIGINT",
      "SIGTERM",
      "SIGHUP",
    ]);
    expect(terminationSignalExitCode("SIGHUP")).toBe(129);
    expect(terminationSignalExitCode("SIGINT")).toBe(130);
    expect(terminationSignalExitCode("SIGBREAK")).toBe(131);
    expect(terminationSignalExitCode("SIGTERM")).toBe(143);
  });

  it("ferme le build Gradle sur la version Java 17 attendue", () => {
    expect(parseJavaMajorVersion('openjdk version "17.0.12" 2024-07-16')).toBe(
      17,
    );
    expect(parseJavaMajorVersion('java version "25.0.1"')).toBe(25);
    expect(parseJavaMajorVersion("sortie inconnue")).toBeNull();
  });

  it("borne l'APK debug à l'ABI de l'émulateur supportée", () => {
    expect(requireSupportedEmulatorAbi(" x86_64\r\n")).toBe("x86_64");
    expect(requireSupportedEmulatorAbi("arm64-v8a")).toBe("arm64-v8a");
    expect(() => requireSupportedEmulatorAbi("armeabi-v7a")).toThrow(/ABI/u);
    expect(buildDefaultApkCommand("x86_64", "linux")).toEqual({
      command: "./gradlew",
      args: [
        "--no-daemon",
        ":app:assembleDebug",
        "-PreactNativeArchitectures=x86_64",
      ],
    });
    expect(buildDefaultApkCommand("arm64-v8a", "win32")).toEqual({
      command: "cmd.exe",
      args: [
        "/d",
        "/s",
        "/c",
        "gradlew.bat",
        "--no-daemon",
        ":app:assembleDebug",
        "-PreactNativeArchitectures=arm64-v8a",
      ],
    });
  });

  it("résout un SDK Android local existant sans valeur implicite distante", async () => {
    const sdkDirectory = await mkdtemp(
      path.join(os.tmpdir(), "thainaute-android-sdk-test-"),
    );
    try {
      await expect(
        resolveAndroidSdkDirectory({ ANDROID_HOME: sdkDirectory }),
      ).resolves.toBe(path.resolve(sdkDirectory));
      await expect(
        resolveAndroidSdkDirectory(
          { ANDROID_HOME: path.join(sdkDirectory, "absent") },
          { platform: "linux", homeDirectory: path.join(sdkDirectory, "home") },
        ),
      ).rejects.toThrow(/SDK Android local/u);
    } finally {
      await rm(sdkDirectory, { recursive: true, force: true });
    }
  });

  it("neutralise toute configuration de facturation dans le serveur QA", () => {
    const environment = webEnvironment(
      {
        apiOrigin: "http://127.0.0.1:54321",
        publishableKey: "sb_publishable_fixture",
        secretKey: "sb_secret_fixture",
      },
      "http://127.0.0.1:3000",
    );
    expect(environment.THAINAUTE_BILLING_MODE).toBe("disabled");
    expect(environment.STRIPE_LIVE_CONFIRMATION).toBe("");
    expect(environment.STRIPE_RESTRICTED_KEY).toBe("");
    expect(environment.REVENUECAT_WEBHOOK_AUTHORIZATION).toBe("");
  });

  it("cible exclusivement un émulateur explicite avec ADB", () => {
    expect(
      buildAdbCommand("emulator-5554", ["shell", "am", "force-stop", "app"]),
    ).toEqual({
      command: "adb",
      args: ["-s", "emulator-5554", "shell", "am", "force-stop", "app"],
    });
    expect(() => buildAdbCommand("physical-device", ["shell", "id"])).toThrow();
  });

  it("classe le foreground Android sans exposer la sortie dumpsys", () => {
    const command = buildAdbForegroundActivityProbe("emulator-5554");
    expect(command).toEqual({
      command: "adb",
      args: ["-s", "emulator-5554", "shell", "-T"],
      stdin:
        "set -eu\n" +
        "dumpsys window | toybox sed -n -e '/^[[:space:]]*mCurrentFocus=/p' -e '/^[[:space:]]*mFocusedApp=/p'\n" +
        "exit\n",
    });
    expect(command.stdin).not.toMatch(
      /grep|head|KEYCODE_|force-stop|pm clear/iu,
    );

    expect(
      classifyForegroundAndroidActivity(
        "mCurrentFocus=Window{abc123 u0 com.thainaute.app/.MainActivity}\n" +
          "mFocusedApp=ActivityRecord{def456 u0 com.thainaute.app/com.thainaute.app.MainActivity t18}\n",
      ),
    ).toBe("thainaute");
    expect(
      classifyForegroundAndroidActivity(
        "mFocusedApp=ActivityRecord{def456 u0 com.google.android.settings.intelligence/.modules.search.SearchActivity t19}\n" +
          "mCurrentFocus=Window{abc123 u0 com.google.android.settings.intelligence/.modules.search.SearchActivity}\n",
      ),
    ).toBe("settings_search");
    expect(
      classifyForegroundAndroidActivity(
        "mCurrentFocus=Window{abc123 u0 com.android.launcher3/.uioverrides.QuickstepLauncher}\n" +
          "mFocusedApp=ActivityRecord{def456 u0 com.android.launcher3/.uioverrides.QuickstepLauncher t7}\n",
      ),
    ).toBe("other");
    expect(() =>
      classifyForegroundAndroidActivity(
        "mCurrentFocus=Window{abc123 u0 com.thainaute.app/.MainActivity}\n" +
          "mFocusedApp=ActivityRecord{def456 u0 com.android.launcher3/.uioverrides.QuickstepLauncher t7}\n",
      ),
    ).toThrow(/incohérente/u);
    expect(() =>
      classifyForegroundAndroidActivity(
        "mCurrentFocus=Window{abc123 u0 com.thainaute.app/.MainActivity}\n" +
          "mFocusedApp=ActivityRecord{def456 u0 com.thainaute.app/.MainActivity t18}\n" +
          "mCurrentFocus=Window{aaa111 u10 com.android.launcher3/.uioverrides.QuickstepLauncher}\n" +
          "mFocusedApp=ActivityRecord{bbb222 u10 com.android.launcher3/.uioverrides.QuickstepLauncher t7}\n",
      ),
    ).toThrow(/invalide/u);
    expect(() =>
      classifyForegroundAndroidActivity(
        "mCurrentFocus=Window{abc123 u0 com.thainaute.app/.MainActivity}\n",
      ),
    ).toThrow(/invalide/u);
    expect(() => classifyForegroundAndroidActivity("x".repeat(4_097))).toThrow(
      /invalide/u,
    );
    expect(
      classifyForegroundAndroidActivitySafely("sortie Android invalide"),
    ).toBe("unavailable");
    expect(
      classifyForegroundAndroidActivitySafely(
        "mCurrentFocus=Window{abc123 u0 com.thainaute.app/.MainActivity}\n" +
          "mFocusedApp=ActivityRecord{def456 u0 com.thainaute.app/.MainActivity t18}\n",
        "diagnostic supprimé",
      ),
    ).toBe("unavailable");
  });

  it("atteste Thaïnaute après lancement et chaque focus avant tout secret", async () => {
    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const launch = source.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authReady);",
    );
    const launchForeground = source.indexOf(
      "await assertThainauteForegroundAfterLaunch(config, serial);",
      launch,
    );
    const bundle = source.indexOf(
      "await assertMobileDevBundleCache(config, serial, devBundleLaunchEpoch);",
      launchForeground,
    );
    const emailFocus = source.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authEntry);",
      bundle,
    );
    const emailForeground = source.indexOf(
      "await assertThainauteForegroundAfterLaunch(config, serial);",
      emailFocus,
    );
    const emailCreation = source.indexOf(
      "const email = `mobile-connected-${randomUUID()}@thainaute.invalid`;",
      emailForeground,
    );
    const emailSubmit = source.indexOf(
      'await submitAndClearSensitiveAndroidInput(config, serial, "email", email);',
      emailCreation,
    );
    const otpFocus = source.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authCodeReady);",
      emailSubmit,
    );
    const otpForeground = source.indexOf(
      "await assertThainauteForegroundAfterLaunch(config, serial);",
      otpFocus,
    );
    const otpRead = source.indexOf(
      "const otp = await readLocalOtp(config.mailpitOrigin, email, config.signal);",
      otpForeground,
    );
    const otpSubmit = source.indexOf(
      'await submitAndClearSensitiveAndroidInput(config, serial, "otp", otp);',
      otpRead,
    );
    expect([
      launch,
      launchForeground,
      bundle,
      emailFocus,
      emailForeground,
      emailCreation,
      emailSubmit,
      otpFocus,
      otpForeground,
      otpRead,
      otpSubmit,
    ]).not.toContain(-1);
    expect(launch).toBeLessThan(launchForeground);
    expect(launchForeground).toBeLessThan(bundle);
    expect(bundle).toBeLessThan(emailFocus);
    expect(emailFocus).toBeLessThan(emailForeground);
    expect(emailForeground).toBeLessThan(emailCreation);
    expect(emailCreation).toBeLessThan(emailSubmit);
    expect(emailSubmit).toBeLessThan(otpFocus);
    expect(otpFocus).toBeLessThan(otpForeground);
    expect(otpForeground).toBeLessThan(otpRead);
    expect(otpRead).toBeLessThan(otpSubmit);
    const inputHelper = source.indexOf(
      "async function submitAndClearSensitiveAndroidInput(",
    );
    const lastHostForeground = source.indexOf(
      "await assertThainauteForegroundAfterLaunch(config, serial);",
      inputHelper,
    );
    const sensitiveCommand = source.indexOf(
      "const command = buildAdbSensitiveInputCommand(serial, input, value);",
      inputHelper,
    );
    expect([inputHelper, lastHostForeground, sensitiveCommand]).not.toContain(
      -1,
    );
    expect(inputHelper).toBeLessThan(lastHostForeground);
    expect(lastHostForeground).toBeLessThan(sensitiveCommand);
    expect(source).not.toMatch(/KEYCODE_(?:MOVE_END|DEL|BACK)/u);
    expect(source).not.toMatch(
      /(?:force-stop|pm clear)[^\r\n]*com\.google\.android\.settings\.intelligence/iu,
    );
  });

  it("saisit puis efface l'authentification uniquement par stdin ADB sans PTY", () => {
    const email =
      "mobile-connected-00000000-0000-4000-8000-000000000001@thainaute.invalid";
    const otp = "482913";
    const expectedKeyCode = (character) => {
      if (/^[a-z]$/u.test(character))
        return `KEYCODE_${character.toUpperCase()}`;
      if (/^\d$/u.test(character)) return `KEYCODE_${character}`;
      if (character === "-") return "KEYCODE_MINUS";
      if (character === ".") return "KEYCODE_PERIOD";
      if (character === "@") return "KEYCODE_AT";
      throw new Error("Caractère de fixture inattendu.");
    };
    const foregroundGuard = [
      "foreground=\"$(dumpsys window 2>/dev/null | toybox sed -n -e '/^[[:space:]]*mCurrentFocus=/p' -e '/^[[:space:]]*mFocusedApp=/p')\"",
      "line_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*m(CurrentFocus|FocusedApp)=' || true)\"",
      "current_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*mCurrentFocus=Window\\{[^[:space:]{}]+[[:space:]]+u[0-9]+[[:space:]]+com\\.thainaute\\.app/\\.?[A-Za-z][A-Za-z0-9_.$]*\\}$' || true)\"",
      "focused_count=\"$(printf '%s\\n' \"$foreground\" | toybox grep -E -c '^[[:space:]]*mFocusedApp=ActivityRecord\\{[^[:space:]{}]+[[:space:]]+u[0-9]+[[:space:]]+com\\.thainaute\\.app/\\.?[A-Za-z][A-Za-z0-9_.$]*([[:space:]]+[^{}]*)?\\}$' || true)\"",
      "[ \"$line_count\" = '2' ]",
      "[ \"$current_count\" = '1' ]",
      "[ \"$focused_count\" = '1' ]",
      "unset foreground line_count current_count focused_count",
    ];
    const expectedScript = (value) =>
      [
        "set -eu",
        ...foregroundGuard,
        ...Array.from(
          value,
          (character) => `input keyevent ${expectedKeyCode(character)}`,
        ),
        "input keyevent KEYCODE_ENTER",
        "sleep 1",
        "exit",
        "",
      ].join("\n");
    const emailCommand = buildAdbSensitiveInputCommand(
      "emulator-5554",
      "email",
      email,
    );
    const otpCommand = buildAdbSensitiveInputCommand(
      "emulator-5554",
      "otp",
      otp,
    );

    for (const command of [emailCommand, otpCommand]) {
      expect(command.args).toEqual(["-s", "emulator-5554", "shell", "-T"]);
      expect(command).not.toHaveProperty("env");
      expect(command.stdin).not.toMatch(/KEYCODE_(?:MOVE_END|DEL|BACK)/u);
      expect(command.stdin).toContain("dumpsys window 2>/dev/null");
    }
    expect(emailCommand.stdin).toBe(expectedScript(email));
    expect(otpCommand.stdin).toBe(expectedScript(otp));
    expect(JSON.stringify(emailCommand.args)).not.toContain(email);
    expect(JSON.stringify(otpCommand.args)).not.toContain(otp);
    expect(emailCommand.stdin).not.toContain(email);
    expect(otpCommand.stdin).not.toContain(otp);
    expect(() =>
      buildAdbSensitiveInputCommand(
        "emulator-5554",
        "email",
        "compte@exemple.invalid",
      ),
    ).toThrow(/Saisie Android sensible invalide/u);
    expect(() =>
      buildAdbSensitiveInputCommand("emulator-5554", "otp", "48291\n"),
    ).toThrow(/Saisie Android sensible invalide/u);
  });

  it("atteste la transaction finale SecureStore sans lire la session", () => {
    const preferenceName = secureStoreManifestPreferenceNameFromOrigin(
      "http://10.0.2.2:54321",
    );
    expect(preferenceName).toBe("key_v1-sb-10-auth-token");
    expect(
      buildAdbSecureStoreManifestProbe("emulator-5554", preferenceName),
    ).toEqual({
      command: "adb",
      args: ["-s", "emulator-5554", "shell", "-T"],
      stdin:
        "set -eu\n" +
        `if ! run-as com.thainaute.app toybox grep -F -q 'name="${preferenceName}"' shared_prefs/SecureStore.xml; then\n` +
        "  exit 1\n" +
        "fi\n" +
        `if run-as com.thainaute.app toybox grep -F -q 'name="${preferenceName}.thainaute_staging_v2"' shared_prefs/SecureStore.xml; then\n` +
        "  exit 1\n" +
        "fi\n" +
        "exit 0\n",
    });
    expect(() =>
      buildAdbSecureStoreManifestProbe("emulator-5554", "token-secret"),
    ).toThrow(/manifeste SecureStore/u);
  });

  it("retire toute valeur sensible de l'environnement et des arguments Maestro", () => {
    const email =
      "mobile-connected-00000000-0000-4000-8000-000000000001@thainaute.invalid";
    const otp = "482913";
    const maestroEnvironment = maestroEnvironmentWithoutSecrets(
      {
        PATH: "outils-locaux",
        MAESTRO_THAINAUTE_QA_EMAIL: email,
        THAINAUTE_QA_OTP: otp,
        SUPABASE_SECRET_KEY: "secret-local",
        WRAPPED_VALUE: `avant-${email}-après`,
      },
      [email, otp],
    );
    const privateOutput = path.join(os.tmpdir(), "maestro-private");
    const commands = [
      "connected-auth-entry.yaml",
      "connected-auth-code-ready.yaml",
      "connected-auth-verify.yaml",
      "connected-auth-cold-launch.yaml",
      "connected-auth-cold-onboarding.yaml",
      "connected-auth-cold-account.yaml",
      "connected-auth-cold-signed-in.yaml",
    ].map((flowName) =>
      buildMaestroCommand(
        `apps/mobile/maestro/${flowName}`,
        privateOutput,
        "emulator-5554",
      ),
    );
    const serializedCommands = JSON.stringify(commands);
    const serializedEnvironment = JSON.stringify(maestroEnvironment);
    for (const forbidden of [email, otp, "secret-local"]) {
      expect(serializedCommands).not.toContain(forbidden);
      expect(serializedEnvironment).not.toContain(forbidden);
    }
    expect(maestroEnvironment).toEqual({ PATH: "outils-locaux" });
    expect(commands.every((command) => !command.args.includes("-e"))).toBe(
      true,
    );
    expect(commands[0]).toEqual({
      command: process.platform === "win32" ? "cmd.exe" : "maestro",
      args: [
        ...(process.platform === "win32"
          ? ["/d", "/s", "/c", "maestro.bat"]
          : []),
        "test",
        "--test-output-dir",
        privateOutput,
        "--debug-output",
        path.join(privateOutput, "debug"),
        "--flatten-debug-output",
        "--device",
        "emulator-5554",
        "apps/mobile/maestro/connected-auth-entry.yaml",
      ],
    });
    expect(() =>
      buildMaestroCommand(
        "apps/mobile/maestro/connected-auth-entry.yaml",
        path.resolve(ROOT, "durable-artifacts"),
        "emulator-5554",
      ),
    ).toThrow(/Maestro/u);
  });

  it("focalise, soumet et efface avant chaque flow Maestro de vérification", async () => {
    const readyFlow = await readFile(
      path.resolve("apps/mobile/maestro/connected-auth-ready.yaml"),
      "utf8",
    );
    const entryFlow = await readFile(
      path.resolve("apps/mobile/maestro/connected-auth-entry.yaml"),
      "utf8",
    );
    const codeReadyFlow = await readFile(
      path.resolve("apps/mobile/maestro/connected-auth-code-ready.yaml"),
      "utf8",
    );
    const verifyFlow = await readFile(
      path.resolve("apps/mobile/maestro/connected-auth-verify.yaml"),
      "utf8",
    );
    const coldFlows = await Promise.all(
      ["launch", "onboarding", "account", "signed-in"].map((step) =>
        readFile(
          path.resolve(`apps/mobile/maestro/connected-auth-cold-${step}.yaml`),
          "utf8",
        ),
      ),
    );
    const accountScreen = await readFile(
      path.resolve("apps/mobile/app/account.tsx"),
      "utf8",
    );
    const runner = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );

    expect(readyFlow).toContain(
      'visible: "Un départ simple, pensé pour vous."\n    timeout: 60000',
    );
    expect(entryFlow).toContain(
      '- tapOn:\n    id: "account-email-input"\n- assertVisible:\n    id: "account-email-input"\n    focused: true',
    );
    expect(readyFlow).toContain(
      'visible: "Retrouver sa progression partout."\n    timeout: 30000',
    );
    const codeTitleReady = codeReadyFlow.indexOf(
      'visible: "Code reçu par email"',
    );
    const submitActionReady = codeReadyFlow.indexOf(
      'visible: "Me connecter"\n    timeout: 30000',
      codeTitleReady,
    );
    const otpFocused = codeReadyFlow.indexOf(
      '- tapOn:\n    id: "account-otp-input"\n- assertVisible:\n    id: "account-otp-input"\n    focused: true',
      submitActionReady,
    );
    expect([codeTitleReady, submitActionReady, otpFocused]).not.toContain(-1);
    expect(codeTitleReady).toBeLessThan(submitActionReady);
    expect(submitActionReady).toBeLessThan(otpFocused);
    const otpReady = codeReadyFlow.indexOf('visible: "Me connecter"');
    const otpTap = codeReadyFlow.indexOf(
      '- tapOn:\n    id: "account-otp-input"',
    );
    expect(otpReady).toBeGreaterThan(-1);
    expect(otpTap).toBeGreaterThan(otpReady);
    const signedInWait = verifyFlow.indexOf("- extendedWaitUntil:");
    expect(signedInWait).toBeGreaterThan(-1);
    expect(verifyFlow).not.toContain("openLink");
    expect(verifyFlow).not.toContain("- hideKeyboard");
    expect(verifyFlow).toContain(
      'visible: "État du compte : connecté"\n    timeout: 30000',
    );
    expect(verifyFlow).toContain(
      '- assertVisible: "État du compte : connecté"',
    );
    expect(verifyFlow).not.toContain('id: "account-auth-signed-in"');
    expect(verifyFlow).not.toContain("account-otp-input");
    for (const flow of [
      readyFlow,
      entryFlow,
      codeReadyFlow,
      verifyFlow,
      ...coldFlows,
    ]) {
      expect(flow).not.toMatch(
        /inputText|clipboard|copyTextFrom|pasteText|\$\{|THAINAUTE_QA_EMAIL|THAINAUTE_QA_OTP/iu,
      );
    }
    await expect(
      readFile(
        path.resolve("apps/mobile/maestro/connected-auth-request.yaml"),
        "utf8",
      ),
    ).rejects.toThrow();

    const emailFocus = runner.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authEntry);",
    );
    const emailSubmit = runner.indexOf(
      "await submitAndClearSensitiveAndroidInput(",
      emailFocus,
    );
    const emailCreation = runner.indexOf(
      "const email = `mobile-connected-${randomUUID()}@thainaute.invalid`;",
      emailFocus,
    );
    const otpRead = runner.indexOf(
      "const otp = await readLocalOtp(config.mailpitOrigin, email, config.signal);",
      emailSubmit,
    );
    const otpFocus = runner.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authCodeReady);",
      emailSubmit,
    );
    const otpSubmit = runner.indexOf(
      "await submitAndClearSensitiveAndroidInput(",
      otpFocus,
    );
    const authSessionProof = runner.indexOf(
      "await waitForLocalAuthSession(status, email, config.signal);",
      otpSubmit,
    );
    const secureStoreProof = runner.indexOf(
      "await waitForMobileSecureStoreManifest(",
      authSessionProof,
    );
    const safeVerification = runner.indexOf(
      "await runMaestro(config, serial, FLOW_NAMES.authVerify);",
      otpSubmit,
    );
    const livePrimary = runner.indexOf("const livePrimary =", safeVerification);
    const liveAbortGuard = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(",
      livePrimary,
    );
    const liveStateDiagnostic = runner.indexOf(
      "const liveState = await readPostSecretDeviceState(config, serial);",
      liveAbortGuard,
    );
    const postDumpAbortGuard = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(",
      liveStateDiagnostic,
    );
    const liveSignedInSkip = runner.indexOf(
      'if (liveState === "signed_in") {',
      liveStateDiagnostic,
    );
    const coldLaunch = runner.indexOf(
      "flowName: FLOW_NAMES.authColdLaunch,",
      liveSignedInSkip,
    );
    const coldOnboarding = runner.indexOf(
      "flowName: FLOW_NAMES.authColdOnboarding,",
      coldLaunch,
    );
    const coldAccount = runner.indexOf(
      "flowName: FLOW_NAMES.authColdAccount,",
      coldOnboarding,
    );
    const coldSignedIn = runner.indexOf(
      "flowName: FLOW_NAMES.authColdSignedIn,",
      coldAccount,
    );
    const coldRestoreOkFailure = runner.indexOf(
      'liveState,\n          "restore_ok",',
      coldSignedIn,
    );
    const fixturePreparation = runner.indexOf(
      'safeProgress(\n      "[mobile-connected] Préparation de la fixture',
      safeVerification,
    );
    const verificationForeground = runner.indexOf(
      "await assertThainauteForegroundAfterLaunch(config, serial);",
      secureStoreProof,
    );
    expect([
      emailFocus,
      emailCreation,
      emailSubmit,
      otpRead,
      otpFocus,
      otpSubmit,
      authSessionProof,
      secureStoreProof,
      verificationForeground,
      safeVerification,
      livePrimary,
      liveAbortGuard,
      liveStateDiagnostic,
      postDumpAbortGuard,
      liveSignedInSkip,
      coldLaunch,
      coldOnboarding,
      coldAccount,
      coldSignedIn,
      coldRestoreOkFailure,
      fixturePreparation,
    ]).not.toContain(-1);
    expect(emailFocus).toBeLessThan(emailSubmit);
    expect(emailFocus).toBeLessThan(emailCreation);
    expect(emailCreation).toBeLessThan(emailSubmit);
    expect(emailSubmit).toBeLessThan(otpFocus);
    expect(otpFocus).toBeLessThan(otpRead);
    expect(otpRead).toBeLessThan(otpSubmit);
    expect(otpFocus).toBeLessThan(otpSubmit);
    expect(otpSubmit).toBeLessThan(authSessionProof);
    expect(authSessionProof).toBeLessThan(secureStoreProof);
    expect(secureStoreProof).toBeLessThan(verificationForeground);
    expect(verificationForeground).toBeLessThan(safeVerification);
    expect(safeVerification).toBeLessThan(livePrimary);
    expect(livePrimary).toBeLessThan(liveAbortGuard);
    expect(liveAbortGuard).toBeLessThan(liveStateDiagnostic);
    expect(liveStateDiagnostic).toBeLessThan(postDumpAbortGuard);
    expect(postDumpAbortGuard).toBeLessThan(liveSignedInSkip);
    expect(liveSignedInSkip).toBeLessThan(coldLaunch);
    expect(coldLaunch).toBeLessThan(coldOnboarding);
    expect(coldOnboarding).toBeLessThan(coldAccount);
    expect(coldAccount).toBeLessThan(coldSignedIn);
    expect(coldSignedIn).toBeLessThan(coldRestoreOkFailure);
    expect(coldRestoreOkFailure).toBeLessThan(fixturePreparation);
    expect(secureStoreProof).toBeLessThan(safeVerification);
    expect(authSessionProof).toBeLessThan(safeVerification);
    expect(otpSubmit).toBeLessThan(safeVerification);
    const helper = runner.indexOf(
      "async function submitAndClearSensitiveAndroidInput(",
    );
    const ignoredOutput = runner.indexOf("capture: false", helper);
    expect([helper, ignoredOutput]).not.toContain(-1);
    expect(helper).toBeLessThan(ignoredOutput);
    expect(runner).not.toContain("waitForSensitiveAndroidField");
    expect(runner).not.toContain("assertSensitiveAndroidFieldCleared");
    expect(runner).not.toContain("dumpsys input_method");
    expect(runner).toContain(
      "...maestroEnvironmentWithoutSecrets(process.env, runtimeSecrets)",
    );
    expect(runner).not.toContain("buildMaestroAuthEnvironment");
    expect(runner).not.toContain("extraEnvironment");

    expect(accountScreen).toContain('testID="account-email-input"');
    expect(accountScreen).toContain('testID="account-otp-input"');
    expect(
      accountScreen.match(/submitBehavior="blurAndSubmit"/gu),
    ).toHaveLength(2);
    expect(accountScreen).not.toContain('submitBehavior="submit"');
    expect(accountScreen).toContain('returnKeyType="send"');
    expect(accountScreen).toContain('returnKeyType="done"');
    expect(accountScreen).toContain("void requestCode(nativeEvent.text);");
    expect(accountScreen).toContain("void verifyCode(nativeEvent.text);");
    expect(accountScreen).toContain("if (busy) return;");
    expect(accountScreen).toContain(
      'label={busy ? "Vérification…" : "Me connecter"}',
    );
    expect(accountScreen).toContain(
      "await auth.verifyEmailCode(submittedChallengeEmail, normalizedCode);",
    );
    expect(accountScreen).toContain('setChallengeEmail("");');
    const captureChallenge = accountScreen.indexOf(
      "setChallengeEmail(normalizedEmail);",
    );
    const requestChallenge = accountScreen.indexOf(
      "await auth.requestEmailCode(normalizedEmail);",
      captureChallenge,
    );
    const clearEmail = accountScreen.indexOf('setEmail("");', captureChallenge);
    const requestCatch = accountScreen.indexOf(
      "} catch (error) {",
      requestChallenge,
    );
    const requestFinally = accountScreen.indexOf("} finally {", requestCatch);
    const otpScreenEnabled = accountScreen.indexOf(
      "setCodeRequested(true);",
      requestChallenge,
    );
    const requestFinished = accountScreen.indexOf(
      "setBusy(false);",
      requestFinally,
    );
    const verifyFunction = accountScreen.indexOf(
      "async function verifyCode(submittedCode: string)",
    );
    const clearOtp = accountScreen.indexOf('setCode("");', verifyFunction);
    const verifyRequest = accountScreen.indexOf(
      "await auth.verifyEmailCode(submittedChallengeEmail, normalizedCode);",
      clearOtp,
    );
    const verifyCatch = accountScreen.indexOf(
      "} catch (error) {",
      verifyRequest,
    );
    const verifyFinally = accountScreen.indexOf("} finally {", verifyCatch);
    const keyboardEmailSubmit = accountScreen.indexOf(
      "void requestCode(nativeEvent.text);",
    );
    const keyboardOtpSubmit = accountScreen.indexOf(
      "void verifyCode(nativeEvent.text);",
    );
    const emailKeyboardHandler = accountScreen.slice(
      keyboardEmailSubmit,
      accountScreen.indexOf('returnKeyType="send"', keyboardEmailSubmit),
    );
    const otpKeyboardHandler = accountScreen.slice(
      keyboardOtpSubmit,
      accountScreen.indexOf('returnKeyType="done"', keyboardOtpSubmit),
    );
    expect([
      captureChallenge,
      clearEmail,
      requestChallenge,
      requestCatch,
      requestFinally,
      otpScreenEnabled,
      requestFinished,
      verifyFunction,
      clearOtp,
      verifyRequest,
      verifyCatch,
      verifyFinally,
      keyboardEmailSubmit,
      keyboardOtpSubmit,
    ]).not.toContain(-1);
    expect(captureChallenge).toBeLessThan(requestChallenge);
    expect(clearEmail).toBeLessThan(requestChallenge);
    expect(otpScreenEnabled).toBeLessThan(requestFinished);
    expect(accountScreen.slice(requestCatch, requestFinally)).not.toContain(
      "setEmail(normalizedEmail)",
    );
    expect(clearOtp).toBeLessThan(verifyRequest);
    expect(accountScreen.slice(verifyCatch, verifyFinally)).not.toContain(
      "setCode(normalizedCode)",
    );
    expect(emailKeyboardHandler).not.toContain('setEmail("");');
    expect(otpKeyboardHandler).not.toContain('setCode("");');
  });

  it("classe un échec pré-authentification sans restituer la hiérarchie", () => {
    expect(
      classifyPreAuthHierarchy(
        '<node text="Un départ simple, pensé pour vous." />',
      ),
    ).toBe("onboarding");
    expect(
      classifyPreAuthHierarchy(
        '<node content-desc="Retrouver sa progression partout." />',
      ),
    ).toBe("account");
    expect(
      classifyPreAuthHierarchy('<node text="Unable to load script" />'),
    ).toBe("metro_unavailable");
    expect(
      classifyPreAuthHierarchy('<node text="Development servers" />'),
    ).toBe("development_launcher");
    expect(
      classifyPreAuthHierarchy('<node package="com.thainaute.app" text="" />'),
    ).toBe("app_without_expected_text");
    expect(
      classifyPreAuthHierarchy('<node package="com.android.launcher3" />'),
    ).toBe("android_launcher");
    expect(classifyPreAuthHierarchy('<node text="État privé" />')).toBe(
      "unrecognized",
    );
    expect(classifyPreAuthHierarchy(null)).toBe("unavailable");
  });

  it("classe l'état post-OTP sans restituer la hiérarchie", () => {
    const hierarchy = (content) =>
      `<hierarchy><node package="com.thainaute.app" ${content} /></hierarchy>`;

    expect(
      classifyPostOtpHierarchy(
        '<hierarchy><node package="host.exp.exponent" text="Development servers" /></hierarchy>',
      ),
    ).toBe("development_launcher");
    expect(
      classifyPostOtpHierarchy(
        '<hierarchy><node text="Unable to load script" /></hierarchy>',
      ),
    ).toBe("metro_unavailable");
    expect(
      classifyPostOtpHierarchy(
        '<hierarchy><node text="Copy error Dismiss error Reload application" /></hierarchy>',
      ),
    ).toBe("dev_runtime_error");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" resource-id="router_error_message" />' +
          '<node package="com.thainaute.app" resource-id="router_error_retry" />' +
          "</hierarchy>",
      ),
    ).toBe("dev_runtime_error");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" text="surface" />' +
          '<node package="com.android.settings" resource-id="router_error_message" />' +
          '<node package="com.android.settings" resource-id="router_error_retry" />' +
          "</hierarchy>",
      ),
    ).toBe("semantic_unknown");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" resource-id="account-auth-signed-in" text="COMPTE CONNECTÉ" />' +
          '<node package="com.thainaute.app" text="Préparation des ressources locales…" />' +
          "</hierarchy>",
      ),
    ).toBe("root_resources_loading");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'resource-id="account-auth-signed-in" text="Ressources locales incomplètes"',
        ),
      ),
    ).toBe("root_resources_error");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'resource-id="account-auth-signed-in" text="Stockage local indisponible. Mettez l’application à jour."',
        ),
      ),
    ).toBe("root_storage_error");
    expect(
      classifyPostOtpHierarchy(hierarchy('text="Préparation d’Aujourd’hui…"')),
    ).toBe("today_loading");
    expect(
      classifyPostOtpHierarchy(hierarchy('text="Ouverture de l’onboarding…"')),
    ).toBe("onboarding_redirect");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="Préparation de votre parcours…"'),
      ),
    ).toBe("onboarding_loading");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'text="Stockage local indisponible. Réessayez avant de commencer."',
        ),
      ),
    ).toBe("onboarding_storage_error");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('content-desc="État du compte : connecté"'),
      ),
    ).toBe("signed_in");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('content-desc="État du compte : déconnecté"'),
      ),
    ).toBe("provider_stale");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('content-desc="État du compte : session en vérification"'),
      ),
    ).toBe("provider_loading");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('content-desc="État du compte : non configuré"'),
      ),
    ).toBe("unconfigured");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" content-desc="État du compte : connecté" />' +
          '<node package="com.thainaute.app" text="Préparation des ressources locales…" />' +
          "</hierarchy>",
      ),
    ).toBe("root_resources_loading");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" text="surface" />' +
          '<node package="com.android.settings" content-desc="État du compte : connecté" />' +
          "</hierarchy>",
      ),
    ).toBe("semantic_unknown");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('content-desc="État du compte : connectée"'),
      ),
    ).toBe("semantic_unknown");
    const signedOutWithOtpState = (otpState) =>
      "<hierarchy>" +
      '<node package="com.thainaute.app" resource-id="account-auth-signed-out" content-desc="État du compte : déconnecté" />' +
      `<node package="com.thainaute.app" ${otpState} />` +
      "</hierarchy>";
    expect(
      classifyPostOtpHierarchy(
        signedOutWithOtpState(
          'resource-id="account-otp-verifying-card" text="Vérification…"',
        ),
      ),
    ).toBe("verify_in_flight");
    expect(
      classifyPostOtpHierarchy(
        signedOutWithOtpState(
          'resource-id="account-otp-input" text="Le code est invalide ou a expiré."',
        ),
      ),
    ).toBe("verify_rejected");
    expect(
      classifyPostOtpHierarchy(
        signedOutWithOtpState(
          'resource-id="account-otp-input" text="Me connecter"',
        ),
      ),
    ).toBe("otp_idle");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="COMPTE CONNECTÉ Votre progression, sous contrôle."'),
      ),
    ).toBe("signed_in");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'resource-id="account-email-input" text="Compte connecté sur cet appareil."',
        ),
      ),
    ).toBe("provider_stale");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="account-otp-input" text="Vérification…"'),
      ),
    ).toBe("verify_in_flight");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'resource-id="account-otp-input" text="Le code est invalide ou a expiré."',
        ),
      ),
    ).toBe("verify_rejected");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="account-otp-input" text="Me connecter"'),
      ),
    ).toBe("otp_idle");
    expect(
      classifyPostOtpHierarchy(
        hierarchy(
          'resource-id="account-auth-unconfigured" text="Compte non configuré ici"',
        ),
      ),
    ).toBe("unconfigured");
    expect(
      classifyPostOtpHierarchy(
        '<hierarchy><node package="com.android.launcher3" /></hierarchy>',
      ),
    ).toBe("wrong_package");
    expect(
      classifyPostOtpHierarchy(
        '<node package="com.thainaute.app" text="état privé" />',
      ),
    ).toBe("unavailable");
    expect(classifyPostOtpHierarchy(null)).toBe("unavailable");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="Un départ simple, pensé pour vous."'),
      ),
    ).toBe("onboarding");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="account-connected-preview-ready"'),
      ),
    ).toBe("account_preview_ready");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="account-connected-preview-busy"'),
      ),
    ).toBe("account_preview_busy");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-option-7-ready"'),
      ),
    ).toBe("connected_option_ready");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-option-7-selected"'),
      ),
    ).toBe("connected_option_selected");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-option-7-blocked"'),
      ),
    ).toBe("connected_option_blocked");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-attempt-submit-ready"'),
      ),
    ).toBe("connected_submit_ready");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-attempt-retry"'),
      ),
    ).toBe("connected_attempt_pending");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-attempt-status-result"'),
      ),
    ).toBe("connected_result");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('resource-id="connected-progress-mastery"'),
      ),
    ).toBe("connected_progress");
    expect(
      classifyPostOtpHierarchy(
        "<hierarchy>" +
          '<node package="com.thainaute.app" resource-id="connected-option-0-selected" />' +
          '<node package="com.thainaute.app" resource-id="connected-attempt-retry" />' +
          "</hierarchy>",
      ),
    ).toBe("connected_attempt_pending");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="Chargement de la boucle connectée…"'),
      ),
    ).toBe("connected_loading");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="Boucle connectée indisponible"'),
      ),
    ).toBe("connected_unavailable");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="Cette leçon attend son lecteur dédié."'),
      ),
    ).toBe("connected_typed_mismatch");
    expect(
      classifyPostOtpHierarchy(hierarchy('text="Boucle technique locale"')),
    ).toBe("connected_lesson");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="" content-desc="" resource-id=""'),
      ),
    ).toBe("app_blank_or_splash");
    expect(
      classifyPostOtpHierarchy(
        hierarchy('text="" content-desc="" resource-id="private-marker"'),
      ),
    ).toBe("semantic_unknown");
    expect(classifyPostOtpHierarchy(hierarchy('text="état privé"'))).toBe(
      "semantic_unknown",
    );
    expect(
      classifyPostOtpHierarchy(
        `<hierarchy><node package="com.thainaute.app" text="${"x".repeat(512 * 1_024)}" /></hierarchy>`,
      ),
    ).toBe("unavailable");
  });

  it("attend le marker Auth live sans renaviguer ni exposer le compte", async () => {
    const flow = await readFile(
      path.resolve("apps/mobile/maestro/connected-auth-verify.yaml"),
      "utf8",
    );
    const accountScreen = await readFile(
      path.resolve("apps/mobile/app/account.tsx"),
      "utf8",
    );
    const wait = flow.indexOf("- extendedWaitUntil:");
    const label = flow.indexOf('visible: "État du compte : connecté"', wait);
    const assertion = flow.indexOf(
      '- assertVisible: "État du compte : connecté"',
      label,
    );

    expect([wait, label, assertion]).not.toContain(-1);
    expect(wait).toBeLessThan(label);
    expect(label).toBeLessThan(assertion);
    expect(flow).not.toContain('id: "account-auth-signed-in"');
    expect(flow).not.toContain("openLink");
    expect(flow).not.toContain("hideKeyboard");
    expect(flow).not.toContain("launchApp");
    expect(flow).not.toContain("clearState");
    expect(flow).not.toContain("scrollUntilVisible");
    expect(accountScreen).toContain(
      'testID={`account-auth-${auth.status.replace("_", "-")}`}',
    );
    expect(accountScreen).toContain('accessibilityRole="header"');
    expect(accountScreen).toContain(
      "accessibilityLabel={authStatusAccessibilityLabel}",
    );
    const markerStart = accountScreen.indexOf(
      "const authStatusAccessibilityLabel =",
    );
    const markerEnd = accountScreen.indexOf(";", markerStart);
    const markerContract = accountScreen.slice(markerStart, markerEnd);
    for (const marker of [
      "État du compte : connecté",
      "État du compte : déconnecté",
      "État du compte : session en vérification",
      "État du compte : non configuré",
    ]) {
      expect(markerContract).toContain(marker);
    }
    expect(markerContract).not.toMatch(
      /email|otp|code|auth\.session|user\.|@/iu,
    );
    expect(accountScreen).toContain("ref={scrollViewRef}");
    expect(accountScreen).toContain(
      "scrollViewRef.current?.scrollTo({ y: 0, animated: false });",
    );
  });

  it("fait défiler le compte restauré avant d'ouvrir la preview connectée", async () => {
    const [accountFlow, openFlow, routeFlow, audioFlow, optionFlow] =
      await Promise.all(
        ["account", "open", "route", "audio", "option"].map((step) =>
          readFile(
            path.resolve(`apps/mobile/maestro/connected-prepare-${step}.yaml`),
            "utf8",
          ),
        ),
      );
    const authReady = accountFlow.indexOf("État du compte : connecté");
    const launch = accountFlow.indexOf("- launchApp:");
    const onboarding = accountFlow.indexOf(
      'visible: "Un départ simple, pensé pour vous."',
      launch,
    );
    const accountLink = accountFlow.indexOf(
      "- openLink: thainaute://account",
      onboarding,
    );
    const scroll = openFlow.indexOf("- scrollUntilVisible:");
    const centered = openFlow.indexOf("centerElement: true", scroll);
    const target = openFlow.indexOf(
      'id: ".*account-connected-preview-ready.*"',
      centered,
    );
    const enabled = openFlow.indexOf("enabled: true", target);
    const settled = openFlow.indexOf("- waitForAnimationToEnd:", enabled);
    const tap = openFlow.indexOf("- tapOn:", settled);
    const tapTarget = openFlow.indexOf(
      'id: ".*account-connected-preview-ready.*"',
      tap,
    );
    const retryTap = openFlow.indexOf("retryTapIfNoChange: true", tapTarget);
    const disappearance = openFlow.indexOf("notVisible:", retryTap);

    expect([
      launch,
      onboarding,
      accountLink,
      authReady,
      scroll,
      centered,
      target,
      enabled,
      settled,
      tap,
      tapTarget,
      retryTap,
      disappearance,
    ]).not.toContain(-1);
    expect(launch).toBeLessThan(onboarding);
    expect(onboarding).toBeLessThan(accountLink);
    expect(accountLink).toBeLessThan(authReady);
    expect(scroll).toBeLessThan(centered);
    expect(centered).toBeLessThan(target);
    expect(scroll).toBeLessThan(target);
    expect(target).toBeLessThan(enabled);
    expect(enabled).toBeLessThan(settled);
    expect(settled).toBeLessThan(tap);
    expect(tap).toBeLessThan(tapTarget);
    expect(tapTarget).toBeLessThan(retryTap);
    expect(retryTap).toBeLessThan(disappearance);
    expect(openFlow).not.toContain('tapOn: "Ouvrir la preview connectée"');
    const accountScreen = await readFile(
      path.resolve("apps/mobile/app/account.tsx"),
      "utf8",
    );
    expect(accountScreen).toContain('"account-connected-preview-busy"');
    expect(accountScreen).toContain('"account-connected-preview-ready"');
    expect(accountScreen).toContain(
      'accessibilityLabel="Ouvrir la preview connectée"',
    );
    expect(accountScreen).toContain(
      'onPress={() => router.push("/connected-lesson")}',
    );
    expect(routeFlow).toContain('visible: "Boucle technique locale"');
    expect(routeFlow).toContain("timeout: 60000");
    expect(routeFlow).toContain(
      "Fixture technique · aucune valeur pédagogique · non publiable",
    );
    expect(audioFlow).toContain(
      'visible: "Signal vérifié et lu depuis le cache privé de l’app."',
    );
    expect(optionFlow).toContain('text: "^Option A$"');
    expect(optionFlow).toContain('id: ".*connected-option-[0-9]+-selected.*"');
    expect(optionFlow).not.toContain("connected-option-0-ready");
    expect(optionFlow).toContain("retryTapIfNoChange: true");
  });

  it("expurge le diagnostic de préparation connectée", () => {
    const seen = connectedPreparationFailure(
      "route",
      "thainaute",
      "connected_unavailable",
      2,
      new Error("secret"),
    );
    expect(seen.message).toContain(
      "route_thainaute_connected_unavailable_requests_seen",
    );
    expect(seen.message).not.toContain("secret");
    expect(
      connectedPreparationFailure("privé", "inconnu", "privé", 0).message,
    ).toContain("unknown_unavailable_unavailable_requests_none");
  });

  it("garde le cold restore diagnostic fatal et expurge son état", async () => {
    const [launchFlow, onboardingFlow, accountFlow, signedInFlow] =
      await Promise.all(
        ["launch", "onboarding", "account", "signed-in"].map((step) =>
          readFile(
            path.resolve(
              `apps/mobile/maestro/connected-auth-cold-${step}.yaml`,
            ),
            "utf8",
          ),
        ),
      );
    expect(launchFlow).toContain("- launchApp:");
    expect(launchFlow).toContain("stopApp: true");
    expect(launchFlow).toContain("clearState: false");
    expect(launchFlow).not.toContain("clearState: true");
    expect(launchFlow).toContain("permissions:\n      all: deny");
    expect(launchFlow).not.toMatch(/extendedWaitUntil|openLink/iu);
    expect(onboardingFlow).toContain(
      'visible: "Un départ simple, pensé pour vous."\n    timeout: 60000',
    );
    expect(onboardingFlow).not.toMatch(/launchApp|openLink/iu);
    const accountLink = accountFlow.indexOf("- openLink: thainaute://account");
    const accountMarker = accountFlow.indexOf(
      'visible: "^État du compte : (connecté|déconnecté|session en vérification|non configuré)$"',
      accountLink,
    );
    expect([accountLink, accountMarker]).not.toContain(-1);
    expect(accountLink).toBeLessThan(accountMarker);
    expect(accountFlow).toContain("timeout: 30000");
    expect(accountFlow).toContain(
      '- assertVisible: "^État du compte : (connecté|déconnecté|session en vérification|non configuré)$"',
    );
    expect(accountFlow).not.toContain('visible: "Retour"');
    expect(accountFlow).not.toContain(".*");
    expect(signedInFlow).toContain(
      'visible: "État du compte : connecté"\n    timeout: 30000',
    );
    expect(signedInFlow).toContain(
      '- assertVisible: "État du compte : connecté"',
    );
    expect(signedInFlow).not.toContain('id: "account-auth-signed-in"');
    for (const flow of [
      launchFlow,
      onboardingFlow,
      accountFlow,
      signedInFlow,
    ]) {
      expect(flow).not.toMatch(
        /inputText|clipboard|copyTextFrom|pasteText|hideKeyboard|\$\{|THAINAUTE_QA_EMAIL|THAINAUTE_QA_OTP|@thainaute\.invalid/iu,
      );
    }
    await expect(
      readFile(
        path.resolve("apps/mobile/maestro/connected-auth-cold-restore.yaml"),
        "utf8",
      ),
    ).rejects.toThrow();

    const sensitiveCause = new MobileConnectedE2EError(
      "valeur sensible interdite",
    );
    const restored = postOtpColdRestoreDiagnosticFailure(
      "semantic_unknown",
      "restore_ok",
      "thainaute",
      "signed_in",
      sensitiveCause,
    );
    const failed = postOtpColdRestoreDiagnosticFailure(
      "provider_stale",
      "account",
      "settings_search",
      "semantic_unknown",
      sensitiveCause,
    );
    const invalid = postOtpColdRestoreDiagnosticFailure(
      "valeur sensible interdite",
      "valeur sensible interdite",
      "valeur sensible interdite",
      "valeur sensible interdite",
      sensitiveCause,
    );
    const skipped = postOtpColdRestoreDiagnosticFailure(
      "signed_in",
      "skipped",
      "thainaute",
      "signed_in",
      sensitiveCause,
    );
    expect(restored.message).toContain("live_semantic_unknown_cold_restore_ok");
    expect(failed.message).toContain(
      "live_provider_stale_cold_account_settings_search_semantic_unknown",
    );
    expect(invalid.message).toContain(
      "live_unavailable_cold_unknown_unavailable_unavailable",
    );
    expect(skipped.message).toContain("live_signed_in_cold_restore_skipped");
    for (const failure of [restored, failed, invalid, skipped]) {
      expect(failure.message).not.toContain("valeur sensible interdite");
      expect(failure.cause).toBe(sensitiveCause);
    }
    const combined = combineFailureWithCleanup(failed, [
      "artefacts Maestro",
      "mode avion",
    ]);
    expect(combined.cleanupSteps).toEqual(["artefacts Maestro", "mode avion"]);
    expect(combined.cause).toBe(failed);

    const runner = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const helper = runner.indexOf("async function runColdAuthDiagnosticStep(");
    const preStepAbort = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(config, livePrimary, cleanupSteps);",
      helper,
    );
    const maestro = runner.indexOf(
      "await runMaestro(config, serial, flowName);",
      preStepAbort,
    );
    const cleanupMerge = runner.indexOf("const allCleanupSteps = [", maestro);
    const preForegroundAbort = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);",
      cleanupMerge,
    );
    const foreground = runner.indexOf(
      "const foregroundState = await readForegroundAndroidActivityState(",
      preForegroundAbort,
    );
    const betweenProbesAbort = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);",
      foreground,
    );
    const screen = runner.indexOf(
      "const screenState = await readPostSecretDeviceState(config, serial);",
      betweenProbesAbort,
    );
    const postScreenAbort = runner.indexOf(
      "throwIfColdAuthDiagnosticAborted(config, livePrimary, allCleanupSteps);",
      screen,
    );
    const fatal = runner.indexOf(
      "throw combineFailureWithCleanup(failure, allCleanupSteps);",
      postScreenAbort,
    );
    expect([
      helper,
      preStepAbort,
      maestro,
      cleanupMerge,
      preForegroundAbort,
      foreground,
      betweenProbesAbort,
      screen,
      postScreenAbort,
      fatal,
    ]).not.toContain(-1);
    expect(preStepAbort).toBeLessThan(maestro);
    expect(maestro).toBeLessThan(cleanupMerge);
    expect(cleanupMerge).toBeLessThan(preForegroundAbort);
    expect(preForegroundAbort).toBeLessThan(foreground);
    expect(foreground).toBeLessThan(betweenProbesAbort);
    expect(betweenProbesAbort).toBeLessThan(screen);
    expect(screen).toBeLessThan(postScreenAbort);
    expect(postScreenAbort).toBeLessThan(fatal);
  });

  it.each(["&", "|", "<", ">", "^", "%", "!", '"', "(", ")"])(
    "refuse le métacaractère cmd.exe %s dans un chemin Maestro Windows",
    (metacharacter) => {
      expect(() =>
        buildMaestroCommand(
          "apps/mobile/maestro/connected-auth-entry.yaml",
          path.join(os.tmpdir(), `maestro${metacharacter}private`),
          "emulator-5554",
          "win32",
        ),
      ).toThrow(/métacaractère cmd\.exe interdit/u);
    },
  );

  it("ne prend possession de l'app qu'après installation attestée, avant son reset annoncé", async () => {
    const source = await readFile(
      path.resolve("scripts/qa/run-mobile-connected-e2e.mjs"),
      "utf8",
    );
    const install = source.indexOf('["install", "-r", "-t", config.apkPath]');
    const verification = source.indexOf(
      '["shell", "pm", "path", MOBILE_APP_ID]',
      install,
    );
    const ownership = source.indexOf("appMayBeInstalled = true;", verification);
    const announcement = source.indexOf(
      "Effacement des données privées QA de",
      ownership,
    );
    const reset = source.indexOf(
      '["shell", "pm", "clear", MOBILE_APP_ID]',
      announcement,
    );
    expect([
      install,
      verification,
      ownership,
      announcement,
      reset,
    ]).not.toContain(-1);
    expect(install).toBeLessThan(verification);
    expect(verification).toBeLessThan(ownership);
    expect(ownership).toBeLessThan(announcement);
    expect(announcement).toBeLessThan(reset);
  });

  it("attend la fin unique de l'auto-synchronisation hors ligne avant reconnexion", async () => {
    const flow = await readFile(
      path.resolve("apps/mobile/maestro/connected-pending-after-relaunch.yaml"),
      "utf8",
    );
    expect(flow).toContain(
      'visible: "Réponse enregistrée sur cet appareil. La correction sera reprise avec ce même événement."',
    );
    expect(flow).not.toContain(
      'assertVisible: "Réponse enregistrée sur cet appareil.*"',
    );
  });

  it("cible les états natifs de soumission et de rejeu sans ghost tap", async () => {
    const [submit, pending, dropped, success, progress, screenSource] =
      await Promise.all(
        [
          "connected-submit-offline.yaml",
          "connected-pending-after-relaunch.yaml",
          "connected-replay-dropped.yaml",
          "connected-replay-success.yaml",
          "connected-replay-progress.yaml",
        ]
          .map((name) =>
            readFile(path.resolve("apps/mobile/maestro", name), "utf8"),
          )
          .concat([
            readFile(
              path.resolve("apps/mobile/app/connected-lesson.tsx"),
              "utf8",
            ),
          ]),
      );

    expect(submit).toContain("centerElement: true");
    expect(submit).toContain('id: ".*connected-attempt-submit-ready.*"');
    expect(submit).toContain("retryTapIfNoChange: true");
    expect(submit).toContain('id: ".*connected-attempt-retry.*"');
    const launch = pending.indexOf("- launchApp:");
    const onboarding = pending.indexOf(
      "visible: '^(Un départ simple, pensé pour vous\\.|Boucle technique locale)$'",
      launch,
    );
    const deepLink = pending.indexOf(
      "- openLink: thainaute://connected-lesson",
      onboarding,
    );
    expect([launch, onboarding, deepLink]).not.toContain(-1);
    expect(launch).toBeLessThan(onboarding);
    expect(onboarding).toBeLessThan(deepLink);
    expect(pending).toContain('id: ".*connected-attempt-retry.*"');
    expect(pending).toContain("centerElement: true");
    expect(dropped).toContain('id: ".*connected-attempt-retry.*"');
    expect(success).toContain('id: ".*connected-attempt-retry.*"');
    expect(success).toContain('id: ".*connected-attempt-status-result.*"');
    expect(success).toContain(
      "assertVisible: '^La boucle technique fonctionne\\.$'",
    );
    expect(progress).toContain('id: ".*connected-progress.*"');
    expect(progress).toContain('visible: "Maîtrise technique 25 %"');
    expect(progress).toContain('assertVisible: "Maîtrise technique 25 %"');
    expect(progress).toContain('assertVisible: "Tentatives 1"');
    expect(screenSource).toContain('"connected-attempt-submit-ready"');
    expect(screenSource).toContain('testID="connected-attempt-retry"');
    expect(screenSource).toContain('testID="connected-progress"');
    expect(screenSource).toContain('testID="connected-progress-mastery"');
    expect(screenSource).toContain('testID="connected-progress-attempts"');
  });

  it("censure les valeurs directes, encodées et les formes usuelles de token", () => {
    const email = "mobile-connected@example.invalid";
    const otp = "482913";
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.signature";
    const raw = `${email} ${encodeURIComponent(email)} ${otp} Bearer ${jwt} sb_secret_value`;
    const redacted = redactSensitive(raw, [email, otp, jwt]);
    expect(redacted).not.toContain(email);
    expect(redacted).not.toContain(encodeURIComponent(email));
    expect(redacted).not.toContain(otp);
    expect(redacted).not.toContain(jwt);
    expect(redacted).not.toContain("sb_secret_value");
  });

  it("extrait l'OTP local sans dépendre d'un transport Auth alternatif", () => {
    expect(
      extractOtpFromMailpitHtml(
        '<p style="font-size: 32px; letter-spacing: 8px;"> 482913 </p>',
      ),
    ).toBe("482913");
    expect(() => extractOtpFromMailpitHtml("<p>aucun code</p>")).toThrow();
    expect(
      mailpitMessageIdsFromPayload({ messages: [{ ID: "message-safe_1" }] }),
    ).toEqual(["message-safe_1"]);
    expect(
      mailpitMessageIdsFromPayload({ messages: [{ ID: "../invalide" }] }),
    ).toBeNull();
    expect(
      mailpitHtmlFromPayload({
        HTML: '<p style="letter-spacing: 8px;">482913</p>',
      }),
    ).toContain("482913");
    expect(mailpitHtmlFromPayload({ HTML: 482913 })).toBeNull();
  });

  it("classe la création de session Auth sans exposer l'utilisateur", () => {
    const email =
      "mobile-connected-00000000-0000-4000-8000-000000000001@thainaute.invalid";
    expect(classifyLocalAuthUsers(null, email)).toBe("unavailable");
    expect(classifyLocalAuthUsers({ users: [] }, email)).toBe("unexpected");
    expect(
      classifyLocalAuthUsers(
        {
          users: [
            {
              email,
              email_confirmed_at: "2026-08-09T18:00:00.000Z",
              is_anonymous: false,
              last_sign_in_at: null,
            },
          ],
        },
        email,
      ),
    ).toBe("pending");
    expect(
      classifyLocalAuthUsers(
        {
          users: [
            {
              email,
              email_confirmed_at: "2026-08-09T18:00:00.000Z",
              is_anonymous: false,
              last_sign_in_at: "2026-08-09T18:00:00.000Z",
            },
          ],
        },
        email,
      ),
    ).toBe("session_created");
    expect(
      classifyLocalAuthUsers(
        {
          users: [
            {
              email,
              email_confirmed_at: null,
              is_anonymous: true,
              last_sign_in_at: null,
            },
          ],
        },
        email,
      ),
    ).toBe("unexpected");
    expect(
      classifyLocalAuthUsers(
        {
          users: [
            {
              email,
              email_confirmed_at: "invalide",
              is_anonymous: false,
              last_sign_in_at: "invalide",
            },
          ],
        },
        email,
      ),
    ).toBe("unexpected");
    expect(
      classifyLocalAuthUsers(
        {
          users: [
            {
              email:
                "mobile-connected-ffffffff-ffff-4fff-8fff-ffffffffffff@thainaute.invalid",
              email_confirmed_at: "2026-08-09T18:00:00.000Z",
              is_anonymous: false,
              last_sign_in_at: "2026-08-09T18:00:00.000Z",
            },
          ],
        },
        email,
      ),
    ).toBe("unexpected");
  });
});

describe("preuve du rejeu idempotent", () => {
  it("accepte deux transports pour une seule projection autoritaire", () => {
    expect(assertFinalFaultProxyState(validProxyState())).toBe(true);
  });

  it("refuse une projection doublée ou différente au rejeu", () => {
    const doubled = validProxyState();
    doubled.lastReplayProjection.singleStateAttemptCount = 2;
    expect(() => assertFinalFaultProxyState(doubled)).toThrow();

    const mismatched = validProxyState();
    mismatched.lastReplayProjection.singleStateDueAt =
      "2026-08-11T12:00:00.000Z";
    expect(() => assertFinalFaultProxyState(mismatched)).toThrow();

    const changedResponse = validProxyState();
    changedResponse.lastReplayResponseMatched = false;
    expect(() => assertFinalFaultProxyState(changedResponse)).toThrow(
      /réponse HTTP/u,
    );
  });

  it("refuse un lot avec une tentative acceptée et une tentative rejetée", () => {
    const mixedBatch = validProxyState();
    for (const projection of [
      mixedBatch.lastCommittedProjection,
      mixedBatch.lastReplayProjection,
    ]) {
      projection.resultCount = 2;
      projection.rejectedCount = 1;
    }
    expect(() => assertFinalFaultProxyState(mixedBatch)).toThrow(
      /exactement une tentative acceptée/u,
    );
  });
});
