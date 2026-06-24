import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { PageShell } from "@/components/aura/PageShell";
import { SalonCard } from "@/components/aura/SalonCard";
import { SALONS } from "@/data/salons";
import { AREAS } from "@/data/areas";
import { api } from "@/lib/api-client";
import type { Salon } from "@/data/types";

function dbToSalon(s: Record<string, unknown>): Salon {
  return {
    slug: s.slug as string, name: s.name as string,
    area: (s.city as string || "bangalore").toLowerCase().replace(/\s+/g, "-") as Salon["area"],
    areaLabel: s.city as string || "Bangalore", rating: (s.rating as number) || 0,
    startingPrice: (s.startingPrice as number) || 0, cover: (s.coverImage as string) || "",
    gallery: (s.galleryImages as string[]) || [], specialty: ((s.services as string[]) || [])[0] || "",
    about: (s.description as string) || "", specialties: (s.services as string[]) || [],
    services: ((s.services as string[]) || []).map((svc) => svc.toLowerCase()) as Salon["services"],
    contact: { phone: (s.phone as string) || "", email: (s.email as string) || "", website: (s.website as string) || "", address: (s.address as string) || "" },
  };
}

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
  const { data: dbSalons } = useQuery({
    queryKey: ["public-salons"],
    queryFn: () => api.listDbSalons().catch(() => []),
    staleTime: 60_000,
  });

  const allSalons = useMemo(() => {
    const dbConverted = ((dbSalons as Record<string, unknown>[] | undefined) || []).map(dbToSalon);
    const hardcodedSlugs = new Set(SALONS.map((s) => s.slug));
    return [...SALONS, ...dbConverted.filter((s) => !hardcodedSlugs.has(s.slug))];
  }, [dbSalons]);

  const dynamicAreas = useMemo(() => {
    const areaMap = new Map<string, string>();
    for (const a of AREAS) areaMap.set(a.slug, a.label);
    for (const s of allSalons) {
      if (!areaMap.has(s.area)) areaMap.set(s.area, s.areaLabel);
    }
    return [...areaMap.entries()].map(([slug, label]) => ({ slug, label }));
  }, [allSalons]);

  const dynamicServices = useMemo(() => {
    const svcs = new Set<string>();
    for (const s of allSalons) {
      for (const svc of s.services) svcs.add(svc);
    }
    return [...svcs].sort().map((s) => ({ slug: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
  }, [allSalons]);

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
                {dynamicAreas.map((a) => (
                  <Link key={a.slug} to="/salons/area/$area" params={{ area: a.slug }}
                    className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70 hover:bg-foreground hover:text-background transition-colors">
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Filter by service</p>
              <div className="flex flex-wrap gap-2">
                {dynamicServices.map((s) => (
                  <Link key={s.slug} to="/salons/service/$service" params={{ service: s.slug }}
                    className="rounded-full border border-foreground/15 px-4 py-2 text-xs text-foreground/70 hover:bg-foreground hover:text-background transition-colors">
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allSalons.map((s) => (
              <div key={s.slug} className="w-full"><SalonCard s={s} /></div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
