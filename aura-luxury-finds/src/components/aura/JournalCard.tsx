import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { JournalArticle } from "@/data/types";
import { handleImageError } from "@/data/images";

export function JournalCard({ p }: { p: JournalArticle }) {
  return (
    <Link to="/journal/article/$slug" params={{ slug: p.slug }} className="group block">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl">
        <img
          src={p.cover}
          alt={p.title}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
      </div>
      <div className="pt-5">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-foreground/50">
          <span>{p.category}</span><span>·</span><span>{p.readingTime} read</span>
        </div>
        <h3 className="mt-3 font-display text-xl md:text-2xl leading-snug">{p.title}</h3>
        <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{p.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs text-foreground/70 group-hover:text-foreground">
          Read Journal <ArrowUpRight size={12} />
        </span>
      </div>
    </Link>
  );
}
