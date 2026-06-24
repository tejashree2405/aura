import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { PageShell } from "@/components/aura/PageShell";
import { Check, X, Clock, User, Calendar, Mail } from "lucide-react";

export const Route = createFileRoute("/salon/dashboard")({
  component: SalonDashboard,
});

const STATUS_ORDER: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, REJECTED: 3, CANCELLED: 4 };

function SalonDashboard() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (ready && (!user || user.role !== "SALON")) { navigate({ to: "/auth/login" }); return null; }
  if (!ready) return <div className="min-h-screen grid place-items-center"><Clock className="animate-spin" /></div>;

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["salon-appointments"],
    queryFn: () => api.getSalonAppointments(),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateSalonAppointment(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salon-appointments"] }); toast.success("Appointment updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const appointments = [...(raw as Array<Record<string, unknown>>)].sort((a, b) => {
    const sa = STATUS_ORDER[a.status as string] ?? 9;
    const sb = STATUS_ORDER[b.status as string] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(a.date as string).getTime() - new Date(b.date as string).getTime();
  });

  const statusColor: Record<string, string> = {
    PENDING: "text-amber-600 bg-amber-50", CONFIRMED: "text-blue-600 bg-blue-50",
    COMPLETED: "text-green-600 bg-green-50", REJECTED: "text-red-600 bg-red-50", CANCELLED: "text-foreground/40 bg-foreground/5",
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <span className="eyebrow">Salon Dashboard</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">Appointments</h1>

          {isLoading ? (
            <p className="mt-12 text-foreground/50 text-sm">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">No appointments yet.</p>
              <p className="mt-2 text-xs text-foreground/40">Appointments from customers will appear here.</p>
            </div>
          ) : (
            <div className="mt-10 space-y-4">
              {appointments.map((a) => (
                <div key={a.id as string} className="rounded-2xl border border-foreground/10 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <p className="font-display text-xl capitalize">{a.service as string}</p>
                      <div className="mt-3 space-y-1.5 text-sm text-foreground/60">
                        <p className="flex items-center gap-2">
                          <User size={12} /> {(a.user as Record<string, string>)?.name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail size={12} /> {(a.user as Record<string, string>)?.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={12} /> {new Date(a.date as string).toLocaleDateString("en-IN", { dateStyle: "medium" })} at {a.time as string}
                        </p>
                      </div>
                      {a.notes ? (
                        <div className="mt-3 rounded-xl bg-foreground/[0.03] px-4 py-2.5">
                          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/40">Notes</span>
                          <p className="mt-1 text-sm text-foreground/70">{String(a.notes)}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs ${statusColor[a.status as string] || ""}`}>
                        {a.status as string}
                      </span>
                      <div className="flex gap-2">
                        {a.status === "PENDING" && (
                          <>
                            <button onClick={() => updateMu.mutate({ id: a.id as string, status: "CONFIRMED" })}
                              className="rounded-full px-4 py-1.5 text-xs border border-green-200 text-green-600 hover:bg-green-50 flex items-center gap-1">
                              <Check size={12} /> Confirm
                            </button>
                            <button onClick={() => updateMu.mutate({ id: a.id as string, status: "REJECTED" })}
                              className="rounded-full px-4 py-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1">
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                        {a.status === "CONFIRMED" && (
                          <button onClick={() => updateMu.mutate({ id: a.id as string, status: "COMPLETED" })}
                            className="rounded-full px-4 py-1.5 text-xs border border-green-200 text-green-600 hover:bg-green-50">
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
