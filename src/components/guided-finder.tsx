import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useState } from "react";
import { FINDER, FINDER_START, type FinderOption } from "@/lib/finder";
import { ContactButtons } from "./shop";

const choice =
  "flex min-h-14 w-full flex-col justify-center rounded-lg border-l-4 border-primary bg-card px-4 py-2 text-left text-lg font-semibold hover:bg-accent";
const small = "inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-3 font-semibold";

export function GuidedFinder() {
  const navigate = useNavigate();
  const [trail, setTrail] = useState<string[]>([FINDER_START]);
  const node = FINDER[trail[trail.length - 1] ?? FINDER_START];
  if (!node) return null;

  const pick = (o: FinderOption) => {
    if (o.next) {
      setTrail((t) => [...t, o.next as string]);
      window.scrollTo({ top: 0 });
      return;
    }
    if (!o.go) return;
    const search: { sub?: string; q?: string } = {};
    if (o.go.sub) search.sub = o.go.sub;
    if (o.go.q) search.q = o.go.q;
    void navigate({ to: "/$category", params: { category: o.go.category }, search });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-background p-4">
      <h3 className="text-2xl uppercase">{node.question}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {node.options.map((o) => (
          <li key={o.label}>
            <button type="button" onClick={() => pick(o)} className={choice}>
              {o.label}
              {o.hint && <span className="text-sm font-normal text-muted-foreground">{o.hint}</span>}
            </button>
          </li>
        ))}
      </ul>
      {node.contact && (
        <div className="space-y-3">
          <ContactButtons />
          <p className="text-muted-foreground">Or try the search box above. We stock far more than we list.</p>
        </div>
      )}
      {trail.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={() => setTrail((t) => t.slice(0, -1))} className={small}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
          <button type="button" onClick={() => setTrail([FINDER_START])} className={small}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Start over
          </button>
        </div>
      )}
    </div>
  );
}
