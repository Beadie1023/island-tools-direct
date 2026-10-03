import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductBrowser } from "@/components/product-browser";
import { ContactButtons } from "@/components/shop";
import { productsQuery } from "@/lib/queries";
import { CATEGORIES, categoryName, pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/$category")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productsQuery);
    const known = CATEGORIES.some((c) => c.slug === params.category);
    if (!known && !data.products.some((p) => p.category === params.category)) throw notFound();
    return { name: categoryName(params.category) };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Screws & Tools" }, { name: "robots", content: "noindex" }] };
    const n = loaderData.name;
    return pageMeta(
      `${n} in Nassau, Bahamas — Prices & Stock | Screws & Tools`,
      `Buy ${n.toLowerCase()} in Nassau, Bahamas. See sizes, prices in BSD and what's in stock at Screws & Tools, 9 Faith Avenue.`,
      `/${params.category}`,
    );
  },
  notFoundComponent: () => (
    <div className="space-y-4">
      <h1 className="text-4xl uppercase">Page not found</h1>
      <Link to="/products" className="text-lg text-primary underline">See all products</Link>
    </div>
  ),
  errorComponent: () => <p className="text-lg">This page couldn't load. Please refresh.</p>,
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data } = useSuspenseQuery(productsQuery);
  const items = data.products.filter((p) => p.category === category);
  const info = CATEGORIES.find((c) => c.slug === category);
  return (
    <div className="space-y-4">
      <h1 className="text-5xl uppercase">{categoryName(category)} <span className="block text-2xl text-muted-foreground">in Nassau, Bahamas</span></h1>
      {info && <p className="text-lg text-muted-foreground">{info.blurb}</p>}
      {items.length ? (
        <ProductBrowser key={category} products={items} showCategoryFilter={false} />
      ) : (
        <div className="space-y-4 rounded-lg border bg-card p-5">
          <p className="text-lg">We carry {categoryName(category).toLowerCase()} in store — our online list is coming soon. Call or WhatsApp us for what you need.</p>
          <ContactButtons />
        </div>
      )}
    </div>
  );
}
