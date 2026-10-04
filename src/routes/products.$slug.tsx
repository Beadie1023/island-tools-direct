import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ContactButtons, ProductCard, StockLabel } from "@/components/shop";
import { productQuery } from "@/lib/queries";
import { SHOP, categoryName, formatPrice, pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const res = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!res.product) throw notFound();
    return res;
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product not found — Screws & Tools" }, { name: "robots", content: "noindex" }] };
    const title = `${p.name}${p.size ? ` ${p.size}` : ""} — Nassau, Bahamas | Screws & Tools`;
    const desc = `${p.name} (${p.size}) ${p.price != null ? `for ${formatPrice(p.price)}` : ""} at Screws & Tools, ${SHOP.address}. ${p.in_stock ? "In stock now." : "Ask us about availability."}`;
    const m = pageMeta(title, desc, `/products/${params.slug}`);
    return {
      ...m,
      meta: [...m.meta.filter((x) => !("property" in x && x.property === "og:type")), { property: "og:type", content: "product" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            category: p.category_name,
            description: `${p.name}, ${p.size}`,
            offers: {
              "@type": "Offer",
              priceCurrency: "BSD",
              ...(p.price != null ? { price: Number(p.price).toFixed(2) } : {}),
              availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
              seller: { "@type": "HardwareStore", name: SHOP.name },
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="space-y-4">
      <h1 className="text-4xl uppercase">Product not found</h1>
      <Link to="/products" className="text-lg text-primary underline">See all products</Link>
    </div>
  ),
  errorComponent: () => <p className="text-lg">This product couldn't load. Please refresh.</p>,
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const p = data.product!;
  return (
    <article className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-muted-foreground">
        <Link to="/products" className="underline">Products</Link> /{" "}
        <Link to="/$category" params={{ category: p.category }} className="underline">{p.category_name}</Link>
      </nav>
      <div className="space-y-3 rounded-lg border bg-card p-5">
        <h1 className="text-4xl uppercase sm:text-5xl">{p.name}</h1>
        <dl className="grid gap-2 text-lg">
          <div className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">Size / spec</dt><dd className="font-semibold">{p.size || "—"}</dd></div>
          <div className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">Category</dt><dd className="font-semibold">{p.category_name}</dd></div>
          <div className="flex items-center justify-between"><dt className="text-muted-foreground">Price</dt><dd className="text-3xl font-bold">{formatPrice(p.price)}</dd></div>
        </dl>
        <StockLabel inStock={p.in_stock} />
      </div>
      <p className="text-lg">Available at Screws &amp; Tools, {SHOP.address}. Call or WhatsApp to check quantities or set one aside.</p>
      <ContactButtons />
      {data.related.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-3xl uppercase">More {p.category_name}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">{data.related.map((r) => <ProductCard key={r.id} p={r} />)}</ul>
        </section>
      )}
    </article>
  );
}
