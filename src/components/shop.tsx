import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, MapPin, MessageCircle, Phone, Search, Star } from "lucide-react";
import { DAY_NAMES, SHOP, hoursLabel, isOpenAt, nassauNow, reviewHref, whatsappHref, formatPrice, categoryName, type Product } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function OpenBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const tick = () => setOpen(isOpenAt());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  if (open === null) return <span className={cn("inline-block h-8 w-24 rounded-full bg-muted", className)} aria-hidden />;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide",
        open ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {open ? "Open now" : "Closed"}
    </span>
  );
}

export function TodayHours() {
  const [day, setDay] = useState<number | null>(null);
  useEffect(() => setDay(nassauNow().day), []);
  return (
    <div className="flex items-center gap-3 text-lg">
      <Clock className="h-5 w-5 text-primary" aria-hidden />
      <span>
        Today: <strong>{day === null ? "…" : hoursLabel(day)}</strong>
      </span>
    </div>
  );
}

export function HoursTable() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <dl className="divide-y divide-border rounded-lg border bg-card">
      {order.map((d) => (
        <div key={d} className="flex justify-between px-4 py-3">
          <dt>{DAY_NAMES[d]}</dt>
          <dd className="font-semibold">{hoursLabel(d)}</dd>
        </div>
      ))}
    </dl>
  );
}

const big = "flex min-h-14 items-center justify-center gap-2 rounded-lg px-5 text-lg font-bold transition-transform active:scale-[0.98]";

export function ContactButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <a href={SHOP.phoneHref} className={cn(big, "bg-primary text-primary-foreground")}>
        <Phone className="h-5 w-5" aria-hidden /> Call
      </a>
      <a href={whatsappHref()} target="_blank" rel="noopener" className={cn(big, "bg-whatsapp text-whatsapp-foreground")}>
        <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
      </a>
    </div>
  );
}

export function ReviewButton() {
  return (
    <a href={reviewHref()} target="_blank" rel="noopener" className={cn(big, "w-full border-2 border-primary text-primary")}>
      <Star className="h-5 w-5" aria-hidden /> Leave us a Google review
    </a>
  );
}

export function MapEmbed() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <iframe
        title="Map showing Screws & Tools at 9 Faith Avenue, Nassau"
        src={SHOP.mapEmbed}
        className="h-64 w-full md:h-80"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={SHOP.mapLink} target="_blank" rel="noopener" className="flex items-center gap-2 bg-card px-4 py-3 font-semibold">
        <MapPin className="h-5 w-5 text-primary" aria-hidden /> {SHOP.address}
      </a>
    </div>
  );
}

export function SearchBar({ defaultValue = "", onSubmit }: { defaultValue?: string; onSubmit: (q: string) => void }) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(String(new FormData(e.currentTarget).get("q") ?? ""));
      }}
      className="flex overflow-hidden rounded-lg border-2 border-primary bg-card"
    >
      <label htmlFor="product-search" className="sr-only">Search products</label>
      <input
        id="product-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search: deck screws, 1/2 bolt…"
        className="min-h-16 w-full bg-transparent px-4 text-lg outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" aria-label="Search" className="flex w-16 shrink-0 items-center justify-center bg-primary text-primary-foreground">
        <Search className="h-6 w-6" />
      </button>
    </form>
  );
}

export function StockLabel({ inStock }: { inStock: boolean }) {
  return inStock ? (
    <span className="rounded bg-success/15 px-2 py-0.5 text-sm font-bold text-success">In stock</span>
  ) : (
    <span className="rounded bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">Ask us</span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  return (
    <li>
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="flex h-full flex-col gap-1 rounded-lg border bg-card p-4 transition-colors hover:border-primary"
      >
        <span className="text-sm uppercase tracking-wide text-muted-foreground">{categoryName(p.category)}</span>
        <span className="font-display text-2xl font-bold leading-tight">{p.name}</span>
        <span className="text-muted-foreground">{p.size}</span>
        <span className="mt-auto flex items-center justify-between pt-3">
          <span className="text-xl font-bold">{formatPrice(p.price)}</span>
          <StockLabel inStock={p.in_stock} />
        </span>
      </Link>
    </li>
  );
}
