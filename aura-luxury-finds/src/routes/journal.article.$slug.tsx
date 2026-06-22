import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { JournalCard } from "@/components/aura/JournalCard";
import { getArticle, JOURNAL } from "@/data/journal";

export const Route = createFileRoute("/journal/article/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.article.title} — Aûra Journal` },
            { name: "description", content: loaderData.article.excerpt },
            { property: "og:image", content: loaderData.article.cover },
          ],
        }
      : {},
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
  const { article } = Route.useLoaderData();
  const related = JOURNAL.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);

  return (
    <PageShell>
      <article className="px-6 md:px-16 pb-20">
        <div className="max-w-[820px] mx-auto">
          <Link to="/journal" className="text-xs text-foreground/60 hover:text-foreground">← Journal</Link>
          <div className="mt-8 text-[10px] tracking-[0.3em] uppercase text-foreground/50 flex items-center gap-3">
            <span>{article.category}</span><span>·</span><span>{article.readingTime} read</span><span>·</span><span>{article.date}</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">{article.title}</h1>
          <p className="mt-6 text-lg text-foreground/70">{article.excerpt}</p>
        </div>
        <div className="max-w-[1080px] mx-auto mt-12 aspect-[16/9] overflow-hidden rounded-2xl">
          <img src={article.cover} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-[720px] mx-auto mt-16 space-y-6 font-display text-xl leading-[1.6] text-foreground/85">
          {article.content.map((p: string, i: number) => <p key={i}>{p}</p>)}
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
