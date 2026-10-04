import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { publicClient } = await import("@/lib/products.server");
        const sb = publicClient();
        const origin = new URL(request.url).origin;
        const products: { slug: string; updated_at: string }[] = [];
        for (let from = 0; ; from += 1000) {
          const { data } = await sb.from("products").select("slug, updated_at").order("slug").range(from, from + 999);
          products.push(...(data ?? []));
          if (!data || data.length < 1000) break;
        }
        const { data: cats } = await sb.from("categories").select("slug").range(0, 1999);
        const paths = ["/", "/products", "/categories", "/about", ...(cats ?? []).map((c) => `/${c.slug}`)];
        const urls = [
          ...paths.map((p) => `<url><loc>${origin}${p}</loc></url>`),
          ...products.map((p) => `<url><loc>${origin}/products/${p.slug}</loc><lastmod>${p.updated_at.slice(0, 10)}</lastmod></url>`),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
