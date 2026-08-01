import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sampleRate = 8_000;
const durationMs = 320;
const sampleCount = Math.floor((sampleRate * durationMs) / 1_000);
const dataSize = sampleCount * 2;
const wav = Buffer.alloc(44 + dataSize);

wav.write("RIFF", 0, "ascii");
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVE", 8, "ascii");
wav.write("fmt ", 12, "ascii");
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36, "ascii");
wav.writeUInt32LE(dataSize, 40);

for (let index = 0; index < sampleCount; index += 1) {
  const fade = Math.min(index / 160, (sampleCount - index) / 160, 1);
  const sample = Math.round(
    Math.sin((2 * Math.PI * 440 * index) / sampleRate) * 5_000 * fade,
  );
  wav.writeInt16LE(sample, 44 + index * 2);
}

const paths = [
  "packages/content/assets/fixture-tone.wav",
  "apps/web/public/audio/fixture-tone.wav",
  "apps/mobile/assets/audio/fixture-tone.wav",
];

for (const relativePath of paths) {
  const outputPath = resolve(relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, wav);
}

console.log(
  `Generated ${paths.length} identical ${wav.length}-byte WAV assets.`,
);
