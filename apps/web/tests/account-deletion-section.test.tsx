import { SyncHttpApiError, type AccountDeletionReceipt } from "@thainaute/sync";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
  idempotency: "20000000-0000-4000-8000-000000000001",
  receipt: "30000000-0000-4000-8000-000000000001",
} as const;

const pending = {
  format: "thainaute.web-account-deletion-operation/v1",
  expectedUserId: ids.userA,
  idempotencyKey: ids.idempotency,
  continuationSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
} as const;

const receipt: AccountDeletionReceipt = {
  format: "thainaute.account-deletion-receipt/v1",
  receiptId: ids.receipt,
  completedAt: "2026-08-02T10:00:00.000Z",
  deleted: true,
};

const mocks = vi.hoisted(() => ({
  auth: {
    clearDeletedSession: vi.fn(),
    requestAccountDeletionCode: vi.fn(),
    session: null as { user: { id: string } } | null,
    sessionBoundaryRevision: 0,
    verifyAccountDeletionCode: vi.fn(),
  },
  complete: vi.fn(),
  create: vi.fn(),
  isTombstoned: vi.fn(),
  read: vi.fn(),
}));

vi.mock("../lib/client/auth-session", () => ({
  useWebAuthSession: () => mocks.auth,
}));

vi.mock("../lib/client/account-deletion", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../lib/client/account-deletion")>();
  return {
    ...actual,
    completePendingWebAccountDeletion: mocks.complete,
    createPendingWebAccountDeletion: mocks.create,
    isDeletedWebAccountTombstoned: mocks.isTombstoned,
    readPendingWebAccountDeletion: mocks.read,
  };
});

import {
  WEB_ACCOUNT_DELETION_STORAGE_KEY,
  WebAccountDeletionCorruptStateError,
  WebAccountDeletionLocalStateError,
} from "../lib/client/account-deletion";
import { AccountDeletionSection } from "../app/account/account-deletion-section";

function signedIn(userId: string = ids.userA) {
  mocks.auth.session = { user: { id: userId } };
}

describe("suppression de compte web", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.session = null;
    mocks.auth.sessionBoundaryRevision = 0;
    mocks.read.mockReturnValue(null);
    mocks.isTombstoned.mockResolvedValue(true);
    mocks.create.mockReturnValue(pending);
    mocks.auth.clearDeletedSession.mockResolvedValue(undefined);
    mocks.auth.requestAccountDeletionCode.mockResolvedValue(undefined);
    mocks.auth.verifyAccountDeletionCode.mockResolvedValue(undefined);
    mocks.complete.mockImplementation(
      async ({
        clearDeletedSession,
      }: {
        clearDeletedSession: (id: string) => Promise<void>;
      }) => {
        await clearDeletedSession(ids.userA);
        return receipt;
      },
    );
  });

  it("exige deux confirmations explicites puis un OTP avant la commande", async () => {
    const analytics = { capture: vi.fn() };
    mocks.create.mockImplementationOnce(
      (_userId: string, options: { readonly onCreated?: () => void }) => {
        options.onCreated?.();
        return pending;
      },
    );
    signedIn();
    render(
      <AccountDeletionSection
        analytics={analytics}
        expectedUserId={ids.userA}
      />,
    );

    const requestButton = await screen.findByRole("button", {
      name: "Recevoir le code de suppression",
    });
    expect(requestButton).toBeDisabled();
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Je comprends que cette suppression est irr\u00e9versible.",
      }),
    );
    fireEvent.change(
      screen.getByLabelText(/Saisissez SUPPRIMER pour confirmer/u),
      { target: { value: "SUPPRIMER" } },
    );
    expect(requestButton).toBeEnabled();
    fireEvent.click(requestButton);

    await waitFor(() =>
      expect(mocks.auth.requestAccountDeletionCode).toHaveBeenCalledWith(
        ids.userA,
      ),
    );
    const codeInput = await screen.findByLabelText(
      "Code \u00e0 six chiffres re\u00e7u par email",
    );
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Supprimer d\u00e9finitivement mon compte",
      }),
    );

    await waitFor(() =>
      expect(mocks.auth.verifyAccountDeletionCode).toHaveBeenCalledWith(
        ids.userA,
        "123456",
      ),
    );
    expect(mocks.create).toHaveBeenCalledWith(
      ids.userA,
      expect.objectContaining({ onCreated: expect.any(Function) }),
    );
    expect(analytics.capture).toHaveBeenCalledOnce();
    expect(analytics.capture).toHaveBeenCalledWith({
      name: "account_deletion_requested",
      platform: "web",
    });
    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Votre compte a \u00e9t\u00e9 supprim\u00e9",
    );
  });

  it("reprend automatiquement sans session et n'affiche jamais le secret", async () => {
    mocks.read.mockReturnValue(pending);
    render(<AccountDeletionSection expectedUserId={null} />);

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(mocks.auth.clearDeletedSession).toHaveBeenCalledWith(ids.userA);
    expect(
      screen.queryByText(pending.continuationSecret),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "La suppression en attente a \u00e9t\u00e9 termin\u00e9e",
    );
  });

  it("reprend A pendant une session B sans demander de deconnecter B", async () => {
    signedIn(ids.userB);
    mocks.read.mockReturnValue(pending);
    render(<AccountDeletionSection expectedUserId={ids.userB} />);

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledTimes(1));
    expect(mocks.auth.clearDeletedSession).toHaveBeenCalledWith(ids.userA);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Le compte actuellement connect\u00e9 n'a pas \u00e9t\u00e9 d\u00e9connect\u00e9",
    );
  });

  it.each([
    {
      code: "reauthentication_required" as const,
      status: 403,
      expected: "Reconnectez le m\u00eame compte",
      button: "Recevoir un nouveau code",
    },
    {
      code: "unauthorized" as const,
      status: 401,
      expected: "Reconnectez le m\u00eame compte",
      button: "Recevoir un nouveau code",
    },
    {
      code: "deletion_in_progress" as const,
      status: 409,
      expected: "La suppression est encore en cours",
      button: "Reprendre la m\u00eame demande",
    },
    {
      code: "idempotency_key_reused" as const,
      status: 409,
      expected: "ses identifiants ne correspondent plus",
      button: null,
    },
    {
      code: "database_unavailable" as const,
      status: 503,
      expected: "momentan\u00e9ment indisponible",
      button: "Reprendre la m\u00eame demande",
    },
  ])(
    "traite l'erreur $status/$code sans perdre la reprise",
    async (scenario) => {
      signedIn();
      mocks.read.mockReturnValue(pending);
      mocks.complete.mockRejectedValue(
        new SyncHttpApiError({
          endpoint: "account_deletion",
          status: scenario.status,
          code: scenario.code,
        }),
      );
      render(<AccountDeletionSection expectedUserId={ids.userA} />);

      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(scenario.expected),
      );
      if (scenario.button === null) {
        expect(
          screen.queryByRole("button", {
            name: "Reprendre la m\u00eame demande",
          }),
        ).not.toBeInTheDocument();
      } else {
        expect(
          screen.getByRole("button", { name: scenario.button }),
        ).toBeEnabled();
      }
    },
  );

  it("propose une reprise apres un echec de purge locale", async () => {
    signedIn();
    mocks.read.mockReturnValue(pending);
    mocks.complete.mockRejectedValue(
      new WebAccountDeletionLocalStateError("purge failed"),
    );
    render(<AccountDeletionSection expectedUserId={ids.userA} />);

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "La reprise ou la purge locale n'a pas abouti",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Reprendre la m\u00eame demande" }),
    ).toBeEnabled();
  });

  it("refl\u00e8te la fin de suppression effectu\u00e9e dans un autre onglet", async () => {
    signedIn();
    mocks.read.mockReturnValue(pending);
    mocks.complete.mockRejectedValue(new Error("offline"));
    render(<AccountDeletionSection expectedUserId={ids.userA} />);

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledOnce());
    mocks.read.mockReturnValue(null);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: WEB_ACCOUNT_DELETION_STORAGE_KEY,
        newValue: null,
      }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "termin\u00e9e dans un autre onglet",
    );
    expect(mocks.isTombstoned).toHaveBeenCalledWith(ids.userA);
  });

  it("n'annonce jamais un succ\u00e8s distant sans tombstone", async () => {
    signedIn();
    mocks.read.mockReturnValue(pending);
    mocks.complete.mockRejectedValue(new Error("offline"));
    mocks.isTombstoned.mockResolvedValue(false);
    render(<AccountDeletionSection expectedUserId={ids.userA} />);

    await waitFor(() => expect(mocks.complete).toHaveBeenCalledOnce());
    mocks.read.mockReturnValue(null);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: WEB_ACCOUNT_DELETION_STORAGE_KEY,
        newValue: null,
      }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "sans preuve de suppression ni de purge",
    );
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "termin\u00e9e dans un autre onglet",
    );
  });

  it("conserve et bloque une opération locale illisible sans boucle de retry", async () => {
    mocks.read.mockImplementation(() => {
      throw new WebAccountDeletionCorruptStateError();
    });
    render(<AccountDeletionSection expectedUserId={null} />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "La reprise locale est illisible",
    );
    expect(
      screen.queryByRole("button", { name: "Reprendre la même demande" }),
    ).not.toBeInTheDocument();
  });
});
