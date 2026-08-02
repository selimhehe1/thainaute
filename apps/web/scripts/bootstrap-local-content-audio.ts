import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const EXPECTED_BYTE_LENGTH = 5_164;
const EXPECTED_SHA256 =
  "801031380b85885ed9edd1bfe0050a4e93a61208fae8b8c5f01bbd3d553c118a";
const FIXTURE_BUCKET = "bucket-prive";
const FIXTURE_OBJECT = "chemin-interne.wav";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value === "") {
    throw new Error(`Variable locale requise absente : ${name}.`);
  }
  return value;
}

function assertExplicitLocalTarget(input: string): URL {
  if (process.env.THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP !== "1") {
    throw new Error(
      "Bootstrap refusé sans THAINAUTE_LOCAL_FIXTURE_BOOTSTRAP=1.",
    );
  }

  const url = new URL(input);
  const localHost =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1" ||
    url.hostname === "[::1]";
  if (url.protocol !== "http:" || !localHost) {
    throw new Error("Bootstrap refusé : la cible Supabase n'est pas locale.");
  }
  return url;
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function main(): Promise<void> {
  const supabaseUrl = assertExplicitLocalTarget(
    requiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  );
  const secret = requiredEnvironmentVariable("SUPABASE_SECRET_KEY");
  const fixturePath = fileURLToPath(
    new URL("../public/audio/fixture-tone.wav", import.meta.url),
  );
  const fixture = await readFile(fixturePath);
  if (
    fixture.byteLength !== EXPECTED_BYTE_LENGTH ||
    sha256Hex(fixture) !== EXPECTED_SHA256
  ) {
    throw new Error("La fixture audio locale ne correspond pas au manifeste.");
  }

  const client = createClient(supabaseUrl.origin, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const listed = await client.storage.listBuckets();
  if (listed.error !== null) {
    throw new Error("La liste des buckets locaux est indisponible.");
  }
  const existing = listed.data.find(({ name }) => name === FIXTURE_BUCKET);
  if (existing?.public === true) {
    throw new Error("Le bucket de fixture existe mais n'est pas privé.");
  }
  if (existing === undefined) {
    const created = await client.storage.createBucket(FIXTURE_BUCKET, {
      allowedMimeTypes: ["audio/wav"],
      fileSizeLimit: "6KB",
      public: false,
    });
    if (created.error !== null) {
      throw new Error("Le bucket audio local n'a pas pu être créé.");
    }
  }

  const uploaded = await client.storage
    .from(FIXTURE_BUCKET)
    .upload(FIXTURE_OBJECT, fixture, {
      cacheControl: "0",
      contentType: "audio/wav",
      upsert: true,
    });
  if (uploaded.error !== null) {
    throw new Error("La fixture audio locale n'a pas pu être chargée.");
  }

  const downloaded = await client.storage
    .from(FIXTURE_BUCKET)
    .download(FIXTURE_OBJECT);
  if (downloaded.error !== null) {
    throw new Error("La fixture audio locale n'a pas pu être relue.");
  }
  const verified = new Uint8Array(await downloaded.data.arrayBuffer());
  if (
    verified.byteLength !== EXPECTED_BYTE_LENGTH ||
    sha256Hex(verified) !== EXPECTED_SHA256
  ) {
    throw new Error("La fixture audio locale relue est corrompue.");
  }

  process.stdout.write("Fixture audio Supabase locale vérifiée.\n");
}

await main();
