import { Link, useNavigate, useSearch } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// phone.email global callback
// ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    phoneEmailListener?: (userObj: {
      user_json_url: string;
    }) => void;
  }
}

// ─────────────────────────────────────────────────────────────
// Session helpers — no Supabase auth, just localStorage
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toE164(countryCode: string, localNumber: string): string {
  const cc = countryCode.replace(/\D/g, "");
  const ln = localNumber.replace(/\D/g, "");
  return `+${cc}${ln}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ─────────────────────────────────────────────────────────────
// Step state
// ─────────────────────────────────────────────────────────────

type Step =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "signup_form"; phone: string }
  | { kind: "error"; message: string };

// ─────────────────────────────────────────────────────────────
// phone.email button
// ─────────────────────────────────────────────────────────────

function PhoneEmailButton({
  onVerified,
}: {
  onVerified: (userJsonUrl: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onVerified);

  callbackRef.current = onVerified;

  useEffect(() => {
    window.phoneEmailListener = (userObj) => {
      callbackRef.current(userObj.user_json_url);
    };

    return () => {
      delete window.phoneEmailListener;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = `
      <div 
        class="pe_signin_button" 
        data-client-id="11592384052900299448">
      </div>
    `;

    if (
      !document.querySelector(
        'script[src="https://www.phone.email/sign_in_button_v1.js"]'
      )
    ) {
      const s = document.createElement("script");
      s.src = "https://www.phone.email/sign_in_button_v1.js";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <>
      <style>{`
        .pe_signin_button a,
        .pe_signin_button button,
        .pe_signin_button > div,
        .pe_signin_button [class*="btn"],
        .pe_signin_button [class*="button"],
        .pe_signin_button [class*="sign"] {
          background-color: #B91C1C !important;
          border-color: #B91C1C !important;
          color: #fff !important;
        }
        .pe_signin_button a:hover,
        .pe_signin_button button:hover {
          background-color: #991B1B !important;
          border-color: #991B1B !important;
        }
      `}</style>
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Head
// ─────────────────────────────────────────────────────────────

function RouteHead() {
  return (
    <Helmet>
      <title>Sign in — Thayilam</title>
      <meta
        name="description"
        content="Login or create your Thayilam account using your verified phone number."
      />
      <meta name="robots" content="noindex" />
    </Helmet>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

function AuthPage() {
  const sp = useSearch<{ redirect?: string }>();
  const redirect = sp.redirect || "/";
  const navigate = useNavigate();

  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // ───────────────────────────────────────────────────────────
  // Redirect if already logged in
  // ───────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem("thayilam_user");
    if (!stored) return;
    const user = JSON.parse(stored);
    navigate({
      to: user.role === "admin" ? "/admin" : (redirect as "/"),
    });
  }, [navigate, redirect]);
  // ───────────────────────────────────────────────────────────
  // Handle phone.email verification
  // ───────────────────────────────────────────────────────────

  const handleVerified = async (userJsonUrl: string) => {
    setStep({ kind: "loading", message: "Verifying your number..." });

    try {
      // Validate source
      const parsed = new URL(userJsonUrl);
      if (parsed.hostname !== "user.phone.email") {
        throw new Error("Invalid verification source.");
      }

      // Fetch verified user info
      const res = await fetch(userJsonUrl);
      if (!res.ok) throw new Error("Failed to fetch verified number.");

      const data: {
        user_country_code: string;
        user_phone_number: string;
      } = await res.json();

      const phone = toE164(data.user_country_code, data.user_phone_number);

      // Check existing profile by phone (no role column here)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("phone", phone)
        .maybeSingle();

      if (profileError) throw profileError;

      // ─────────────────────────────────────────────────────
      // Existing user → fetch role then set session
      // ─────────────────────────────────────────────────────

      if (profile) {
        setStep({ kind: "loading", message: "Signing you in..." });

        const { data: roleRow, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .maybeSingle();

        if (roleError) throw roleError;

        const role = (roleRow?.role as "customer" | "admin") ?? "customer";

        signIn({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          role,
        });

        navigate({
          to: role === "admin" ? "/admin" : (redirect as "/"),
        });
        return;
      }

      // ─────────────────────────────────────────────────────
      // New user → show signup form
      // ─────────────────────────────────────────────────────

      setStep({ kind: "signup_form", phone });

    } catch (err: unknown) {
      setStep({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // Create account
  // ───────────────────────────────────────────────────────────

  const handleCreateAccount = async () => {
    if (step.kind !== "signup_form") return;

    const phone = step.phone;

    try {
      if (!fullName.trim()) throw new Error("Please enter your full name.");
      if (!email.trim()) throw new Error("Please enter your email.");
      if (!isValidEmail(email.trim())) {
        throw new Error("Please enter a valid email address.");
      }

      setStep({ kind: "loading", message: "Creating your account..." });

      // Check email not already taken
      const { data: emailCheck, error: emailCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.trim())
        .maybeSingle();

      if (emailCheckError) throw emailCheckError;

      if (emailCheck) {
        throw new Error(
          "An account with this email already exists. Please use a different email."
        );
      }

      // Generate UUID as profile id — no Supabase auth user needed
      const id = crypto.randomUUID();

      // Insert profile (no role column)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id,
          full_name: fullName.trim(),
          email: email.trim(),
          phone,
        });

      if (profileError) {
        if ((profileError as { code?: string }).code === "23505") {
          throw new Error(
            "An account with this phone or email already exists."
          );
        }
        throw profileError;
      }

      // Insert default role into user_roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: id, role: "customer" });

      if (roleError) throw roleError;

      // Set local session
      signIn({
        id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone,
        role: "customer",
      });

      navigate({ to: redirect as "/" });

    } catch (err: unknown) {
      setStep({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Failed to create account.",
      });
    }
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <>
      <RouteHead />

      <div className="min-h-screen flex flex-col">
        <SiteHeader />

        <main className="flex-1 paper grid place-items-center px-5 py-12 md:py-20">
          <div className="w-full max-w-md">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2 font-bold">
                — Welcome to Thayilam —
              </div>

              <h1 className="font-script text-5xl md:text-6xl text-rust leading-none">
                Come on in
              </h1>

              <p className="text-brown/70 mt-3 text-sm">
                Continue with your verified phone number.
              </p>
            </div>

            {/* Card */}
            <div className="paper-sand ink-border rounded-2xl p-6 md:p-8 text-brown">

              {/* Loading */}
              {step.kind === "loading" && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="w-6 h-6 border-2 border-rust border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-brown/60">{step.message}</p>
                </div>
              )}

              {/* Idle */}
              {step.kind === "idle" && (
                <div className="flex flex-col items-center gap-5">
                  <p className="text-xs text-brown/55 text-center">
                    Verify your phone number to continue.
                  </p>
                  <PhoneEmailButton onVerified={handleVerified} />
                </div>
              )}

              {/* Signup Form */}
              {step.kind === "signup_form" && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      Create your account
                    </h2>
                    <p className="text-sm text-brown/60 mt-1">
                      Your number has been verified successfully.
                    </p>
                  </div>

                  <div className="space-y-4">

                    {/* Phone (read-only) */}
                    <div>
                      <label className="block text-sm mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={step.phone}
                        disabled
                        className="w-full rounded-xl border px-4 py-3 bg-brown/5 text-brown"
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border px-4 py-3 outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border px-4 py-3 outline-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleCreateAccount}
                      className="w-full bg-rust text-cream rounded-xl py-3 font-medium hover:opacity-90 transition-opacity"
                    >
                      Create Account
                    </button>

                  </div>
                </div>
              )}

              {/* Error */}
              {step.kind === "error" && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-center">
                    <p className="text-sm text-red-600">{step.message}</p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => setStep({ kind: "idle" })}
                      className="text-rust text-sm hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8">
                <div className="w-full flex items-center gap-3 text-brown/25">
                  <div className="flex-1 h-px bg-current" />
                  <span className="text-[10px] uppercase tracking-widest">
                    secure · verified
                  </span>
                  <div className="flex-1 h-px bg-current" />
                </div>

                <p className="text-[11px] text-brown/40 text-center leading-relaxed mt-3">
                  We only receive your verified phone number.
                  Your messages are never accessed.
                </p>
              </div>

            </div>

            {/* Admin link */}
            <div className="text-center mt-6 text-xs text-brown/55">
              Are you an admin?{" "}
              <Link to="/admin/login" className="text-rust hover:underline">
                Use admin sign in
              </Link>
            </div>

          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

export default AuthPage;