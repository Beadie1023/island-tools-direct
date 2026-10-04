import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkAdmin, publicClient } from "./products.server";
import { assignSlugs, slugify, type Category, type Product, type Subcategory } from "./shop";

const COLS = "id, slug, name, category, category_name, subcategory, size, price, in_stock";
export const PAGE_SIZE = 48;

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ q: z.string().max(100).default(""), cat: z.string().max(200).default(""), sub: z.string().max(200).default(""), page: z.number().int().min(1).max(1000).default(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    let query = publicClient().from("products").select(COLS, { count: "exact" });
    if (data.cat) query = query.eq("category", data.cat);
    if (data.sub) query = query.eq("subcategory", data.sub);
    const terms = data.q.replace(/[,()%*\\]/g, " ").split(/\s+/).filter(Boolean).slice(0, 6);
    for (const t of terms) query = query.or(`name.ilike.%${t}%,category_name.ilike.%${t}%,subcategory.ilike.%${t}%`);
    const from = (data.page - 1) * PAGE_SIZE;
    const { data: rows, count, error } = await query.order("name").range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error("Could not load products");
    return { items: (rows ?? []) as Product[], total: count ?? 0, page: data.page, pageSize: PAGE_SIZE };
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("categories").select("slug, name, product_count").order("name").range(0, 1999);
  if (error) throw new Error("Could not load categories");
  return (data ?? []) as Category[];
});

export const listSubcategories = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ cat: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    if (!data.cat) return [] as Subcategory[];
    const { data: rows, error } = await publicClient()
      .from("subcategories")
      .select("category, subcategory, product_count")
      .eq("category", data.cat)
      .order("subcategory")
      .range(0, 499);
    if (error) throw new Error("Could not load subcategories");
    return (rows ?? []) as Subcategory[];
  });

export const getCategory = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { data: c } = await publicClient().from("categories").select("slug, name, product_count").eq("slug", data.slug).maybeSingle();
    return (c ?? null) as Category | null;
  });

export const getPricesUpdated = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("site_settings").select("value").eq("key", "prices_updated_at").maybeSingle();
  return data?.value ?? null;
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: p } = await sb.from("products").select(COLS).eq("slug", data.slug).maybeSingle();
    if (!p) return { product: null, related: [] as Product[] };
    const { data: related } = await sb.from("products").select(COLS).eq("category", p.category).neq("slug", p.slug).limit(4);
    return { product: p as Product, related: (related ?? []) as Product[] };
  });

const pw = z.string().min(1).max(200);

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    return { ok: true };
  });

const row = z.object({
  name: z.string().trim().min(1).max(300),
  category: z.string().trim().min(1).max(200),
  subcategory: z.string().trim().max(200).default(""),
  size: z.string().trim().max(200).default(""),
  price: z.number().nonnegative().nullable(),
  in_stock: z.boolean(),
});

const toRecord = (r: z.infer<typeof row>) => ({
  ...r,
  category: slugify(r.category),
  category_name: r.category,
  updated_at: new Date().toISOString(),
});

async function touchPrices() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  await supabaseAdmin.from("site_settings").upsert({ key: "prices_updated_at", value: now, updated_at: now });
}

/** Replaces the whole product list with the uploaded file. */
export const uploadProducts = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw, rows: z.array(row).min(1).max(20000) }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const records = assignSlugs(data.rows.map(toRecord));
    const del = await supabaseAdmin.from("products").delete().not("id", "is", null);
    if (del.error) throw new Error("Upload failed: " + del.error.message);
    for (let i = 0; i < records.length; i += 500) {
      const { error } = await supabaseAdmin.from("products").insert(records.slice(i, i + 500));
      if (error) throw new Error("Upload failed: " + error.message);
    }
    await touchPrices();
    return { count: records.length };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw, id: z.string().uuid().nullable(), product: row }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rec = toRecord(data.product);
    let error;
    if (data.id) {
      ({ error } = await supabaseAdmin.from("products").update(rec).eq("id", data.id));
    } else {
      const base = slugify(rec.name);
      const { data: existing } = await supabaseAdmin.from("products").select("slug").like("slug", `${base}%`);
      const [withSlug] = assignSlugs([rec], new Set((existing ?? []).map((e) => e.slug)));
      ({ error } = await supabaseAdmin.from("products").insert(withSlug));
    }
    if (error) throw new Error(error.message);
    await touchPrices();
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw, id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
