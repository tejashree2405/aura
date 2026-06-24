import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { PageShell } from "@/components/aura/PageShell";
import { getProduct, productsByCategory, PRODUCTS } from "@/data/products";
import { handleImageError } from "@/data/images";
import { ProductCard } from "@/components/aura/ProductCard";
import { useAccount } from "@/lib/account-store";
import { useAuth } from "@/lib/auth-context";
import { setRedirect } from "@/lib/redirect-after-login";
import { api } from "@/lib/api-client";
import type { Product } from "@/data/types";

function dbToProduct(p: Record<string, unknown>): Product {
  const images = (p.gallery as string[])?.length ? (p.gallery as string[]) : [p.image as string];
  return {
    slug: p.slug as string, name: p.name as string, brand: p.brand as string,
    category: p.category as Product["category"], price: p.price as number,
    rating: (p.rating as number) || 4.8, image: images[0],
    gallery: images, description: (p.description as string) || "",
    ingredients: (p.ingredients as string[]) || [], reviews: [],
  };
}

export const Route = createFileRoute("/marketplace/product/$slug")({
  loader: ({ params }) => {
    const hardcoded = getProduct(params.slug);
    return { slug: params.slug, hardcoded: hardcoded || null };
  },
  head: ({ loaderData }) =>
    loaderData?.hardcoded
      ? { meta: [{ title: `${loaderData.hardcoded.name} — Aûra` }, { name: "description", content: loaderData.hardcoded.description }, { property: "og:image", content: loaderData.hardcoded.image }] }
      : { meta: [{ title: "Product — Aûra" }] },
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
  const { slug, hardcoded } = Route.useLoaderData();
  const { data: dbRaw, isLoading } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => api.getDbProduct(slug).catch(() => null),
    enabled: !hardcoded,
    staleTime: 60_000,
  });

  const product: Product | null = hardcoded || (dbRaw ? dbToProduct(dbRaw as Record<string, unknown>) : null);

  if (!hardcoded && isLoading) {
    return <PageShell><div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto"><p className="text-foreground/50">Loading...</p></div></PageShell>;
  }
  if (!product) {
    return (
      <PageShell>
        <div className="px-6 md:px-16 py-20 max-w-[1280px] mx-auto">
          <h1 className="font-display text-3xl">Product not found.</h1>
          <Link to="/marketplace" className="mt-6 inline-block underline">Back to marketplace</Link>
        </div>
      </PageShell>
    );
  }

  return <ProductView product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const related = productsByCategory(product.category).filter((p) => p.slug !== product.slug).slice(0, 4);
  const { addToBag } = useAccount();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mainImg, setMainImg] = useState(0);

  const gallery = product.gallery.length ? product.gallery : [product.image];

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[1280px] mx-auto">
          <Link to="/marketplace" className="text-xs text-foreground/60 hover:text-foreground">← Marketplace</Link>
          <div className="mt-8 grid lg:grid-cols-2 gap-12">
            <div>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <img src={gallery[mainImg]} alt={product.name} onError={handleImageError} className="h-full w-full object-cover" />
              </div>
              {gallery.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {gallery.map((g, i) => (
                    <button key={i} onClick={() => setMainImg(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === mainImg ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={g} alt="" onError={handleImageError} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
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
                  onClick={() => { addToBag(product.slug, 1); toast.success("Added to Bag", { description: product.name }); }}
                  className="rounded-full border border-foreground/20 px-6 py-3 text-sm hover:bg-foreground/5 transition-colors">
                  Add to Bag
                </button>
                <button
                  onClick={() => {
                    if (!user) { setRedirect(`/checkout?slug=${product.slug}`); navigate({ to: "/auth/login" }); return; }
                    navigate({ to: "/checkout", search: { slug: product.slug } });
                  }}
                  className="rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-[var(--earth)] transition-colors">
                  Buy Now
                </button>
              </div>
              {product.ingredients.length > 0 && (
                <div className="mt-10">
                  <span className="eyebrow">Ingredients</span>
                  <p className="mt-3 text-sm text-foreground/70">{product.ingredients.join(" · ")}</p>
                </div>
              )}
            </div>
          </div>

          {product.reviews.length > 0 && (
            <div className="mt-20">
              <span className="eyebrow">Reviews</span>
              <div className="mt-6 grid md:grid-cols-3 gap-6">
                {product.reviews.map((r, i) => (
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
          )}

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
