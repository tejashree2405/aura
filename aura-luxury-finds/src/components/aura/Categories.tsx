import { Reveal } from "./Reveal";

const categories = [
  { n: "01", t: "Hair", s: "Cuts, colour, keratin, bridal." },
  { n: "02", t: "Skin", s: "Facials, peels, gua sha rituals." },
  { n: "03", t: "Makeup", s: "Editorial, bridal, occasion." },
  { n: "04", t: "Wellness", s: "Massage, ayurveda, stillness." },
];

export function Categories() {
  return (
    <section className="py-28 md:py-40 px-6 md:px-16 border-y border-foreground/10">
      <div className="max-w-[1280px] mx-auto">
        <Reveal>
          <span className="eyebrow">The Disciplines</span>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-3xl">
            Four quiet <em className="italic text-[var(--earth)]">disciplines</em>, one considered house.
          </h2>
        </Reveal>

        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14">
          {categories.map((c, i) => (
            <Reveal key={c.t} delay={i + 1}>
              <div className="border-t border-foreground/15 pt-6">
                <span className="font-mono text-[11px] tracking-[0.3em] text-foreground/40">{c.n}</span>
                <h3 className="mt-6 font-display text-3xl md:text-4xl">{c.t}</h3>
                <p className="mt-4 text-sm text-foreground/60 leading-relaxed max-w-[28ch]">{c.s}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
