import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { heroImages, handleImageError } from "@/data/images";

interface Slide {
  image: string;
  title: React.ReactNode;
  text: string;
  ctas: { label: string; to: string; primary?: boolean; mode?: "concierge" }[];
}

const slides: Slide[] = [
  {
    image: heroImages[0].url,
    title: (
      <>
        Discover Bangalore's <em className="italic text-[var(--earth)]">finest</em> beauty
        experiences.
      </>
    ),
    text: "Luxury salons, curated beauty products, and personalised recommendations guided by Aûra AI.",
    ctas: [
      { label: "Explore Salons", to: "/salons", primary: true },
      { label: "Ask Aûra AI", to: "/ask-aura" },
    ],
  },
  {
    image: heroImages[1].url,
    title: (
      <>
        Beauty tailored to your <em className="italic text-[var(--earth)]">rhythm</em>.
      </>
    ),
    text: "Discover salons, professionals, and rituals aligned with your lifestyle.",
    ctas: [{ label: "Discover Experiences", to: "/marketplace", primary: true }],
  },
  {
    image: heroImages[2].url,
    title: (
      <>
        The city's most <em className="italic text-[var(--earth)]">trusted</em> beauty destinations.
      </>
    ),
    text: "Explore verified beauty spaces across Bangalore.",
    ctas: [{ label: "Browse Salons", to: "/salons", primary: true }],
  },
  {
    image: heroImages[3].url,
    title: (
      <>
        A personal beauty concierge for{" "}
        <em className="italic text-[var(--earth)]">modern living</em>.
      </>
    ),
    text: "Receive intelligent recommendations for salons, products, and wellness rituals.",
    ctas: [{ label: "Ask Aûra AI", to: "/ask-aura", primary: true, mode: "concierge" }],
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = slides[idx];

  return (
    <section className="relative h-[100svh] min-h-[680px] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={s.image}
            alt={heroImages[idx].alt}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="100vw"
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ivory)]/25 via-[var(--ivory)]/40 to-[var(--ivory)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-end pb-20 md:pb-28 px-6 md:px-16 max-w-[1280px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow mb-6 block">A luxury beauty atelier · Bangalore</span>
            <h1 className="font-display text-[clamp(2.4rem,6.5vw,6rem)] leading-[1.02] max-w-5xl text-foreground">
              {s.title}
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/70 leading-relaxed">
              {s.text}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {s.ctas.map((c) =>
                c.primary ? (
                  <Link
                    key={c.label}
                    to={c.to}
                    className="group inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm"
                  >
                    <Sparkles size={16} className="text-[var(--gold)]" />
                    <span>{c.label}</span>
                    <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-background transition-transform group-hover:rotate-45">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                ) : (
                  <Link
                    key={c.label}
                    to={c.to}
                    className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground transition"
                  >
                    {c.label}
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 right-8 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[3px] transition-all ${i === idx ? "w-10 bg-foreground" : "w-5 bg-foreground/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
