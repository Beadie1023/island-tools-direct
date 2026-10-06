import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicClient } from "./products.server";
import type { Product } from "./shop";

const SYSTEM = `You are the friendly helper for Screws & Tools, a small hardware store at 9 Faith Avenue, Nassau, Bahamas (phone +1 242-341-7337).
Customers describe a job; suggest what parts/tools they need in plain, short language (max ~80 words, simple bullet list ok).
Never invent prices or stock. Suggest they call or WhatsApp to confirm. Keep safety in mind (e.g. turn off water/power).
Reply as JSON: {"reply": string, "searches": string[]} where "searches" are 1-4 short product search keywords (1-2 words each, e.g. "wax ring", "toilet bolt", "teflon tape") to look up in our catalogue.`;

export const askHelper = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1000) })).min(1).max(12),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: "The helper is unavailable right now — please call or WhatsApp us.", products: [] as Product[] };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: SYSTEM,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
        text: {
          format: {
            type: "json_schema",
            name: "helper_reply",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["reply", "searches"],
              properties: { reply: { type: "string" }, searches: { type: "array", items: { type: "string" } } },
            },
          },
        },
      }),
    });
    if (!res.ok || !res.body) {
      console.error("AI gateway", res.status, await res.text());
      const msg = res.status === 429 ? "Lots of questions right now — try again in a minute, or call us." : "The helper couldn't answer just now — please call or WhatsApp us.";
      return { reply: msg, products: [] as Product[] };
    }
    // Consume the SSE stream and collect the output text.
    let out = "";
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") out += ev.delta ?? "";
        } catch { /* ignore partial */ }
      }
    }
    let reply = "";
    let searches: string[] = [];
    try {
      const parsed = JSON.parse(out || "{}");
      reply = String(parsed.reply ?? "");
      searches = Array.isArray(parsed.searches) ? parsed.searches.map(String).slice(0, 4) : [];
    } catch {
      reply = out;
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
