import { Link, useNavigate } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// phone.email global callback type
// ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    phoneEmailListener?: (userObj: { user_json_url: string }) => void;
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toE164(countryCode: string, localNumber: string): string {
  const cc = countryCode.replace(/\D/g, "");
  const ln = localNumber.replace(/\D/g, "");
  return `+${cc}${ln}`;
}

// ─────────────────────────────────────────────────────────────
// Step state
// ─────────────────────────────────────────────────────────────

type Step =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "error"; message: string };

// ─────────────────────────────────────────────────────────────
// phone.email button — same pattern as user auth page
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

  return <div ref={containerRef} className="flex justify-center" />;
}

// ─────────────────────────────────────────────────────────────
// Head
// ─────────────────────────────────────────────────────────────

function RouteHead() {
  return (
    <Helmet>
      <title>Admin sign in — Thayilam</title>
      <meta name="robots" content="noindex" />
    </Helmet>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<Step>({ kind: "idle" });

  // ─────────────────────────────────────────────────────────
  // Redirect if already logged in as admin
  // ─────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem("thayilam_user");
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      if (user.role === "admin") navigate({ to: "/admin" });
    } catch {
      // malformed storage — ignore
    }
  }, [navigate]);

  // ─────────────────────────────────────────────────────────
  // Handle phone.email verification
  // ─────────────────────────────────────────────────────────

  const handleVerified = async (userJsonUrl: string) => {
    setStep({ kind: "loading", message: "Verifying your number..." });

    try {
      // 1. Validate source URL
      const parsed = new URL(userJsonUrl);
      if (parsed.hostname !== "user.phone.email") {
        throw new Error("Invalid verification source.");
      }

      // 2. Fetch verified phone info from phone.email
      const res = await fetch(userJsonUrl);
      if (!res.ok) throw new Error("Failed to fetch verified number.");

      const data: {
        user_country_code: string;
        user_phone_number: string;
      } = await res.json();

      const phone = toE164(data.user_country_code, data.user_phone_number);

      // 3. Look up profile by phone number
      setStep({ kind: "loading", message: "Checking your account..." });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("phone", phone)
        .maybeSingle();

      if (profileError) throw profileError;

      // No profile at all → not registered
      if (!profile) {
        throw new Error(
          "No account found for this number. Admin accounts are created by the system."
        );
      }

      // 4. Check admin role in user_roles table
      setStep({ kind: "loading", message: "Checking admin access..." });

      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profile.id)
        .eq("role", "admin")        // strictly check for admin only
        .maybeSingle();

      if (roleError) throw roleError;

      // Role row missing or not admin → deny
      if (!roleRow) {
        throw new Error(
          "Access denied. This number is not linked to an admin account."
        );
      }

      // 5. All good — sign in as admin
      setStep({ kind: "loading", message: "Signing you in..." });

      signIn({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        role: "admin",
      });

      navigate({ to: "/admin" });

    } catch (err: unknown) {
      setStep({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────

  return (
    <>
      <RouteHead />

      <div className="min-h-screen grid place-items-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 grid place-items-center mb-3">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Admin sign in
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Restricted area · Verify with WhatsApp OTP
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            {/* Loading */}
            {step.kind === "loading" && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">{step.message}</p>
              </div>
            )}

            {/* Idle — show phone.email button */}
            {step.kind === "idle" && (
              <div className="flex flex-col items-center gap-5">
                <p className="text-xs text-slate-500 text-center">
                  Verify your phone number to access the admin panel.
                </p>
                <PhoneEmailButton onVerified={handleVerified} />
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
                    className="text-slate-700 text-sm hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3 text-slate-200">
              <div className="flex-1 h-px bg-current" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                secure · verified
              </span>
              <div className="flex-1 h-px bg-current" />
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-3">
              Only authorised admin numbers can access this panel.
              Unauthorised attempts are blocked.
            </p>

          </div>

          {/* Footer link */}
          <div className="text-center mt-5 text-xs text-slate-500">
            Are you a customer?{" "}
            <Link
              to="/auth"
              search={{ redirect: "/", mode: "login" }}
              className="text-slate-900 font-medium hover:underline"
            >
              Customer sign in
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminLoginPage;