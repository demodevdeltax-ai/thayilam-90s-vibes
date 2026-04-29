// Vite config wrapper from @lovable.dev/vite-tanstack-config.
//
// • Default (Lovable preview / Cloudflare publish): the wrapper auto-includes
//   the Cloudflare plugin and TanStack Start. Nothing extra needed.
//
// • Vercel: Vercel sets the `VERCEL` env var during its build. We disable
//   the Cloudflare plugin and add the Nitro Vite plugin, which detects the
//   Vercel environment and emits Vercel Functions + static client assets in
//   `.vercel/output/` (the Build Output API).
//
// Reference: https://vercel.com/docs/frameworks/full-stack/tanstack-start
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { PluginOption } from "vite";

const isVercel = !!process.env.VERCEL;

const extraPlugins: PluginOption[] = [];
if (isVercel) {
  // Top-level await is supported by Vite's config loader.
  const { nitro } = await import("nitro/vite");
  extraPlugins.push(nitro());
}

export default defineConfig({
  cloudflare: isVercel ? false : undefined,
  plugins: extraPlugins,
});
