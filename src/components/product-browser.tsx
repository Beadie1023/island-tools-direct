import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { searchQuery, type SearchParams } from "@/lib/queries";
import type { Category } from "@/lib/shop";
import { ProductCard } from "./shop";
import { cn } from "@/lib/utils";

export function ProductBrowser({
  search,
  onChange,
  categories,
}: {
  search: SearchParams;
  onChange: (s: SearchParams) => void;
  categories?: Category[];
}) {
  const [text, setText] = useState(search.q ?? "");
  useEffect(() => setText(search.q ?? ""), [search.q]);
  useEffect(() => {
    if (text === (search.q ?? "")) return;
    const t = setTimeout(() => onChange({ ...search, q: text || undefined, page: undefined }), 250);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isFetching } = useQuery({ ...searchQuery(search), placeholderData: keepPreviousData });
  const page = search.page ?? 1;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const go = (p: number) => {
    onChange({ ...search, page: p > 1 ? p : undefined });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label htmlFor="filter-q" className="sr-only">Search by name or category</label>
        <input
          id="filter-q"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search name or category…"
          className="min-h-14 w-full rounded-lg border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary"
        />
        {categories && (
          <>
            <label htmlFor="filter-cat" className="sr-only">Filter by category</label>
            <select
              id="filter-cat"
              value={search.cat ?? ""}
              onChange={(e) => onChange({ ...search, cat: e.target.value || undefined, page: undefined })}
              className="min-h-14 rounded-lg border-2 border-input bg-card px-3 text-lg outline-none focus:border-primary sm:max-w-xs"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name} ({c.product_count})</option>
              ))}
            </select>
          </>
        )}
      </div>
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
