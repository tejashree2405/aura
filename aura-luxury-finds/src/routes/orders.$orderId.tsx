import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { useAccount } from "@/lib/account-store";
import type { OrderStatus } from "@/data/types";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({ meta: [{ title: "Order — Aûra" }] }),
  component: () => <RequireAuth><OrderDetail /></RequireAuth>,
});

const STATUS_FLOW: OrderStatus[] = ["Confirmed", "Processing", "Shipped", "Delivered"];

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { getOrder } = useAccount();
  const order = getOrder(orderId);

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

  const stepIdx = STATUS_FLOW.indexOf(order.status);
  const PAYMENT_LABELS: Record<string, string> = {
    "upi": "UPI", "credit-card": "Credit Card", "debit-card": "Debit Card", "net-banking": "Net Banking",
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <Link to="/orders" className="text-xs text-foreground/60 hover:text-foreground">← All orders</Link>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="eyebrow">Order {order.id}</span>
              <h1 className="mt-2 font-display text-[clamp(1.8rem,4vw,3rem)]">₹{order.total.toLocaleString("en-IN")}</h1>
              <p className="mt-1 text-sm text-foreground/60">
                {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
            <span className="rounded-full bg-[var(--gold)]/20 text-[var(--earth)] text-xs px-3 py-1">{order.status}</span>
          </div>

          {/* Timeline */}
          <div className="mt-10 rounded-2xl border border-foreground/10 p-6 bg-[var(--cream)]/40">
            <span className="eyebrow">Status</span>
            <ol className="mt-5 space-y-4">
              {STATUS_FLOW.map((s, i) => {
                const active = i <= stepIdx;
                return (
                  <li key={s} className="flex items-center gap-4">
                    <span className={`h-3 w-3 rounded-full ${active ? "bg-[var(--earth)]" : "bg-foreground/20"}`} />
                    <span className={active ? "font-medium" : "text-foreground/50"}>{s}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-foreground/10 p-6">
              <span className="eyebrow">Delivery Address</span>
              <p className="mt-3 text-sm">{order.address.fullName} · {order.address.phone}</p>
              <p className="mt-1 text-sm text-foreground/70">{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
              {order.address.landmark && <p className="text-sm text-foreground/60">Near {order.address.landmark}</p>}
              <p className="text-sm text-foreground/70">{order.address.city}, {order.address.state} {order.address.pincode}</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 p-6">
              <span className="eyebrow">Payment</span>
              <p className="mt-3 text-sm">{PAYMENT_LABELS[order.paymentMethod]}</p>
              <p className="mt-1 text-xs text-foreground/60">Amount paid · ₹{order.total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-10">
            <span className="eyebrow">Items</span>
            <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
              {order.items.map((i) => (
                <li key={i.productSlug} className="py-5 flex gap-4">
                  <Link to="/marketplace/product/$slug" params={{ slug: i.productSlug }} className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={i.image} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex-1 text-sm">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">{i.brand}</p>
                    <Link to="/marketplace/product/$slug" params={{ slug: i.productSlug }} className="font-display text-lg hover:underline">{i.name}</Link>
                    <p className="text-foreground/60 text-xs">Qty {i.qty} · ₹{i.price.toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-right">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={`₹${order.subtotal.toLocaleString("en-IN")}`} />
              <Row label="Taxes" value={`₹${order.tax.toLocaleString("en-IN")}`} />
              <Row label="Delivery" value={order.delivery === 0 ? "Complimentary" : `₹${order.delivery}`} />
              <div className="pt-3 border-t border-foreground/10 flex justify-between font-display text-xl">
                <span>Total</span>
                <span>₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-foreground/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
