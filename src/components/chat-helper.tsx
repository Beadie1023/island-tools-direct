import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { askHelper } from "@/lib/chat.functions";
import { formatPrice, type Product } from "@/lib/shop";
import { ContactButtons } from "./shop";

type Msg = { role: "user" | "assistant"; content: string; products?: Product[] };

export function ChatHelper() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(askHelper);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const r = await ask({ data: { messages: next.slice(-10).map(({ role, content }) => ({ role, content })) } });
      setMsgs([...next, { role: "assistant", content: r.reply, products: r.products }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Sorry, I couldn't answer just now — please call or WhatsApp us." }]);
    }
    setBusy(false);
  };

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-primary px-5 text-lg font-bold text-primary-foreground shadow-lg"
      >
        <MessageSquare className="h-5 w-5" aria-hidden /> Ask us
      </button>
    );

  return (
    <div role="dialog" aria-label="Ask Screws & Tools" className="fixed inset-x-2 bottom-2 z-40 flex max-h-[80vh] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96">
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <p className="font-display text-xl font-bold uppercase">Ask Screws &amp; Tools</p>
          <p className="text-sm text-muted-foreground">Describe the job. We'll suggest what you need.</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-11 w-11 items-center justify-center"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {msgs.length === 0 && <p className="text-muted-foreground">e.g. "My toilet keeps leaking, what do I need?"</p>}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-8 rounded-lg bg-primary p-3 text-primary-foreground">{m.content}</p>
          ) : (
            <div key={i} className="mr-4 space-y-2 rounded-lg border bg-background p-3">
              <p className="whitespace-pre-line">{m.content}</p>
              {m.products && m.products.length > 0 && (
                <ul className="space-y-1">
                  {m.products.map((p) => (
                    <li key={p.id}>
                      <Link to="/products/$slug" params={{ slug: p.slug }} onClick={() => setOpen(false)} className="flex justify-between gap-2 rounded bg-secondary px-3 py-2 text-sm">
                        <span className="font-semibold">{p.name}</span>
                        <span className="shrink-0">{formatPrice(p.price)}{p.in_stock ? "" : " · Ask us"}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {i === msgs.length - 1 && <ContactButtons />}
            </div>
          ),
        )}
        {busy && <p className="text-muted-foreground">Thinking…</p>}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t p-3">
        <label htmlFor="chat-input" className="sr-only">Your question</label>
        <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. something to hang a mirror" className="min-h-12 flex-1 rounded-lg border-2 border-input bg-background px-3 outline-none focus:border-primary" />
        <button disabled={busy || !text.trim()} aria-label="Send" className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-5 w-5" /></button>
      </form>
      <p className="px-3 pb-2 text-xs text-muted-foreground">AI helper — it can make mistakes, so please confirm with the shop. Don't share personal details.</p>
    </div>
  );
}
