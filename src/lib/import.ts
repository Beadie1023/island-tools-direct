export type ProductRow = { name: string; category: string; size: string; price: number | null; in_stock: boolean };

export function parseStock(v: unknown) {
  const s = String(v ?? "").trim().toLowerCase();
  return ["yes", "y", "true", "1", "in stock", "instock", "x"].includes(s);
}

export function parsePrice(v: unknown): number | null {
  if (typeof v === "number") return v >= 0 ? Math.round(v * 100) / 100 : null;
  const s = String(v ?? "").replace(/[^0-9.]/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

export function normalizeRows(raw: Record<string, unknown>[]) {
  const rows: ProductRow[] = [];
  const errors: string[] = [];
  raw.forEach((r, i) => {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) o[k.trim().toLowerCase().replace(/[\s-]+/g, "_")] = v;
    const name = String(o["name"] ?? "").trim();
    const category = String(o["category"] ?? "").trim();
    if (!name || !category) {
      errors.push(`Row ${i + 2}: missing name or category`);
      return;
    }
    rows.push({ name, category, size: String(o["size"] ?? "").trim(), price: parsePrice(o["price"]), in_stock: parseStock(o["in_stock"]) });
  });
  return { rows, errors };
}

export async function parseRows(file: File) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0] ?? ""];
  if (!sheet) return { rows: [], errors: ["Empty file"] };
  return normalizeRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }));
}
