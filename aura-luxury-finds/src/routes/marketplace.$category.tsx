import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { ProductCard } from "@/components/aura/ProductCard";
import { productsByCategory } from "@/data/products";
import { api } from "@/lib/api-client";
import type { Product } from "@/data/types";

const VALID = ["skincare", "haircare", "makeup", "wellness"] as const;
const LABELS: Record<string, string> = {
  skincare: "Skincare", haircare: "Haircare", makeup: "Makeup", wellness: "Wellness",
};

export const Route = createFileRoute("/marketplace/$category")({
  loader: ({ params }) => {
    if (!VALID.includes(params.category as never)) throw notFound();
    return { category: params.category, label: LABELS[params.category] };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Category not found.</h1>
        <Link to="/marketplace" className="mt-6 inline-block underline">Back to marketplace</Link>
      </div>
    </PageShell>
  ),
});

function CategoryPage() {
  const { category, label } = Route.useLoaderData();
  const hardcoded = productsByCategory(category);
  const { data: dbAll } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => api.listDbProducts().catch(() => []),
    staleTime: 60_000,
  });
  const hardcodedSlugs = new Set(hardcoded.map((p) => p.slug));
  const dbFiltered = ((dbAll as Record<string, unknown>[] | undefined) || [])
    .filter((p) => (p.category as string) === category && !hardcodedSlugs.has(p.slug as string))
    .map((p): Product => ({
      slug: p.slug as string, name: p.name as string, brand: p.brand as string,
      category: p.category as Product["category"], price: p.price as number,
      rating: (p.rating as number) || 4.8, image: p.image as string,
      gallery: (p.gallery as string[]) || [p.image as string],
      description: (p.description as string) || "", ingredients: (p.ingredients as string[]) || [], reviews: [],
    }));
  const products = [...hardcoded, ...dbFiltered];

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/marketplace" className="text-xs text-foreground/60 hover:text-foreground">← Marketplace</Link>
          <span className="eyebrow mt-6 block">Category</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02]">
            <em className="italic text-[var(--earth)]">{label}</em>
          </h1>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
