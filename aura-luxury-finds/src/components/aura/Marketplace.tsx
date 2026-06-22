import { Sparkles, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { PRODUCTS } from "@/data/products";

const cats = ["All", "Haircare", "Skincare", "Makeup", "Wellness"];
const products = PRODUCTS.slice(0, 4).map((p) => ({
  name: p.name,
  category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
  price: p.price.toLocaleString("en-IN"),
  img: p.image,
}));

export function Marketplace() {
  return (
    <section id="marketplace" className="py-28 md:py-40 px-6 md:px-16 bg-[var(--cream)]/40">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-8 mb-12">
          <div>
            <Reveal><span className="eyebrow">The Marketplace</span></Reveal>
            <Reveal delay={1}>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-xl">
                A library of beautiful things, <em className="italic text-[var(--earth)]">considered</em>.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2}>
            <div className="flex flex-wrap gap-2">
              {cats.map((c, i) => (
                <button
                  key={c}
                  className={`rounded-full px-4 py-2 text-xs border transition-colors ${
                    i === 0
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/15 text-foreground/70 hover:border-foreground/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((p, i) => (
            <Reveal key={p.name} delay={i}>
              <article className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-background">
                  <img
                    src={p.img}
                    alt={p.name}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                </div>
                <div className="pt-4 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">{p.category}</p>
                    <h3 className="font-display text-lg mt-1">{p.name}</h3>
                  </div>
                  <p className="text-sm mt-1">₹{p.price}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={2}>
          <div className="mt-20 rounded-3xl border border-foreground/10 bg-background p-8 md:p-12 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <span className="eyebrow">AI Product Pairing</span>
              <h3 className="mt-4 font-display text-3xl md:text-4xl leading-tight">
                Tell Aura your skin, hair, and intent. Receive a ritual built for you.
              </h3>
              <a
                href="#ai"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm"
              >
                <Sparkles size={16} className="text-[var(--gold)]" />
                <span>Ask Aura AI</span>
                <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-foreground transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </a>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["Skin", "Combination, monsoon sensitivity"],
                ["Hair", "Coloured, fine texture"],
                ["Budget", "Up to ₹6,000"],
                ["Goal", "Quiet glow before travel"],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-foreground/10 pb-3">
                  <span className="text-foreground/50 text-[10px] tracking-[0.3em] uppercase">{k}</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
