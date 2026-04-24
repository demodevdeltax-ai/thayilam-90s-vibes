import { createFileRoute } from "@tanstack/react-router";
import { VendorShell } from "@/components/vendor/vendor-shell";

export const Route = createFileRoute("/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Panel — Thayilam" },
      { name: "description", content: "Manage products, orders and earnings on Thayilam." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VendorShell,
});
