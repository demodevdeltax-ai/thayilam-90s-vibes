// Vite config wrapper from @lovable.dev/vite-tanstack-config.
//
// • Default (Lovable preview / Cloudflare publish): the wrapper auto-includes
//   the Cloudflare plugin. Nothing extra needed.
//
// • Vercel: Vercel sets the `VERCEL` env var during its build. We disable
//   Cloudflare and add the Nitro Vite plugin, which detects Vercel and emits
//   Vercel Functions + static client assets in `.vercel/output/`.
//
// Reference: https://vercel.com/docs/frameworks/full-stack/tanstack-start
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL;

export default defineConfig(async () => {
  if (!isVercel) return {};
  // Lazy import so non-Vercel builds don't pay the cost.
  const { nitro } = await import("nitro/vite");
  return {
    cloudflare: false,
    plugins: [nitro()],
  };
});
