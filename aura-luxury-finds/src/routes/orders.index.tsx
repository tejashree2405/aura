import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { useAccount } from "@/lib/account-store";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Orders — Aûra" }] }),
  component: () => <RequireAuth><OrdersPage /></RequireAuth>,
});

function OrdersPage() {
  const { orders } = useAccount();

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <span className="eyebrow">Orders</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">Your purchases.</h1>

          {orders.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">You haven't placed any orders yet.</p>
              <Link to="/marketplace" className="mt-6 inline-block rounded-full bg-foreground text-background px-6 py-3 text-sm">
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <ul className="mt-10 space-y-4">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/orders/$orderId"
                    params={{ orderId: o.id }}
                    className="block rounded-2xl border border-foreground/10 p-6 hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow text-xs">{o.id}</p>
                        <p className="mt-1 font-display text-lg">
                          {o.items.length} {o.items.length === 1 ? "item" : "items"} · ₹{o.total.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-foreground/60">
                          {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--gold)]/20 text-[var(--earth)] text-xs px-3 py-1">
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {o.items.slice(0, 5).map((i) => (
                        <div key={i.productSlug} className="h-14 w-14 rounded-lg overflow-hidden bg-muted">
                          <img src={i.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PageShell>
  );
}
