// Reusable WhatsApp OTP form used by both customer (/auth) and admin
// (/admin/login) flows. UI-only — wire backend by replacing sendOtp /
// verifyOtp inside src/lib/auth.tsx.

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageCircle, ChevronLeft } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  normalizePhone,
  sendOtp,
  verifyOtp,
  useAuth,
  type OtpIntent,
  type MockUser,
} from "@/lib/auth";

type Mode = "login" | "signup";

type Props = {
  audience: "customer" | "admin";
  initialMode?: Mode;
  onAuthenticated: (user: MockUser) => void;
  /** Optional theme overrides for admin (slate) vs customer (cream) look. */
  theme?: "cream" | "slate";
};

type Step = "phone" | "otp" | "profile";

export function WhatsAppOtpForm({
  audience,
  initialMode = "login",
  onAuthenticated,
  theme = "cream",
}: Props) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState(""); // normalized
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const intent: OtpIntent = `${audience}-${mode}` as OtpIntent;

  const inputClass =
    theme === "slate"
      ? "w-full h-11 px-3 rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none text-sm"
      : "w-full h-11 px-4 rounded-lg border border-brown/25 bg-cream focus:border-rust focus:outline-none focus:ring-2 focus:ring-rust/20 text-sm text-brown";

  const primaryBtn =
    theme === "slate"
      ? "w-full h-11 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2"
      : "w-full h-11 rounded-lg bg-rust hover:bg-rust/90 text-cream text-sm font-semibold uppercase tracking-wider disabled:opacity-60 inline-flex items-center justify-center gap-2";

  const ghostText =
    theme === "slate" ? "text-slate-900" : "text-rust";

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    const normalized = normalizePhone(phoneInput);
    if (!normalized) {
      toast.error("Enter a valid phone (10-digit Indian number or +country code).");
      return;
    }
    setSubmitting(true);
    try {
      await sendOtp(normalized, intent);
      setPhone(normalized);
      setStep("otp");
      toast.success(`OTP sent on WhatsApp to ${normalized}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await sendOtp(phone, intent);
      toast.success("OTP resent on WhatsApp.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  }

  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    // Signup needs a name — collect it first.
    if (mode === "signup" && !fullName.trim()) {
      setStep("profile");
      return;
    }
    setSubmitting(true);
    try {
      const user = await verifyOtp(phone, code, intent, mode === "signup" ? { fullName } : undefined);
      signIn(user);
      onAuthenticated(user);
      toast.success(audience === "admin" ? "Welcome, admin." : "You're signed in!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {step === "phone" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 opacity-70">
              WhatsApp number
            </label>
            <input
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              required
              placeholder="98xxxxxxxx or +91 98xxxxxxxx"
              className={inputClass}
            />
            <p className="text-[11px] mt-1.5 opacity-60">
              We'll send a 6-digit code to your WhatsApp.
            </p>
          </div>

          <button type="submit" disabled={submitting} className={primaryBtn}>
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
            {submitting ? "Sending OTP…" : "Send OTP on WhatsApp"}
          </button>

          <div className="text-center text-xs opacity-70 pt-1">
            {mode === "login" ? (
              <>
                New to {audience === "admin" ? "admin" : "Thayilam"}?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`${ghostText} font-semibold hover:underline`}
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
                  className={`${ghostText} font-semibold hover:underline`}
                >
                  Sign in instead
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setCode("");
            }}
            className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
          >
            <ChevronLeft size={14} /> Change number
          </button>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 opacity-70">
              Enter the 6-digit code
            </label>
            <p className="text-[12px] mb-3 opacity-70">
              Sent on WhatsApp to <span className="font-semibold">{phone}</span>
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <button type="submit" disabled={submitting || code.length !== 6} className={primaryBtn}>
            {submitting && <Loader2 className="animate-spin" size={16} />}
            {submitting ? "Verifying…" : mode === "signup" ? "Verify & continue" : "Verify & sign in"}
          </button>

          <div className="text-center text-xs opacity-70">
            Didn't get the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className={`${ghostText} font-semibold hover:underline disabled:opacity-50`}
            >
              {resending ? "Resending…" : "Resend on WhatsApp"}
            </button>
          </div>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider mb-1.5 opacity-70">
              Your full name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={100}
              placeholder={audience === "admin" ? "e.g. Lakshmi Raman" : "e.g. Lakshmi"}
              className={inputClass}
              autoFocus
            />
            <p className="text-[11px] mt-1.5 opacity-60">
              We'll address you by this name in WhatsApp updates.
            </p>
          </div>

          <button type="submit" disabled={submitting || !fullName.trim()} className={primaryBtn}>
            {submitting && <Loader2 className="animate-spin" size={16} />}
            {submitting ? "Creating account…" : "Finish & sign in"}
          </button>
        </form>
      )}
    </div>
  );
}
