import { Reveal } from "./Reveal";

const quotes = [
  { q: "Aura led me to a hidden atelier in Indiranagar — the most considered bridal preview of my life.", a: "Anaïs R.", c: "Bride, Spring '26" },
  { q: "I asked for a calm monsoon ritual. It returned three products and a Sunday booking. Effortless.", a: "Meher S.", c: "Writer" },
  { q: "Finally, a beauty platform that understands restraint. It feels less like an app, more like a confidant.", a: "Rhea K.", c: "Architect" },
  { q: "The recommendations feel hand-picked by a friend with exquisite taste — never algorithmic.", a: "Ila M.", c: "Gallerist" },
  { q: "From a single conversation, Aura curated my entire wedding-week beauty calendar.", a: "Tara V.", c: "Bride, Winter '25" },
  { q: "It found me a colourist in Koramangala I had walked past for years and never noticed.", a: "Devika P.", c: "Editor" },
  { q: "There is a softness to the way Aura suggests things. Nothing pushed, everything considered.", a: "Naina A.", c: "Photographer" },
  { q: "A beauty concierge that finally feels like Bangalore deserves.", a: "Maya J.", c: "Curator" },
];

export function Testimonials() {
  return (
    <section className="py-28 md:py-40 px-6 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-16">
          <Reveal><span className="eyebrow">Stories</span></Reveal>
          <Reveal delay={1}>
            <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-3xl">
              Quiet endorsements from those who choose <em className="italic text-[var(--earth)]">carefully</em>.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {quotes.map((t, i) => (
            <Reveal key={t.a} delay={i}>
              <figure className="aspect-[4/5] rounded-2xl border border-foreground/10 bg-[var(--cream)]/40 p-6 md:p-7 flex flex-col">
                <span className="font-display text-5xl text-[var(--gold)] leading-none">“</span>
                <blockquote className="mt-4 font-display text-base md:text-lg leading-[1.35] text-foreground/85 flex-1">
                  {t.q}
                </blockquote>
                <figcaption className="mt-6 text-[10px] tracking-[0.3em] uppercase text-foreground/60">
                  {t.a} · {t.c}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
