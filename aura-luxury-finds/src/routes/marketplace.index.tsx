import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { ProductCard } from "@/components/aura/ProductCard";
import { PRODUCTS } from "@/data/products";

const CATEGORIES = [
  { slug: "skincare", label: "Skincare" },
  { slug: "haircare", label: "Haircare" },
  { slug: "makeup", label: "Makeup" },
  { slug: "wellness", label: "Wellness" },
] as const;

export const Route = createFileRoute("/marketplace/")({
  head: () => ({
    meta: [
      { title: "Marketplace — Aûra" },
      { name: "description", content: "Curated beauty, hair, and wellness products from considered houses." },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">The Marketplace</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02] max-w-3xl">
            A library of <em className="italic text-[var(--earth)]">beautiful</em> things.
          </h1>

          <div className="mt-12 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/marketplace/$category"
                params={{ category: c.slug }}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
