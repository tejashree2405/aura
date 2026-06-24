import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { useAccount } from "@/lib/account-store";
import { PRODUCTS } from "@/data/products";
import { resolveProduct } from "@/lib/account-store";
import { ProductCard } from "@/components/aura/ProductCard";

export const Route = createFileRoute("/bag")({
  head: () => ({ meta: [{ title: "My Bag — Aûra" }] }),
  component: () => <RequireAuth><BagPage /></RequireAuth>,
});

function BagPage() {
  const { bag, updateBagQty, removeFromBag, bagSubtotal } = useAccount();
  const items = bag.flatMap((b) => {
    const p = resolveProduct(b.productSlug);
    return p ? [{ b, p }] : [];
  });

  const inBag = new Set(bag.map((b) => b.productSlug));
  const suggested = PRODUCTS.filter((p) => !inBag.has(p.slug)).slice(0, 4);

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1080px] mx-auto">
          <span className="eyebrow">Your Bag</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.6rem)]">Items added.</h1>

          {items.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-foreground/10 p-12 text-center">
              <p className="text-foreground/60">Your bag is empty.</p>
              <Link
                to="/marketplace"
                className="mt-6 inline-block rounded-full bg-foreground text-background px-6 py-3 text-sm"
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-10 divide-y divide-foreground/10 border-y border-foreground/10">
                {items.map(({ b, p }) => (
                  <li key={p.slug} className="py-6 flex gap-5">
                    <Link to="/marketplace/product/$slug" params={{ slug: p.slug }} className="h-24 w-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">{p.brand}</p>
                      <Link to="/marketplace/product/$slug" params={{ slug: p.slug }} className="font-display text-lg hover:underline">
                        {p.name}
                      </Link>
                      <p className="mt-1 text-sm text-foreground/70">₹{p.price.toLocaleString("en-IN")}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-full border border-foreground/15">
                          <button
                            onClick={() => updateBagQty(p.slug, b.qty - 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-foreground/5 rounded-l-full"
                            aria-label="Decrease"
                          ><Minus size={12} /></button>
                          <span className="px-3 text-sm">{b.qty}</span>
                          <button
                            onClick={() => updateBagQty(p.slug, b.qty + 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-foreground/5 rounded-r-full"
                            aria-label="Increase"
                          ><Plus size={12} /></button>
                        </div>
                        <button
                          onClick={() => removeFromBag(p.slug)}
                          className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-[var(--earth)]"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-display text-lg whitespace-nowrap">
                      ₹{(p.price * b.qty).toLocaleString("en-IN")}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <p className="eyebrow text-xs">Subtotal</p>
                  <p className="mt-1 font-display text-3xl">₹{bagSubtotal.toLocaleString("en-IN")}</p>
                  <p className="mt-1 text-xs text-foreground/50">Taxes and delivery calculated at checkout.</p>
                </div>
                <Link
                  to="/checkout"
                  className="rounded-full bg-foreground text-background px-8 py-3.5 text-sm hover:bg-[var(--earth)] transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </>
          )}

          {suggested.length > 0 && (
            <div className="mt-24">
              <span className="eyebrow">Things you might have missed</span>
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {suggested.map((p) => <ProductCard key={p.slug} p={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
