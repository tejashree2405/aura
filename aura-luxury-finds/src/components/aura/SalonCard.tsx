import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight } from "lucide-react";
import type { Salon } from "@/data/types";
import { handleImageError, FALLBACK_IMAGE } from "@/data/images";

export function SalonCard({ s }: { s: Salon }) {
  return (
    <Link
      to="/salons/$slug"
      params={{ slug: s.slug }}
      className="group block w-[78vw] sm:w-[300px] md:w-[280px] shrink-0"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <img
          src={s.cover || FALLBACK_IMAGE}
          alt={`${s.name} — ${s.specialty}`}
          loading="lazy"
          sizes="(min-width: 768px) 280px, 78vw"
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.05]"
        />
        {s.rating > 0 && (
          <div className="absolute top-3 left-3">
            <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
              <Star size={12} fill="currentColor" className="text-[var(--gold)]" />
              {s.rating}
            </span>
          </div>
        )}
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg truncate">{s.name}</h3>
            <p className="text-xs text-foreground/55 mt-1">{s.areaLabel}, Bangalore</p>
          </div>
          {s.startingPrice > 0 && (
            <div className="text-right shrink-0">
              <p className="text-[9px] tracking-[0.25em] uppercase text-foreground/50">Starting</p>
              <p className="font-display text-base mt-0.5">₹{s.startingPrice.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--earth)]">{s.specialty}</p>
          <span className="inline-flex items-center gap-1 text-xs text-foreground/60 group-hover:text-foreground transition-colors">
            View Details <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
