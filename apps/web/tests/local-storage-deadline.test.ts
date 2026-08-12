import { describe, expect, it, vi } from "vitest";

import {
  LocalStorageDeadlineError,
  withLocalStorageDeadline,
} from "../lib/client/local-storage-deadline";

describe("échéance du stockage local", () => {
  it("rend une opération rapide sans attendre l'échéance", async () => {
    await expect(
      withLocalStorageDeadline(Promise.resolve("prêt"), 100),
    ).resolves.toBe("prêt");
  });

  it("rejette une ouverture IndexedDB qui ne répond plus", async () => {
    vi.useFakeTimers();
    try {
      const close = vi.fn();
      const pending = withLocalStorageDeadline(
        new Promise<never>(() => undefined),
        250,
        close,
      );
      const rejection = expect(pending).rejects.toBeInstanceOf(
        LocalStorageDeadlineError,
      );

      await vi.advanceTimersByTimeAsync(250);
      await rejection;
      expect(close).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it("refuse une échéance non positive", async () => {
    await expect(
      withLocalStorageDeadline(Promise.resolve("ignoré"), 0),
    ).rejects.toBeInstanceOf(RangeError);
  });
});
