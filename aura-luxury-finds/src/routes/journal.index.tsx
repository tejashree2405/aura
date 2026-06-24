import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { JournalCard } from "@/components/aura/JournalCard";
import { JOURNAL } from "@/data/journal";
import { api } from "@/lib/api-client";
import type { JournalArticle } from "@/data/types";

const CATS = [
  { slug: "bridal", label: "Bridal" },
  { slug: "haircare", label: "Haircare" },
  { slug: "skincare", label: "Skincare" },
  { slug: "wellness", label: "Wellness" },
] as const;

function dbToArticle(a: Record<string, unknown>): JournalArticle {
  return {
    slug: a.slug as string,
    title: a.title as string,
    excerpt: (a.excerpt as string) || "",
    category: a.category as JournalArticle["category"],
    cover: a.cover as string,
    readingTime: (a.readingTime as string) || "5 min",
    content: (a.content as string[]) || [],
    author: (a.author as string) || "Aûra Editorial",
    date: (a.date as string) || "",
  };
}

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
  const { data: dbArticles } = useQuery({
    queryKey: ["public-journals"],
    queryFn: () => api.listDbJournals().catch(() => []),
    staleTime: 60_000,
  });

  const dbConverted = ((dbArticles as Record<string, unknown>[] | undefined) || []).map(dbToArticle);
  const hardcodedSlugs = new Set(JOURNAL.map((a) => a.slug));
  const uniqueDb = dbConverted.filter((a) => !hardcodedSlugs.has(a.slug));
  const allArticles = [...JOURNAL, ...uniqueDb];

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
            {allArticles.map((p) => <JournalCard key={p.slug} p={p} />)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
