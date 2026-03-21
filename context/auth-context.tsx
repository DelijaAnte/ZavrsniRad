import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/utils/supabase";

type DeleteAccountJson = { error?: string; ok?: boolean };

function parseDeleteAccountResponse(
  status: number,
  raw: string
): { ok: true } | { ok: false; message: string } {
  let json: DeleteAccountJson | null = null;
  if (raw) {
    try {
      json = JSON.parse(raw) as DeleteAccountJson;
    } catch {
      json = null;
    }
  }

  if (status === 404) {
    return {
      ok: false,
      message:
        "Delete-account function not found. Run: npx supabase functions deploy delete-account",
    };
  }

  if (status < 200 || status >= 300) {
    const fromJson = json?.error != null && String(json.error).trim() !== "";
    const message = fromJson
      ? String(json!.error).trim()
      : raw.trim()
        ? raw.trim().slice(0, 400)
        : `Request failed (HTTP ${status})`;
    return { ok: false, message };
  }

  if (json?.error != null && String(json.error).trim() !== "") {
    return { ok: false, message: String(json.error).trim() };
  }

  return { ok: true };
}

type AuthContextValue = {
  session: Session | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; session: Session | null }>;
  signOut: () => Promise<void>;
  /** Calls Edge Function `delete-account` (service role), then signs out locally. */
  deleteAccount: () => Promise<{ error: Error | null }>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return {
      error: error ? new Error(error.message) : null,
      session: data.session ?? null,
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    await supabase.auth.refreshSession().catch(() => {
      /* ignore; getSession may still have a usable token */
    });

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !sessionData.session) {
      return { error: new Error(sessionErr?.message ?? "Not signed in") };
    }

    const accessToken = sessionData.session.access_token;
    const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

    try {
      const res = await fetch(`${baseUrl}/functions/v1/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
        },
        body: "{}",
      });

      const raw = await res.text();
      const parsed = parseDeleteAccountResponse(res.status, raw);

      if (!parsed.ok) {
        return { error: new Error(parsed.message) };
      }

      await supabase.auth.signOut();
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Network error";
      return { error: new Error(message) };
    }
  }, []);

  const value = useMemo(
    () => ({ session, initialized, signIn, signUp, signOut, deleteAccount }),
    [session, initialized, signIn, signUp, signOut, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
