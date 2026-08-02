export type MobileNetworkUrlKind = "api_origin" | "public_resource";

export type MobileNetworkUrlResult =
  | { readonly success: true; readonly url: string }
  | {
      readonly success: false;
      readonly reason: "insecure_http" | "invalid_url";
    };

function parseIpv4(hostname: string): readonly number[] | null {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)) return null;
  const octets = hostname.split(".").map(Number);
  return octets.length === 4 && octets.every((octet) => octet <= 255)
    ? octets
    : null;
}

/** Hôtes sans routage public admis uniquement par un bundle de développement. */
export function isMobileDevelopmentHttpHost(hostnameInput: string): boolean {
  const hostname = hostnameInput.toLowerCase();
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const octets = parseIpv4(hostname);
  if (octets === null) return false;
  const first = octets[0];
  const second = octets[1];
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second !== undefined && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

/**
 * Politique réseau commune au contenu connecté mobile. HTTPS reste obligatoire
 * hors développement; le HTTP dev est borné à loopback, aux alias émulateur
 * (dans 10/8) et aux plages LAN RFC1918.
 */
export function parseMobileNetworkUrl(input: {
  readonly development: boolean;
  readonly kind: MobileNetworkUrlKind;
  readonly value: string;
}): MobileNetworkUrlResult {
  let url: URL;
  try {
    url = new URL(input.value.trim());
  } catch {
    return { success: false, reason: "invalid_url" };
  }
  if (
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== "" ||
    (url.protocol !== "https:" && url.protocol !== "http:")
  ) {
    return { success: false, reason: "invalid_url" };
  }
  if (
    url.protocol === "http:" &&
    (!input.development || !isMobileDevelopmentHttpHost(url.hostname))
  ) {
    return { success: false, reason: "insecure_http" };
  }
  if (
    input.kind === "api_origin" &&
    (url.pathname !== "/" || url.search !== "")
  ) {
    return { success: false, reason: "invalid_url" };
  }
  return {
    success: true,
    url: input.kind === "api_origin" ? url.origin : url.href,
  };
}
