import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { useAccount } from "@/lib/account-store";
import { getProduct } from "@/data/products";
import type { Address, OrderItem, PaymentMethod } from "@/data/types";

const searchSchema = z.object({
  slug: fallback(z.string().optional(), undefined),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Checkout — Aûra" }] }),
  component: () => <RequireAuth><CheckoutPage /></RequireAuth>,
});

const TAX_RATE = 0.18;
const DELIVERY = (sub: number) => (sub > 2500 ? 0 : 99);

function CheckoutPage() {
  const { slug } = Route.useSearch();
  const navigate = useNavigate();
  const { bag, addresses, addAddress, updateAddress, removeAddress, placeOrder, clearBag } = useAccount();

  const items: OrderItem[] = useMemo(() => {
    if (slug) {
      const p = getProduct(slug);
      if (!p) return [];
      return [{ productSlug: p.slug, name: p.name, brand: p.brand, image: p.image, qty: 1, price: p.price }];
    }
    return bag
      .map((b) => {
        const p = getProduct(b.productSlug);
        return p ? { productSlug: p.slug, name: p.name, brand: p.brand, image: p.image, qty: b.qty, price: p.price } : null;
      })
      .filter((x): x is OrderItem => !!x);
  }, [slug, bag]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const delivery = items.length ? DELIVERY(subtotal) : 0;
  const total = subtotal + tax + delivery;

  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(addresses[0]?.id ?? null);
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [editing, setEditing] = useState<Address | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAddrId && addresses[0]) setSelectedAddrId(addresses[0].id);
  }, [addresses, selectedAddrId]);

  if (items.length === 0 && !success) {
    return (
      <PageShell>
        <section className="px-6 md:px-16 pb-20 max-w-[720px] mx-auto">
          <h1 className="mt-4 font-display text-3xl">Nothing to checkout.</h1>
          <Link to="/marketplace" className="mt-6 inline-block rounded-full bg-foreground text-background px-6 py-3 text-sm">
            Explore Marketplace
          </Link>
        </section>
      </PageShell>
    );
  }

  const handlePayment = async () => {
    setErr(null);
    const address = addresses.find((a) => a.id === selectedAddrId);
    if (!address) { setErr("Select or add a delivery address."); return; }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1600));
    const order = placeOrder({ items, address, paymentMethod: method, subtotal, tax, delivery, total });
    if (!slug) clearBag();
    setProcessing(false);
    setSuccess(order.id);
    setTimeout(() => navigate({ to: "/orders/$orderId", params: { orderId: order.id } }), 1400);
  };

  if (processing || success) {
    return (
      <PageShell>
        <section className="px-6 md:px-16 pb-20 max-w-[520px] mx-auto text-center pt-12">
          {processing ? (
            <>
              <Loader2 size={32} className="mx-auto animate-spin text-[var(--gold)]" />
              <h1 className="mt-6 font-display text-3xl">Processing Payment…</h1>
              <p className="mt-3 text-sm text-foreground/60">A quiet moment. Don't close this page.</p>
            </>
          ) : (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-[var(--gold)]/20 grid place-items-center">
                <Check size={28} className="text-[var(--earth)]" />
              </div>
              <h1 className="mt-6 font-display text-3xl">Payment Successful</h1>
              <p className="mt-3 text-sm text-foreground/60">Your order {success} has been confirmed.<br/>Thank you for shopping with Aûra.</p>
            </>
          )}
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1080px] mx-auto">
          <span className="eyebrow">Checkout</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">A considered exchange.</h1>

          <div className="mt-12 grid lg:grid-cols-[1.3fr_1fr] gap-10">
            <div className="space-y-10">
              {/* Address */}
              <div>
                <h2 className="font-display text-2xl">Delivery Address</h2>
                {addresses.length > 0 && (
                  <ul className="mt-5 space-y-3">
                    {addresses.map((a) => (
                      <li
                        key={a.id}
                        className={`rounded-2xl border p-5 cursor-pointer transition-colors ${
                          selectedAddrId === a.id ? "border-foreground bg-[var(--cream)]/40" : "border-foreground/10 hover:border-foreground/30"
                        }`}
                        onClick={() => setSelectedAddrId(a.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm">
                            <p className="font-medium">{a.fullName} · {a.phone}</p>
                            <p className="mt-1 text-foreground/70">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                            {a.landmark && <p className="text-foreground/60">Near {a.landmark}</p>}
                            <p className="text-foreground/70">{a.city}, {a.state} {a.pincode}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); setEditing(a); setShowForm(true); }} className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5"><Pencil size={12} /></button>
                            <button onClick={(e) => { e.stopPropagation(); removeAddress(a.id); }} className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5 text-[var(--earth)]"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {!showForm ? (
                  <button
                    onClick={() => { setEditing(null); setShowForm(true); }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm underline"
                  >
                    <Plus size={12} /> Add new address
                  </button>
                ) : (
                  <AddressForm
                    initial={editing}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                    onSubmit={(a) => {
                      if (editing) {
                        updateAddress(editing.id, a);
                        setSelectedAddrId(editing.id);
                      } else {
                        const created = addAddress(a);
                        setSelectedAddrId(created.id);
                      }
                      setShowForm(false);
                      setEditing(null);
                    }}
                  />
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="font-display text-2xl">Payment Method</h2>
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {([
                    ["upi", "UPI"],
                    ["credit-card", "Credit Card"],
                    ["debit-card", "Debit Card"],
                    ["net-banking", "Net Banking"],
                  ] as const).map(([k, label]) => (
                    <label
                      key={k}
                      className={`rounded-2xl border p-4 text-sm cursor-pointer transition-colors flex items-center gap-3 ${
                        method === k ? "border-foreground bg-[var(--cream)]/40" : "border-foreground/10 hover:border-foreground/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pm"
                        className="accent-foreground"
                        checked={method === k}
                        onChange={() => setMethod(k)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-foreground/50">For demonstration purposes — no real charge is made.</p>
              </div>
            </div>

            {/* Summary */}
            <aside className="rounded-2xl border border-foreground/10 bg-[var(--cream)]/40 p-6 h-fit">
              <h2 className="font-display text-2xl">Order Summary</h2>
              <ul className="mt-5 space-y-4">
                {items.map((i) => (
                  <li key={i.productSlug} className="flex gap-3">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={i.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium leading-tight">{i.name}</p>
                      <p className="text-foreground/60 text-xs">{i.brand} · Qty {i.qty}</p>
                    </div>
                    <p className="text-sm">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 text-sm border-t border-foreground/10 pt-4">
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
                <Row label="Taxes (18% GST)" value={`₹${tax.toLocaleString("en-IN")}`} />
                <Row label="Delivery" value={delivery === 0 ? "Complimentary" : `₹${delivery}`} />
              </div>
              <div className="mt-4 pt-4 border-t border-foreground/10 flex items-baseline justify-between">
                <span className="eyebrow">Total</span>
                <span className="font-display text-2xl">₹{total.toLocaleString("en-IN")}</span>
              </div>
              {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
              <button
                onClick={handlePayment}
                className="mt-5 w-full rounded-full bg-foreground text-background px-6 py-3.5 text-sm hover:bg-[var(--earth)] transition-colors"
              >
                Make Payment
              </button>
            </aside>
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

function AddressForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Address | null;
  onSubmit: (a: Omit<Address, "id">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<Omit<Address, "id">>({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    landmark: initial?.landmark ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pincode: initial?.pincode ?? "",
  });
  const [err, setErr] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="mt-5 rounded-2xl border border-foreground/10 p-6 space-y-4 bg-background">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Full Name" value={f.fullName} onChange={u("fullName")} />
        <Field label="Phone Number" value={f.phone} onChange={u("phone")} />
        <Field className="sm:col-span-2" label="Address Line 1" value={f.line1} onChange={u("line1")} />
        <Field className="sm:col-span-2" label="Address Line 2" value={f.line2 ?? ""} onChange={u("line2")} />
        <Field label="Landmark" value={f.landmark ?? ""} onChange={u("landmark")} />
        <Field label="City" value={f.city} onChange={u("city")} />
        <Field label="State" value={f.state} onChange={u("state")} />
        <Field label="Pincode" value={f.pincode} onChange={u("pincode")} />
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (!f.fullName || !f.phone || !f.line1 || !f.city || !f.state || !f.pincode) {
              setErr("Please complete required fields.");
              return;
            }
            onSubmit(f);
          }}
          className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm"
        >
          {initial ? "Save changes" : "Save address"}
        </button>
        <button onClick={onCancel} className="text-sm text-foreground/60 hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="eyebrow text-xs">{label}</span>
      <input
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/40"
      />
    </label>
  );
}
