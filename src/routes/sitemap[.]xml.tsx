// Dynamic sitemap.xml — pulls live product slugs from Supabase so search
// engines discover every product page. Falls back to static routes if the
// product fetch fails for any reason.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://thayilam-90s-vibes.lovable.app";

const STATIC_PATHS: Array<{ path: string; priority: string; freq: string }> = [
  { path: "/", priority: "1.0", freq: "daily" },
  { path: "/shop", priority: "0.9", freq: "daily" },
  { path: "/about", priority: "0.7", freq: "monthly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const urls: string[] = STATIC_PATHS.map(
          ({ path, priority, freq }) =>
            `<url><loc>${SITE}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`,
        );

        try {
          const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const key =
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const supabase = createClient(url, key);
            const { data } = await supabase
              .from("products")
              .select("id, updated_at")
              .order("updated_at", { ascending: false })
              .limit(500);
            if (data) {
              for (const p of data) {
                const lastmod =
                  typeof p.updated_at === "string" ? p.updated_at.slice(0, 10) : today;
                urls.push(
                  `<url><loc>${SITE}/shop/${p.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
                );
              }
            }
          }
        } catch (err) {
          console.error("[sitemap] product fetch failed", err);
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
