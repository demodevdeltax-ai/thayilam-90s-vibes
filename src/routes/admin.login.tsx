import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin sign in — Thayilam" }] }),
  component: AdminLoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});
const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Name is too short").max(100),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading, refreshRole } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && isAdmin) navigate({ to: "/admin" });
  }, [isAuthenticated, isAdmin, loading, navigate]);

  async function handleLogin() {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isAdminAccount = roles?.some((r) => r.role === "admin");
    if (!isAdminAccount) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access.");
      return;
    }
    await refreshRole();
    toast.success("Welcome, admin.");
    navigate({ to: "/admin" });
  }

  async function handleSignup() {
    const parsed = signupSchema.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/login`,
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
    // If email confirmation is required, no session yet.
    if (!data.session) {
      toast.success("Account created. Check your inbox to confirm, then sign in.");
      setMode("login");
      return;
    }
    // Session exists — try to claim admin if this is the first admin.
    const { data: claimed, error: rpcError } = await supabase.rpc("claim_admin_if_first");
    if (rpcError) {
      toast.error(rpcError.message);
      return;
    }
    if (claimed) {
      await refreshRole();
      toast.success("Welcome — you are the first admin.");
      navigate({ to: "/admin" });
    } else {
      await supabase.auth.signOut();
      toast.error("An admin already exists. Ask them to grant you access.");
      setMode("login");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "login") await handleLogin();
      else await handleSignup();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 grid place-items-center mb-3">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {mode === "login" ? "Super admin sign in" : "Create admin account"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login"
              ? "Restricted area · Thayilam platform"
              : "Only the first signup becomes admin. Others must be invited."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm"
        >
          {mode === "signup" && (
            <label className="block">
              <span className="block text-xs font-medium text-slate-600 mb-1.5">Full name</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={100}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-sm"
                placeholder="Your name"
              />
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-sm"
              placeholder="admin@thayilam.in"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Password</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={72}
              className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-sm"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting
              ? "Just a moment…"
              : mode === "login"
                ? "Sign in"
                : "Create admin account"}
          </button>

          <div className="text-center text-xs text-slate-500 pt-1">
            {mode === "login" ? (
              <>
                No admin account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-slate-900 font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an admin account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-slate-900 font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        <div className="text-center mt-5 text-xs text-slate-500">
          Are you a customer?{" "}
          <Link to="/auth" className="text-slate-900 font-medium hover:underline">
            Customer sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
