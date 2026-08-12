import { describe, expect, it, vi } from "vitest";

import {
  getActiveMobileLanguagePack,
  getMobileDatabaseName,
} from "../lib/mobile-language-pack";

vi.mock("expo-constants", () => ({
  default: { expoConfig: undefined },
}));

describe("profil de langue mobile", () => {
  it("charge le pack thaï par défaut et conserve son nom de base historique", () => {
    expect(getActiveMobileLanguagePack().id).toBe("thai-fr");
    expect(getMobileDatabaseName("thai-fr")).toBe("thainaute-local.db");
  });

  it("isole les bases des futurs packs", () => {
    expect(getMobileDatabaseName("italian-fr")).toBe(
      "thainaute-local-italian-fr.db",
    );
  });
});
