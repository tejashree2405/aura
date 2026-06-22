/**
 * Per-user persisted stores (bag, addresses, orders, appointments).
 * All keyed by user.id so signing out / switching accounts isolates data.
 * Future Prisma swap: replace these contexts with server-function-backed hooks.
 */
import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import type {
  Address, BagItem, Order, OrderItem, Appointment,
  PaymentMethod, OrderStatus,
} from "@/data/types";
import { getProduct } from "@/data/products";

function key(userId: string | undefined, name: string) {
  return `aura.${userId ?? "guest"}.${name}`;
}

function load<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function save<T>(k: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(value)); } catch { /* ignore */ }
}

// =========================================================================
interface AccountValue {
  // Bag
  bag: BagItem[];
  bagCount: number;
  bagSubtotal: number;
  addToBag: (slug: string, qty?: number) => void;
  removeFromBag: (slug: string) => void;
  updateBagQty: (slug: string, qty: number) => void;
  clearBag: () => void;
  // Addresses
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => Address;
  updateAddress: (id: string, patch: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  // Orders
  orders: Order[];
  placeOrder: (input: {
    items: OrderItem[];
    address: Address;
    paymentMethod: PaymentMethod;
    subtotal: number;
    tax: number;
    delivery: number;
    total: number;
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrder: (id: string) => Order | undefined;
  // Appointments
  appointments: Appointment[];
  bookAppointment: (a: Omit<Appointment, "id" | "status" | "createdAt">) => Appointment;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
}

const AccountCtx = createContext<AccountValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id;

  const [bag, setBag] = useState<BagItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Hydrate when user changes
  useEffect(() => {
    setBag(load<BagItem[]>(key(uid, "bag"), []));
    setAddresses(load<Address[]>(key(uid, "addresses"), []));
    setOrders(load<Order[]>(key(uid, "orders"), []));
    setAppointments(load<Appointment[]>(key(uid, "appointments"), []));
  }, [uid]);

  // Persist on change
  useEffect(() => { save(key(uid, "bag"), bag); }, [uid, bag]);
  useEffect(() => { save(key(uid, "addresses"), addresses); }, [uid, addresses]);
  useEffect(() => { save(key(uid, "orders"), orders); }, [uid, orders]);
  useEffect(() => { save(key(uid, "appointments"), appointments); }, [uid, appointments]);

  const bagCount = useMemo(() => bag.reduce((s, i) => s + i.qty, 0), [bag]);
  const bagSubtotal = useMemo(
    () => bag.reduce((s, i) => {
      const p = getProduct(i.productSlug);
      return s + (p ? p.price * i.qty : 0);
    }, 0),
    [bag],
  );

  const value: AccountValue = {
    bag, bagCount, bagSubtotal,
    addToBag: (slug, qty = 1) => setBag((prev) => {
      const idx = prev.findIndex((b) => b.productSlug === slug);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { productSlug: slug, qty }];
    }),
    removeFromBag: (slug) => setBag((prev) => prev.filter((b) => b.productSlug !== slug)),
    updateBagQty: (slug, qty) => setBag((prev) => qty <= 0
      ? prev.filter((b) => b.productSlug !== slug)
      : prev.map((b) => b.productSlug === slug ? { ...b, qty } : b)),
    clearBag: () => setBag([]),

    addresses,
    addAddress: (a) => {
      const created: Address = { ...a, id: crypto.randomUUID() };
      setAddresses((prev) => [...prev, created]);
      return created;
    },
    updateAddress: (id, patch) => setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a)),
    removeAddress: (id) => setAddresses((prev) => prev.filter((a) => a.id !== id)),

    orders,
    placeOrder: (input) => {
      const seq = 1024 + orders.length;
      const order: Order = {
        id: `AURA${seq}`,
        createdAt: new Date().toISOString(),
        status: "Confirmed",
        ...input,
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    updateOrderStatus: (id, status) => setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o)),
    getOrder: (id) => orders.find((o) => o.id === id),

    appointments,
    bookAppointment: (a) => {
      const created: Appointment = {
        ...a,
        id: crypto.randomUUID(),
        status: "Upcoming",
        createdAt: new Date().toISOString(),
      };
      setAppointments((prev) => [created, ...prev]);
      return created;
    },
    cancelAppointment: (id) => setAppointments((prev) =>
      prev.map((a) => a.id === id ? { ...a, status: "Cancelled" } : a)),
    rescheduleAppointment: (id, date, time) => setAppointments((prev) =>
      prev.map((a) => a.id === id ? { ...a, date, time, status: "Upcoming" } : a)),
  };

  return <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
