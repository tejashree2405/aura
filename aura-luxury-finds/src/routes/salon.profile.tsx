import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { PageShell } from "@/components/aura/PageShell";
import { Clock, Upload, X, Pencil } from "lucide-react";
import { FALLBACK_IMAGE } from "@/data/images";

export const Route = createFileRoute("/salon/profile")({
  component: SalonProfilePage,
});

function SalonProfilePage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [servicesText, setServicesText] = useState("");

  if (ready && (!user || user.role !== "SALON")) { navigate({ to: "/auth/login" }); return null; }
  if (!ready) return <div className="min-h-screen grid place-items-center"><Clock className="animate-spin" /></div>;

  const { data: salon, isLoading } = useQuery({ queryKey: ["salon-profile"], queryFn: () => api.getSalonProfile() });
  const saveMu = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.updateSalonProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["salon-profile"] }); setEditing(false); toast.success("Profile saved"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <PageShell><div className="px-6 md:px-16 py-20"><p className="text-foreground/50">Loading...</p></div></PageShell>;
  if (!salon) return <PageShell><div className="px-6 md:px-16 py-20"><p className="text-foreground/50">Profile not found.</p></div></PageShell>;

  const s = salon as Record<string, unknown>;

  const startEditing = () => {
    setForm({ ...s });
    setServicesText(((s.services as string[]) || []).join(", "));
    setEditing(true);
  };

  const handleSave = () => {
    const services = servicesText.split(",").map((v) => v.trim()).filter(Boolean);
    const payload: Record<string, unknown> = {};
    for (const key of ["name", "description", "phone", "address", "city", "fulfillmentAddress", "timings", "website", "instagram", "coverImage", "galleryImages"]) {
      if (form[key] !== undefined) payload[key] = form[key];
    }
    payload.services = services;
    payload.startingPrice = parseInt(String(form.startingPrice || 0), 10) || 0;
    saveMu.mutate(payload);
  };

  const uploadImage = async (file: File, key: "coverImage" | "galleryImages") => {
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      toast.error("Only JPEG, PNG, or WebP images are allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await api.uploadImage(reader.result as string, "aura/salons");
        if (key === "coverImage") {
          setForm((f) => ({ ...f, coverImage: result.url }));
        } else {
          setForm((f) => ({ ...f, galleryImages: [...((f.galleryImages as string[]) || []), result.url] }));
        }
        toast.success("Image uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  if (editing) {
    return (
      <PageShell>
        <section className="px-6 md:px-16 pb-20">
          <div className="max-w-[640px] mx-auto">
            <span className="eyebrow">Edit Salon Profile</span>
            <h1 className="mt-3 font-display text-3xl">{String(form.name || "")}</h1>
            <div className="mt-8 space-y-5">
              {(["name", "description", "phone", "address", "city", "fulfillmentAddress", "timings", "website", "instagram"] as const).map((k) => (
                <label key={k} className="block">
                  <span className="eyebrow text-xs">{k === "timings" ? "Opening Hours" : k === "fulfillmentAddress" ? "Fulfillment Address (private)" : k === "address" ? "Public Salon Address" : k}</span>
                  {k === "description" ? (
                    <textarea value={String(form[k] || "")} onChange={set(k)} rows={4}
                      className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm resize-none outline-none focus:border-foreground/40" />
                  ) : (
                    <input value={String(form[k] || "")} onChange={set(k)}
                      className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
                  )}
                </label>
              ))}
              <label className="block">
                <span className="eyebrow text-xs">Starting Price (₹)</span>
                <input type="number" value={String(form.startingPrice || "")} onChange={set("startingPrice")}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Services (comma-separated)</span>
                <input value={servicesText} onChange={(e) => setServicesText(e.target.value)} placeholder="Hair Spa, Facial, Bridal Makeup"
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>

              <div>
                <span className="eyebrow text-xs">Cover Image</span>
                <div className="mt-2 flex items-center gap-3">
                  {form.coverImage ? (
                    <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-foreground/10">
                      <img src={form.coverImage as string} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm((f) => ({ ...f, coverImage: null }))}
                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 grid place-items-center"><X size={10} /></button>
                    </div>
                  ) : null}
                  <label className="cursor-pointer rounded-xl border-2 border-dashed border-foreground/15 px-4 py-3 text-xs text-foreground/50 hover:border-foreground/30">
                    <Upload size={14} className="inline mr-1" /> Upload
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "coverImage")} />
                  </label>
                </div>
              </div>

              <div>
                <span className="eyebrow text-xs">Gallery Images</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {((form.galleryImages as string[]) || []).map((url: string, i: number) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-foreground/10">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setForm((f) => ({ ...f, galleryImages: ((f.galleryImages as string[]) || []).filter((_: string, j: number) => j !== i) }))}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-background/80 grid place-items-center"><X size={10} /></button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-foreground/15 grid place-items-center cursor-pointer text-foreground/30 hover:border-foreground/30">
                    <Upload size={16} />
                    <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" onChange={(e) => {
                      if (e.target.files) Array.from(e.target.files).forEach((f) => uploadImage(f, "galleryImages"));
                      e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} disabled={saveMu.isPending}
                  className="rounded-full bg-foreground text-background px-6 py-3 text-sm disabled:opacity-50">
                  {saveMu.isPending ? "Saving..." : "Save Profile"}
                </button>
                <button onClick={() => setEditing(false)}
                  className="rounded-full border border-foreground/15 px-6 py-3 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="eyebrow">Salon Profile</span>
              <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.4rem)]">{s.name as string}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs ${s.status === "APPROVED" ? "text-green-600 bg-green-50" : s.status === "REJECTED" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"}`}>
                {s.status as string}
              </span>
              <button onClick={startEditing}
                className="rounded-full border border-foreground/15 px-5 py-2 text-sm hover:bg-foreground/5 flex items-center gap-2">
                <Pencil size={12} /> Edit
              </button>
            </div>
          </div>

          {(s.coverImage as string) ? (
            <div className="mt-8">
              <span className="eyebrow text-xs">Cover Image</span>
              <img src={s.coverImage as string} alt="Cover" className="mt-2 w-full h-64 object-cover rounded-2xl" />
            </div>
          ) : null}

          {((s.galleryImages as string[]) || []).length > 0 && (
            <div className="mt-8">
              <span className="eyebrow text-xs">Gallery</span>
              <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
                {((s.galleryImages as string[]) || []).map((url: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {([
              ["Salon Name", s.name], ["Owner", s.ownerName], ["Email", s.email], ["Phone", s.phone],
              ["Public Address", s.address], ["City", s.city],
              ["Fulfillment Address (private)", s.fulfillmentAddress || "—"],
              ["Opening Hours", s.timings],
              ["Services", (s.services as string[])?.join(", ")],
              ["Starting Price", s.startingPrice ? `₹${s.startingPrice}` : "—"],
              ["Website", s.website || "—"], ["Instagram", s.instagram || "—"],
            ] as [string, unknown][]).map(([label, value]) => (
              <div key={label} className="border-b border-foreground/10 pb-4">
                <span className="text-[10px] tracking-[0.25em] uppercase text-foreground/50">{label}</span>
                <p className="mt-1 text-sm">{String(value || "—")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
