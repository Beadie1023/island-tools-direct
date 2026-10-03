import { useMemo, useState } from "react";
import { categoryName, CATEGORIES, type Product } from "@/lib/shop";
import { ProductCard } from "./shop";
import { cn } from "@/lib/utils";

export function ProductBrowser({
  products,
  initialQuery = "",
  initialCategory = "",
  showCategoryFilter = true,
}: {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  showCategoryFilter?: boolean;
}) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(initialCategory);
  const cats = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    const known = CATEGORIES.map((c) => c.slug).filter((s) => present.has(s));
    return [...known, ...[...present].filter((s) => !known.includes(s))];
  }, [products]);

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (cat && p.category !== cat) return false;
      const hay = `${p.name} ${p.size} ${categoryName(p.category)}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [products, q, cat]);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="filter-q" className="sr-only">Search by name</label>
        <input
          id="filter-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or size…"
          className="min-h-14 w-full rounded-lg border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary"
        />
      </div>
      {showCategoryFilter && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by category">
          {["", ...cats].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 font-semibold",
                cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {c ? categoryName(c) : "All"}
            </button>
          ))}
        </div>
      )}
      <p className="text-muted-foreground" aria-live="polite">{filtered.length} item{filtered.length === 1 ? "" : "s"}</p>
      {filtered.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
        </ul>
      ) : (
        <p className="rounded-lg border bg-card p-6 text-lg">Can't find it? We stock far more than we list — call or WhatsApp us and ask.</p>
      )}
    </div>
  );
}
