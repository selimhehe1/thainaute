import { describe, expect, it, vi } from "vitest";

import { readAndDestroyPrivateHandoffFile } from "../e2e/connected-mobile-handoff-file";

describe("fichier privé du handoff mobile", () => {
  it("préserve l'échec de lecture et signale aussi un cleanup impossible", () => {
    const remove = vi.fn(() => {
      throw new Error("chemin et détail cleanup interdits");
    });
    let failure: unknown;
    try {
      readAndDestroyPrivateHandoffFile("chemin-interdit", 2_048, {
        io: {
          read: () => {
            throw new Error("contenu secret interdit");
          },
          remove,
          stat: () => ({ isFile: () => true, mode: 0o600, size: 12 }),
        },
        platform: "linux",
      });
    } catch (error) {
      failure = error;
    }

    expect(remove).toHaveBeenCalledOnce();
    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toBe(
      "Le fichier de transfert privé est invalide. Le fichier de transfert n'a pas pu être détruit.",
    );
    expect((failure as Error).cause).toBeInstanceOf(Error);
    expect((failure as Error).message).not.toContain("chemin-interdit");
    expect((failure as Error).message).not.toContain("contenu secret");
    expect((failure as Error).message).not.toContain("détail cleanup");
  });

  it("retourne les octets lus seulement après suppression réussie", () => {
    const remove = vi.fn();
    expect(
      readAndDestroyPrivateHandoffFile("privé", 2_048, {
        io: {
          read: () => '{"schemaVersion":1}',
          remove,
          stat: () => ({ isFile: () => true, mode: 0o600, size: 19 }),
        },
        platform: "linux",
      }),
    ).toBe('{"schemaVersion":1}');
    expect(remove).toHaveBeenCalledOnce();
  });
});
