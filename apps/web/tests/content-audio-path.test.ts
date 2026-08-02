import { describe, expect, it } from "vitest";

import { parsePublishedAudioStorageLocation } from "../lib/server/content-delivery/audio-path";

describe("chemin Storage audio publié", () => {
  it("conserve exactement le bucket et le nom d'objet", () => {
    expect(
      parsePublishedAudioStorageLocation(
        "published-audio/fr-FR/ก่/natural-01.wav",
      ),
    ).toEqual({
      bucket: "published-audio",
      objectPath: "fr-FR/ก่/natural-01.wav",
    });
  });

  it.each([
    "",
    "/bucket/file.wav",
    "Bucket/file.wav",
    "bucket",
    "bucket/../file.wav",
    "bucket/./file.wav",
    "bucket//file.wav",
    "bucket/file.wav?token=secret",
    "bucket\\file.wav",
  ])("refuse le chemin ambigu %s", (value) => {
    expect(parsePublishedAudioStorageLocation(value)).toBeNull();
  });
});
