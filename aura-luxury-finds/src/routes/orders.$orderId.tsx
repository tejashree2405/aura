import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({ meta: [{ title: "Order — Aûra" }] }),
  component: () => <RequireAuth><OrderDetail /></RequireAuth>,
});

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => api.getOrderDetail(orderId).catch(() => null),
  });

  if (isLoading) {
    return <PageShell><div className="px-6 md:px-16 py-20 max-w-[720px] mx-auto"><p className="text-foreground/50">Loading...</p></div></PageShell>;
  }

  if (!order) {
    return (
      <PageShell>
        <section className="px-6 md:px-16 pb-20 max-w-[720px] mx-auto">
          <h1 className="font-display text-3xl">Order not found.</h1>
          <Link to="/orders" className="mt-6 inline-block underline">Back to orders</Link>
        </section>
      </PageShell>
    );
  }

  const o = order as Record<string, unknown>;
  const items = (o.items as Array<Record<string, unknown>>) || [];
  const status = (o.status as string) || "PENDING";
  const STATUS_FLOW = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const stepIdx = STATUS_FLOW.indexOf(status);
  const PAYMENT_LABELS: Record<string, string> = {
    upi: "UPI", "credit-card": "Credit Card", "debit-card": "Debit Card", "net-banking": "Net Banking", PAY_AT_SALON: "Pay at Salon",
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <Link to="/orders" className="text-xs text-foreground/60 hover:text-foreground">← All orders</Link>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="eyebrow">Order {(o.id as string).slice(0, 10)}</span>
              <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)]">₹{(o.total as number).toLocaleString("en-IN")}</h1>
              <p className="mt-1 text-sm text-foreground/60">
                {new Date(o.createdAt as string).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
            <span className="rounded-full bg-[var(--gold)]/20 text-[var(--earth)] text-xs px-3 py-1">{status}</span>
          </div>

          <div className="mt-10 rounded-2xl border border-foreground/10 p-6 bg-[var(--cream)]/40">
            <span className="eyebrow">Status</span>
            <ol className="mt-5 space-y-4">
              {STATUS_FLOW.map((s, i) => (
                <li key={s} className="flex items-center gap-4">
                  <span className={`h-3 w-3 rounded-full ${i <= stepIdx ? "bg-[var(--earth)]" : "bg-foreground/20"}`} />
                  <span className={i <= stepIdx ? "font-medium" : "text-foreground/50"}>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10 rounded-2xl border border-foreground/10 p-6">
            <span className="eyebrow">Payment</span>
            <p className="mt-3 text-sm">{PAYMENT_LABELS[o.paymentMethod as string] || String(o.paymentMethod)}</p>
            <p className="mt-1 text-xs text-foreground/60">Amount · ₹{(o.total as number).toLocaleString("en-IN")}</p>
          </div>

          {items.length > 0 && (
            <div className="mt-10">
              <span className="eyebrow">Items</span>
              <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
                {items.map((item: Record<string, unknown>, idx: number) => (
                  <li key={idx} className="py-5 flex gap-4">
                    <div className="flex-1 text-sm">
                      <p className="font-display text-lg">Product: {item.productId as string}</p>
                      <p className="text-foreground/60 text-xs">Qty {item.quantity as number} · ₹{(item.price as number).toLocaleString("en-IN")}</p>
                    </div>
                    <p className="text-right">₹{((item.price as number) * (item.quantity as number)).toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
