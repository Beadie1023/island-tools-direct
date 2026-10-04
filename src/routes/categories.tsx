import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { categoriesQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/categories")({
  head: () =>
    pageMeta(
      "All Categories — Screws & Tools Hardware, Nassau, Bahamas",
      "Every product category at Screws & Tools in Nassau, Bahamas: bolts, screws, nuts, washers, fittings, sockets, drill bits and more.",
      "/categories",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  errorComponent: () => <p className="text-lg">Categories couldn't load. Please refresh.</p>,
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(categoriesQuery);
  const [f, setF] = useState("");
  const list = data.filter((c) => c.name.toLowerCase().includes(f.toLowerCase()));
  return (
    <div className="space-y-4">
      <h1 className="text-5xl uppercase">All categories</h1>
      <label htmlFor="cat-filter" className="sr-only">Filter categories</label>
      <input
        id="cat-filter"
        type="search"
        value={f}
        onChange={(e) => setF(e.target.value)}
        placeholder="Find a category…"
        className="min-h-14 w-full rounded-lg border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary"
      />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <li key={c.slug}>
            <Link to="/$category" params={{ category: c.slug }} className="flex min-h-12 items-center justify-between gap-2 rounded-lg border bg-card px-4 py-2 font-semibold hover:border-primary">
              <span>{c.name}</span>
              <span className="text-sm text-muted-foreground">{c.product_count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
