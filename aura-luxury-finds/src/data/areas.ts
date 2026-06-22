import type { Area } from "./types";
import { areaImages } from "./images";

export const AREAS: { slug: Area; label: string; image: string; blurb: string }[] = [
  { slug: "indiranagar", label: "Indiranagar", image: areaImages[0].url, blurb: "Atelier studios on tree-lined avenues." },
  { slug: "koramangala", label: "Koramangala", image: areaImages[1].url, blurb: "Editorial colour & considered cuts." },
  { slug: "hsr-layout", label: "HSR Layout", image: areaImages[2].url, blurb: "Quiet, contemporary beauty houses." },
  { slug: "whitefield", label: "Whitefield", image: areaImages[3].url, blurb: "Spa-led wellness retreats." },
  { slug: "jayanagar", label: "Jayanagar", image: areaImages[4].url, blurb: "Heritage rituals, modern refinement." },
];

export const SERVICES = [
  { slug: "hair", label: "Hair" },
  { slug: "bridal", label: "Bridal" },
  { slug: "makeup", label: "Makeup" },
  { slug: "spa", label: "Spa" },
  { slug: "nails", label: "Nails" },
  { slug: "facial", label: "Facial" },
] as const;
