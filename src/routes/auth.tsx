import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppOtpForm } from "@/components/whatsapp-otp-form";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in with WhatsApp — Thayilam" },
      {
        name: "description",
        content:
          "Sign in or create your Thayilam account using a one-tap WhatsApp OTP. No passwords, no email — just your phone.",
      },
      { property: "og:title", content: "Sign in with WhatsApp — Thayilam" },
      {
        property: "og:description",
        content: "Sign in to Thayilam using a WhatsApp OTP. No passwords.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/",
    mode: s.mode === "signup" ? "signup" : ("login" as "login" | "signup"),
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect, mode } = Route.useSearch();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate({ to: isAdmin ? "/admin" : (redirect as "/") });
    }
  }, [isAuthenticated, isAdmin, loading, navigate, redirect]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 paper grid place-items-center px-5 py-12 md:py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
              — Welcome to Thayilam —
            </div>
            <h1 className="font-script text-5xl md:text-6xl text-rust leading-none">
              {mode === "login" ? "Come on in" : "Join the dabba"}
            </h1>
            <p className="text-brown/70 mt-3 text-sm">
              Sign in with a WhatsApp OTP — no passwords needed.
            </p>
          </div>

          <div className="paper-sand ink-border rounded-2xl p-6 md:p-8 text-brown">
            <WhatsAppOtpForm
              audience="customer"
              initialMode={mode}
              theme="cream"
              onAuthenticated={() => navigate({ to: redirect as "/" })}
            />
          </div>

          <div className="text-center mt-6 text-xs text-brown/55">
            Are you an admin?{" "}
            <Link to="/admin/login" className="text-rust hover:underline">
              Use the admin sign in
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
