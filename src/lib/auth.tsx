import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Role = "admin" | "customer";

export type LocalUser = {
  id: string;
  phone: string;
  full_name: string;
  role: Role;
  email: string;
};

type AuthCtx = {
  user: LocalUser | null;
  role: Role | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (user: LocalUser) => void;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
};

// ─────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────

const SESSION_KEY = "thayilam_user";

export function getLocalSession(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(user: LocalUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearLocalSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getLocalSession());
    setLoading(false);

    // Sync state across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        setUser(getLocalSession());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value: AuthCtx = {
    user,
    role: user?.role ?? null,
    loading,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,

    signIn: (u) => {
      setLocalSession(u);
      setUser(u);
    },

    signOut: async () => {
      clearLocalSession();
      setUser(null);
    },

    refreshRole: async () => {
      const stored = getLocalSession();
      if (!stored) return;

      // Re-fetch role from DB in case it changed
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", stored.id)
        .maybeSingle();

      if (roleRow?.role) {
        const updated: LocalUser = {
          ...stored,
          role: roleRow.role as Role,
        };
        setLocalSession(updated);
        setUser(updated);
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

// ─────────────────────────────────────────────────────────────
// Phone normalizer
// ─────────────────────────────────────────────────────────────

export function normalizePhone(input: string): string | null {
  const trimmed = input.replace(/[\s\-()]/g, "");
  if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  return null;
}