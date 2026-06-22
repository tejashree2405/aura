/**
 * AÛRA — Production Image Registry
 *
 * Cloudinary migration: replace the `u()` helper to return
 *   `https://res.cloudinary.com/YOUR_CLOUD/image/upload/w_${w},q_80,f_auto/aura/${folder}/${name}`
 * and upload each image into the matching folder below.
 *
 * Folder structure (for Cloudinary):
 *   aura/hero/          — hero carousel backgrounds
 *   aura/salons/        — salon cover images
 *   aura/salons/gallery — salon gallery images
 *   aura/bridal/        — bridal content
 *   aura/skincare/      — skincare content
 *   aura/wellness/      — wellness & spa content
 *   aura/products/      — product photography
 *   aura/journal/       — journal article hero images
 *   aura/areas/         — neighbourhood area cards
 */

export interface AuraImage {
  id: string;
  url: string;
  category: string;
  specialty: string;
  alt: string;
  width: number;
  height: number;
}

function u(photoId: string, w = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80&auto=format&fit=crop`;
}

// 1x1 warm-neutral SVG fallback — matches AÛRA brand palette
const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="%23e8e0d4"><rect width="800" height="600"/></svg>',
)}`;

export const FALLBACK_IMAGE = FALLBACK_SVG;

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_SVG) {
    img.src = FALLBACK_SVG;
  }
}

function img(
  id: string,
  photoId: string,
  category: string,
  specialty: string,
  alt: string,
  w = 800,
  h = 600,
): AuraImage {
  return { id, url: u(photoId, w), category, specialty, alt, width: w, height: h };
}

// ────────────────────────────────────────────────────────────
// Hero Carousel
// ────────────────────────────────────────────────────────────

export const heroImages: AuraImage[] = [
  img("hero-1", "1706629505300-168aa1604912", "hero", "salon-interior", "Luxury salon interior with styling chairs and mirrors", 1920, 1080),
  img("hero-2", "1560066984-138dadb4c035", "hero", "salon-workspace", "Professional salon workspace with curated beauty tools", 1920, 1080),
  img("hero-3", "1776763018829-ad685e621871", "hero", "spa-wellness", "Minimalist spa lounge with calm water and warm neutral tones", 1920, 1080),
  img("hero-4", "1761470575018-135c213340eb", "hero", "wellness-studio", "Wellness steam room with candle and soft ambient lighting", 1920, 1080),
];

// ────────────────────────────────────────────────────────────
// Concierge / AI Background
// ────────────────────────────────────────────────────────────

export const conciergeImage: AuraImage = img(
  "concierge-bg",
  "1507003211169-0a1dd7228f2d",
  "concierge",
  "atmosphere",
  "Serene atmospheric background for AI concierge",
  1600,
  1000,
);

// ────────────────────────────────────────────────────────────
// Area / Neighbourhood Cards
// ────────────────────────────────────────────────────────────

export const areaImages: AuraImage[] = [
  img("area-indiranagar", "1762122944695-4ee7032b7c9e", "area", "boutique", "Tree-lined boutique beauty entrance in Indiranagar"),
  img("area-koramangala", "1560869713-7d0a29430803", "area", "modern", "Modern beauty counter in a Koramangala salon"),
  img("area-hsr", "1554519934-e32b1629d9ee", "area", "contemporary", "Contemporary salon mirrors and styling stations in HSR"),
  img("area-whitefield", "1612817288484-6f916006741a", "area", "retreat", "Spa-led wellness retreat space in Whitefield"),
  img("area-jayanagar", "1643122966676-29e8597257f7", "area", "heritage", "Heritage beauty space with warm candlelit ambiance"),
];

// ────────────────────────────────────────────────────────────
// Salon Covers — one unique cover per salon, matched to specialty
// ────────────────────────────────────────────────────────────

export const salonImages: AuraImage[] = [
  // Covers
  img("salon-cover-maison-lumiere", "1519741497674-611481863552", "salon", "bridal", "Bridal preparation in soft natural light"),
  img("salon-cover-atrium-atelier", "1562322140-8baeececf3df", "salon", "hair-color", "Expert balayage and colour work in progress"),
  img("salon-cover-studio-noir", "1522337360788-8b13dee7a37e", "salon", "editorial", "Editorial hair styling session"),
  img("salon-cover-maison-aura", "1570172619644-dfd03ed5d881", "salon", "facial", "Restorative gua sha facial treatment"),
  img("salon-cover-quiet-room", "1544161515-4ab6ce6db874", "salon", "wellness", "Ayurvedic massage with warm herbal oils"),
  img("salon-cover-atelier-blanc", "1522335789203-aabd1fc54bc9", "salon", "makeup", "Couture makeup brush collection arranged with care"),
  img("salon-cover-salon-veda", "1516975080664-ed2fc6a32937", "salon", "hair-spa", "Tranquil hair spa environment with soft lighting"),
  img("salon-cover-house-of-ila", "1552693673-1bf958298935", "salon", "skin", "Precision skincare treatment application"),

  // Gallery — Maison Lumière (Bridal)
  img("gallery-ml-1", "1595476108010-b4d1f102b1b1", "salon", "bridal", "Bridal hair styling with delicate floral details"),
  img("gallery-ml-2", "1487530811176-3780de880c2d", "salon", "bridal", "Bridal jewelry and accessories on display"),
  img("gallery-ml-3", "1465495976277-4387d4b0b4c6", "salon", "bridal", "Elegant white floral arrangement in bridal suite"),
  img("gallery-ml-4", "1522673607200-164d1b6ce486", "salon", "bridal", "Bridal makeup application in soft natural light"),
  img("gallery-ml-5", "1520763185298-1b434c919102", "salon", "bridal", "Bridal bouquet and beauty preparation details"),
  img("gallery-ml-6", "1469371670807-013ccf25f16a", "salon", "bridal", "Bridal beauty consultation room interior"),

  // Gallery — The Atrium Atelier (Hair Color)
  img("gallery-aa-1", "1640958899960-65fc2f989a5f", "salon", "hair", "Precision cutting tools arranged on styling station"),
  img("gallery-aa-2", "1696091925467-7ebe43393c20", "salon", "hair", "Professional blow dry styling technique"),
  img("gallery-aa-3", "1620331311520-246422fd82f9", "salon", "hair", "Hand-painted balayage highlights in progress"),
  img("gallery-aa-4", "1576091160399-112ba8d25d1d", "salon", "hair", "Gentle hair brushing and conditioning treatment"),
  img("gallery-aa-5", "1605980776566-0486c3ac7617", "salon", "hair", "Luxury deep conditioning hair treatment"),
  img("gallery-aa-6", "1526045478516-99145907023c", "salon", "hair", "Hair styling with natural flowing movement"),

  // Gallery — Studio Noir (Editorial Hair & Skin)
  img("gallery-sn-1", "1505944357431-27579db47558", "salon", "editorial", "Editorial beauty look captured in salon mirror"),
  img("gallery-sn-2", "1498843053639-170ff2122f35", "salon", "editorial", "Beauty portrait with sculpted editorial styling"),
  img("gallery-sn-3", "1636714528228-f469eefb3eef", "salon", "editorial", "Close-up skincare application with precision tools"),
  img("gallery-sn-4", "1508094189980-f310ae0fc605", "salon", "editorial", "Professional skin treatment in editorial studio"),
  img("gallery-sn-5", "1596462502278-27bfdc403348", "salon", "editorial", "Editorial beauty setup with curated products"),
  img("gallery-sn-6", "1620464003286-a5b0d79f32c2", "salon", "editorial", "Makeup application with editorial precision"),

  // Gallery — Maison Aura (Gua Sha & Facial)
  img("gallery-ma-1", "1616394584738-fc6e612e71b9", "salon", "facial", "Curated skincare products for facial rituals"),
  img("gallery-ma-2", "1598440947619-2c35fc9aa908", "salon", "facial", "Minimalist skincare treatment environment"),
  img("gallery-ma-3", "1611930022073-b7a4ba5fcccd", "salon", "facial", "Restorative face cream and treatment balms"),
  img("gallery-ma-4", "1713768704571-6aeb0d0e5105", "salon", "facial", "Facial oil dropper with botanical active serums"),
  img("gallery-ma-5", "1559599101-f09722fb4948", "salon", "facial", "Natural beauty and skin wellness portrait"),
  img("gallery-ma-6", "1613803745799-ba6c10aace85", "salon", "facial", "Radiant skin after restorative facial treatment"),

  // Gallery — The Quiet Room (Ayurvedic Wellness)
  img("gallery-qr-1", "1515377905703-c4788e51af15", "salon", "wellness", "Spa candles and aromatherapy oils"),
  img("gallery-qr-2", "1601479604588-68d9e6d386b5", "salon", "wellness", "Zen wellness space with calming earth tones"),
  img("gallery-qr-3", "1487412720507-e7ab37603c6f", "salon", "wellness", "Luxury spa room prepared for treatment"),
  img("gallery-qr-4", "1652149400663-de9ddb8166be", "salon", "wellness", "Deep relaxation treatment in Ayurvedic setting"),
  img("gallery-qr-5", "1582750433449-648ed127bb54", "salon", "wellness", "Herbal spa treatment with traditional oils"),
  img("gallery-qr-6", "1519823551278-64ac92734fb1", "salon", "wellness", "Therapeutic massage with warm herbal compress"),

  // Gallery — Atelier Blanc (Couture Makeup)
  img("gallery-ab-1", "1512496015851-a90fb38ba796", "salon", "makeup", "Curated lipstick collection in muted rose tones"),
  img("gallery-ab-2", "1526045612212-70caf35c14df", "salon", "makeup", "Editorial colour palette for couture artistry"),
  img("gallery-ab-3", "1557205465-f3762edea6d3", "salon", "makeup", "Foundation and complexion products in warm tones"),
  img("gallery-ab-4", "1631214524020-7e18db9a8f92", "salon", "makeup", "Precision mascara for editorial lash definition"),
  img("gallery-ab-5", "1597225244660-1cd128c64284", "salon", "makeup", "Brow sculpting tools and pomade collection"),
  img("gallery-ab-6", "1704621354138-e124277356f2", "salon", "makeup", "Makeup application ritual in studio light"),

  // Gallery — Salon Veda (Hair Spa & Nails)
  img("gallery-sv-1", "1553521041-d168abd31de3", "salon", "hair-spa", "Hair colour preparation bowls and tools"),
  img("gallery-sv-2", "1700760934268-8aa0ef52ce0a", "salon", "hair-spa", "Hair accessories and styling pins on tray"),
  img("gallery-sv-3", "1556760544-74068565f05c", "salon", "hair-spa", "Spa towels rolled in tranquil treatment room"),
  img("gallery-sv-4", "1519824145371-296894a0daa9", "salon", "hair-spa", "Hot stone and spa treatment preparation"),
  img("gallery-sv-5", "1570295999919-56ceb5ecca61", "salon", "hair-spa", "Aromatherapy oils for scalp wellness ritual"),
  img("gallery-sv-6", "1571781926291-c477ebfd024b", "salon", "hair-spa", "Curated hair and body care product shelf"),

  // Gallery — House of Ila (Skin & Brow)
  img("gallery-hi-1", "1508214751196-bcfd4ca60f91", "salon", "skin", "Skincare consultation with diagnostic tools"),
  img("gallery-hi-2", "1523263685509-57c1d050d19b", "salon", "skin", "Brow architecture and lamination treatment"),
  img("gallery-hi-3", "1519125323398-675f0ddb6308", "salon", "skin", "Microcurrent facial device in treatment room"),
  img("gallery-hi-4", "1733145820333-6fa6ed6f8f5d", "salon", "skin", "Skin renewal treatment with active serums"),
  img("gallery-hi-5", "1519415387722-a1c3bbef716c", "salon", "skin", "Brow shaping with precision threading tools"),
  img("gallery-hi-6", "1735151225764-eac694642dbf", "salon", "skin", "Post-treatment skin hydration and barrier repair"),
];

// ────────────────────────────────────────────────────────────
// Products — one unique image per product
// ────────────────────────────────────────────────────────────

export const productImages: AuraImage[] = [
  // Skincare
  img("prod-restorative-serum", "1556228578-0d85b1a4d571", "product", "skincare", "Restorative facial serum in minimalist glass bottle"),
  img("prod-cocoon-day-cream", "1611930022073-b7a4ba5fcccd", "product", "skincare", "Featherweight day cream in frosted porcelain jar"),
  img("prod-cleansing-balm", "1608248543803-ba4f8c70ae0b", "product", "skincare", "Gentle cleansing balm in amber apothecary vessel"),
  img("prod-midnight-oil", "1713768704571-6aeb0d0e5105", "product", "skincare", "Midnight renewal oil with botanical dropper"),
  // Skincare supplementary (for galleries)
  img("prod-skincare-context-1", "1598440947619-2c35fc9aa908", "product", "skincare", "Skincare ritual on marble vanity"),
  img("prod-skincare-context-2", "1636714528228-f469eefb3eef", "product", "skincare", "Skincare layering routine close-up"),

  // Haircare
  img("prod-botanical-oil", "1585751119414-ef2636f8aede", "product", "haircare", "Botanical hair oil in hand-blown glass flacon"),
  img("prod-repair-mask", "1671493235081-5842463637cd", "product", "haircare", "Restorative hair mask in matte ceramic jar"),
  img("prod-everyday-shampoo", "1535585209827-a15fcdbc4c2d", "product", "haircare", "Everyday shampoo in recyclable aluminium bottle"),
  img("prod-scalp-serum", "1608571423902-eed4a5ad8108", "product", "haircare", "Scalp renewal serum with precision applicator"),
  // Haircare supplementary
  img("prod-haircare-context-1", "1527799820374-dcf8d9d4a388", "product", "haircare", "Hair care products arranged on bathroom shelf"),
  img("prod-haircare-context-2", "1576091160399-112ba8d25d1d", "product", "haircare", "Hair brushing with natural bristle brush"),

  // Makeup
  img("prod-velvet-lip", "1512496015851-a90fb38ba796", "product", "makeup", "Velvet lip colour in muted rose shade"),
  img("prod-editorial-mascara", "1631214524020-7e18db9a8f92", "product", "makeup", "Editorial mascara with precision wand"),
  img("prod-complexion-base", "1557205465-f3762edea6d3", "product", "makeup", "Complexion base in calibrated skin tones"),
  img("prod-brow-pomade", "1597225244660-1cd128c64284", "product", "makeup", "Brow architect pomade with sculpting brush"),
  // Makeup supplementary
  img("prod-makeup-context-1", "1596462502278-27bfdc403348", "product", "makeup", "Makeup products arranged on styling tray"),
  img("prod-makeup-context-2", "1620464003286-a5b0d79f32c2", "product", "makeup", "Makeup application with professional brushes"),

  // Wellness
  img("prod-diffuser", "1602928321679-560bb453f190", "product", "wellness", "Ceramic stillness diffuser with Ayurvedic oil"),
  img("prod-bath-salts", "1563822249366-3efb23b8e0c9", "product", "wellness", "Calm bath salts with pink salt and dried rose"),
  img("prod-tisane", "1571875257727-256c39da42af", "product", "wellness", "Morning tisane blend in hand-crafted glass cup"),
  img("prod-silk-pillow", "1584100936595-c0654b55a2e2", "product", "wellness", "Mulberry silk pillowcase in natural ivory"),
  // Wellness supplementary
  img("prod-wellness-context-1", "1515377905703-c4788e51af15", "product", "wellness", "Wellness ritual with candles and botanicals"),
  img("prod-wellness-context-2", "1601479604588-68d9e6d386b5", "product", "wellness", "Calm wellness space with earth-toned textiles"),
];

// ────────────────────────────────────────────────────────────
// Journal — one unique cover per article, matched to category
// ────────────────────────────────────────────────────────────

export const journalImages: AuraImage[] = [
  img("journal-bridal-trends", "1469371670807-013ccf25f16a", "journal", "bridal", "Bridal beauty trends with soft jewels and sculpted skin", 1200, 675),
  img("journal-bridal-routine", "1522673607200-164d1b6ce486", "journal", "bridal", "Building a bridal skincare routine with intention", 1200, 675),
  img("journal-keratin", "1620331311520-246422fd82f9", "journal", "haircare", "Keratin treatment vs smoothening comparison", 1200, 675),
  img("journal-prewash-oils", "1605980776566-0486c3ac7617", "journal", "haircare", "Pre-wash oil treatment for hair restoration", 1200, 675),
  img("journal-monsoon", "1570172619644-dfd03ed5d881", "journal", "skincare", "Monsoon skincare essentials for humid climate", 1200, 675),
  img("journal-niacinamide", "1556228578-0d85b1a4d571", "journal", "skincare", "Niacinamide serum and quiet active ingredients", 1200, 675),
  img("journal-abhyanga", "1544161515-4ab6ce6db874", "journal", "wellness", "Abhyanga Ayurvedic massage tradition", 1200, 675),
  img("journal-stillness", "1601479604588-68d9e6d386b5", "journal", "wellness", "A Sunday of stillness and restorative calm", 1200, 675),
];

// ────────────────────────────────────────────────────────────
// Bridal — dedicated bridal content pool
// ────────────────────────────────────────────────────────────

export const bridalImages: AuraImage[] = salonImages.filter(
  (i) => i.specialty === "bridal",
);

// ────────────────────────────────────────────────────────────
// Wellness — dedicated wellness content pool
// ────────────────────────────────────────────────────────────

export const wellnessImages: AuraImage[] = [
  ...salonImages.filter((i) => i.specialty === "wellness"),
  ...productImages.filter((i) => i.specialty === "wellness"),
];

// ────────────────────────────────────────────────────────────
// Lookup helpers
// ────────────────────────────────────────────────────────────

const byId = new Map<string, AuraImage>();
[...heroImages, conciergeImage, ...areaImages, ...salonImages, ...productImages, ...journalImages].forEach(
  (i) => byId.set(i.id, i),
);

export function getImage(id: string): AuraImage | undefined {
  return byId.get(id);
}

export function getImageUrl(id: string): string {
  return byId.get(id)?.url ?? "";
}

export function imagesByCategory(category: string): AuraImage[] {
  return [...byId.values()].filter((i) => i.category === category);
}

export function imagesBySpecialty(specialty: string): AuraImage[] {
  return [...byId.values()].filter((i) => i.specialty === specialty);
}
