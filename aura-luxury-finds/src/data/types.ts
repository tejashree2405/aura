// Types shaped to mirror future Prisma models. Replace mock data sources with
// database calls (server functions) without changing component contracts.

export type Area = "indiranagar" | "koramangala" | "hsr-layout" | "whitefield" | "jayanagar";
export type ServiceKey = "hair" | "bridal" | "makeup" | "spa" | "nails" | "facial";
export type ProductCategory = "skincare" | "haircare" | "makeup" | "wellness";
export type JournalCategory = "bridal" | "haircare" | "skincare" | "wellness";

export interface Salon {
  slug: string;
  name: string;
  area: Area;
  areaLabel: string;
  rating: number;
  startingPrice: number;
  cover: string;
  gallery: string[];
  specialty: string;
  about: string;
  specialties: string[];
  services: ServiceKey[];
  contact: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  rating: number;
  image: string;
  gallery: string[];
  description: string;
  ingredients: string[];
  reviews: { author: string; rating: number; text: string }[];
}

export interface JournalArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: JournalCategory;
  cover: string;
  readingTime: string;
  content: string[];
  author: string;
  date: string;
}

export interface Testimonial {
  q: string;
  a: string;
  c: string;
}

// ============ Account / commerce models (Prisma-shaped) ============

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BagItem {
  productSlug: string;
  qty: number;
}

export type PaymentMethod = "upi" | "credit-card" | "debit-card" | "net-banking";

export interface OrderItem {
  productSlug: string;
  name: string;
  brand: string;
  image: string;
  qty: number;
  price: number;
}

export type OrderStatus = "Confirmed" | "Processing" | "Shipped" | "Delivered";

export interface Order {
  id: string; // e.g. AURA1024
  createdAt: string; // ISO
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export type AppointmentStatus = "Upcoming" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  salonSlug: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}
