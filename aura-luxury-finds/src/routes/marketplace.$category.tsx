import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { ProductCard } from "@/components/aura/ProductCard";
import { productsByCategory } from "@/data/products";

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
  const products = productsByCategory(category);
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
