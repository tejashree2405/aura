import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Aûra" },
      { name: "description", content: "AÛRA is a luxury beauty concierge for Bangalore. Personal, effortless, trusted, elevated." },
      { property: "og:title", content: "About Aûra" },
      { property: "og:description", content: "A luxury beauty concierge for Bangalore." },
    ],
  }),
  component: AboutPage,
});

const philosophy = [
  { t: "Personal", s: "Built around your texture, tones, and tempo." },
  { t: "Effortless", s: "Curation that removes the noise of choice." },
  { t: "Trusted", s: "Vetted salons, verified professionals." },
  { t: "Elevated", s: "Standards quietly raised, always." },
];

const what = [
  { t: "Discover", s: "Find Bangalore's most considered salons and beauty houses." },
  { t: "Curate", s: "A shortlist built for your skin, hair, and intent." },
  { t: "Personalize", s: "Recommendations that learn your rhythm." },
  { t: "Connect", s: "Direct introductions to the right artist or atelier." },
];

const experience = [
  { t: "Curated Salons", s: "The city's quietly extraordinary spaces." },
  { t: "Trusted Professionals", s: "A roster of considered artists and therapists." },
  { t: "Personalized Rituals", s: "Routines composed for your life, not a category." },
  { t: "Aûra AI Concierge", s: "An intelligence that knows beauty." },
];

function AboutPage() {
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-16">
        <div className="max-w-[1080px] mx-auto text-center">
          <span className="eyebrow">About Aûra</span>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[1.02]">
            Beauty, <em className="italic text-[var(--earth)]">thoughtfully</em> curated.
          </h1>
          <p className="mt-8 mx-auto max-w-2xl text-lg text-foreground/70 leading-relaxed">
            AÛRA is a luxury beauty concierge connecting Bangalore's most exceptional salons,
            beauty professionals, and wellness experiences through intelligent recommendations
            and thoughtful curation.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-20 border-y border-foreground/10">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">Our Philosophy</span>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {philosophy.map((p) => (
              <div key={p.t} className="border-t border-foreground/15 pt-6">
                <h3 className="font-display text-3xl">{p.t}</h3>
                <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{p.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">What Aûra Does</span>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {what.map((w) => (
              <div key={w.t} className="rounded-2xl border border-foreground/10 p-6 bg-[var(--cream)]/40">
                <h3 className="font-display text-2xl">{w.t}</h3>
                <p className="mt-3 text-sm text-foreground/65">{w.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-20 bg-[var(--cream)]/40">
        <div className="max-w-[1080px] mx-auto">
          <span className="eyebrow">Why we built Aûra</span>
          <h2 className="mt-6 font-display text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.1] max-w-3xl">
            Bangalore deserved a beauty platform that <em className="italic text-[var(--earth)]">felt like</em> Bangalore.
          </h2>
          <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
            Quiet, considered, and grown-up. A space where discovery feels personal, where
            ateliers are introduced rather than advertised, and where intelligence sits in
            the background — never the foreground.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">The Aûra Experience</span>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {experience.map((e) => (
              <div key={e.t} className="border-t border-foreground/15 pt-6">
                <h3 className="font-display text-2xl">{e.t}</h3>
                <p className="mt-3 text-sm text-foreground/65 leading-relaxed">{e.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-20" id="contact">
        <div className="max-w-[1080px] mx-auto text-center">
          <span className="eyebrow">Bangalore First</span>
          <h2 className="mt-6 font-display text-[clamp(1.8rem,4vw,3rem)] leading-[1.1]">
            We are devoted to a single city — for now.
          </h2>
          <p className="mt-6 mx-auto max-w-xl text-foreground/70">
            Aûra is built in and for Bangalore, with deep relationships across every neighbourhood beauty house.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-32 bg-foreground text-background">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="font-display text-[clamp(1.8rem,4vw,3rem)] italic leading-[1.2]">
            "Luxury is not excess.<br />Luxury is knowing exactly where to go."
          </p>
          <Link to="/salons" className="mt-10 inline-block rounded-full bg-background text-foreground px-6 py-3 text-sm">
            Explore Salons
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
