import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { ProductCard } from "@/components/aura/ProductCard";
import { PRODUCTS } from "@/data/products";
import { api } from "@/lib/api-client";
import type { Product } from "@/data/types";

const CATEGORIES = [
  { slug: "skincare", label: "Skincare" },
  { slug: "haircare", label: "Haircare" },
  { slug: "makeup", label: "Makeup" },
  { slug: "wellness", label: "Wellness" },
] as const;

function dbToProduct(p: Record<string, unknown>): Product {
  return {
    slug: p.slug as string,
    name: p.name as string,
    brand: p.brand as string,
    category: p.category as Product["category"],
    price: p.price as number,
    rating: (p.rating as number) || 4.8,
    image: p.image as string,
    gallery: (p.gallery as string[]) || [p.image as string],
    description: (p.description as string) || "",
    ingredients: (p.ingredients as string[]) || [],
    reviews: [],
  };
}

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
  const { data: dbProducts } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => api.listDbProducts().catch(() => []),
    staleTime: 60_000,
  });

  const dbConverted = ((dbProducts as Record<string, unknown>[] | undefined) || []).map(dbToProduct);
  const hardcodedSlugs = new Set(PRODUCTS.map((p) => p.slug));
  const uniqueDb = dbConverted.filter((p) => !hardcodedSlugs.has(p.slug));
  const allProducts = [...PRODUCTS, ...uniqueDb];

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
            {allProducts.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
