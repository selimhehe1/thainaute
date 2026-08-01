import "react-native-url-polyfill/auto";

import {
  createClient,
  processLock,
  type SupabaseClient,
} from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

import { createChunkedSecureSessionStorage } from "./secure-session-storage";

export interface MobileSupabaseConfiguration {
  readonly url: string;
  readonly publishableKey: string;
}

let mobileClient: SupabaseClient | undefined;

export function readMobileSupabaseConfiguration(): MobileSupabaseConfiguration | null {
  const urlInput = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const keyInput = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (urlInput === undefined || keyInput === undefined) return null;

  try {
    const url = new URL(urlInput);
    const developmentHttp =
      process.env.NODE_ENV !== "production" && url.protocol === "http:";
    const key = keyInput.trim();
    if (
      (url.protocol !== "https:" && !developmentHttp) ||
      url.username !== "" ||
      url.password !== "" ||
      key.length < 20 ||
      /\s/u.test(key) ||
      key.startsWith("sb_secret_")
    ) {
      return null;
    }
    return { url: url.origin, publishableKey: key };
  } catch {
    return null;
  }
}

const secureSessionStorage = createChunkedSecureSessionStorage({
  getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  removeItem(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },
  setItem(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
});

/** Session chiffrée par le trousseau natif, distincte de la base d’apprentissage. */
export function getMobileSupabaseAuthClient(): SupabaseClient | null {
  const configuration = readMobileSupabaseConfiguration();
  if (configuration === null) return null;

  mobileClient ??= createClient(
    configuration.url,
    configuration.publishableKey,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        lock: processLock,
        persistSession: true,
        storage: secureSessionStorage,
      },
    },
  );
  return mobileClient;
}
