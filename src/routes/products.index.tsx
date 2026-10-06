import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { GuidedFinder } from "@/components/guided-finder";
import { SafeBoundary } from "@/components/safe-boundary";
import { ProductBrowser } from "@/components/product-browser";
import { categoriesQuery, pricesUpdatedQuery, searchQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/products/")({
  validateSearch: z.object({
    q: z.string().optional(),
    cat: z.string().optional(),
    sub: z.string().optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
  loaderDeps: ({ search }) => search,
  head: () =>
    pageMeta(
      "All Products & Prices — Screws & Tools, Nassau, Bahamas",
      "Search 3,600+ bolts, screws, nuts, fittings, sockets and tools with prices in BSD at Screws & Tools in Nassau, Bahamas.",
      "/products",
    ),
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(searchQuery(deps)),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(pricesUpdatedQuery),
    ]),
  errorComponent: () => <p className="text-lg">Products couldn't load. Please refresh or call us.</p>,
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: cats } = useQuery(categoriesQuery);
  const { data: updated } = useQuery(pricesUpdatedQuery);
  return (
    <div className="space-y-4">
      <h1 className="text-5xl uppercase">Products</h1>
      {updated && (
        <p className="text-muted-foreground">
          Prices last updated:{" "}
          <strong className="text-foreground">
            {new Date(updated).toLocaleDateString("en-US", { timeZone: "America/Nassau", dateStyle: "long" })}
          </strong>
        </p>
      )}
      <details className="rounded-lg border bg-card p-4">
        <summary className="cursor-pointer text-lg font-bold">Not sure what you need? Help me choose</summary>
        <div className="pt-3"><SafeBoundary label="help finder"><GuidedFinder /></SafeBoundary></div>
      </details>
      <ProductBrowser search={search} categories={cats} onChange={(s) => navigate({ search: s, replace: true })} />
    </div>
  );
}
