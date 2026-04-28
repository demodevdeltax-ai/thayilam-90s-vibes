import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — Thayilam" },
      { name: "description", content: "Platform-wide control for products, orders and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminGuard,
});

function AdminGuard() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const onLogin = path === "/admin/login";

  useEffect(() => {
    if (loading || onLogin) return;
    if (!isAuthenticated || !isAdmin) navigate({ to: "/admin/login" });
  }, [loading, isAuthenticated, isAdmin, onLogin, navigate]);

  // Always render the login page without the shell
  if (onLogin) return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500 text-sm">
        Redirecting to sign in…
      </div>
    );
  }

  return <AdminShell />;
}
