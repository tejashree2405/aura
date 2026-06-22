import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { SalonCard } from "@/components/aura/SalonCard";
import { SALONS } from "@/data/salons";
import { AREAS, SERVICES } from "@/data/areas";

export const Route = createFileRoute("/salons/")({
  head: () => ({
    meta: [
      { title: "Salons — Aûra" },
      { name: "description", content: "Bangalore's most considered salons, vetted for you." },
    ],
  }),
  component: SalonsPage,
});

function SalonsPage() {
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <span className="eyebrow">The Directory</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02] max-w-3xl">
            Featured <em className="italic text-[var(--earth)]">salons</em> across Bangalore.
          </h1>

          <div className="mt-12 grid lg:grid-cols-2 gap-3">
            <div>
              <p className="eyebrow mb-3">Filter by area</p>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <Link
                    key={a.slug}
                    to="/salons/area/$area"
                    params={{ area: a.slug }}
                    className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70 hover:bg-foreground hover:text-background transition-colors"
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Filter by service</p>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <Link
                    key={s.slug}
                    to="/salons/service/$service"
                    params={{ service: s.slug }}
                    className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70 hover:bg-foreground hover:text-background transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SALONS.map((s) => (
              <div key={s.slug} className="w-full"><SalonCard s={s} /></div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
