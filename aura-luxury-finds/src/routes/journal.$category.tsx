import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { JournalCard } from "@/components/aura/JournalCard";
import { articlesByCategory } from "@/data/journal";

const VALID = ["bridal", "haircare", "skincare", "wellness"] as const;
const LABELS: Record<string, string> = {
  bridal: "Bridal", haircare: "Haircare", skincare: "Skincare", wellness: "Wellness",
};

export const Route = createFileRoute("/journal/$category")({
  loader: ({ params }) => {
    if (!VALID.includes(params.category as never)) throw notFound();
    return { category: params.category, label: LABELS[params.category] };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Category not found.</h1>
        <Link to="/journal" className="mt-6 inline-block underline">Back to journal</Link>
      </div>
    </PageShell>
  ),
});

function CategoryPage() {
  const { category, label } = Route.useLoaderData();
  const articles = articlesByCategory(category);
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/journal" className="text-xs text-foreground/60 hover:text-foreground">← Journal</Link>
          <span className="eyebrow mt-6 block">Category</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02]">
            <em className="italic text-[var(--earth)]">{label}</em>
          </h1>
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {articles.map((p) => <JournalCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
