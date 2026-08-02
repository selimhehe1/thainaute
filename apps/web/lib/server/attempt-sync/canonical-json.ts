import { createHash } from "node:crypto";

function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Une valeur JSON numérique doit être finie.");
    }
    return JSON.stringify(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalize(entry)).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Readonly<Record<string, unknown>>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`);
    return `{${entries.join(",")}}`;
  }

  throw new TypeError(
    "La valeur ne peut pas être représentée en JSON canonique.",
  );
}

export function hashCanonical(namespace: string, value: unknown): string {
  const canonicalValue = canonicalize({ namespace, value });
  return createHash("sha256").update(canonicalValue, "utf8").digest("hex");
}

export function hashAttemptBatch(
  batch: unknown,
  activeReleaseId: string,
  contentEligibility: unknown,
): string {
  return hashCanonical("thainaute.attempt-batch/v2:/api/v1/attempts/batch", {
    activeReleaseId,
    batch,
    contentEligibility,
  });
}
