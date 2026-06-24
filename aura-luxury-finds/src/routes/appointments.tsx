import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Phone, Star, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { getSalon } from "@/data/salons";
import { api } from "@/lib/api-client";

type ApiReview = { id: string; rating: number; comment: string; createdAt: string };
type ApiAppointment = {
  id: string; salonId: string; service: string; date: string; time: string;
  notes?: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  createdAt: string; review?: ApiReview | null;
};

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "Appointments — Aûra" }] }),
  component: () => <RequireAuth><AppointmentsPage /></RequireAuth>,
});

const STATUS_ORDER: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, REJECTED: 3, CANCELLED: 4 };

function AppointmentsPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ApiAppointment | null>(null);
  const { data: raw, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.listAppointments() as Promise<ApiAppointment[]>,
  });

  const appointments = [...(raw ?? [])].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const updateMu = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, string> }) => api.updateAppointment(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <span className="eyebrow">Appointments</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">Your salon visits.</h1>

          {isLoading ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">No appointments booked yet.</p>
              <Link to="/salons" className="mt-6 inline-block rounded-full bg-foreground text-background px-6 py-3 text-sm">
                Discover Salons
              </Link>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {appointments.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  onEdit={() => setEditing(a)}
                  onCancel={() => {
                    updateMu.mutate({ id: a.id, patch: { status: "CANCELLED" } }, {
                      onSuccess: () => toast.success("Appointment cancelled"),
                    });
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      {editing && (
        <EditModal
          appointment={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateMu.mutate({ id: editing.id, patch }, {
              onSuccess: () => { setEditing(null); toast.success("Appointment updated"); },
            });
          }}
        />
      )}
    </PageShell>
  );
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Confirmation",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-foreground/5 text-foreground/50",
};

function AppointmentCard({ appointment, onEdit, onCancel }: {
  appointment: ApiAppointment; onEdit: () => void; onCancel: () => void;
}) {
  const salon = getSalon(appointment.salonId);
  const canEdit = appointment.status === "PENDING";
  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  return (
    <li className="rounded-2xl border border-foreground/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow text-xs capitalize">{appointment.service}</span>
          {salon ? (
            <Link to="/salons/$slug" params={{ slug: salon.slug }} className="mt-1 block font-display text-2xl hover:underline">
              {salon.name}
            </Link>
          ) : (
            <p className="mt-1 font-display text-2xl">{appointment.salonId}</p>
          )}
          <div className="mt-3 space-y-1.5 text-sm text-foreground/70">
            <p className="flex items-center gap-2">
              <Calendar size={12} /> {formatDate(appointment.date)} at {appointment.time}
            </p>
            {salon && (
              <p className="flex items-center gap-2"><MapPin size={12} /> {salon.contact.address}</p>
            )}
            {salon && (
              <p className="flex items-center gap-2"><Phone size={12} /> {salon.contact.phone}</p>
            )}
            {appointment.notes && (
              <p className="text-foreground/50 italic">Notes: {appointment.notes}</p>
            )}
          </div>
        </div>
        <span className={`rounded-full text-xs px-3 py-1 ${STATUS_COLORS[appointment.status] || "bg-foreground/5"}`}>
          {STATUS_LABELS[appointment.status] || appointment.status}
        </span>
      </div>

      {(canEdit || canCancel) && (
        <div className="mt-5 flex gap-3">
          {canEdit && (
            <button onClick={onEdit}
              className="rounded-full border border-foreground/15 px-5 py-2 text-sm hover:bg-foreground/5 flex items-center gap-2">
              <Pencil size={12} /> Edit Appointment
            </button>
          )}
          {canCancel && (
            <button onClick={onCancel}
              className="rounded-full border border-foreground/15 px-5 py-2 text-sm text-[var(--earth)] hover:bg-[var(--earth)]/10">
              Cancel
            </button>
          )}
        </div>
      )}

      {appointment.status === "COMPLETED" && <ReviewPanel appointment={appointment} />}
    </li>
  );
}

function ReviewPanel({ appointment }: { appointment: ApiAppointment }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(appointment.review?.rating ?? 5);
  const [comment, setComment] = useState("");
  const reviewMu = useMutation({
    mutationFn: () => api.createReview(appointment.id, rating, comment),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Review saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save review"),
  });

  if (appointment.review) {
    return (
      <div className="mt-5 rounded-2xl border border-foreground/10 bg-[var(--cream)]/30 p-5">
        <p className="eyebrow text-xs">Your Review</p>
        <div className="mt-2 flex text-[var(--gold)]">
          {Array.from({ length: appointment.review.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
        <p className="mt-3 text-sm text-foreground/70">{appointment.review.comment}</p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-foreground/10 bg-[var(--cream)]/30 p-5">
      <p className="eyebrow text-xs">Rate your experience</p>
      <div className="mt-3 flex gap-1 text-[var(--gold)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} onClick={() => setRating(i + 1)}><Star size={18} fill={i < rating ? "currentColor" : "none"} /></button>
        ))}
      </div>
      <label className="mt-4 block">
        <span className="eyebrow text-xs">Write a review</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm resize-none" />
      </label>
      <button onClick={() => reviewMu.mutate()} disabled={reviewMu.isPending || !comment.trim()}
        className="mt-4 rounded-full bg-foreground text-background px-5 py-2.5 text-sm disabled:opacity-50">
        Save Review
      </button>
    </div>
  );
}

function EditModal({ appointment, onClose, onSave }: {
  appointment: ApiAppointment; onClose: () => void; onSave: (patch: Record<string, string>) => void;
}) {
  const [date, setDate] = useState(formatDate(appointment.date));
  const [time, setTime] = useState(appointment.time);
  const [service, setService] = useState(appointment.service);
  const [notes, setNotes] = useState(appointment.notes || "");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-3xl bg-background p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full hover:bg-foreground/5">
          <X size={16} />
        </button>
        <span className="eyebrow">Edit Appointment</span>
        <h2 className="mt-2 font-display text-2xl">{getSalon(appointment.salonId)?.name ?? appointment.salonId}</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="eyebrow text-xs">Service</span>
            <input value={service} onChange={(e) => setService(e.target.value)}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="eyebrow text-xs">Date</span>
              <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm" />
            </label>
            <label>
              <span className="eyebrow text-xs">Time</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm" />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow text-xs">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm resize-none" />
          </label>
        </div>
        <button onClick={() => onSave({ date, time, service, notes })}
          className="mt-6 w-full rounded-full bg-foreground text-background px-6 py-3 text-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return date.slice(0, 10);
}
