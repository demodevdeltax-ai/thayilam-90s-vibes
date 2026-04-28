import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Thayilam" },
      { name: "description", content: "Sign in or create an account to track orders and save favourites." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
    mode: s.mode === "signup" ? "signup" : ("login" as "login" | "signup"),
  }),
  component: AuthPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Name is too short").max(100),
});

function AuthPage() {
  const { redirect, mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already signed in, bounce away.
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate({ to: isAdmin ? "/admin" : (redirect as "/") });
    }
  }, [isAuthenticated, isAdmin, loading, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Welcome back!");
      } else {
        const parsed = signupSchema.safeParse({ email, password, fullName });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: parsed.data.fullName },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("That email is already registered. Try signing in.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Account created! Check your inbox to confirm your email.");
        setMode("login");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 paper grid place-items-center px-5 py-12 md:py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">— Welcome to Thayilam —</div>
            <h1 className="font-script text-5xl md:text-6xl text-rust leading-none">
              {mode === "login" ? "Come on in" : "Join the dabba"}
            </h1>
            <p className="text-brown/70 mt-3 text-sm">
              {mode === "login"
                ? "Sign in to track orders and save your favourites."
                : "Create an account to start ordering."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="paper-sand ink-border rounded-2xl p-6 md:p-8 space-y-4"
          >
            {mode === "signup" && (
              <Field label="Full name">
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                  className="auth-input"
                  placeholder="Lakshmi Raman"
                />
              </Field>
            )}
            <Field label="Email">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="auth-input"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
                className="auth-input"
                placeholder={mode === "login" ? "Your password" : "At least 6 characters"}
              />
            </Field>

            <Button type="submit" disabled={submitting} className="w-full mt-2" size="lg">
              {submitting
                ? "Just a moment…"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Button>

            <div className="text-center text-sm text-brown/70 pt-2">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-rust font-semibold hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-rust font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </form>

          <div className="text-center mt-6 text-xs text-brown/55">
            Are you an admin?{" "}
            <Link to="/admin/login" className="text-rust hover:underline">
              Use the admin sign in
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />

      <style>{`
        .auth-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid rgba(61,35,16,0.25);
          background: var(--cream, #FBF6EC);
          color: var(--brown, #3D2310);
          font-size: 14px;
          outline: none;
          transition: border-color .15s;
        }
        .auth-input:focus {
          border-color: var(--rust, #C4541A);
          box-shadow: 0 0 0 3px rgba(196,84,26,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
