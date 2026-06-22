import { Sparkles, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { conciergeImage } from "@/data/images";

const prompts = [
  "Wedding in 2 months",
  "Hair spa under ₹3000",
  "Best balayage specialist in Indiranagar",
  "Products for oily skin",
];

export function Concierge() {
  return (
    <section id="ai" className="relative py-28 md:py-40 px-6 md:px-16 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={conciergeImage.url}
          alt={conciergeImage.alt}
          width={1600}
          height={1000}
          loading="lazy"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
        <div>
          <Reveal><span className="eyebrow">The Aura Concierge</span></Reveal>
          <Reveal delay={1}>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.05]">
              A quiet intelligence that <em className="italic text-[var(--earth)]">knows beauty</em>.
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-8 text-foreground/70 max-w-md leading-relaxed">
              Tell Aura what you're seeking — a moment, a milestone, a ritual. It returns
              recommendations sourced from the city's most considered salons, services, and products.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <a
              href="#about"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm"
            >
              <Sparkles size={16} className="text-[var(--gold)]" />
              <span>Ask Aura AI</span>
              <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div className="glass rounded-3xl p-6 md:p-8 shadow-[var(--shadow-elegant)]">
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <span className="h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
              Aura AI · listening
            </div>
            <div className="mt-6 rounded-2xl bg-background/60 border border-foreground/10 p-5">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-[var(--gold)] mt-1 shrink-0" />
                <p className="text-foreground/80 text-sm leading-relaxed">
                  "I'd love a calm bridal preview in Indiranagar next weekend, with skincare prep for combination skin."
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                { k: "Salon", v: "Maison Aura · Indiranagar" },
                { k: "Service", v: "Bridal preview & gua sha facial" },
                { k: "Product", v: "Aman Restorative Serum" },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between border-b border-foreground/10 last:border-0 py-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">{r.k}</span>
                  <span className="text-sm">{r.v}</span>
                  <ArrowUpRight size={14} className="text-foreground/40" />
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button key={p} className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70 hover:bg-foreground hover:text-background transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
