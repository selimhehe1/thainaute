// La progression part-elle sans qu'on clique ?
//
// Pourquoi ce test existe
// -----------------------
// La synchronisation de la progression n'avait AUCUN déclenchement
// automatique : elle ne partait que par deux boutons de l'écran Compte. Un
// apprenant pouvait finir plusieurs leçons, fermer l'onglet, et n'avoir
// jamais rien envoyé, sans le moindre signal à l'écran.
//
// Ce test vérifie les quatre garanties du déclencheur : il part quand il y a
// quelque chose à envoyer, il se tait quand il n'y a rien, il refuse de
// partir hors ligne ou pendant une suppression de compte, et deux
// déclencheurs simultanés ne produisent qu'une seule passe.

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const synchronizeWebAccount = vi.fn(() => Promise.resolve({}));
let etatLocal = {
  accountSnapshot: {
    entries: [] as { status: string }[],
    inFlight: null as unknown,
  },
};
let suppressionEnCours: unknown = null;

vi.mock("../lib/client/account-sync", () => ({
  synchronizeWebAccount,
  readWebAccountLocalState: () => Promise.resolve(etatLocal),
}));

vi.mock("../lib/client/account-deletion", () => ({
  WEB_ACCOUNT_DELETION_STORAGE_KEY: "deletion-key",
  readPendingWebAccountDeletion: () => suppressionEnCours,
}));

let sessionCourante: {
  status: string;
  session: { user: { id: string } } | null;
  sessionBoundaryRevision: number;
} = { status: "signed_out", session: null, sessionBoundaryRevision: 0 };

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => sessionCourante,
}));

const { WebAttemptSyncBootstrap } =
  await import("../lib/client/attempt-sync-bootstrap");

const UTILISATEUR = "33333333-3333-4333-8333-333333333333";

function connecte() {
  sessionCourante = {
    status: "signed_in",
    session: { user: { id: UTILISATEUR } },
    sessionBoundaryRevision: 1,
  };
}

function avecUneTentativeEnAttente() {
  etatLocal = {
    accountSnapshot: { entries: [{ status: "pending" }], inFlight: null },
  };
}

function monter() {
  return render(<WebAttemptSyncBootstrap />);
}

beforeEach(() => {
  synchronizeWebAccount.mockReset();
  synchronizeWebAccount.mockResolvedValue({});
  sessionCourante = {
    status: "signed_out",
    session: null,
    sessionBoundaryRevision: 0,
  };
  etatLocal = { accountSnapshot: { entries: [], inFlight: null } };
  suppressionEnCours = null;
  Object.defineProperty(navigator, "onLine", {
    value: true,
    configurable: true,
  });
});

afterEach(cleanup);

describe("reprise automatique de la synchronisation", () => {
  it("envoie sans qu'on clique quand une tentative attend", async () => {
    connecte();
    avecUneTentativeEnAttente();

    monter();

    await waitFor(() => {
      expect(synchronizeWebAccount).toHaveBeenCalledWith({
        userId: UTILISATEUR,
        // Jamais de fusion automatique : verser une progression anonyme dans
        // un compte reste une décision de l'apprenant.
        startAnonymousFusion: false,
      });
    });
  });

  it("ne part pas en réseau quand il n'y a rien à envoyer", async () => {
    connecte();

    monter();

    // Sans ce contrôle, chaque retour d'onglet déclencherait un
    // enregistrement d'appareil et un instantané de progression pour rien.
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(synchronizeWebAccount).not.toHaveBeenCalled();
  });

  it("se tait hors ligne, puis part au retour du réseau", async () => {
    connecte();
    avecUneTentativeEnAttente();
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    monter();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(synchronizeWebAccount).not.toHaveBeenCalled();

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    window.dispatchEvent(new Event("online"));

    await waitFor(() => expect(synchronizeWebAccount).toHaveBeenCalledTimes(1));
  });

  it("laisse la priorité à une suppression de compte en cours", async () => {
    connecte();
    avecUneTentativeEnAttente();
    suppressionEnCours = { userId: UTILISATEUR };

    monter();

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(synchronizeWebAccount).not.toHaveBeenCalled();
  });

  it("ne fait rien sans compte connecté", async () => {
    avecUneTentativeEnAttente();

    monter();

    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(synchronizeWebAccount).not.toHaveBeenCalled();
  });

  it("deux déclencheurs simultanés ne produisent qu'une seule passe", async () => {
    connecte();
    avecUneTentativeEnAttente();
    let resoudre: (() => void) | undefined;
    synchronizeWebAccount.mockImplementation(
      () =>
        new Promise<Record<string, never>>((resolve) => {
          resoudre = () => resolve({});
        }),
    );

    monter();
    window.dispatchEvent(new Event("online"));
    window.dispatchEvent(new Event("online"));

    await waitFor(() => expect(synchronizeWebAccount).toHaveBeenCalled());
    expect(synchronizeWebAccount).toHaveBeenCalledTimes(1);
    resoudre?.();
  });
});
