import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { Clock, Store, Package, FileText, ShoppingCart, Users, Calendar, LogOut, Pencil, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type Tab = "salons" | "products" | "journals" | "orders" | "users" | "appointments";

function AdminDashboard() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("salons");

  if (ready && (!user || user.role !== "ADMIN")) {
    navigate({ to: "/auth/login" });
    return null;
  }
  if (!ready) return <div className="min-h-screen grid place-items-center"><Clock className="animate-spin" /></div>;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "salons", label: "Salons", icon: <Store size={14} /> },
    { key: "products", label: "Products", icon: <Package size={14} /> },
    { key: "journals", label: "Journals", icon: <FileText size={14} /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart size={14} /> },
    { key: "users", label: "Users", icon: <Users size={14} /> },
    { key: "appointments", label: "Appointments", icon: <Calendar size={14} /> },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-foreground/10 px-6 md:px-16 py-4 flex items-center justify-between">
        <span className="font-display text-xl tracking-wide">AÛRA <span className="text-xs text-foreground/50 ml-2">Admin</span></span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground/60">{user?.name}</span>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-[var(--earth)] hover:text-foreground transition-colors">
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </header>
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-xs border transition-colors flex items-center gap-2 ${tab === t.key ? "bg-foreground text-background border-foreground" : "border-foreground/15 text-foreground/70"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        {tab === "salons" && <SalonsTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "journals" && <JournalsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "users" && <UsersTab />}
        {tab === "appointments" && <AppointmentsTab />}
      </div>
    </div>
  );
}

// ─── Image Upload Hook ────────────────────────────────────────

function useImageUpload(folder: string) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const pick = () => ref.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setUploading(true);
      try {
        const result = await api.uploadImage(base64, folder);
        setUrl(result.url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        setUrl(null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const clear = () => { setPreview(null); setUrl(null); if (ref.current) ref.current.value = ""; };

  const Input = (
    <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
  );

  return { preview, uploading, url, pick, clear, Input };
}

// ─── Field Helpers ────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", required = false, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50">{label}{required && " *"}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm outline-none focus:border-foreground/40" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="mt-1 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm resize-none outline-none focus:border-foreground/40" />
    </label>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm capitalize">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

// ─── Salons Tab ───────────────────────────────────────────────

function SalonsTab() {
  const qc = useQueryClient();
  const { data: salons = [], isLoading } = useQuery({ queryKey: ["admin-salons"], queryFn: () => api.adminListSalons() });
  const updateMu = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.adminUpdateSalon(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-salons"] }); toast.success("Salon updated"); },
  });
  const deleteMu = useMutation({
    mutationFn: (id: string) => api.adminDeleteSalon(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-salons"] }); toast.success("Salon deleted"); },
  });

  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;
  const statusColors: Record<string, string> = { PENDING: "text-amber-600 bg-amber-50", APPROVED: "text-green-600 bg-green-50", REJECTED: "text-red-600 bg-red-50", DISABLED: "text-foreground/40 bg-foreground/5" };

  return (
    <div className="space-y-3">
      {(salons as Array<Record<string, unknown>>).map((s) => (
        <div key={s.id as string} className="rounded-2xl border border-foreground/10 p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="font-display text-lg">{s.name as string}</p>
            <p className="text-xs text-foreground/50">{s.city as string} · {s.email as string} · {s.phone as string}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${statusColors[s.status as string] || ""}`}>{s.status as string}</span>
          <div className="flex gap-2">
            {s.status !== "APPROVED" && (
              <button onClick={() => updateMu.mutate({ id: s.id as string, status: "APPROVED" })}
                className="rounded-full px-3 py-1 text-xs border border-green-200 text-green-600 hover:bg-green-50">Approve</button>
            )}
            {s.status === "PENDING" && (
              <button onClick={() => updateMu.mutate({ id: s.id as string, status: "REJECTED" })}
                className="rounded-full px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50">Reject</button>
            )}
            {s.status === "APPROVED" && (
              <button onClick={() => updateMu.mutate({ id: s.id as string, status: "DISABLED" })}
                className="rounded-full px-3 py-1 text-xs border border-foreground/15 text-foreground/50">Disable</button>
            )}
            <button onClick={() => { if (confirm("Delete this salon and all its data?")) deleteMu.mutate(s.id as string); }}
              className="rounded-full px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 size={12} className="inline mr-1" />Delete
            </button>
          </div>
        </div>
      ))}
      {!(salons as unknown[]).length && <p className="text-sm text-foreground/50">No salon registrations yet.</p>}
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────

type ProductForm = { name: string; brand: string; category: string; price: string; description: string; image: string; images: string[]; ingredients: string };
const emptyProduct: ProductForm = { name: "", brand: "", category: "skincare", price: "", description: "", image: "", images: [], ingredients: "" };

function ProductsTab() {
  const qc = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const { data: products = [], isLoading } = useQuery({ queryKey: ["admin-products", showArchived], queryFn: () => api.adminListProducts(showArchived) });
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [editId, setEditId] = useState<string | null>(null);
  const img = useImageUpload("aura/products");

  const createMu = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.adminCreateProduct(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); reset(); toast.success("Product created"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.adminUpdateProduct(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); reset(); toast.success("Product updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const deleteMu = useMutation({
    mutationFn: (id: string) => api.adminDeleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product archived"); },
  });
  const restoreMu = useMutation({
    mutationFn: (id: string) => api.adminRestoreProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Product restored"); },
  });

  const reset = () => { setMode("list"); setForm(emptyProduct); setEditId(null); img.clear(); };

  const startEdit = (p: Record<string, unknown>) => {
    const gallery = (p.gallery as string[]) || [];
    setForm({
      name: p.name as string, brand: p.brand as string, category: p.category as string,
      price: String(p.price), description: p.description as string || "", image: p.image as string,
      images: gallery.length ? gallery : [p.image as string],
      ingredients: ((p.ingredients as string[]) || []).join(", "),
    });
    setEditId(p.id as string);
    setMode("edit");
  };

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await api.uploadImage(base64, "aura/products");
          setForm((f) => ({ ...f, images: [...f.images, result.url] }));
        } catch (err) {
          toast.error("Image upload failed");
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const submit = () => {
    if (!form.name || !form.brand || !form.price) { toast.error("Fill required fields"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { toast.error("Price must be a positive number"); return; }
    const allImages = form.images.length ? form.images : (img.url ? [img.url] : form.image ? [form.image] : []);
    if (!allImages.length) { toast.error("At least one image is required"); return; }
    const ingredientsList = form.ingredients.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = { name: form.name, brand: form.brand, category: form.category, price, description: form.description, image: allImages[0], gallery: allImages, ingredients: ingredientsList };
    if (mode === "edit" && editId) updateMu.mutate({ id: editId, data: payload });
    else createMu.mutate(payload);
  };

  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;

  if (mode !== "list") {
    return (
      <div className="max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">{mode === "edit" ? "Edit Product" : "New Product"}</h3>
          <button onClick={reset} className="text-foreground/50 hover:text-foreground"><X size={18} /></button>
        </div>
        <Field label="Product Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
        <Field label="Brand" value={form.brand} onChange={(v) => setForm((f) => ({ ...f, brand: v }))} required />
        <Field label="Price (₹)" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v.replace(/[^0-9.]/g, "") }))} type="text" required placeholder="e.g. 2400" />
        <Select label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={["skincare", "haircare", "makeup", "wellness"]} />
        <TextArea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
        <Field label="Ingredients (comma-separated)" value={form.ingredients} onChange={(v) => setForm((f) => ({ ...f, ingredients: v }))} placeholder="Squalane, Niacinamide, Vitamin E" />
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50">Product Images * (1–10)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.images.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-foreground/10">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-background/80 grid place-items-center"><X size={10} /></button>
              </div>
            ))}
            {form.images.length < 10 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-foreground/15 grid place-items-center text-foreground/30 hover:border-foreground/30 cursor-pointer">
                <div className="text-center"><Upload size={16} /><p className="text-[9px] mt-0.5">Add</p></div>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={addImage} />
              </label>
            )}
          </div>
        </div>
        <button onClick={submit} disabled={createMu.isPending || updateMu.isPending}
          className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm disabled:opacity-50">
          {(createMu.isPending || updateMu.isPending) ? "Saving..." : mode === "edit" ? "Update Product" : "Create Product"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode("create")} className="rounded-full bg-foreground text-background px-5 py-2 text-sm">+ New Product</button>
        <button onClick={() => setShowArchived(!showArchived)}
          className={`rounded-full px-4 py-2 text-xs border transition-colors ${showArchived ? "bg-foreground text-background border-foreground" : "border-foreground/15 text-foreground/70"}`}>
          {showArchived ? "Show Active Only" : "Show Archived"}
        </button>
      </div>
      <div className="space-y-2">
        {(products as Array<Record<string, unknown>>).map((p) => {
          const archived = !(p.isActive as boolean);
          return (
            <div key={p.id as string} className={`rounded-xl border border-foreground/10 p-4 flex items-center gap-4 ${archived ? "opacity-60" : ""}`}>
              {p.image ? <img src={p.image as string} alt="" className="w-12 h-12 rounded-lg object-cover" /> : null}
              <div className="flex-1 min-w-0">
                <p className="font-display">{p.name as string} <span className="text-xs text-foreground/50">({p.brand as string})</span>
                  {archived && <span className="ml-2 text-[10px] text-red-500 uppercase">Archived</span>}
                </p>
                <p className="text-xs text-foreground/50">₹{(p.price as number).toLocaleString("en-IN")} · {p.category as string}</p>
              </div>
              {!archived && (
                <>
                  <button onClick={() => startEdit(p)} className="text-xs text-foreground/50 hover:text-foreground"><Pencil size={14} /></button>
                  <button onClick={() => deleteMu.mutate(p.id as string)} className="text-xs text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                </>
              )}
              {archived && (
                <button onClick={() => restoreMu.mutate(p.id as string)} className="rounded-full px-3 py-1 text-xs border border-green-200 text-green-600 hover:bg-green-50">Restore</button>
              )}
            </div>
          );
        })}
        {!(products as unknown[]).length && <p className="text-sm text-foreground/50">{showArchived ? "No products found." : "No active admin products. Hardcoded seed products are always visible."}</p>}
      </div>
    </div>
  );
}

// ─── Journals Tab ─────────────────────────────────────────────

type JournalForm = { title: string; excerpt: string; content: string; category: string; cover: string; author: string; date: string; readingTime: string };
const emptyJournal: JournalForm = { title: "", excerpt: "", content: "", category: "skincare", cover: "", author: "", date: "", readingTime: "5" };

function JournalsTab() {
  const qc = useQueryClient();
  const { data: articles = [], isLoading } = useQuery({ queryKey: ["admin-journals"], queryFn: () => api.adminListJournals() });
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [form, setForm] = useState<JournalForm>(emptyJournal);
  const [editId, setEditId] = useState<string | null>(null);
  const img = useImageUpload("aura/journal");

  const createMu = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.adminCreateJournal(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-journals"] }); reset(); toast.success("Article created"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const updateMu = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => api.adminUpdateJournal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-journals"] }); reset(); toast.success("Article updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const deleteMu = useMutation({
    mutationFn: (id: string) => api.adminDeleteJournal(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-journals"] }); toast.success("Article deleted"); },
  });

  const reset = () => { setMode("list"); setForm(emptyJournal); setEditId(null); img.clear(); };

  const startEdit = (a: Record<string, unknown>) => {
    const contentArr = (a.content as string[]) || [];
    setForm({
      title: a.title as string, excerpt: a.excerpt as string || "",
      content: contentArr.join("\n\n"), category: a.category as string,
      cover: a.cover as string, author: a.author as string || "", date: a.date as string,
      readingTime: (a.readingTime as string || "5").replace(/\D/g, ""),
    });
    setEditId(a.id as string);
    setMode("edit");
  };

  const submit = () => {
    if (!form.title || !form.date) { toast.error("Title and date are required"); return; }
    const coverUrl = img.url || form.cover;
    if (!coverUrl) { toast.error("Cover image is required"); return; }
    const contentParagraphs = form.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const payload = { ...form, cover: coverUrl, readingTime: `${form.readingTime} min`, content: contentParagraphs.length ? contentParagraphs : (form.excerpt ? [form.excerpt] : []) };
    if (mode === "edit" && editId) updateMu.mutate({ id: editId, data: payload });
    else createMu.mutate(payload);
  };

  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;

  if (mode !== "list") {
    return (
      <div className="max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">{mode === "edit" ? "Edit Article" : "New Article"}</h3>
          <button onClick={reset} className="text-foreground/50 hover:text-foreground"><X size={18} /></button>
        </div>
        <Field label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
        <Field label="Author" value={form.author} onChange={(v) => setForm((f) => ({ ...f, author: v }))} placeholder="Aûra Editorial" />
        <TextArea label="Excerpt (short summary)" value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} rows={3} />
        <TextArea label="Article Content (separate paragraphs with blank lines)" value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} rows={10} />
        <Select label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={["bridal", "haircare", "skincare", "wellness"]} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} type="date" required />
          <Field label="Read Time (minutes)" value={form.readingTime} onChange={(v) => setForm((f) => ({ ...f, readingTime: v.replace(/\D/g, "") }))} type="text" placeholder="5" />
        </div>
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/50">Cover Image *</span>
          <div className="mt-2 flex items-start gap-4">
            {(img.preview || form.cover) ? (
              <div className="relative w-48 h-28 rounded-xl overflow-hidden border border-foreground/10">
                <img src={img.preview || form.cover} alt="" className="w-full h-full object-cover" />
                <button onClick={() => { img.clear(); setForm((f) => ({ ...f, cover: "" })); }}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 grid place-items-center"><X size={12} /></button>
              </div>
            ) : (
              <button onClick={img.pick}
                className="w-48 h-28 rounded-xl border-2 border-dashed border-foreground/15 grid place-items-center text-foreground/30 hover:border-foreground/30">
                <div className="text-center"><ImageIcon size={20} /><p className="text-[10px] mt-1">Upload Cover</p></div>
              </button>
            )}
            {img.uploading && <p className="text-xs text-foreground/50 mt-4">Uploading...</p>}
          </div>
          {img.Input}
        </div>
        <button onClick={submit} disabled={createMu.isPending || updateMu.isPending || img.uploading}
          className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm disabled:opacity-50">
          {(createMu.isPending || updateMu.isPending) ? "Saving..." : mode === "edit" ? "Update Article" : "Create Article"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setMode("create")} className="rounded-full bg-foreground text-background px-5 py-2 text-sm">+ New Article</button>
      <div className="space-y-2">
        {(articles as Array<Record<string, unknown>>).map((a) => (
          <div key={a.id as string} className="rounded-xl border border-foreground/10 p-4 flex items-center gap-4">
            {a.cover ? <img src={a.cover as string} alt="" className="w-16 h-10 rounded-lg object-cover" /> : null}
            <div className="flex-1 min-w-0">
              <p className="font-display">{a.title as string}</p>
              <p className="text-xs text-foreground/50">{a.category as string} · {a.date as string} · {a.author as string}</p>
            </div>
            <button onClick={() => startEdit(a)} className="text-xs text-foreground/50 hover:text-foreground"><Pencil size={14} /></button>
            <button onClick={() => deleteMu.mutate(a.id as string)} className="text-xs text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
          </div>
        ))}
        {!(articles as unknown[]).length && <p className="text-sm text-foreground/50">No admin-created articles yet. Hardcoded seed articles are always visible.</p>}
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => api.adminListOrders() });
  const updateMu = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.adminUpdateOrder(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); toast.success("Order updated"); },
  });

  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;
  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-3">
      {(orders as Array<Record<string, unknown>>).map((o) => (
        <div key={o.id as string} className="rounded-2xl border border-foreground/10 p-5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="font-display">Order {(o.id as string).slice(0, 8)}</p>
            <p className="text-xs text-foreground/50">
              {(o.user as Record<string, string>)?.name} · ₹{(o.total as number).toLocaleString("en-IN")} · {new Date(o.createdAt as string).toLocaleDateString("en-IN")}
            </p>
          </div>
          <select value={o.status as string} onChange={(e) => updateMu.mutate({ id: o.id as string, status: e.target.value })}
            className="rounded-xl border border-foreground/15 bg-background px-3 py-1.5 text-xs">
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ))}
      {!(orders as unknown[]).length && <p className="text-sm text-foreground/50">No orders yet.</p>}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────

function UsersTab() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => api.adminListUsers() });
  const deleteMu = useMutation({
    mutationFn: (id: string) => api.adminDeleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;
  const roleColors: Record<string, string> = { USER: "bg-foreground/5", SALON: "bg-blue-50 text-blue-600", ADMIN: "bg-amber-50 text-amber-600" };

  return (
    <div className="space-y-2">
      {(users as Array<Record<string, unknown>>).map((u) => (
        <div key={u.id as string} className="rounded-xl border border-foreground/10 p-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display">{u.name as string}</p>
            <p className="text-xs text-foreground/50">{u.email as string} · Joined {new Date(u.createdAt as string).toLocaleDateString("en-IN")}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${roleColors[u.role as string] || ""}`}>{u.role as string}</span>
          {u.role !== "ADMIN" && (
            <button onClick={() => { if (confirm(`Delete ${u.name as string}? This removes all their data.`)) deleteMu.mutate(u.id as string); }}
              className="text-xs text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Appointments Tab ─────────────────────────────────────────

function AppointmentsTab() {
  const { data: raw = [], isLoading } = useQuery({ queryKey: ["admin-appointments"], queryFn: () => api.adminListAppointments() });
  if (isLoading) return <p className="text-sm text-foreground/50">Loading...</p>;

  const statusColors: Record<string, string> = {
    PENDING: "text-amber-600 bg-amber-50", CONFIRMED: "text-blue-600 bg-blue-50",
    COMPLETED: "text-green-600 bg-green-50", REJECTED: "text-red-600 bg-red-50", CANCELLED: "text-foreground/40 bg-foreground/5",
  };
  const sortOrder: Record<string, number> = { PENDING: 0, CONFIRMED: 1, COMPLETED: 2, REJECTED: 3, CANCELLED: 4 };
  const appointments = [...(raw as Array<Record<string, unknown>>)].sort((a, b) => {
    const sa = sortOrder[a.status as string] ?? 9;
    const sb = sortOrder[b.status as string] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(a.date as string).getTime() - new Date(b.date as string).getTime();
  });

  return (
    <div className="space-y-2">
      {appointments.map((a) => (
        <div key={a.id as string} className="rounded-xl border border-foreground/10 p-4 flex flex-wrap items-start gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="font-display">{a.service as string}</p>
            <p className="text-xs text-foreground/50">
              Salon: {a.salonId as string} · Customer: {(a.user as Record<string, string>)?.name} ({(a.user as Record<string, string>)?.email})
            </p>
            <p className="text-xs text-foreground/50">
              {new Date(a.date as string).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {a.time as string}
            </p>
            {a.notes ? <p className="text-xs text-foreground/40 mt-1 italic">Notes: {String(a.notes)}</p> : null}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs ${statusColors[a.status as string] || "bg-foreground/5"}`}>{a.status as string}</span>
        </div>
      ))}
      {!appointments.length && <p className="text-sm text-foreground/50">No appointments yet.</p>}
    </div>
  );
}
