import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { TESTIMONIALS } from "@/data/testimonials";

export function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const speed = 32;
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

  const scrollBy = (d: number) => trackRef.current?.scrollBy({ left: d * 320, behavior: "smooth" });

  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 mb-12">
        <Reveal><span className="eyebrow">Stories</span></Reveal>
        <Reveal delay={1}>
          <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] max-w-3xl">
            Quiet endorsements from those who choose <em className="italic text-[var(--earth)]">carefully</em>.
          </h2>
        </Reveal>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-5 md:gap-6 overflow-x-auto px-6 md:px-16 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loop.map((t, i) => (
            <figure
              key={t.a + i}
              className="shrink-0 w-[78vw] sm:w-[44vw] md:w-[300px] aspect-[4/5] rounded-2xl border border-foreground/10 bg-[var(--cream)]/40 p-6 md:p-7 flex flex-col"
            >
              <span className="font-display text-5xl text-[var(--gold)] leading-none">"</span>
              <blockquote className="mt-4 font-display text-base md:text-lg leading-[1.35] text-foreground/85 flex-1">
                {t.q}
              </blockquote>
              <figcaption className="mt-6 text-[10px] tracking-[0.3em] uppercase text-foreground/60">
                {t.a} · {t.c}
              </figcaption>
            </figure>
          ))}
        </div>
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Previous"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Next"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center rounded-full glass shadow-[var(--shadow-soft)] hover:bg-foreground hover:text-background transition-colors"
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
