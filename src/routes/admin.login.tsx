import { createFileRoute, Link, useNavigate } from "@/lib/router-compat";
import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { WhatsAppOtpForm } from "@/components/whatsapp-otp-form";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Thayilam" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && isAdmin) navigate({ to: "/admin" });
  }, [isAuthenticated, isAdmin, loading, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 grid place-items-center mb-3">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin sign in</h1>
          <p className="text-sm text-slate-500 mt-1">
            Restricted area · Verify with WhatsApp OTP
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900">
          <WhatsAppOtpForm
            audience="admin"
            initialMode="login"
            theme="slate"
            onAuthenticated={() => navigate({ to: "/admin" })}
          />
        </div>

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
  );
}
