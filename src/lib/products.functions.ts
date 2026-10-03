import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkAdmin, publicClient } from "./products.server";
import { slugify, type Product } from "./shop";

const COLS = "id, slug, name, category, size, price, in_stock";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [{ data, error }, { data: setting }] = await Promise.all([
    sb.from("products").select(COLS).order("category").order("name"),
    sb.from("site_settings").select("value").eq("key", "prices_updated_at").maybeSingle(),
  ]);
  if (error) throw new Error("Could not load products");
  return { products: (data ?? []) as Product[], updatedAt: setting?.value ?? null };
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: p } = await sb.from("products").select(COLS).eq("slug", data.slug).maybeSingle();
    if (!p) return { product: null, related: [] as Product[] };
    const { data: related } = await sb
      .from("products").select(COLS).eq("category", p.category).neq("slug", p.slug).limit(4);
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
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  size: z.string().trim().max(200).default(""),
  price: z.number().nonnegative().nullable(),
  in_stock: z.boolean(),
});

async function touchPrices() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("site_settings").upsert({ key: "prices_updated_at", value: new Date().toISOString(), updated_at: new Date().toISOString() });
}

export const uploadProducts = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw, rows: z.array(row).min(1).max(5000) }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const seen = new Set<string>();
    const records = data.rows.map((r) => {
      let slug = slugify(r.name);
      if (seen.has(slug)) slug = slugify(`${r.name} ${r.size}`);
      seen.add(slug);
      return { ...r, slug, category: slugify(r.category), updated_at: new Date().toISOString() };
    });
    const unique = Array.from(new Map(records.map((r) => [r.slug, r])).values());
    const { error } = await supabaseAdmin.from("products").upsert(unique, { onConflict: "slug" });
    if (error) throw new Error("Upload failed: " + error.message);
    await touchPrices();
    return { count: unique.length };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: pw, id: z.string().uuid().nullable(), product: row }).parse(d))
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rec = { ...data.product, category: slugify(data.product.category), updated_at: new Date().toISOString() };
    const { error } = data.id
      ? await supabaseAdmin.from("products").update(rec).eq("id", data.id)
      : await supabaseAdmin.from("products").insert({ ...rec, slug: slugify(rec.name) });
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
