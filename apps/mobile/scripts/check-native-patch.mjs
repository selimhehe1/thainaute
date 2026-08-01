import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const expoAudioRoot = dirname(require.resolve("expo-audio/package.json"));
const repoRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);

function fail(message) {
  throw new Error(`Contrat du patch expo-audio invalide : ${message}`);
}

function readSource(relativePath) {
  return readFileSync(join(expoAudioRoot, relativePath), "utf8");
}

function section(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) fail(`section ${label} introuvable.`);
  return source.slice(start, end);
}

function requireText(source, expected, label) {
  if (!source.includes(expected)) fail(`${label} absent.`);
}

function forbidText(source, forbidden, label) {
  if (source.includes(forbidden)) fail(`${label} encore présent.`);
}

function requireOrder(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) {
    fail(`ordre invalide pour ${label}.`);
  }
}

const patchPath = join(repoRoot, "patches", "expo-audio@57.0.3.patch");
const patchBytes = readFileSync(patchPath);
const patchText = patchBytes.toString("utf8");
const patchHash = createHash("sha256").update(patchBytes).digest("hex");
const lockfile = readFileSync(join(repoRoot, "pnpm-lock.yaml"), "utf8");
const workspace = readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8");
const mobilePackage = JSON.parse(
  readFileSync(join(repoRoot, "apps", "mobile", "package.json"), "utf8"),
);

forbidText(patchText, "\r\n", "fin de ligne CRLF dans le patch versionné");
requireText(
  lockfile,
  `expo-audio@57.0.3: ${patchHash}`,
  "empreinte SHA-256 du patch dans pnpm-lock.yaml",
);
requireText(
  workspace,
  "expo-audio@57.0.3: patches/expo-audio@57.0.3.patch",
  "déclaration du patch pnpm",
);
for (const platform of ["android", "ios"]) {
  const sourceBuilds =
    mobilePackage.expo?.autolinking?.[platform]?.buildFromSource;
  if (!Array.isArray(sourceBuilds) || !sourceBuilds.includes("expo-audio")) {
    fail(`compilation source d’expo-audio absente pour ${platform}.`);
  }
}

const androidModule = readSource(
  "android/src/main/java/expo/modules/audio/AudioModule.kt",
);
const androidRecorder = readSource(
  "android/src/main/java/expo/modules/audio/AudioRecorder.kt",
);
const iosModule = readSource("ios/AudioModule.swift");
const iosPlayer = readSource("ios/AudioPlayer.swift");
const iosRecorder = readSource("ios/AudioRecorder.swift");
const iosUtils = readSource("ios/AudioUtils.swift");

requireText(
  androidModule,
  "audioManager.registerAudioDeviceCallback(audioDeviceCallback",
  "enregistrement du callback de route Android",
);
requireText(
  androidModule,
  "audioManager.unregisterAudioDeviceCallback(audioDeviceCallback)",
  "désenregistrement du callback de route Android",
);
requireText(
  androidModule,
  "override fun onAudioDevicesAdded",
  "détection d’ajout de route Android",
);
requireText(
  androidModule,
  "override fun onAudioDevicesRemoved",
  "détection de retrait de route Android",
);
requireText(
  androidModule,
  "{ recorderId -> recorders.remove(recorderId) }",
  "retrait du recorder Android libéré",
);

const androidPrepare = section(
  androidRecorder,
  "suspend fun prepareRecording",
  "@Synchronized\n  fun record()",
  "préparation Android",
);
requireText(androidPrepare, "isPreparing = true", "réservation Android");
requireText(androidPrepare, "isReleased", "barrière de libération Android");
requireText(
  androidPrepare,
  "prepareGeneration != generation",
  "génération de préparation Android",
);
requireOrder(
  androidPrepare,
  "isPreparing = true",
  "createRecorder(recordingOptions, pendingOutputFilePath)",
  "réservation avant création Android",
);
requireOrder(
  androidPrepare,
  "preparedRecorder.prepare()",
  "recorder = preparedRecorder",
  "préparation avant publication Android",
);
requireOrder(
  androidPrepare,
  "preparedRecorder.prepare()",
  "filePath = pendingOutputFilePath",
  "publication du chemin Android après préparation",
);
requireText(
  androidPrepare,
  "pendingFilePath = pendingOutputFilePath",
  "chemin Android provisoire ciblé",
);
requireText(
  androidPrepare,
  "if (pendingFilePath == outputFilePath)",
  "nettoyage Android limité à la génération courante",
);
requireText(
  androidPrepare,
  "deleteRecordingFile(outputFilePath)",
  "suppression Android après échec de préparation",
);
requireText(
  androidRecorder,
  "isReleased || isPreparing || captureInvalidated || !isPrepared || recorder == null",
  "refus Android d’un démarrage invalide",
);
requireText(
  androidRecorder,
  "@Synchronized\n  fun record()",
  "sérialisation Android du démarrage",
);

requireText(
  androidRecorder,
  "AudioManager.AudioRecordingCallback",
  "surveillance Android de la capture",
);
requireText(
  androidRecorder,
  "configuration.isClientSilenced",
  "détection Android d’une capture réduite au silence",
);
requireText(
  androidRecorder,
  "setPrivacySensitive(true)",
  "capture Android déclarée sensible",
);
requireText(
  androidRecorder,
  "AudioRouting.OnRoutingChangedListener",
  "surveillance Android du routage effectif",
);

const androidExpectedInterruption = section(
  androidRecorder,
  "private fun stopForInterruption(expectedRecorder: MediaRecorder?)",
  "private fun stopForInterruptionLocked()",
  "revendication atomique Android",
);
requireText(
  androidExpectedInterruption,
  "expectedRecorder !== recorder",
  "identité du recorder Android sous verrou",
);
requireText(
  androidExpectedInterruption,
  "stopForInterruptionLocked()",
  "terminal Android après contrôle d’identité",
);

const androidRouting = section(
  androidRecorder,
  "@Synchronized\n  private fun handleRoutingChange",
  "@Synchronized\n  private fun handleRoutedDevice",
  "callback de routage Android",
);
requireText(
  androidRouting,
  "expectedRecorder !== recorder",
  "rejet atomique d’un routage Android obsolète",
);
const androidRecordingConfiguration = section(
  androidRecorder,
  "private fun handleRecordingConfiguration(\n    expectedRecorder: MediaRecorder",
  "@Synchronized\n  private fun handleRoutingChange",
  "callback de configuration Android",
);
requireText(
  androidRecordingConfiguration,
  "expectedRecorder !== recorder",
  "rejet atomique d’une configuration Android obsolète",
);
const androidOnError = section(
  androidRecorder,
  "override fun onError",
  "override fun onInfo",
  "callback d’erreur Android",
);
requireText(
  androidOnError,
  "stopForInterruption(mr)",
  "identité transmise par l’erreur Android",
);
const androidOnInfo = section(
  androidRecorder,
  "override fun onInfo",
  "fun getCurrentInput",
  "callback d’information Android",
);
requireText(
  androidOnInfo,
  "stopForInterruption(mr)",
  "identité transmise par l’information Android",
);

const androidRelease = section(
  androidRecorder,
  "override fun sharedObjectDidRelease()",
  "fun getAudioRecorderStatus()",
  "libération Android",
);
requireText(androidRelease, "isReleased = true", "état libéré Android");
requireText(
  androidRelease,
  "prepareGeneration += 1",
  "invalidation de préparation à la libération Android",
);
requireText(androidRelease, "onRelease(id)", "retrait du registre Android");
requireText(
  androidRelease,
  "listOfNotNull(filePath, pendingFilePath).distinct()",
  "capture ciblée des fichiers Android à la libération",
);
requireText(
  androidRelease,
  "recordingFiles.forEach(::deleteRecordingFile)",
  "suppression Android à la libération",
);
requireOrder(
  androidRelease,
  "recordingFiles =",
  "filePath = null",
  "capture du chemin Android avant oubli",
);
const androidInterruption = section(
  androidRecorder,
  "private fun stopForInterruptionLocked()",
  "@Synchronized\n  private fun reset()",
  "terminal d’interruption Android",
);
requireText(
  androidInterruption,
  "deleteRecordingFile(interruptedFilePath)",
  "suppression Android d’une prise interrompue",
);
const androidSetOptions = section(
  androidRecorder,
  "private fun setRecordingOptions",
  "private fun deleteRecordingFile",
  "options de capture Android",
);
forbidText(
  androidSetOptions,
  "filePath = outputFilePath",
  "publication prématurée du chemin Android",
);
requireText(androidRecorder, '"hasError" to true', "échec terminal Android");
requireText(
  androidRecorder,
  "if (recorder == null && !isPrepared && !isRecording && !isPaused)",
  "arrêt Android idempotent sans second terminal",
);

const androidStop = section(
  androidModule,
  'AsyncFunction("stop")',
  'Function("getStatus")',
  "fonction stop Android",
);
requireText(
  androidStop,
  "recorder.stopRecording()\n      }.runOnQueue(Queues.MAIN)",
  "stop Android sur la queue principale",
);

const androidBackground = section(
  androidModule,
  "OnActivityEntersBackground",
  "OnActivityEntersForeground",
  "arrière-plan Android",
);
requireText(
  androidBackground,
  "recorder.stopForInterruption()",
  "arrêt Android en arrière-plan",
);
forbidText(
  androidBackground,
  "recorder.pauseRecording()",
  "pause Android en arrière-plan",
);
const androidForeground = section(
  androidModule,
  "OnActivityEntersForeground",
  "OnDestroy",
  "retour Android au premier plan",
);
forbidText(
  androidForeground,
  ".play()",
  "reprise audio Android au premier plan",
);
forbidText(
  androidForeground,
  "requestAudioFocus()",
  "reprise de focus Android au premier plan",
);
forbidText(
  androidForeground,
  "recorder.record()",
  "reprise de capture Android au premier plan",
);
const androidFocusGain = section(
  androidModule,
  "AudioManager.AUDIOFOCUS_GAIN -> {",
  "private fun shouldReleaseFocus",
  "gain de focus Android",
);
forbidText(androidFocusGain, ".play()", "reprise audio Android après focus");
forbidText(
  androidFocusGain,
  "isPaused = false",
  "effacement automatique de la pause Android",
);

requireText(
  iosRecorder,
  "private let stateLock = NSRecursiveLock()",
  "verrou iOS partagé",
);
requireText(
  iosRecorder,
  "func record(atTime: Double?, forDuration: Double?)",
  "démarrage iOS atomique",
);
requireText(
  iosRecorder,
  "guard !captureInvalidated else",
  "refus iOS d’un démarrage invalidé",
);
const iosRecorderPrepare = section(
  iosRecorder,
  "func prepare(options: RecordingOptions?",
  "private func resetDurationTracking()",
  "préparation du recorder iOS",
);
requireText(
  iosRecorderPrepare,
  "guard !isReleased else",
  "barrière de libération avant préparation iOS",
);
requireText(
  iosRecorderPrepare,
  "deleteRecordingFile(at: ref.url)",
  "suppression iOS après échec de préparation",
);
requireText(
  iosRecorderPrepare,
  "let replacedRecordingURL = ref.url",
  "capture ciblée de l’ancienne URL iOS",
);
requireOrder(
  iosRecorderPrepare,
  "ref = newRecorder",
  "deleteRecordingFile(at: replacedRecordingURL)",
  "remplacement iOS avant suppression de l’ancienne prise",
);
requireText(
  iosUtils,
  "try? FileManager.default.removeItem(at: fileUrl)",
  "suppression iOS après échec de création native",
);
forbidText(
  iosModule,
  "recorder.ref.record(",
  "démarrage iOS direct hors verrou",
);

const iosMarkInterruption = section(
  iosRecorder,
  "func markCaptureInterrupted()",
  "func stopForInterruption",
  "revendication d’interruption iOS",
);
requireText(
  iosMarkInterruption,
  "stateLock.lock()",
  "verrou de revendication iOS",
);
requireText(
  iosMarkInterruption,
  "captureInvalidated = true",
  "invalidation immédiate iOS",
);
requireText(iosMarkInterruption, "return ref", "identité native iOS");
const iosStopInterruption = section(
  iosRecorder,
  "func stopForInterruption(expectedRecorder: AVAudioRecorder? = nil)",
  "func getRecordingStatus()",
  "terminal d’interruption iOS",
);
requireText(
  iosStopInterruption,
  "expectedRecorder !== ref",
  "rejet iOS d’une interruption obsolète",
);
requireText(iosStopInterruption, '"hasError": true', "échec terminal iOS");
requireText(
  iosStopInterruption,
  "deleteRecordingFile(at: ref.url)",
  "suppression iOS d’une prise interrompue",
);

const iosStopRecording = section(
  iosRecorder,
  "func stopRecording()",
  "func pauseRecording()",
  "arrêt manuel iOS",
);
requireText(
  iosStopRecording,
  "if captureInvalidated",
  "priorité d’interruption sur l’arrêt iOS",
);
requireOrder(
  iosStopRecording,
  "if captureInvalidated",
  "ref.stop()",
  "priorité d’interruption avant succès iOS",
);
const iosDidFinish = section(
  iosRecorder,
  "func didFinish",
  "func encodeErrorDidOccur",
  "délégué final iOS",
);
requireText(
  iosDidFinish,
  "guard recorder === ref else",
  "identité du délégué iOS",
);
requireText(
  iosDidFinish,
  "guard !isReleased else",
  "rejet du délégué final iOS après libération",
);
requireText(
  iosDidFinish,
  "if captureInvalidated",
  "priorité d’interruption du délégué iOS",
);
const iosRelease = section(
  iosRecorder,
  "override func sharedObjectWillRelease()",
  "\n}",
  "libération iOS",
);
requireText(iosRelease, "isReleased = true", "état libéré iOS");
requireText(
  iosRelease,
  "captureInvalidated = true",
  "invalidation à la libération iOS",
);
requireOrder(
  iosRelease,
  "isReleased = true",
  "ref.stop()",
  "libération avant arrêt iOS",
);
requireText(
  iosRelease,
  "let recordingURL = ref.url",
  "capture ciblée du fichier iOS à la libération",
);
requireText(
  iosRelease,
  "currentState == .prepared || currentState == .recording || currentState == .paused",
  "arrêt iOS des prises actives à la libération",
);
requireText(
  iosRelease,
  "deleteRecordingFile(at: recordingURL)",
  "suppression iOS à la libération",
);
const iosEncodeError = section(
  iosRecorder,
  "func encodeErrorDidOccur",
  "private func recordingDirectory",
  "délégué d’erreur iOS",
);
requireText(
  iosEncodeError,
  "guard !isReleased else",
  "rejet du délégué d’erreur iOS après libération",
);
requireText(
  iosEncodeError,
  "deleteRecordingFile(at: recorder.url)",
  "suppression iOS après erreur d’encodage",
);
requireOrder(
  iosEncodeError,
  "interruptionTerminalPending = true",
  "recorder.stop()",
  "neutralisation du délégué avant fermeture iOS en erreur",
);
requireOrder(
  iosEncodeError,
  "recorder.stop()",
  "deleteRecordingFile(at: recorder.url)",
  "fermeture iOS avant suppression après erreur",
);

const iosInterruptionNotification = section(
  iosModule,
  "@objc private func handleAudioSessionInterruption",
  "private func handleInterruptionBegan",
  "notification d’interruption iOS",
);
forbidText(
  iosInterruptionNotification,
  "DispatchQueue.main.async",
  "double dispatch de l’interruption iOS",
);
const iosRoute = section(
  iosModule,
  "@objc private func handleAudioSessionRouteChange",
  "@objc private func handleMediaServicesReset",
  "changement de route iOS",
);
requireText(
  iosRoute,
  "markCaptureInterrupted()",
  "revendication immédiate de route iOS",
);
requireText(
  iosRoute,
  "DispatchQueue.main.async",
  "dispatch principal de route iOS",
);
requireText(
  iosRoute,
  "stopForInterruption(expectedRecorder: expectedRecorder)",
  "identité de route transmise iOS",
);
requireOrder(
  iosRoute,
  "markCaptureInterrupted()",
  "DispatchQueue.main.async",
  "revendication avant dispatch de route iOS",
);
const iosMediaReset = section(
  iosModule,
  "@objc private func handleMediaServicesReset",
  "private func reconfigureAudioSession",
  "réinitialisation des services iOS",
);
forbidText(
  iosMediaReset,
  "DispatchQueue.main.async",
  "double dispatch du reset iOS",
);

const iosPrepare = section(
  iosModule,
  'AsyncFunction("prepareToRecordAsync")',
  'Function("record")',
  "fonction prepare iOS",
);
requireText(
  iosPrepare,
  "}.runOnQueue(.main)",
  "préparation iOS sur la queue principale",
);
const iosStop = section(
  iosModule,
  'AsyncFunction("stop")',
  'Function("getStatus")',
  "fonction stop iOS",
);
requireText(
  iosStop,
  "recorder.stopRecording()\n      }.runOnQueue(.main)",
  "stop iOS sur la queue principale",
);

const iosBackground = section(
  iosModule,
  "OnAppEntersBackground",
  "OnAppEntersForeground",
  "arrière-plan iOS",
);
requireText(
  iosBackground,
  "recorder.stopForInterruption()",
  "arrêt iOS en arrière-plan",
);
forbidText(iosBackground, "pauseAllRecorders()", "pause iOS en arrière-plan");
const iosForeground = section(
  iosModule,
  "OnAppEntersForeground",
  "// swiftlint:disable:next closure_body_length",
  "retour iOS au premier plan",
);
forbidText(
  iosForeground,
  "resumeAllPlayers()",
  "reprise audio iOS au premier plan",
);
forbidText(
  iosForeground,
  "resumeAllRecorders()",
  "reprise de capture iOS au premier plan",
);
const iosInterruptionEnded = section(
  iosModule,
  "private func handleInterruptionEnded",
  "@objc private func handleAudioSessionRouteChange",
  "fin d’interruption iOS",
);
requireText(
  iosInterruptionEnded,
  "finishInterruptedPlayersWithoutResuming()",
  "fin d’interruption iOS sans reprise",
);
forbidText(
  iosInterruptionEnded,
  "resumeInterruptedPlayers()",
  "reprise audio iOS après interruption",
);
forbidText(
  iosModule,
  "private func resumeAllPlayers()",
  "helper de reprise iOS",
);
requireText(
  iosPlayer,
  "let shouldResume = false",
  "absence de reprise iOS après reset média",
);

console.log(
  `Patch expo-audio ${patchHash.slice(0, 12)} validé : cycles, identités, routes et lectures restent fail-closed sur iOS et Android.`,
);
