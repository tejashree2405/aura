import type { JournalArticle } from "./types";
import { journalImages } from "./images";

const coverUrl = (id: string) => journalImages.find((i) => i.id === id)!.url;

const longform = [
  "There is a quietness to good beauty that the loudest products never quite reach. It is the quietness of preparation — the slow soak, the considered serum, the unhurried morning.",
  "What we offer here is not a regimen but a rhythm. A handful of considered objects. A short list of people who know your skin. A salon you return to the way you return to a favourite chair.",
  "Begin with what you already have. Edit, slowly. Replace, rarely. Let the ritual become invisible.",
];

export const JOURNAL: JournalArticle[] = [
  {
    slug: "bangalore-bridal-beauty-trends-2026",
    title: "Bangalore Bridal Beauty Trends 2026",
    excerpt: "Soft jewels, sculpted skin, and a return to quiet, undone hair.",
    category: "bridal",
    cover: coverUrl("journal-bridal-trends"),
    readingTime: "6 min",
    content: longform,
    author: "Anaïs R.",
    date: "May 2026",
  },
  {
    slug: "how-to-build-a-bridal-routine",
    title: "How to Build a Bridal Routine",
    excerpt: "Begin three months out. The skin keeps its own slow time.",
    category: "bridal",
    cover: coverUrl("journal-bridal-routine"),
    readingTime: "9 min",
    content: longform,
    author: "Meher S.",
    date: "April 2026",
  },
  {
    slug: "keratin-vs-smoothening-a-considered-guide",
    title: "Keratin vs Smoothening — A Considered Guide",
    excerpt: "Two treatments, two intentions. A quiet primer on choosing.",
    category: "haircare",
    cover: coverUrl("journal-keratin"),
    readingTime: "8 min",
    content: longform,
    author: "Rhea K.",
    date: "March 2026",
  },
  {
    slug: "the-case-for-pre-wash-oils",
    title: "The Case for Pre-Wash Oils",
    excerpt: "Twenty quiet minutes that will change your hair entirely.",
    category: "haircare",
    cover: coverUrl("journal-prewash-oils"),
    readingTime: "5 min",
    content: longform,
    author: "Ila M.",
    date: "February 2026",
  },
  {
    slug: "monsoon-skincare-essentials",
    title: "Monsoon Skincare Essentials",
    excerpt: "A four-step ritual for Bangalore's quieter, damper months.",
    category: "skincare",
    cover: coverUrl("journal-monsoon"),
    readingTime: "5 min",
    content: longform,
    author: "Tara V.",
    date: "June 2026",
  },
  {
    slug: "niacinamide-quiet-active",
    title: "Niacinamide, the Quiet Active",
    excerpt: "The most considered ingredient on a considered shelf.",
    category: "skincare",
    cover: coverUrl("journal-niacinamide"),
    readingTime: "6 min",
    content: longform,
    author: "Devika P.",
    date: "May 2026",
  },
  {
    slug: "abhyanga-a-bangalore-tradition",
    title: "Abhyanga, A Bangalore Tradition",
    excerpt: "An ancient Ayurvedic massage practiced in quiet bungalows.",
    category: "wellness",
    cover: coverUrl("journal-abhyanga"),
    readingTime: "7 min",
    content: longform,
    author: "Naina A.",
    date: "April 2026",
  },
  {
    slug: "a-sunday-of-stillness",
    title: "A Sunday of Stillness",
    excerpt: "A short itinerary for the most restorative day of the week.",
    category: "wellness",
    cover: coverUrl("journal-stillness"),
    readingTime: "4 min",
    content: longform,
    author: "Maya J.",
    date: "March 2026",
  },
];

export const getArticle = (slug: string) => JOURNAL.find((a) => a.slug === slug);
export const articlesByCategory = (cat: string) => JOURNAL.filter((a) => a.category === cat);
