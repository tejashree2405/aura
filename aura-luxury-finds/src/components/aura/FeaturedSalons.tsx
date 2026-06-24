import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "./Reveal";
import { SALONS } from "@/data/salons";
import { SalonCard } from "./SalonCard";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api-client";
import type { Salon } from "@/data/types";

function dbToSalon(s: Record<string, unknown>): Salon {
  return {
    slug: s.slug as string, name: s.name as string,
    area: (s.city as string || "bangalore").toLowerCase().replace(/\s+/g, "-") as Salon["area"],
    areaLabel: s.city as string || "Bangalore", rating: (s.rating as number) || 0,
    startingPrice: (s.startingPrice as number) || 0, cover: (s.coverImage as string) || "",
    gallery: (s.galleryImages as string[]) || [], specialty: ((s.services as string[]) || [])[0] || "",
    about: (s.description as string) || "", specialties: (s.services as string[]) || [],
    services: (s.services as string[])?.map((svc) => svc.toLowerCase()) as Salon["services"] || [],
    contact: { phone: (s.phone as string) || "", email: (s.email as string) || "", website: (s.website as string) || "", address: (s.address as string) || "" },
  };
}

export function FeaturedSalons() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const { data: dbSalons } = useQuery({ queryKey: ["public-salons"], queryFn: () => api.listDbSalons().catch(() => []), staleTime: 60_000 });
  const dbConverted = ((dbSalons as Record<string, unknown>[] | undefined) || []).map(dbToSalon);
  const hardcodedSlugs = new Set(SALONS.map((s) => s.slug));
  const allSalons = [...SALONS, ...dbConverted.filter((s) => !hardcodedSlugs.has(s.slug))];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const speed = 56;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += speed * dt;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const loop = [...allSalons, ...allSalons];

  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <Reveal>
              <span className="eyebrow">Featured Salons</span>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] max-w-2xl">
                Quietly extraordinary spaces, <em className="italic text-[var(--earth)]">vetted</em>{" "}
                for you.
              </h2>
            </Reveal>
          </div>
          <Link
            to="/salons"
            className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground"
          >
            View all salons
          </Link>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-5 md:gap-6 overflow-x-auto px-6 md:px-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loop.map((s, i) => (
            <SalonCard key={s.slug + i} s={s} />
          ))}
        </div>

        <button
          onClick={() => scrollBy(-1)}
          aria-label="Previous salons"
          className="absolute left-3 md:left-6 top-[34%] -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Next salons"
          className="absolute right-3 md:right-6 top-[34%] -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
