import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { searchQuery, subcategoriesQuery, type SearchParams } from "@/lib/queries";
import type { Category } from "@/lib/shop";
import { ProductCard } from "./shop";
import { cn } from "@/lib/utils";

const field = "min-h-14 rounded-lg border-2 border-input bg-card px-3 text-lg outline-none focus:border-primary";

export function ProductBrowser({
  search,
  onChange,
  categories,
}: {
  search: SearchParams;
  onChange: (s: SearchParams) => void;
  categories?: Category[] | undefined;
}) {
  const [text, setText] = useState(search.q ?? "");
  useEffect(() => setText(search.q ?? ""), [search.q]);
  useEffect(() => {
    if (text === (search.q ?? "")) return;
    const t = setTimeout(() => onChange({ ...search, q: text || undefined, page: undefined }), 250);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isFetching } = useQuery({ ...searchQuery(search), placeholderData: keepPreviousData });
  const { data: subs } = useQuery({ ...subcategoriesQuery(search.cat ?? ""), enabled: !!search.cat });
  const page = search.page ?? 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const go = (p: number) => {
    onChange({ ...search, page: p > 1 ? p : undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const showTiles = !!categories && !search.cat && !search.q;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label htmlFor="filter-q" className="sr-only">Search by name or category</label>
        <input
          id="filter-q"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search name or category…"
          className={cn(field, "w-full px-4")}
        />
        {(categories || (subs && subs.length > 1)) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories && (
              <>
                <label htmlFor="filter-cat" className="sr-only">Filter by section</label>
                <select
                  id="filter-cat"
                  value={search.cat ?? ""}
                  onChange={(e) => onChange({ ...search, cat: e.target.value || undefined, sub: undefined, page: undefined })}
                  className={field}
                >
                  <option value="">All sections</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name} ({c.product_count})</option>
                  ))}
                </select>
              </>
            )}
            {subs && subs.length > 1 && (
              <>
                <label htmlFor="filter-sub" className="sr-only">Filter by type</label>
                <select
                  id="filter-sub"
                  value={search.sub ?? ""}
                  onChange={(e) => onChange({ ...search, sub: e.target.value || undefined, page: undefined })}
                  className={field}
                >
                  <option value="">All types</option>
                  {subs.map((s) => (
                    <option key={s.subcategory} value={s.subcategory}>{s.subcategory} ({s.product_count})</option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {showTiles && (
        <section aria-label="Browse by section" className="space-y-2">
          <h2 className="text-2xl uppercase">Browse by section</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories!.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/$category"
                  params={{ category: c.slug }}
                  className="flex min-h-16 h-full flex-col justify-center rounded-lg border-l-4 border-primary bg-card px-3 py-2 font-display text-lg font-bold uppercase leading-tight hover:bg-accent"
                >
                  {c.name}
                  <span className="font-sans text-sm font-normal normal-case text-muted-foreground">{c.product_count.toLocaleString()} items</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-muted-foreground" aria-live="polite">
        {data ? `${data.total.toLocaleString()} item${data.total === 1 ? "" : "s"}` : "Loading…"}
        {pages > 1 && ` · page ${page} of ${pages}`}
      </p>
      {data && data.items.length > 0 ? (
        <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", isFetching && "opacity-60")}>
          {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
        </ul>
      ) : data ? (
        <p className="rounded-lg border bg-card p-6 text-lg">Can't find it? We stock far more than we list — call or WhatsApp us and ask.</p>
      ) : null}
      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-2">
          <button disabled={page <= 1} onClick={() => go(page - 1)} className="min-h-12 rounded-lg bg-secondary px-5 font-bold disabled:opacity-40">← Previous</button>
          <span className="font-semibold">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => go(page + 1)} className="min-h-12 rounded-lg bg-primary px-5 font-bold text-primary-foreground disabled:opacity-40">Next →</button>
        </nav>
      )}
    </div>
  );
}
