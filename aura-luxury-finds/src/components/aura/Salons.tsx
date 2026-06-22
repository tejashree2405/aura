import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Reveal } from "./Reveal";
import { SALONS } from "@/data/salons";

const salons = SALONS.slice(0, 6).map((s) => ({
  name: s.name,
  area: s.areaLabel,
  specialty: s.specialty,
  rating: s.rating,
  price: s.startingPrice.toLocaleString("en-IN"),
  img: s.cover,
}));

function Card({ s }: { s: typeof salons[number] }) {
  return (
    <article className="group w-[68vw] sm:w-[300px] md:w-[320px] shrink-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <img
          src={s.img}
          alt={s.name}
          width={800}
          height={1066}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-[1.04]"
        />
        <div className="absolute top-4 left-4">
          <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
            <Star size={12} fill="currentColor" className="text-[var(--gold)]" />
            {s.rating}
          </span>
        </div>
      </div>
      <div className="pt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-xl truncate">{s.name}</h3>
          <p className="text-sm text-foreground/60 mt-1">{s.area}, Bangalore</p>
          <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--earth)] mt-3">{s.specialty}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">Starting</p>
          <p className="font-display text-lg mt-0.5">₹{s.price}</p>
        </div>
      </div>
    </article>
  );
}

export function Salons() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const speed = 45;
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
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 700, behavior: "smooth" });
  };

  const loop = [...salons, ...salons];

  return (
    <section id="salons" className="py-28 md:py-40 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        <div className="mb-16">
          <Reveal><span className="eyebrow">Featured Salons</span></Reveal>
          <Reveal delay={1}>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-2xl">
              Quietly extraordinary spaces, <em className="italic text-[var(--earth)]">vetted</em> for you.
            </h2>
          </Reveal>
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
          className="flex gap-6 md:gap-8 overflow-x-auto px-6 md:px-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loop.map((s, i) => (
            <Card key={s.name + i} s={s} />
          ))}
        </div>

        <button
          onClick={() => scrollBy(-1)}
          aria-label="Previous salons"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Next salons"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
