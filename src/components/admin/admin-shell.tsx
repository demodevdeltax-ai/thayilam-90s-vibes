import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Tag,
  Megaphone,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { pendingApprovalsCount } from "@/lib/admin-data";

type NavItem = { to: string; label: string; Icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/vendors", label: "Vendors", Icon: Store },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", Icon: Users },
  { to: "/admin/payouts", label: "Payouts", Icon: Wallet },
  { to: "/admin/categories", label: "Categories", Icon: Tag },
  { to: "/admin/banners", label: "Banners & Offers", Icon: Megaphone },
  { to: "/admin/reports", label: "Reports", Icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminShell() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const pending = pendingApprovalsCount();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex-col z-30">
        <SidebarInner currentPath={loc.pathname} onNavigate={() => {}} pending={pending} />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 h-9 w-9 rounded-md hover:bg-slate-100 grid place-items-center"
            >
              <X size={18} />
            </button>
            <SidebarInner currentPath={loc.pathname} onNavigate={() => setOpen(false)} pending={pending} />
          </aside>
        </div>
      )}

      <header className="lg:pl-60 sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="h-14 flex items-center justify-between gap-4 px-5 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 w-9 rounded-md hover:bg-slate-100 grid place-items-center"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-slate-900 grid place-items-center">
                <ShieldCheck size={15} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 leading-none">Super admin</div>
                <div className="font-semibold text-sm text-slate-900 leading-tight mt-0.5">Thayilam Platform</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative h-9 w-9 rounded-md hover:bg-slate-100 grid place-items-center" aria-label="Notifications">
              <Bell size={17} className="text-slate-700" />
              {pending > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-[#C4541A] text-white text-[10px] font-semibold grid place-items-center">
                  {pending}
                </span>
              )}
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600 hover:text-[#C4541A] px-3 h-9 rounded-md hover:bg-slate-100"
            >
              View store
            </Link>
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white grid place-items-center text-xs font-semibold">
              SA
            </div>
          </div>
        </div>
      </header>

      <main className="lg:pl-60">
        <div className="px-5 md:px-6 py-6 max-w-[1500px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarInner({
  currentPath,
  onNavigate,
  pending,
}: {
  currentPath: string;
  onNavigate: () => void;
  pending: number;
}) {
  return (
    <>
      <div className="px-5 h-14 flex items-center border-b border-slate-200">
        <Link to="/" className="flex items-end gap-2" onClick={onNavigate}>
          <span style={{ fontFamily: "Caveat, cursive" }} className="text-[28px] leading-none text-slate-900">
            Thayilam
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#C4541A] pb-1.5 font-semibold">admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2.5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 px-2.5 mb-2 font-medium">Platform</div>
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, Icon, exact }) => {
            const active = exact ? currentPath === to : currentPath === to || currentPath.startsWith(to + "/");
            const showBadge = to === "/admin/vendors" && pending > 0;
            return (
              <li key={to}>
                <Link
                  to={to as "/admin"}
                  onClick={onNavigate}
                  className={`group flex items-center gap-2.5 h-9 px-2.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-slate-900 text-white font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-900"} />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-[#C4541A] text-white text-[10px] font-semibold grid place-items-center">
                      {pending}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3 text-[11px] text-slate-500 leading-relaxed">
        <div className="font-medium text-slate-700">v0.4.0 · staging</div>
        <div>Last sync 2 min ago</div>
      </div>
    </>
  );
}
