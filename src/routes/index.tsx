import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/queries";
import { ContactButtons, MapEmbed, OpenBadge, ReviewButton, SearchBar, TodayHours } from "@/components/shop";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Screws & Tools — Hardware Store in Nassau, Bahamas",
      "Screws, bolts, nuts, washers, drill bits and hand tools at 9 Faith Avenue, Nassau, Bahamas. Check prices and stock online, then call or WhatsApp us.",
      "/",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data: cats } = useQuery(categoriesQuery);
  const top = [...(cats ?? [])].sort((a, b) => b.product_count - a.product_count).slice(0, 12);
  return (
    <div className="space-y-10">
      <section className="space-y-5 pt-2">
        <OpenBadge />
        <p className="font-display text-xl font-bold uppercase tracking-widest text-primary">Small parts. Big results.</p>
        <h1 className="text-5xl uppercase sm:text-6xl">
          The right screw. <span className="text-primary">Right here</span> in Nassau.
        </h1>
        <p className="text-xl text-muted-foreground">Fasteners and tools on Faith Avenue. Search what you need, check the price, then come grab it.</p>
        <SearchBar onSubmit={(q) => navigate({ to: "/products", search: { q } })} />
        <ContactButtons />
        <TodayHours />
      </section>

      <section aria-labelledby="cats" className="space-y-3">
        <h2 id="cats" className="text-3xl uppercase">Shop by category</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {top.map((c) => (
            <li key={c.slug}>
              <Link
                to="/$category"
                params={{ category: c.slug }}
                className="flex min-h-20 items-end rounded-lg border-l-4 border-primary bg-card p-4 font-display text-xl font-bold uppercase leading-tight hover:bg-accent"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/categories" className="inline-flex min-h-12 items-center text-lg font-bold text-primary underline">See all {cats?.length ?? ""} categories →</Link>
      </section>

      <section aria-labelledby="find" className="space-y-3">
        <h2 id="find" className="text-3xl uppercase">Find us</h2>
        <MapEmbed />
        <ReviewButton />
      </section>
    </div>
  );
}
