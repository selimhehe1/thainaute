// À QUI appartient le journal des tentatives d'une leçon réelle ?
//
// Pourquoi ce test existe
// -----------------------
// Le lecteur ouvrait son magasin sans propriétaire, donc avec le défaut
// `ANONYMOUS_ATTEMPT_OUTBOX_OWNER`. Conséquence mesurée : même connecté,
// l'apprenant qui suivait une vraie leçon produisait de la progression
// ANONYME, écrite dans la clé `attempts-v1` et non `attempts-v1:account:<id>`.
//
// Cette progression n'était alors remontée que par le chemin de FUSION, donc
// par le bouton « Fusionner et synchroniser », et jamais par la
// synchronisation ordinaire. Un apprenant déjà connecté pouvait travailler
// une heure sans que rien ne parte.
//
// Le défaut était invisible : l'écran affichait la bonne progression, lue
// localement. Seul le propriétaire du magasin était faux. Ce test regarde
// donc le propriétaire, pas le rendu.

import { readFiveMechanicsFixtureBundle } from "@thainaute/content";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExpeditionExperience } from "../app/learn/demo/expedition-experience";

const magasins: { nom: string | undefined; proprietaire: unknown }[] = [];

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("../lib/client/attempt-outbox-store", async () => {
  const reel = await vi.importActual<
    typeof import("../lib/client/attempt-outbox-store")
  >("../lib/client/attempt-outbox-store");
  return {
    ...reel,
    WebAttemptOutboxStore: class {
      constructor(nom?: string, proprietaire?: unknown) {
        magasins.push({ nom, proprietaire });
      }
      close(): void {}
    },
  };
});

/** Session simulée, pilotée test par test. */
let sessionCourante: {
  status: string;
  session: { user: { id: string } } | null;
  sessionBoundaryRevision: number;
} = { status: "signed_out", session: null, sessionBoundaryRevision: 0 };

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => sessionCourante,
  WebAuthSessionProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

const { lesson } = readFiveMechanicsFixtureBundle();

function monter(attemptStorage: "demo" | "learning") {
  render(
    <ExpeditionExperience lesson={lesson} attemptStorage={attemptStorage} />,
  );
}

beforeEach(() => {
  // Le lecteur lit `prefers-reduced-motion` au montage ; jsdom ne fournit pas
  // `matchMedia`. On rend une requête inerte, ce test ne portant pas sur le
  // mouvement.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  magasins.length = 0;
  sessionCourante = {
    status: "signed_out",
    session: null,
    sessionBoundaryRevision: 0,
  };
});

afterEach(() => {
  cleanup();
});

describe("propriétaire du journal des tentatives", () => {
  it("une leçon réelle suivie par un apprenant connecté écrit dans SON compte", async () => {
    sessionCourante = {
      status: "signed_in",
      session: { user: { id: "11111111-1111-4111-8111-111111111111" } },
      sessionBoundaryRevision: 1,
    };

    await monter("learning");

    expect(magasins[0]?.nom).toBe("thainaute-learning-v1");
    expect(
      magasins[0]?.proprietaire,
      "sans propriétaire de compte, la progression reste anonyme et n'est remontée que par la fusion",
    ).toEqual({
      kind: "account",
      userId: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("une leçon réelle suivie sans compte reste anonyme", async () => {
    await monter("learning");

    expect(magasins[0]?.nom).toBe("thainaute-learning-v1");
    expect(magasins[0]?.proprietaire).toBeUndefined();
  });

  it("la démonstration reste anonyme même connecté", async () => {
    sessionCourante = {
      status: "signed_in",
      session: { user: { id: "22222222-2222-4222-8222-222222222222" } },
      sessionBoundaryRevision: 1,
    };

    await monter("demo");

    // Les tentatives de la démonstration portent sur une fixture : les verser
    // dans un compte polluerait une progression réelle.
    expect(magasins[0]?.nom).toBe("thainaute-demo-v1");
    expect(magasins[0]?.proprietaire).toBeUndefined();
  });
});
