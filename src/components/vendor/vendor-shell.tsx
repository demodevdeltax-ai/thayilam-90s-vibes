import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Star,
  Settings,
  HelpCircle,
  Menu,
  X,
  Bell,
  LogOut,
} from "lucide-react";
import { ACTIVE_VENDOR } from "@/lib/vendor-data";

type NavItem = { to: string; label: string; Icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/vendor", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/vendor/products", label: "My Products", Icon: Package },
  { to: "/vendor/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/vendor/earnings", label: "Earnings", Icon: Wallet },
  { to: "/vendor/reviews", label: "Reviews", Icon: Star },
  { to: "/vendor/settings", label: "Store Settings", Icon: Settings },
  { to: "/vendor/help", label: "Help", Icon: HelpCircle },
];

export function VendorShell() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#1f1d1a]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E8E6DF] flex-col z-30">
        <SidebarInner currentPath={loc.pathname} onNavigate={() => {}} />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white border-r border-[#E8E6DF] flex flex-col">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 h-9 w-9 rounded-full hover:bg-[#F1EFE7] grid place-items-center"
            >
              <X size={18} />
            </button>
            <SidebarInner currentPath={loc.pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Top bar */}
      <header className="lg:pl-64 sticky top-0 z-20 bg-white border-b border-[#E8E6DF]">
        <div className="h-16 flex items-center justify-between gap-4 px-5 md:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-10 w-10 rounded-full hover:bg-[#F1EFE7] grid place-items-center"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#7a766c]">Vendor panel</div>
              <div className="font-medium text-sm md:text-base text-[#1f1d1a] -mt-0.5">{ACTIVE_VENDOR}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative h-10 w-10 rounded-full hover:bg-[#F1EFE7] grid place-items-center" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C4541A]" />
            </button>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#7a766c] hover:text-[#C4541A] px-3 h-9 rounded-full hover:bg-[#F1EFE7]"
            >
              View store
            </Link>
            <div className="h-9 w-9 rounded-full bg-[#6B7C4A] text-white grid place-items-center text-sm font-semibold">
              {ACTIVE_VENDOR.slice(0, 1)}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="lg:pl-64">
        <div className="px-5 md:px-7 py-6 md:py-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarInner({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="px-6 h-16 flex items-center border-b border-[#E8E6DF]">
        <Link to="/" className="flex items-end gap-2" onClick={onNavigate}>
          <span style={{ fontFamily: "Caveat, cursive" }} className="text-3xl leading-none text-[#3D2310]">
            Thayilam
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#6B7C4A] pb-1.5">vendor</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] px-3 mb-2">Manage</div>
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, Icon, exact }) => {
            const active = exact ? currentPath === to : currentPath === to || currentPath.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  to={to as "/vendor"}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 h-10 px-3 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-[#6B7C4A]/10 text-[#3D2310] font-medium"
                      : "text-[#4a463e] hover:bg-[#F1EFE7]"
                  }`}
                >
                  <span className={`relative grid place-items-center h-7 w-7 rounded-md ${active ? "bg-[#6B7C4A] text-white" : "text-[#7a766c] group-hover:text-[#3D2310]"}`}>
                    <Icon size={15} strokeWidth={1.7} />
                  </span>
                  {label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C4541A]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E8E6DF] p-3">
        <button className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm text-[#7a766c] hover:bg-[#F1EFE7] hover:text-[#C4541A] transition-colors">
          <LogOut size={15} strokeWidth={1.7} />
          Sign out
        </button>
      </div>
    </>
  );
}
