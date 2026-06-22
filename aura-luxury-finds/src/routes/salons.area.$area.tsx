import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { SalonCard } from "@/components/aura/SalonCard";
import { salonsByArea } from "@/data/salons";
import { AREAS } from "@/data/areas";

export const Route = createFileRoute("/salons/area/$area")({
  loader: ({ params }) => {
    const area = AREAS.find((a) => a.slug === params.area);
    if (!area) throw notFound();
    return { area };
  },
  component: AreaPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Area not found.</h1>
        <Link to="/salons" className="mt-6 inline-block underline">Back to salons</Link>
      </div>
    </PageShell>
  ),
});

function AreaPage() {
  const { area } = Route.useLoaderData();
  const salons = salonsByArea(area.slug);
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/salons" className="text-xs text-foreground/60 hover:text-foreground">← All salons</Link>
          <span className="eyebrow mt-6 block">Area</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02]">
            Salons in <em className="italic text-[var(--earth)]">{area.label}</em>.
          </h1>
          <p className="mt-4 text-foreground/60 max-w-xl">{area.blurb}</p>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {salons.length === 0 ? (
              <p className="text-foreground/60">No salons listed in this area yet.</p>
            ) : (
              salons.map((s) => <div key={s.slug}><SalonCard s={s} /></div>)
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
