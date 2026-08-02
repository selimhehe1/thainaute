export interface PublishedAudioStorageLocation {
  readonly bucket: string;
  readonly objectPath: string;
}

const BUCKET_PATTERN = /^[a-z0-9][a-z0-9._-]{0,62}$/u;

/**
 * Le chemin éditorial reste exact : aucune normalisation Unicode, URL ou
 * filesystem ne peut changer l'objet signé par le bundle.
 */
export function parsePublishedAudioStorageLocation(
  canonicalPath: string,
): PublishedAudioStorageLocation | null {
  if (
    canonicalPath.length > 500 ||
    canonicalPath.includes("\\") ||
    canonicalPath.includes("\0") ||
    canonicalPath.includes("?") ||
    canonicalPath.includes("#") ||
    canonicalPath.startsWith("/") ||
    canonicalPath.endsWith("/")
  ) {
    return null;
  }
  const segments = canonicalPath.split("/");
  const bucket = segments.shift();
  if (
    bucket === undefined ||
    !BUCKET_PATTERN.test(bucket) ||
    segments.length === 0 ||
    segments.some(
      (segment) => segment === "" || segment === "." || segment === "..",
    )
  ) {
    return null;
  }
  return { bucket, objectPath: segments.join("/") };
}
