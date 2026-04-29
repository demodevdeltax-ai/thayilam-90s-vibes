// Vite config wrapper from @lovable.dev/vite-tanstack-config.
//
// On Lovable / Cloudflare builds (default): the wrapper auto-includes the
// Cloudflare plugin — leave `cloudflare` untouched.
//
// On Vercel: the `VERCEL` env var is set automatically by Vercel's build
// runner. We disable Cloudflare and tell TanStack Start to emit a Vercel
// build (Node serverless functions + static client assets).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL;

export default defineConfig(
  isVercel
    ? {
        cloudflare: false,
        tanstackStart: { target: "vercel" },
      }
    : {},
);
