import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteProduct, saveProduct, uploadProducts, verifyAdmin } from "@/lib/products.functions";
import { searchQuery } from "@/lib/queries";
import { formatPrice, type Product } from "@/lib/shop";
import { parseRows, type ProductRow } from "@/lib/import";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner admin — Screws & Tools, Nassau, Bahamas" },
      { name: "description", content: "Owner-only product management for Screws & Tools in Nassau, Bahamas." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

const input = "min-h-12 w-full rounded-lg border-2 border-input bg-card px-3 text-lg outline-none focus:border-primary";
const btn = "min-h-12 rounded-lg px-5 font-bold disabled:opacity-50";

function Admin() {
  const [pw, setPw] = useState<string | null>(null);
  useEffect(() => setPw(sessionStorage.getItem("st-admin")), []);
  const verify = useServerFn(verifyAdmin);

  if (!pw)
    return (
      <form
        className="mx-auto max-w-sm space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = String(new FormData(e.currentTarget).get("pw"));
          try {
            await verify({ data: { password: p } });
            sessionStorage.setItem("st-admin", p);
            setPw(p);
          } catch {
            toast.error("Wrong password");
          }
        }}
      >
        <h1 className="text-4xl uppercase">Owner admin</h1>
        <label className="block space-y-1"><span>Password</span><input name="pw" type="password" required className={input} autoComplete="current-password" /></label>
        <button className={`${btn} w-full bg-primary text-primary-foreground`}>Sign in</button>
      </form>
    );

  return <Dashboard pw={pw} onLogout={() => { sessionStorage.removeItem("st-admin"); setPw(null); }} />;
}

function Dashboard({ pw, onLogout }: { pw: string; onLogout: () => void }) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const t = setTimeout(() => { setQ(filter); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [filter]);
  const { data } = useQuery({ ...searchQuery({ q, page }), placeholderData: keepPreviousData });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const upload = useServerFn(uploadProducts);
  const del = useServerFn(deleteProduct);
  const [preview, setPreview] = useState<{ rows: ProductRow[]; errors: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const refresh = () => qc.invalidateQueries();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl uppercase">Owner admin</h1>
        <button onClick={onLogout} className="underline">Log out</button>
      </div>

      <section className="space-y-3 rounded-lg border bg-card p-5">
        <h2 className="text-2xl uppercase">Bulk upload (CSV or Excel)</h2>
        <p className="text-muted-foreground">Columns: <code>name, category, subcategory, size, price, in_stock</code>. Uploading <strong>replaces the whole product list</strong> with the file.</p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="block w-full text-lg file:mr-3 file:min-h-12 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:font-bold file:text-foreground"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try { setPreview(await parseRows(f)); } catch { toast.error("Couldn't read that file"); }
          }}
        />
        {preview && (
          <div className="space-y-2">
            <p><strong>{preview.rows.length}</strong> products ready.{preview.errors.length > 0 && <span className="text-destructive"> {preview.errors.length} rows skipped.</span>}</p>
            {preview.errors.slice(0, 5).map((er) => <p key={er} className="text-sm text-destructive">{er}</p>)}
            <button
              disabled={busy || !preview.rows.length}
              className={`${btn} bg-primary text-primary-foreground`}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await upload({ data: { password: pw, rows: preview.rows } });
                  toast.success(`${r.count} products saved`);
                  setPreview(null);
                  refresh();
                } catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); }
                setBusy(false);
              }}
            >
              {busy ? "Uploading…" : "Upload & update prices"}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl uppercase">Products ({data?.total.toLocaleString() ?? 0})</h2>
          <button onClick={() => setEditing("new")} className={`${btn} bg-primary text-primary-foreground`}>+ Add</button>
        </div>
        {editing && <ProductForm pw={pw} product={editing === "new" ? null : editing} onDone={() => { setEditing(null); refresh(); }} />}
        <input placeholder="Search products…" value={filter} onChange={(e) => setFilter(e.target.value)} className={input} />
        <ul className="divide-y rounded-lg border bg-card">
          {data?.items
            .map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.category_name}{p.subcategory ? ` · ${p.subcategory}` : ""} · {p.size} · {formatPrice(p.price)} · {p.in_stock ? "In stock" : "Ask us"}</p>
                </div>
                <button onClick={() => setEditing(p)} className={`${btn} bg-secondary`}>Edit</button>
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ${p.name}?`)) return;
                    try { await del({ data: { password: pw, id: p.id } }); toast.success("Deleted"); refresh(); }
                    catch { toast.error("Delete failed"); }
                  }}
                  className={`${btn} bg-destructive text-destructive-foreground`}
                >Delete</button>
              </li>
            ))}
        </ul>
        {pages > 1 && (
          <nav aria-label="Pages" className="flex items-center justify-between gap-3">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} bg-secondary`}>← Previous</button>
            <span className="font-semibold">{page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${btn} bg-primary text-primary-foreground`}>Next →</button>
          </nav>
        )}
      </section>
    </div>
  );
}

function ProductForm({ pw, product, onDone }: { pw: string; product: Product | null; onDone: () => void }) {
  const save = useServerFn(saveProduct);
  return (
    <form
      key={product?.id ?? "new"}
      className="grid gap-3 rounded-lg border-2 border-primary bg-card p-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const priceStr = String(f.get("price") ?? "").trim();
        try {
          await save({
            data: {
              password: pw,
              id: product?.id ?? null,
              product: {
                name: String(f.get("name")),
                category: String(f.get("category")),
                subcategory: String(f.get("subcategory") ?? ""),
                size: String(f.get("size") ?? ""),
                price: priceStr ? Number(priceStr) : null,
                in_stock: f.get("in_stock") === "on",
              },
            },
          });
          toast.success("Saved");
          onDone();
        } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
      }}
    >
      <label className="space-y-1"><span>Name</span><input name="name" required defaultValue={product?.name} className={input} /></label>
      <label className="space-y-1"><span>Category</span><input name="category" required defaultValue={product ? product.category_name : ""} className={input} /></label>
      <label className="space-y-1"><span>Subcategory (optional)</span><input name="subcategory" defaultValue={product?.subcategory} className={input} /></label>
      <label className="space-y-1"><span>Size / spec</span><input name="size" defaultValue={product?.size} className={input} /></label>
      <label className="space-y-1"><span>Price (BSD)</span><input name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? ""} className={input} /></label>
      <label className="flex min-h-12 items-center gap-3"><input name="in_stock" type="checkbox" defaultChecked={product?.in_stock ?? true} className="h-6 w-6 accent-primary" /> In stock</label>
      <div className="flex gap-2 sm:col-span-2">
        <button className={`${btn} bg-primary text-primary-foreground`}>Save</button>
        <button type="button" onClick={onDone} className={`${btn} bg-secondary`}>Cancel</button>
      </div>
    </form>
  );
}
