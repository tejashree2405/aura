import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { JournalCard } from "@/components/aura/JournalCard";
import { JOURNAL } from "@/data/journal";

const CATS = [
  { slug: "bridal", label: "Bridal" },
  { slug: "haircare", label: "Haircare" },
  { slug: "skincare", label: "Skincare" },
  { slug: "wellness", label: "Wellness" },
] as const;

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Journal — Aûra" },
      { name: "description", content: "Slow reading for the thoughtful — bridal, haircare, skincare, wellness." },
    ],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">The Beauty Journal</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02] max-w-3xl">
            Slow reading for the <em className="italic text-[var(--earth)]">thoughtful</em>.
          </h1>

          <div className="mt-12 flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Link
                key={c.slug}
                to="/journal/$category"
                params={{ category: c.slug }}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {JOURNAL.map((p) => <JournalCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
