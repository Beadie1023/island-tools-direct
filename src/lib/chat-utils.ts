// Small pure helpers (no secrets, no network) so they are easy to test.
export function parseShow(text: string): { reply: string; refs: number[] } {
  const m = text.match(/(?:^|\n)[ \t]*SHOW:([^\n]*)\s*$/i);
  if (!m) return { reply: text.trim(), refs: [] };
  const refs = (m[1] ?? "").match(/\d+/g)?.map(Number).filter((n) => n > 0) ?? [];
  return { reply: text.slice(0, m.index ?? text.length).trim(), refs };
}

export function searchTerms(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[,()%*\\"']/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 5);
}

export function rank<T extends { name: string; category_name: string; subcategory: string }>(terms: string[], rows: T[]): T[] {
  const score = (r: T) => {
    const text = `${r.name} ${r.category_name} ${r.subcategory}`.toLowerCase();
    return terms.filter((t) => text.includes(t)).length;
  };
  return [...rows].sort((a, b) => score(b) - score(a));
}
