import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import type { Database } from "@/integrations/supabase/types";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export function checkAdmin(password: string) {
  const expected = process.env["ADMIN_PASSWORD"] ?? "";
  const a = Buffer.from(password ?? "");
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Wrong password");
}
