import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim();

if (!rawUrl || !rawKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY. " +
      "Create a .env / .env.local in the project root (see Expo env docs) and restart the dev server."
  );
}

/** Normalized project URL (no trailing slash). Safe after module load. */
export const supabaseProjectUrl = rawUrl.replace(/\/$/, "");

/** Public anon key. Safe after module load. */
export const supabaseAnonKey = rawKey;

/**
 * Browser: persist session in localStorage.
 * SSR / Node (Expo Router web server render): no native AsyncStorage and often no localStorage —
 * use a no-op store so auth init does not touch the native bridge.
 * iOS / Android: AsyncStorage.
 */
const webAuthStorage = {
  getItem(key: string) {
    try {
      return Promise.resolve(globalThis.localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem(key: string, value: string) {
    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      /* private mode / quota */
    }
    return Promise.resolve();
  },
  removeItem(key: string) {
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  },
};

const ssrAuthStorage = {
  getItem: (_key: string) => Promise.resolve(null),
  setItem: (_key: string, _value: string) => Promise.resolve(),
  removeItem: (_key: string) => Promise.resolve(),
};

function hasBrowserLocalStorage(): boolean {
  try {
    return (
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      globalThis.localStorage != null &&
      typeof globalThis.localStorage.getItem === "function"
    );
  } catch {
    return false;
  }
}

function getAuthStorage() {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-async-storage/async-storage").default;
  }
  if (hasBrowserLocalStorage()) {
    return webAuthStorage;
  }
  return ssrAuthStorage;
}

const authStorage = getAuthStorage();

const isNativeApp = Platform.OS === "ios" || Platform.OS === "android";

export const supabase = createClient(supabaseProjectUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Native / browser: parse auth tokens from the URL when present (e.g. magic links).
    // SSR: leave off (no URL to parse).
    detectSessionInUrl: isNativeApp || hasBrowserLocalStorage(),
  },
});
