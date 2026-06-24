import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Star, Phone, Mail, Globe, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShell } from "@/components/aura/PageShell";
import { getSalon, SALONS } from "@/data/salons";
import { SalonCard } from "@/components/aura/SalonCard";
import { handleImageError } from "@/data/images";
import { useAuth } from "@/lib/auth-context";
import { setRedirect } from "@/lib/redirect-after-login";
import { api } from "@/lib/api-client";

type SalonReviewsResponse = {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user?: { name: string };
  }>;
  averageRating: number | null;
  count: number;
};

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

export const Route = createFileRoute("/salons/$slug")({
  loader: ({ params }) => {
    const salon = getSalon(params.slug);
    return { salon: salon || null, slug: params.slug };
  },
  head: ({ loaderData }) =>
    loaderData?.salon
      ? { meta: [{ title: `${loaderData.salon.name} — Aûra` }, { name: "description", content: loaderData.salon.about }, { property: "og:image", content: loaderData.salon.cover }] }
      : { meta: [{ title: "Salon — Aûra" }] },
  component: SalonDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Salon not found.</h1>
        <Link to="/salons" className="mt-6 inline-block underline">Back to salons</Link>
      </div>
    </PageShell>
  ),
});

function websiteHref(w: string) {
  return /^https?:\/\//i.test(w) ? w : `https://${w}`;
}

function SalonDetail() {
  const { salon: hardcoded, slug } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dbRaw, isLoading: dbLoading } = useQuery({
    queryKey: ["salon-detail", slug],
    queryFn: () => api.getDbSalon(slug).catch(() => null),
    enabled: !hardcoded,
    staleTime: 60_000,
  });

  const salon = hardcoded || (dbRaw ? dbToSalon(dbRaw as Record<string, unknown>) : null);

  if (!hardcoded && dbLoading) {
    return <PageShell><div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto"><p className="text-foreground/50">Loading...</p></div></PageShell>;
  }
  if (!salon) {
    return (
      <PageShell>
        <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
          <h1 className="font-display text-3xl">Salon not found.</h1>
          <Link to="/salons" className="mt-6 inline-block underline">Back to salons</Link>
        </div>
      </PageShell>
    );
  }

  const related = SALONS.filter((s) => s.slug !== salon.slug).slice(0, 3);
  const [open, setOpen] = useState(false);
  const reviewsQ = useQuery({
    queryKey: ["salon-reviews", salon.slug],
    queryFn: () => api.listSalonReviews(salon.slug) as Promise<SalonReviewsResponse>,
  });
  const displayRating = reviewsQ.data?.averageRating ?? salon.rating;
  const bookMu = useMutation({
    mutationFn: (input: { service: string; date: string; time: string }) =>
      api.bookAppointment({ salonId: salon.slug, ...input }),
    onSuccess: (_appointment, input) => {
      setOpen(false);
      toast.success("Appointment confirmed", {
        description: `${salon.name} · ${input.date} at ${input.time}`,
      });
      navigate({ to: "/appointments" });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not book appointment"),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (user && params.get("book") === "1") setOpen(true);
  }, [user]);

  const onBookClick = () => {
    if (!user) {
      setRedirect(`/salons/${salon.slug}?book=1`);
      navigate({ to: "/auth/login" });
      return;
    }
    setOpen(true);
  };

  const subject = `Book Appointment for ${user?.name ?? "Aûra Guest"}`;
  const mailto = `mailto:${salon.contact.email}?subject=${encodeURIComponent(subject)}`;

  return (
    <PageShell bare>
      <div className="pt-24">
        <section className="relative h-[70vh] min-h-[480px]">
          <img
            src={salon.cover}
            alt={salon.name}
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12 max-w-[1280px] mx-auto">
            <span className="eyebrow">{salon.areaLabel}, Bangalore</span>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,5rem)] leading-[1] max-w-3xl">
              {salon.name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-1.5">
                <Star size={14} fill="currentColor" className="text-[var(--gold)]" />{" "}
                {displayRating.toFixed(1)}
              </span>
              <span className="text-foreground/70">{salon.specialty}</span>
              <span className="text-foreground/70">
                Starting ₹{salon.startingPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </section>

        <section className="px-6 md:px-16 py-20">
          <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-16">
            <div>
              <span className="eyebrow">About</span>
              <p className="mt-6 text-lg leading-relaxed text-foreground/80">{salon.about}</p>

              <div className="mt-12">
                <span className="eyebrow">Specialties</span>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {salon.specialties.map((s: string) => (
                    <li
                      key={s}
                      className="rounded-full border border-foreground/15 px-4 py-1.5 text-sm"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12">
                <span className="eyebrow">Services</span>
                <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                  {salon.services.map((svc: string) => (
                    <li key={svc}>
                      <Link
                        to="/salons/service/$service"
                        params={{ service: svc }}
                        className="block border-t border-foreground/15 pt-3 font-display text-xl capitalize hover:text-[var(--earth)]"
                      >
                        {svc}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="rounded-2xl border border-foreground/10 bg-[var(--cream)]/40 p-8 h-fit">
              <span className="eyebrow">Contact</span>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Phone size={14} className="mt-1 text-foreground/50" />
                  <a
                    href={`tel:${salon.contact.phone.replace(/\s/g, "")}`}
                    className="hover:underline"
                  >
                    {salon.contact.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={14} className="mt-1 text-foreground/50" />
                  <a href={mailto} className="hover:underline break-all">
                    {salon.contact.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Globe size={14} className="mt-1 text-foreground/50" />
                  <a
                    href={websiteHref(salon.contact.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline break-all"
                  >
                    {salon.contact.website}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={14} className="mt-1 text-foreground/50" />
                  <span>{salon.contact.address}</span>
                </li>
              </ul>
              <button
                onClick={onBookClick}
                className="mt-8 block w-full text-center rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-[var(--earth)] transition-colors"
              >
                Book Appointment
              </button>
            </aside>
          </div>
        </section>

        <section className="px-6 md:px-16 pb-20">
          <div className="max-w-[1280px] mx-auto">
            <span className="eyebrow">Gallery</span>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {salon.gallery.map((g: string, i: number) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl">
                  <img src={g} alt="" loading="lazy" onError={handleImageError} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReviewsSection reviews={reviewsQ.data?.reviews ?? []} />

        <section className="px-6 md:px-16 pb-32">
          <div className="max-w-[1280px] mx-auto">
            <span className="eyebrow">You may also love</span>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((s) => (
                <div key={s.slug}>
                  <SalonCard s={s} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {open && (
        <BookingModal
          salon={salon}
          onClose={() => setOpen(false)}
          isSubmitting={bookMu.isPending}
          onConfirm={(input) => bookMu.mutate(input)}
        />
      )}
    </PageShell>
  );
}

function BookingModal({
  salon,
  onClose,
  onConfirm,
  isSubmitting,
}: {
  salon: ReturnType<typeof getSalon>;
  onClose: () => void;
  onConfirm: (i: { service: string; date: string; time: string; notes?: string }) => void;
  isSubmitting: boolean;
}) {
  const s = salon!;
  const [service, setService] = useState<string>(s.services[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const { data: slotsData } = useQuery({
    queryKey: ["slots", s.slug, date],
    queryFn: () => api.getAvailableSlots(s.slug, date),
    enabled: !!date,
    staleTime: 30_000,
  });
  const availableSlots = (slotsData as { available?: string[] })?.available ?? [];
  const now = new Date();
  const isToday = date === today;
  const filteredSlots = availableSlots.filter((slot) => {
    if (!isToday) return true;
    const [h, m] = slot.split(":").map(Number);
    return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/30 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl bg-background p-8 shadow-[var(--shadow-soft)] relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full hover:bg-foreground/5"
        >
          <X size={16} />
        </button>
        <span className="eyebrow">Book Appointment</span>
        <h2 className="mt-2 font-display text-3xl">{s.name}</h2>
        <p className="mt-1 text-sm text-foreground/60">
          {s.areaLabel} · {s.contact.phone}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="eyebrow text-xs">Service</span>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm capitalize"
            >
              {s.services.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow text-xs">Date</span>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => { setDate(e.target.value); setTime(""); }}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm"
            />
          </label>
          {date && (
            <div>
              <span className="eyebrow text-xs">Available Time Slots</span>
              {filteredSlots.length === 0 ? (
                <p className="mt-2 text-sm text-foreground/50">No available slots for this date.</p>
              ) : (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {filteredSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        time === slot
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/15 hover:border-foreground/30"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <label className="block">
            <span className="eyebrow text-xs">Notes (optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm resize-none"
            />
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            onClick={() => {
              if (!date || !time) {
                setErr("Choose a date and time.");
                return;
              }
              onConfirm({ service, date, time, notes: notes.trim() || undefined });
            }}
            disabled={isSubmitting}
            className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-[var(--earth)] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ reviews }: { reviews: SalonReviewsResponse["reviews"] }) {
  if (!reviews.length) return null;

  return (
    <section className="px-6 md:px-16 pb-20">
      <div className="max-w-[1280px] mx-auto">
        <span className="eyebrow">Reviews</span>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-foreground/10 bg-[var(--cream)]/30 p-6"
            >
              <div className="flex text-[var(--gold)]">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/70 leading-relaxed">{review.comment}</p>
              {review.user?.name && (
                <p className="mt-4 text-xs text-foreground/40">{review.user.name}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
