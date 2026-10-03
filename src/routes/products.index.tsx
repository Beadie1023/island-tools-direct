import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ProductBrowser } from "@/components/product-browser";
import { productsQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/products/")({
  validateSearch: z.object({ q: z.string().optional(), cat: z.string().optional() }),
  head: () =>
    pageMeta(
      "All Products & Prices — Screws & Tools, Nassau, Bahamas",
      "Browse screws, bolts, nuts, washers and drill bits with prices in BSD and live stock at Screws & Tools in Nassau, Bahamas.",
      "/products",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  errorComponent: () => <p className="text-lg">Products couldn't load. Please refresh or call us.</p>,
  component: ProductsPage,
});

function ProductsPage() {
  const { q, cat } = Route.useSearch();
  const { data } = useSuspenseQuery(productsQuery);
  return (
    <div className="space-y-4">
      <h1 className="text-5xl uppercase">Products</h1>
      {data.updatedAt && (
        <p className="text-muted-foreground">
          Prices last updated:{" "}
          <strong className="text-foreground">
            {new Date(data.updatedAt).toLocaleDateString("en-US", { timeZone: "America/Nassau", dateStyle: "long" })}
          </strong>
        </p>
      )}
      <ProductBrowser products={data.products} initialQuery={q} initialCategory={cat} />
    </div>
  );
}
