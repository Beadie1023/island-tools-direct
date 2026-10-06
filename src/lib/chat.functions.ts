import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicClient } from "./products.server";
import type { Product } from "./shop";

const SYSTEM = `You are the friendly helper for Screws & Tools, a small hardware store at 9 Faith Avenue, Nassau, Bahamas (phone +1 242-341-7337).
Customers describe a job; suggest what parts/tools they need in plain, short language (max ~80 words, simple bullet list ok).
Never invent prices or stock. Suggest they call or WhatsApp to confirm. Keep safety in mind (e.g. turn off water/power).
Reply ONLY as JSON: {"reply": string, "searches": string[]} where "searches" are 1-4 short product search keywords (1-2 words each, e.g. "wax ring", "toilet bolt", "teflon tape") to look up in our catalogue.`;

export const askHelper = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1000) })).min(1).max(12),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: "The helper is unavailable right now — please call or WhatsApp us.", products: [] as Product[] };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });
    if (!res.ok) {
      console.error("AI gateway", res.status, await res.text());
      const msg = res.status === 429 ? "Lots of questions right now — try again in a minute, or call us." : "The helper couldn't answer just now — please call or WhatsApp us.";
      return { reply: msg, products: [] as Product[] };
    }
    const json = await res.json();
    let reply = "";
    let searches: string[] = [];
    try {
      const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
      reply = String(parsed.reply ?? "");
      searches = Array.isArray(parsed.searches) ? parsed.searches.map(String).slice(0, 4) : [];
    } catch {
      reply = String(json.choices?.[0]?.message?.content ?? "");
    }
    const sb = publicClient();
    const found = new Map<string, Product>();
    for (const s of searches) {
      const terms = s.replace(/[,()%*\\]/g, " ").split(/\s+/).filter(Boolean).slice(0, 3);
      if (!terms.length) continue;
      let q = sb.from("products").select("id, slug, name, category, category_name, size, price, in_stock");
      for (const t of terms) q = q.or(`name.ilike.%${t}%,category_name.ilike.%${t}%`);
      const { data: rows } = await q.order("in_stock", { ascending: false }).limit(3);
      for (const r of (rows ?? []) as Product[]) found.set(r.id, r);
    }
    return { reply: reply || "Tell me a bit more about the job?", products: [...found.values()].slice(0, 6) };
  });
