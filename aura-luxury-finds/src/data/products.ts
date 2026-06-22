import type { Product } from "./types";
import { productImages } from "./images";

const prodUrl = (id: string) => productImages.find((i) => i.id === id)!.url;

const skincareSupplement = [prodUrl("prod-skincare-context-1"), prodUrl("prod-skincare-context-2")];
const haircareSupplement = [prodUrl("prod-haircare-context-1"), prodUrl("prod-haircare-context-2")];
const makeupSupplement = [prodUrl("prod-makeup-context-1"), prodUrl("prod-makeup-context-2")];
const wellnessSupplement = [prodUrl("prod-wellness-context-1"), prodUrl("prod-wellness-context-2")];

const supplements: Record<string, string[]> = {
  skincare: skincareSupplement,
  haircare: haircareSupplement,
  makeup: makeupSupplement,
  wellness: wellnessSupplement,
};

const sampleReviews = [
  { author: "Anaïs R.", rating: 5, text: "A quiet, beautiful product. I reach for it every morning." },
  { author: "Meher S.", rating: 5, text: "Restrained, effective, never theatrical." },
  { author: "Rhea K.", rating: 4, text: "Lovely formulation and the packaging belongs on a shelf." },
];

const make = (
  slug: string,
  name: string,
  brand: string,
  category: Product["category"],
  price: number,
  imageId: string,
  desc: string,
): Product => {
  const mainUrl = prodUrl(imageId);
  return {
    slug,
    name,
    brand,
    category,
    price,
    rating: 4.8,
    image: mainUrl,
    gallery: [mainUrl, ...supplements[category]],
    description: desc,
    ingredients: ["Squalane", "Niacinamide", "Botanical actives", "Vitamin E"],
    reviews: sampleReviews,
  };
};

export const PRODUCTS: Product[] = [
  // Skincare — 4 unique product images
  make("restorative-serum", "Restorative Serum", "Maison Aura", "skincare", 3400, "prod-restorative-serum", "A weightless restorative serum for skin that needs quiet repair."),
  make("cocoon-day-cream", "Cocoon Day Cream", "Maison Aura", "skincare", 2800, "prod-cocoon-day-cream", "A featherweight day cream that softens, hydrates, and disappears into the skin."),
  make("gentle-cleansing-balm", "Gentle Cleansing Balm", "Atelier Blanc", "skincare", 2200, "prod-cleansing-balm", "A balm cleanser that melts the day away without disturbing the skin's calm."),
  make("midnight-renewal-oil", "Midnight Renewal Oil", "House of Ila", "skincare", 3800, "prod-midnight-oil", "An overnight facial oil with botanical actives, made for slow renewal."),

  // Haircare — 4 unique product images
  make("botanical-hair-oil", "Botanical Hair Oil", "Studio Noir", "haircare", 2200, "prod-botanical-oil", "A featherweight pre-wash oil that restores shine without weight."),
  make("repair-mask", "Restorative Hair Mask", "Studio Noir", "haircare", 2600, "prod-repair-mask", "A weekly deep mask for coloured and chemically-treated hair."),
  make("everyday-shampoo", "Everyday Shampoo", "Salon Veda", "haircare", 1600, "prod-everyday-shampoo", "A daily gentle cleanse for all hair textures."),
  make("scalp-serum", "Scalp Renewal Serum", "Salon Veda", "haircare", 2400, "prod-scalp-serum", "A soothing scalp serum that supports density and calm."),

  // Makeup — 4 unique product images
  make("velvet-lip", "Velvet Lip", "Atelier Blanc", "makeup", 1800, "prod-velvet-lip", "A satin lip in the most considered shade of muted rose."),
  make("editorial-mascara", "Editorial Mascara", "Atelier Blanc", "makeup", 2200, "prod-editorial-mascara", "Lengthening, never theatrical. The mascara editorial artists reach for."),
  make("complexion-base", "Complexion Base", "House of Ila", "makeup", 3200, "prod-complexion-base", "A second-skin base in twelve calibrated tones."),
  make("brow-pomade", "Brow Architect Pomade", "House of Ila", "makeup", 1400, "prod-brow-pomade", "A precise brow pomade with a sculpting brush."),

  // Wellness — 4 unique product images
  make("stillness-diffuser", "Stillness Diffuser", "The Quiet Room", "wellness", 4600, "prod-diffuser", "A ceramic diffuser with a hand-blended Ayurvedic oil."),
  make("calm-bath-salts", "Calm Bath Salts", "The Quiet Room", "wellness", 1900, "prod-bath-salts", "Pink salt, lavender, and rose for the slowest bath of the week."),
  make("morning-tisane", "Morning Tisane", "The Quiet Room", "wellness", 1200, "prod-tisane", "A grounding morning ritual in a single glass cup."),
  make("silk-pillow", "Mulberry Silk Pillowcase", "The Quiet Room", "wellness", 3400, "prod-silk-pillow", "22-momme mulberry silk, for skin and hair that wake undisturbed."),
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const productsByCategory = (cat: string) => PRODUCTS.filter((p) => p.category === cat);
