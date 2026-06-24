import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Orders — Aûra" }] }),
  component: () => <RequireAuth><OrdersPage /></RequireAuth>,
});

function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => api.listOrders().catch(() => []),
    staleTime: 30_000,
  });

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <span className="eyebrow">Orders</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">Your purchases.</h1>

          {isLoading ? (
            <p className="mt-12 text-foreground/50 text-sm">Loading orders...</p>
          ) : (orders as unknown[]).length === 0 ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">You haven't placed any orders yet.</p>
              <Link to="/marketplace" className="mt-6 inline-block rounded-full bg-foreground text-background px-6 py-3 text-sm">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {(orders as Array<Record<string, unknown>>).map((o) => (
                <li key={o.id as string}>
                  <div className="block rounded-2xl border border-foreground/10 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow text-xs">Order {(o.id as string).slice(0, 10)}</p>
                        <p className="mt-1 font-display text-lg">
                          ₹{(o.total as number).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-foreground/60">
                          {new Date(o.createdAt as string).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--gold)]/20 text-[var(--earth)] text-xs px-3 py-1">
                        {o.status as string}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
