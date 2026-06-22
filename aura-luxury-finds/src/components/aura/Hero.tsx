import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { heroImages } from "@/data/images";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="home" className="relative h-[100svh] min-h-[680px] overflow-hidden">
      <motion.div ref={ref as never} style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImages[0].url}
          alt={heroImages[0].alt}
          width={1920}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--ivory)]/30 via-transparent to-[var(--ivory)]" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col justify-end pb-20 md:pb-28 px-6 md:px-16 max-w-[1280px] mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease }}
          className="eyebrow mb-6"
        >
          A luxury beauty atelier · Bangalore
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.8, ease }}
          className="font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[1.02] max-w-5xl text-foreground"
        >
          Discover Bangalore's <em className="italic text-[var(--earth)]">finest</em> beauty experiences.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease }}
          className="mt-8 max-w-xl text-base md:text-lg text-foreground/70 leading-relaxed"
        >
          Luxury salons, curated beauty products, and personalised recommendations — quietly guided by Aura AI.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button className="group inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm">
            <Sparkles size={16} className="text-[var(--gold)]" />
            <span>Ask Aura AI</span>
            <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-background transition-transform group-hover:rotate-45">
              <ArrowUpRight size={16} />
            </span>
          </button>
          <a href="#salons" className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground transition">
            Explore Salons
          </a>
        </motion.div>
      </div>
    </section>
  );
}
