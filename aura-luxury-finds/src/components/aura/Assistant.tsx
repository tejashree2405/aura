import { Sparkles, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

const examples = [
  "Which haircut suits oval faces?",
  "Best salon for bridal makeup?",
  "Hair spa or keratin treatment?",
  "Products for dry hair?",
];

export function Assistant() {
  return (
    <section id="about" className="py-28 md:py-40 px-6 md:px-16 bg-foreground text-background">
      <div className="max-w-[1180px] mx-auto grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
        <div>
          <Reveal><span className="eyebrow" style={{ color: "var(--sand)" }}>The Aura AI</span></Reveal>
          <Reveal delay={1}>
            <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02]">
              Your <em className="italic text-[var(--gold)]">private</em> beauty assistant. Always in.
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-8 text-background/70 max-w-md leading-relaxed">
              Aura learns your texture, your tones, your tempo — then pairs you with the people, places,
              and products that quietly bring out your best.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <button className="mt-10 group inline-flex items-center gap-3 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm">
              <Sparkles size={16} className="text-[var(--gold)]" />
              <span>Begin a conversation</span>
              <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </button>
          </Reveal>
        </div>

        <Reveal delay={2}>
          <ul className="space-y-2">
            {examples.map((q, i) => (
              <li
                key={q}
                className="group flex items-center justify-between gap-6 rounded-2xl border border-background/15 px-6 py-5 hover:bg-background/5 transition-colors"
              >
                <span className="text-background/40 text-xs font-mono">0{i + 1}</span>
                <span className="flex-1 font-display text-xl md:text-2xl">{q}</span>
                <ArrowUpRight size={18} className="text-background/40 transition-transform group-hover:rotate-45 group-hover:text-[var(--gold)]" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
