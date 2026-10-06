import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { SHOP } from "@/lib/shop";
import { OpenBadge } from "./shop";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="hazard-stripe h-1.5" aria-hidden />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold uppercase tracking-wide">
          Screws <span className="text-primary">&amp;</span> Tools
        </Link>
        <a href={SHOP.phoneHref} className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 font-bold text-primary-foreground">
          <Phone className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{SHOP.phone}</span><span className="sm:hidden">Call</span>
        </a>
      </div>
      <nav aria-label="Main" className="mx-auto flex max-w-5xl gap-1 px-2 pb-2">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.to === "/" }}
            className="flex min-h-11 items-center rounded-md px-3 text-lg font-semibold text-muted-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid max-w-5xl gap-2 px-4 py-8 text-muted-foreground">
        <p className="font-display text-xl font-bold text-foreground">Screws &amp; Tools — Hardware store in Nassau, Bahamas</p>
        <p>{SHOP.address}</p>
        <p><a href={SHOP.phoneHref} className="underline">{SHOP.phone}</a></p>
        <p>Mon–Fri 7:30 AM–5:00 PM · Sat 7:30 AM–3:00 PM · Sun closed</p>
        <div className="mt-2"><OpenBadge /></div>
      </div>
    </footer>
  );
}
