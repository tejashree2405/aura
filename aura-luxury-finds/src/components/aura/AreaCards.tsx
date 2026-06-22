import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";
import { AREAS } from "@/data/areas";
import { handleImageError } from "@/data/images";

export function AreaCards() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-16 border-b border-foreground/10">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <Reveal><span className="eyebrow">Explore by Area</span></Reveal>
            <Reveal delay={1}>
              <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] max-w-2xl">
                Bangalore, <em className="italic text-[var(--earth)]">neighbourhood</em> by neighbourhood.
              </h2>
            </Reveal>
          </div>
          <Link to="/salons" className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground">
            All salons
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {AREAS.map((a, i) => (
            <Reveal key={a.slug} delay={i}>
              <Link
                to="/salons/area/$area"
                params={{ area: a.slug }}
                className="group block"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={a.image}
                    alt={a.label}
                    loading="lazy"
                    onError={handleImageError}
                    className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.06]"
                  />
                </div>
                <div className="pt-4">
                  <h3 className="font-display text-xl">{a.label}</h3>
                  <p className="mt-1 text-xs text-foreground/55">{a.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
