import { createFileRoute } from "@tanstack/react-router";
import { ContactButtons, HoursTable, MapEmbed, OpenBadge, ReviewButton } from "@/components/shop";
import { SHOP, pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/about")({
  head: () =>
    pageMeta(
      "About & Contact — Screws & Tools, Nassau, Bahamas",
      "Visit Screws & Tools at 9 Faith Avenue, Nassau, Bahamas. Opening hours, phone, WhatsApp and directions for your local hardware store.",
      "/about",
    ),
  component: About,
});

function About() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-5xl uppercase">About &amp; Contact</h1>
        <p className="text-xl">
          Screws &amp; Tools is a small, local hardware store on Faith Avenue in Nassau. We keep the fasteners and tools
          builders, contractors and homeowners actually need — screws, bolts, nuts, washers, drill bits and more — and we'll
          help you find the right one.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-3xl uppercase">Get in touch</h2>
        <p className="text-lg">{SHOP.address}<br /><a href={SHOP.phoneHref} className="font-bold text-primary">{SHOP.phone}</a></p>
        <ContactButtons />
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-3xl uppercase">Opening hours</h2><OpenBadge /></div>
        <HoursTable />
      </section>
      <section className="space-y-3">
        <h2 className="text-3xl uppercase">Directions</h2>
        <MapEmbed />
        <ReviewButton />
      </section>
    </div>
  );
}
