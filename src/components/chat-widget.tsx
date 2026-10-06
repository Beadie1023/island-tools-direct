import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CHAT, type ChatItem } from "@/lib/chat-config";
import { sendChat } from "@/lib/chat.functions";
import { formatPrice } from "@/lib/shop";
import { ContactButtons } from "./shop";

type Msg = { role: "user" | "assistant"; content: string; items?: ChatItem[] };

const STARTERS = [
  "I need to hang a shelf on a concrete wall",
  "Screws for an outdoor deck near the sea",
  "My toilet keeps leaking. What do I need?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [detail, setDetail] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy, problem, open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = async (question: string) => {
    const q = question.trim().slice(0, CHAT.maxChars);
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setText("");
    setProblem("");
    setDetail("");
    setBusy(true);
    try {
      const history = next.slice(-CHAT.maxTurns).map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChat({ data: { messages: history } });
      if (res.ok) setMsgs([...next, { role: "assistant", content: res.reply, items: res.items }]);
      else setProblem(res.message);
    } catch (e) {
      console.error("[chat]", e);
      setProblem("Something went wrong. Please call or WhatsApp us.");
      setDetail(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-primary px-5 text-lg font-bold text-primary-foreground shadow-lg"
      >
        <MessageCircle className="h-6 w-6" aria-hidden /> Not sure? Ask us
      </button>
    );
  }

  return (
    <section
      aria-label="Product help chat"
      className="fixed inset-x-2 bottom-2 z-40 flex h-[75vh] max-h-[640px] flex-col overflow-hidden rounded-xl border bg-card shadow-2xl sm:inset-x-auto sm:right-4 sm:w-96"
    >
      <header className="flex items-center justify-between gap-2 border-b bg-secondary px-4 py-3">
        <div>
          <h2 className="text-xl uppercase">Ask Screws &amp; Tools</h2>
          <p className="text-sm text-muted-foreground">Describe the job. We'll suggest what you need.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent">
          <X className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        {msgs.length === 0 && (
          <div className="space-y-2">
            <p className="text-lg">Hi! Tell me what you're trying to do and I'll find the right parts.</p>
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => void ask(s)} className="block w-full rounded-lg border-l-4 border-primary bg-background px-3 py-2 text-left font-semibold hover:bg-accent">
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "space-y-2"}>
            <p className={m.role === "user" ? "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground" : "whitespace-pre-wrap text-lg"}>{m.content}</p>
            {m.items && m.items.length > 0 && (
              <ul className="space-y-2">
                {m.items.filter((it) => !!it.slug).map((it) => (
                  <li key={it.slug}>
                    <a href={`/products/${encodeURIComponent(it.slug)}`} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 hover:bg-accent">
                      <span className="font-semibold leading-tight">{it.name}</span>
                      <span className="shrink-0 font-bold text-primary">{formatPrice(it.price)}</span>
                    </a>
                  </li>
                ))}
                <li className="text-sm text-muted-foreground">Prices are from our list. Call or WhatsApp to confirm stock before you come.</li>
              </ul>
            )}
          </div>
        ))}
        {busy && <p className="text-muted-foreground">Looking through the shelves…</p>}
        {problem && (
          <div className="space-y-2 rounded-lg border bg-background p-3">
            <p>{problem}</p>
            <ContactButtons />
            {detail && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">Technical details</summary>
                <p className="break-words pt-1">{detail}</p>
              </details>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(text);
        }}
        className="flex gap-2 border-t p-3"
      >
        <label htmlFor="chat-input" className="sr-only">Describe what you need</label>
        <input
          id="chat-input"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={CHAT.maxChars}
          placeholder="e.g. something to hang a mirror"
          className="min-h-12 flex-1 rounded-lg border-2 border-input bg-background px-3 text-lg outline-none focus:border-primary"
        />
        <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="flex min-h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40">
          <Send className="h-5 w-5" aria-hidden />
        </button>
      </form>
      <p className="px-3 pb-2 text-xs text-muted-foreground">AI helper. It can make mistakes, so please confirm with the shop. Don't share personal details.</p>
    </section>
  );
}
