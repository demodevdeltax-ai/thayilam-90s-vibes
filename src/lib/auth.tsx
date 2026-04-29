// Mock WhatsApp OTP auth context (UI-only, no backend yet).
//
// State is persisted in localStorage so the user stays "signed in" across
// reloads. The same API surface as the previous Supabase-backed context is
// kept (isAuthenticated, isAdmin, signOut, ...) so existing route guards keep
// working without changes.
//
// You will wire your real WhatsApp Business API (WABA) calls inside:
//   - sendOtp(phone, intent)
//   - verifyOtp(phone, code, intent, profile?)
// from the `/auth` and `/admin/login` routes. For now, ANY 6-digit code is
// accepted by verifyOtp().

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "admin" | "customer";

export type MockUser = {
  id: string;
  phone: string;
  fullName: string;
  role: Role;
  createdAt: string;
};

type AuthCtx = {
  user: MockUser | null;
  role: Role | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (user: MockUser) => void;
  signOut: () => Promise<void>;
  // Kept for compatibility with old code paths.
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "thayilam.mockAuth.v1";

function readStored(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStored());
    setLoading(false);

    // Sync across tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUser(readStored());
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
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      }
      setUser(u);
    },
    signOut: async () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setUser(null);
    },
    refreshRole: async () => {
      setUser(readStored());
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}

// ---------------------------------------------------------------------------
// MOCK WhatsApp OTP helpers — replace these with real WABA calls later.
// Both functions resolve after a small delay so the UI feels real.
// ---------------------------------------------------------------------------

export type OtpIntent = "customer-login" | "customer-signup" | "admin-login" | "admin-signup";

export async function sendOtp(phone: string, _intent: OtpIntent): Promise<void> {
  // TODO: POST to your WABA endpoint to dispatch the OTP via WhatsApp.
  await new Promise((r) => setTimeout(r, 600));
  // For dev convenience, log the "code" the user should type.
  // In production, remove this — the real OTP arrives over WhatsApp.
  // eslint-disable-next-line no-console
  console.info(`[mock OTP] sent to ${phone}. Use any 6-digit code (e.g. 123456) to verify.`);
}

export async function verifyOtp(
  phone: string,
  code: string,
  intent: OtpIntent,
  profile?: { fullName: string },
): Promise<MockUser> {
  await new Promise((r) => setTimeout(r, 500));
  if (!/^\d{6}$/.test(code)) {
    throw new Error("Enter the 6-digit code we sent on WhatsApp.");
  }
  const role: Role = intent.startsWith("admin") ? "admin" : "customer";
  const fullName = profile?.fullName?.trim() || (role === "admin" ? "Admin" : "Guest");
  const user: MockUser = {
    id: `${role}-${phone}`,
    phone,
    fullName,
    role,
    createdAt: new Date().toISOString(),
  };
  return user;
}

// Lightweight phone validator — accepts +country code with 8-15 digits, or a
// 10-digit local number which we treat as IN (+91).
export function normalizePhone(input: string): string | null {
  const trimmed = input.replace(/[\s\-()]/g, "");
  if (/^\+\d{8,15}$/.test(trimmed)) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  return null;
}
