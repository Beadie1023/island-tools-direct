import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductBrowser } from "@/components/product-browser";
import { categoryQuery, searchQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/$category")({
  validateSearch: z.object({ q: z.string().optional(), sub: z.string().optional(), page: z.coerce.number().int().min(1).optional() }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const cat = await context.queryClient.ensureQueryData(categoryQuery(params.category));
    if (!cat) throw notFound();
    await context.queryClient.ensureQueryData(searchQuery({ ...deps, cat: params.category }));
    return { name: cat.name };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Screws & Tools" }, { name: "robots", content: "noindex" }] };
    const n = loaderData.name;
    return pageMeta(
      `${n} in Nassau, Bahamas — Prices & Stock | Screws & Tools`,
      `Buy ${n} in Nassau, Bahamas. See sizes, prices in BSD and what's in stock at Screws & Tools, 9 Faith Avenue.`,
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
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: cat } = useSuspenseQuery(categoryQuery(category));
  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-muted-foreground">
        <Link to="/categories" className="underline">All categories</Link>
      </nav>
      <h1 className="text-5xl uppercase">{cat?.name} <span className="block text-2xl text-muted-foreground">in Nassau, Bahamas</span></h1>
      <ProductBrowser
        key={category}
        search={{ ...search, cat: category }}
        onChange={({ q, sub, page }) => navigate({ search: { q, sub, page }, replace: true })}
      />
    </div>
  );
}
