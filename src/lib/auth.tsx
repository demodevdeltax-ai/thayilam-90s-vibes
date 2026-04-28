// Lightweight auth context: tracks Supabase session + the user's role.
// We expose isAdmin / isCustomer so route guards can react synchronously.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "customer" | null;

type AuthCtx = {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

async function fetchRole(userId: string): Promise<Role> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!data || data.length === 0) return "customer";
  // Admin wins if multiple
  if (data.some((r) => r.role === "admin")) return "admin";
  return "customer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Subscribe FIRST (per Supabase guidance) so the listener catches the initial event.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Defer role fetch to avoid deadlocks inside the auth callback.
        setTimeout(() => {
          fetchRole(newSession.user.id).then(setRole);
        }, 0);
      } else {
        setRole(null);
      }
    });

    // 2. Then read the existing session.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchRole(data.session.user.id).then((r) => {
          setRole(r);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthCtx = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    isAdmin: role === "admin",
    isAuthenticated: !!session,
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refreshRole: async () => {
      if (session?.user) {
        const r = await fetchRole(session.user.id);
        setRole(r);
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
