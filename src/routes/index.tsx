import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ContactButtons, MapEmbed, OpenBadge, ReviewButton, SearchBar, TodayHours } from "@/components/shop";
import { GuidedFinder } from "@/components/guided-finder";
import { SafeBoundary } from "@/components/safe-boundary";
import { categoriesQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Screws & Tools — Hardware Store in Nassau, Bahamas",
      "Screws, bolts, nuts, washers, drill bits and hand tools at 9 Faith Avenue, Nassau, Bahamas. Check prices and stock online, then call or WhatsApp us.",
      "/",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoriesQuery),
  errorComponent: () => <p className="text-lg">The page couldn't load. Please refresh or call us.</p>,
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  return (
    <div className="space-y-10">
      <section className="space-y-5 pt-2">
        <OpenBadge />
        <h1 className="text-5xl uppercase sm:text-6xl">
          The right screw. <span className="text-primary">Right here</span> in Nassau.
        </h1>
        <p className="text-xl text-muted-foreground">Fasteners and tools on Faith Avenue. Search what you need, check the price, then come grab it.</p>
        <SearchBar onSubmit={(q) => navigate({ to: "/products", search: { q } })} />
        <ContactButtons />
        <TodayHours />
      </section>

      <section aria-labelledby="help" className="space-y-3">
        <h2 id="help" className="text-3xl uppercase">Not sure what you need?</h2>
        <SafeBoundary label="help finder">
          <GuidedFinder />
        </SafeBoundary>
      </section>

      <section aria-labelledby="cats" className="space-y-3">
        <h2 id="cats" className="text-3xl uppercase">Shop by category</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                to="/$category"
                params={{ category: c.slug }}
                className="flex min-h-20 h-full flex-col justify-end rounded-lg border-l-4 border-primary bg-card p-4 font-display text-xl font-bold uppercase leading-tight hover:bg-accent"
              >
                {c.name}
                <span className="font-sans text-sm font-normal normal-case text-muted-foreground">{c.product_count.toLocaleString()} items</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="find" className="space-y-3">
        <h2 id="find" className="text-3xl uppercase">Find us</h2>
        <MapEmbed />
        <ReviewButton />
      </section>
    </div>
  );
}
