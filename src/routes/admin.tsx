import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin — Thayilam" },
      { name: "description", content: "Platform-wide control for vendors, products, orders, payouts and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminShell,
});
