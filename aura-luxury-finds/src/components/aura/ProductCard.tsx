import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/types";
import { handleImageError } from "@/data/images";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link to="/marketplace/product/$slug" params={{ slug: p.slug }} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-background">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
      </div>
      <div className="pt-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">{p.brand}</p>
          <h3 className="font-display text-base mt-1">{p.name}</h3>
        </div>
        <p className="text-sm mt-1 whitespace-nowrap">₹{p.price.toLocaleString("en-IN")}</p>
      </div>
    </Link>
  );
}
