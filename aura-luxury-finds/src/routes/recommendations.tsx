import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { SALONS } from "@/data/salons";
import { PRODUCTS } from "@/data/products";
import { JOURNAL } from "@/data/journal";
import { SalonCard } from "@/components/aura/SalonCard";
import { ProductCard } from "@/components/aura/ProductCard";
import { JournalCard } from "@/components/aura/JournalCard";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations — Aûra" }] }),
  component: () => <RequireAuth><RecommendationsPage /></RequireAuth>,
});

function RecommendationsPage() {
  const salons = [...SALONS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const products = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const journal = JOURNAL.slice(0, 3);
  const rituals = JOURNAL.filter((j) => j.category === "wellness" || j.category === "skincare").slice(0, 3);

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">For You</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.6rem)]">A ritual curated for your aûra.</h1>
          <p className="mt-4 max-w-xl text-foreground/70">
            Quietly composed from the salons, products, and journal pieces aligned with your sensibility.
          </p>

          <Section title="Recommended Salons">
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((s) => <SalonCard key={s.slug} s={s} />)}
            </div>
          </Section>

          <Section title="Recommended Products">
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => <ProductCard key={p.slug} p={p} />)}
            </div>
          </Section>

          <Section title="From the Journal">
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {journal.map((j) => <JournalCard key={j.slug} p={j} />)}
            </div>
          </Section>

          <Section title="Rituals & Beauty Experiences">
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rituals.map((j) => <JournalCard key={j.slug} p={j} />)}
            </div>
            <div className="mt-8">
              <Link to="/ask-aura" search={{ mode: "ritual-builder" }} className="inline-flex rounded-full bg-foreground text-background px-6 py-3 text-sm">
                Build a personal ritual with Aûra
              </Link>
            </div>
          </Section>
        </div>
      </section>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-20">
      <h2 className="font-display text-3xl">{title}</h2>
      {children}
    </div>
  );
}
