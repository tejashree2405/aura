/**
 * Per-user persisted stores (bag, addresses).
 * Bag uses localStorage keyed by user.id.
 * Addresses use backend API for persistence.
 */
import { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth-context";
import type { Address, BagItem } from "@/data/types";
import { getProduct } from "@/data/products";
import { api } from "./api-client";

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

const dbProductCache = new Map<string, { price: number; name: string; brand: string; image: string; category: string }>();

async function ensureDbProductCache() {
  if (dbProductCache.size > 0) return;
  try {
    const products = await api.listDbProducts() as Array<Record<string, unknown>>;
    for (const p of products) {
      dbProductCache.set(p.slug as string, {
        price: p.price as number, name: p.name as string, brand: p.brand as string,
        image: p.image as string, category: p.category as string,
      });
    }
  } catch { /* offline */ }
}

export function resolveProduct(slug: string) {
  const hardcoded = getProduct(slug);
  if (hardcoded) return hardcoded;
  const cached = dbProductCache.get(slug);
  if (cached) return { slug, ...cached, rating: 4.8, gallery: [cached.image], description: "", ingredients: [] as string[], reviews: [] as { author: string; rating: number; text: string }[] };
  return null;
}

interface AccountValue {
  bag: BagItem[];
  bagCount: number;
  bagSubtotal: number;
  addToBag: (slug: string, qty?: number) => void;
  removeFromBag: (slug: string) => void;
  updateBagQty: (slug: string, qty: number) => void;
  clearBag: () => void;
  addresses: Address[];
  addressesLoading: boolean;
  addAddress: (a: Omit<Address, "id">) => Promise<Address>;
  updateAddress: (id: string, patch: Partial<Address>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  refreshAddresses: () => void;
}

const AccountCtx = createContext<AccountValue | null>(null);

function dbToAddress(a: Record<string, unknown>): Address {
  return {
    id: a.id as string,
    fullName: (a.fullName as string) || "",
    phone: (a.phone as string) || "",
    line1: a.line1 as string,
    line2: a.line2 as string | undefined,
    landmark: a.landmark as string | undefined,
    city: a.city as string,
    state: a.state as string,
    pincode: a.pincode as string,
  };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id;

  const [bag, setBag] = useState<BagItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    setBag(load<BagItem[]>(key(uid, "bag"), []));
    ensureDbProductCache().then(() => setCacheReady(true));
  }, [uid]);

  const refreshAddresses = useCallback(async () => {
    if (!uid) { setAddresses([]); return; }
    setAddressesLoading(true);
    try {
      const raw = await api.listAddresses() as Array<Record<string, unknown>>;
      setAddresses(raw.map(dbToAddress));
    } catch {
      setAddresses(load<Address[]>(key(uid, "addresses"), []));
    } finally {
      setAddressesLoading(false);
    }
  }, [uid]);

  useEffect(() => { refreshAddresses(); }, [refreshAddresses]);
  useEffect(() => { save(key(uid, "bag"), bag); }, [uid, bag]);

  const bagCount = useMemo(() => bag.reduce((s, i) => s + i.qty, 0), [bag]);
  const bagSubtotal = useMemo(() => {
    if (!cacheReady) return 0;
    return bag.reduce((s, i) => {
      const p = resolveProduct(i.productSlug);
      return s + (p ? p.price * i.qty : 0);
    }, 0);
  }, [bag, cacheReady]);

  const addAddress = useCallback(async (a: Omit<Address, "id">): Promise<Address> => {
    try {
      const created = await api.createAddress(a as Record<string, unknown>) as Record<string, unknown>;
      const addr = dbToAddress(created);
      setAddresses((prev) => [addr, ...prev]);
      return addr;
    } catch {
      const local: Address = { ...a, id: crypto.randomUUID() };
      setAddresses((prev) => [local, ...prev]);
      save(key(uid, "addresses"), [local, ...addresses]);
      return local;
    }
  }, [uid, addresses]);

  const updateAddress = useCallback(async (id: string, patch: Partial<Address>) => {
    try {
      await api.updateAddress(id, patch as Record<string, unknown>);
      setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
    } catch {
      setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));
    }
  }, []);

  const removeAddress = useCallback(async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  }, []);

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
    addresses, addressesLoading, addAddress, updateAddress, removeAddress, refreshAddresses,
  };

  return <AccountCtx.Provider value={value}>{children}</AccountCtx.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountCtx);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
