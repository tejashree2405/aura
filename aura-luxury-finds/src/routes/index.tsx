import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Nav } from "@/components/aura/Nav";
import { Footer } from "@/components/aura/Footer";
import { HeroCarousel } from "@/components/aura/HeroCarousel";
import { AreaCards } from "@/components/aura/AreaCards";
import { FeaturedSalons } from "@/components/aura/FeaturedSalons";
import { TestimonialsCarousel } from "@/components/aura/TestimonialsCarousel";
import { Categories } from "@/components/aura/Categories";
import { Reveal } from "@/components/aura/Reveal";
import { useLenis } from "@/hooks/use-lenis";
import { PRODUCTS } from "@/data/products";
import { JOURNAL } from "@/data/journal";
import { ProductCard } from "@/components/aura/ProductCard";
import { JournalCard } from "@/components/aura/JournalCard";
import { conciergeImage } from "@/data/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aûra — Bangalore's Finest Beauty, Discovered by AI" },
      { name: "description", content: "A luxury beauty concierge — curated salons, premium products, and personalised recommendations powered by Aûra AI." },
      { property: "og:title", content: "Aûra — Luxury Beauty Discovery" },
      { property: "og:description", content: "Discover Bangalore's finest salons and beauty rituals, guided by Aûra AI." },
    ],
  }),
  component: Index,
});

function Index() {
  useLenis();
  const featuredProducts = PRODUCTS.slice(0, 4);
  const featuredJournal = JOURNAL.slice(0, 3);

  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <Nav />
      <HeroCarousel />
      <AreaCards />
      <Categories />
      <FeaturedSalons />

      {/* Marketplace teaser */}
      <section className="py-24 md:py-32 px-6 md:px-16 bg-[var(--cream)]/40">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <Reveal><span className="eyebrow">The Marketplace</span></Reveal>
              <Reveal delay={1}>
                <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] max-w-xl">
                  A library of beautiful things, <em className="italic text-[var(--earth)]">considered</em>.
                </h2>
              </Reveal>
            </div>
            <Link to="/marketplace" className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground">
              All products
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((p, i) => (
              <Reveal key={p.slug} delay={i}><ProductCard p={p} /></Reveal>
            ))}
          </div>

          <Reveal delay={2}>
            <div className="mt-16 rounded-3xl border border-foreground/10 bg-background p-8 md:p-12 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <span className="eyebrow">AI Product Pairing</span>
                <h3 className="mt-4 font-display text-2xl md:text-3xl leading-tight">
                  Tell Aûra your skin, hair, and intent. Receive a ritual built for you.
                </h3>
                <Link
                  to="/ask-aura"
                  search={{ mode: "product-pairing" }}
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm"
                >
                  <Sparkles size={16} className="text-[var(--gold)]" />
                  <span>Ask Aûra AI</span>
                  <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-foreground transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
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

      {/* AI concierge */}
      <section className="relative py-24 md:py-32 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={conciergeImage.url} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        <div className="max-w-[1180px] mx-auto text-center">
          <Reveal><span className="eyebrow">The Aûra Concierge</span></Reveal>
          <Reveal delay={1}>
            <h2 className="mt-6 mx-auto font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-3xl">
              A quiet intelligence that <em className="italic text-[var(--earth)]">knows beauty</em>.
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-8 mx-auto max-w-lg text-foreground/70 leading-relaxed">
              Tell Aûra what you're seeking. It returns recommendations sourced from the city's most considered salons, services, and products.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <Link
              to="/ask-aura"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-foreground text-background pl-6 pr-2 py-2 text-sm"
            >
              <Sparkles size={16} className="text-[var(--gold)]" />
              <span>Ask Aûra AI</span>
              <span className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-[var(--gold)] text-foreground transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <TestimonialsCarousel />

      {/* Journal teaser */}
      <section className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <Reveal><span className="eyebrow">The Beauty Journal</span></Reveal>
              <Reveal delay={1}>
                <h2 className="mt-6 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.05] max-w-2xl">
                  Slow reading for the <em className="italic text-[var(--earth)]">thoughtful</em>.
                </h2>
              </Reveal>
            </div>
            <Link to="/journal" className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground">
              All essays
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {featuredJournal.map((p, i) => (
              <Reveal key={p.slug} delay={i}><JournalCard p={p} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
