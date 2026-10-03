import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/shop";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { publicClient } = await import("@/lib/products.server");
        const origin = new URL(request.url).origin;
        const { data } = await publicClient().from("products").select("slug, category, updated_at");
        const cats = new Set([...CATEGORIES.map((c) => c.slug), ...(data ?? []).map((p) => p.category)]);
        const paths = ["/", "/products", "/about", ...[...cats].map((c) => `/${c}`)];
        const urls = [
          ...paths.map((p) => `<url><loc>${origin}${p}</loc></url>`),
          ...(data ?? []).map(
            (p) => `<url><loc>${origin}/products/${p.slug}</loc><lastmod>${p.updated_at.slice(0, 10)}</lastmod></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
