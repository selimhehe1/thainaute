import { describe, expect, it } from "vitest";

import {
  isMobileDevelopmentHttpHost,
  parseMobileNetworkUrl,
} from "../lib/mobile-network-url";

describe("politique URL réseau mobile", () => {
  it.each([
    "localhost",
    "127.0.0.1",
    "127.12.34.56",
    "[::1]",
    "10.0.2.2",
    "10.0.3.2",
    "10.255.0.4",
    "172.16.0.1",
    "172.31.255.254",
    "192.168.1.20",
  ])("reconnaît l’hôte local/LAN %s", (hostname) => {
    expect(isMobileDevelopmentHttpHost(hostname)).toBe(true);
  });

  it.each([
    "8.8.8.8",
    "169.254.1.1",
    "172.15.0.1",
    "172.32.0.1",
    "192.167.1.1",
    "api.local",
    "localhost.example.com",
  ])("refuse l’hôte HTTP publiquement routable ou DNS %s", (hostname) => {
    expect(isMobileDevelopmentHttpHost(hostname)).toBe(false);
  });

  it("autorise HTTPS dans tous les environnements", () => {
    expect(
      parseMobileNetworkUrl({
        development: false,
        kind: "api_origin",
        value: "https://api.thainaute.com/",
      }),
    ).toEqual({ success: true, url: "https://api.thainaute.com" });
  });

  it.each([
    "http://10.0.2.2:3000/",
    "http://10.0.3.2:3000/",
    "http://192.168.1.20:3000/",
    "http://172.20.10.2:3000/",
  ])("autorise l’origine LAN %s seulement en développement", (value) => {
    expect(
      parseMobileNetworkUrl({
        development: true,
        kind: "api_origin",
        value,
      }),
    ).toMatchObject({ success: true });
    expect(
      parseMobileNetworkUrl({
        development: false,
        kind: "api_origin",
        value,
      }),
    ).toEqual({ success: false, reason: "insecure_http" });
  });

  it("refuse HTTP public même en développement", () => {
    expect(
      parseMobileNetworkUrl({
        development: true,
        kind: "api_origin",
        value: "http://8.8.8.8:3000/",
      }),
    ).toEqual({ success: false, reason: "insecure_http" });
  });

  it("impose une origine nue mais permet le chemin opaque d’une ressource", () => {
    expect(
      parseMobileNetworkUrl({
        development: true,
        kind: "api_origin",
        value: "http://192.168.1.20:3000/api?token=x",
      }),
    ).toEqual({ success: false, reason: "invalid_url" });
    expect(
      parseMobileNetworkUrl({
        development: true,
        kind: "public_resource",
        value: "http://192.168.1.20:3000/api/v1/audio?id=opaque",
      }),
    ).toEqual({
      success: true,
      url: "http://192.168.1.20:3000/api/v1/audio?id=opaque",
    });
  });

  it.each([
    "https://user:secret@api.thainaute.com/",
    "https://api.thainaute.com/#fragment",
    "ftp://api.thainaute.com/file",
    "not-a-url",
  ])("refuse les formes URL ambiguës %s", (value) => {
    expect(
      parseMobileNetworkUrl({
        development: true,
        kind: "public_resource",
        value,
      }),
    ).toMatchObject({ success: false });
  });
});
