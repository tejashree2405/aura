import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/aura/PageShell";
import { getProduct, productsByCategory } from "@/data/products";
import { handleImageError } from "@/data/images";
import { ProductCard } from "@/components/aura/ProductCard";
import { useAccount } from "@/lib/account-store";
import { useAuth } from "@/lib/auth-context";
import { setRedirect } from "@/lib/redirect-after-login";

export const Route = createFileRoute("/marketplace/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.product.name} — Aûra` },
            { name: "description", content: loaderData.product.description },
            { property: "og:image", content: loaderData.product.image },
          ],
        }
      : {},
  component: ProductDetail,
  notFoundComponent: () => (
    <PageShell>
      <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
        <h1 className="font-display text-3xl">Product not found.</h1>
        <Link to="/marketplace" className="mt-6 inline-block underline">Back to marketplace</Link>
      </div>
    </PageShell>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const related = productsByCategory(product.category).filter((p) => p.slug !== product.slug).slice(0, 4);
  const { addToBag } = useAccount();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAdd = () => {
    addToBag(product.slug, 1);
    toast.success("Added to Bag", { description: product.name });
  };

  const handleBuyNow = () => {
    if (!user) {
      setRedirect(`/checkout?slug=${product.slug}`);
      navigate({ to: "/auth/login" });
      return;
    }
    navigate({ to: "/checkout", search: { slug: product.slug } });
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/marketplace" className="text-xs text-foreground/60 hover:text-foreground">← Marketplace</Link>
          <div className="mt-8 grid lg:grid-cols-2 gap-12">
            <div className="grid grid-cols-2 gap-3">
              {product.gallery.map((g: string, i: number) => (
                <div key={i} className={`overflow-hidden rounded-2xl bg-muted ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}>
                  <img src={g} alt="" onError={handleImageError} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/50">{product.brand}</p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.05]">{product.name}</h1>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <Star size={14} fill="currentColor" className="text-[var(--gold)]" /> {product.rating}
                </span>
                <span className="capitalize text-foreground/60">{product.category}</span>
              </div>
              <p className="mt-6 font-display text-3xl">₹{product.price.toLocaleString("en-IN")}</p>
              <p className="mt-6 text-foreground/75 leading-relaxed">{product.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handleAdd}
                  className="rounded-full border border-foreground/20 px-6 py-3 text-sm hover:bg-foreground/5 transition-colors"
                >
                  Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-[var(--earth)] transition-colors"
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-10">
                <span className="eyebrow">Ingredients</span>
                <p className="mt-3 text-sm text-foreground/70">{product.ingredients.join(" · ")}</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <span className="eyebrow">Reviews</span>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {product.reviews.map((r: { author: string; rating: number; text: string }, i: number) => (
                <figure key={i} className="rounded-2xl border border-foreground/10 p-6">
                  <div className="flex gap-1 text-[var(--gold)]">
                    {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} fill="currentColor" />)}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed">{r.text}</blockquote>
                  <figcaption className="mt-4 text-[10px] tracking-[0.3em] uppercase text-foreground/50">{r.author}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <span className="eyebrow">Related</span>
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => <ProductCard key={p.slug} p={p} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
