import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { SalonCard } from "@/components/aura/SalonCard";
import { salonsByService } from "@/data/salons";
import { SERVICES } from "@/data/areas";

export const Route = createFileRoute("/salons/service/$service")({
  loader: ({ params }) => {
    const svc = SERVICES.find((s) => s.slug === params.service);
    if (!svc) throw notFound();
    return { service: svc };
  },
  component: ServicePage,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Service not found.</h1>
        <Link to="/salons" className="mt-6 inline-block underline">Back to salons</Link>
      </div>
    </PageShell>
  ),
});

function ServicePage() {
  const { service } = Route.useLoaderData();
  const salons = salonsByService(service.slug);
  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/salons" className="text-xs text-foreground/60 hover:text-foreground">← All salons</Link>
          <span className="eyebrow mt-6 block">Service</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.02]">
            Salons specialising in <em className="italic text-[var(--earth)]">{service.label}</em>.
          </h1>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {salons.map((s) => <div key={s.slug}><SalonCard s={s} /></div>)}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
