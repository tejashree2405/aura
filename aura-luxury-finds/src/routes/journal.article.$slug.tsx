import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { JournalCard } from "@/components/aura/JournalCard";
import { getArticle, JOURNAL } from "@/data/journal";
import { api } from "@/lib/api-client";
import type { JournalArticle } from "@/data/types";

function dbToArticle(a: Record<string, unknown>): JournalArticle {
  return {
    slug: a.slug as string, title: a.title as string,
    excerpt: (a.excerpt as string) || "",
    category: a.category as JournalArticle["category"],
    cover: a.cover as string,
    readingTime: (a.readingTime as string) || "5 min",
    content: (a.content as string[]) || [],
    author: (a.author as string) || "Aûra Editorial",
    date: (a.date as string) || "",
  };
}

export const Route = createFileRoute("/journal/article/$slug")({
  loader: ({ params }) => {
    const hardcoded = getArticle(params.slug);
    return { slug: params.slug, hardcoded: hardcoded || null };
  },
  head: ({ loaderData }) =>
    loaderData?.hardcoded
      ? { meta: [{ title: `${loaderData.hardcoded.title} — Aûra Journal` }, { name: "description", content: loaderData.hardcoded.excerpt }, { property: "og:image", content: loaderData.hardcoded.cover }] }
      : { meta: [{ title: "Journal — Aûra" }] },
  component: ArticlePage,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Article not found.</h1>
        <Link to="/journal" className="mt-6 inline-block underline">Back to journal</Link>
      </div>
    </PageShell>
  ),
});

function ArticlePage() {
  const { slug, hardcoded } = Route.useLoaderData();
  const { data: dbRaw, isLoading } = useQuery({
    queryKey: ["journal-detail", slug],
    queryFn: () => api.getDbJournal(slug).catch(() => null),
    enabled: !hardcoded,
    staleTime: 60_000,
  });

  const article: JournalArticle | null = hardcoded || (dbRaw ? dbToArticle(dbRaw as Record<string, unknown>) : null);

  if (!hardcoded && isLoading) {
    return <PageShell><div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto"><p className="text-foreground/50">Loading...</p></div></PageShell>;
  }
  if (!article) {
    return (
      <PageShell>
        <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
          <h1 className="font-display text-3xl">Article not found.</h1>
          <Link to="/journal" className="mt-6 inline-block underline">Back to journal</Link>
        </div>
      </PageShell>
    );
  }

  const related = JOURNAL.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);
  const contentParagraphs = article.content.length ? article.content : (article.excerpt ? [article.excerpt] : []);

  return (
    <PageShell>
      <article className="px-6 md:px-16 pb-20">
        <div className="max-w-[820px] mx-auto">
          <Link to="/journal" className="text-xs text-foreground/60 hover:text-foreground">← Journal</Link>
          <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-foreground/50 flex items-center gap-3">
            <span>{article.category}</span><span>·</span><span>{article.readingTime} read</span><span>·</span><span>{article.date}</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">{article.title}</h1>
          {article.excerpt && article.content.length > 0 && (
            <p className="mt-6 text-lg text-foreground/70">{article.excerpt}</p>
          )}
        </div>
        <div className="max-w-[1080px] mx-auto mt-12 aspect-[16/9] overflow-hidden rounded-2xl">
          <img src={article.cover} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-[720px] mx-auto mt-16 space-y-6 font-display text-xl leading-[1.6] text-foreground/85">
          {contentParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)}
        </div>
        <p className="max-w-[720px] mx-auto mt-12 text-[10px] tracking-[0.3em] uppercase text-foreground/50">
          Written by {article.author}
        </p>
      </article>

      {related.length > 0 && (
        <section className="px-6 md:px-16 pb-32 border-t border-foreground/10 pt-20">
          <div className="max-w-[1280px] mx-auto">
            <span className="eyebrow">Related reading</span>
            <div className="mt-8 grid md:grid-cols-3 gap-8 md:gap-10">
              {related.map((p) => <JournalCard key={p.slug} p={p} />)}
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
