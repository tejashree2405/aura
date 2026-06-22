import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageShell } from "@/components/aura/PageShell";
import { RequireAuth } from "@/components/aura/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { useAccount } from "@/lib/account-store";
import type { Address } from "@/data/types";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Aûra" }] }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user, updateProfile, refresh, signOut } = useAuth();
  const { addresses, addAddress, updateAddress, removeAddress } = useAccount();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user!.name);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [uploading, setUploading] = useState(false);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) {
      toast.error("Choose an image smaller than 6 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploading(true);
        await api.uploadProfileImage(reader.result as string);
        await refresh();
        toast.success("Profile picture updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload profile picture");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(f);
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[840px] mx-auto">
          <span className="eyebrow">Your Aûra</span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3.6rem)]">
            Welcome, {user!.name}.
          </h1>

          {/* Identity */}
          <div className="mt-12 rounded-2xl border border-foreground/10 p-8 bg-[var(--cream)]/40">
            <div className="flex items-start gap-6">
              {user!.avatarUrl ? (
                <img src={user!.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="h-20 w-20 rounded-full bg-foreground text-background grid place-items-center font-display text-2xl">
                  {initials}
                </span>
              )}
              <div className="flex-1 flex flex-wrap gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="hidden"
                />
                <button
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Change Picture"}
                </button>
                {user!.avatarUrl && (
                  <button
                    onClick={async () => {
                      await updateProfile({ avatarUrl: null });
                      toast.success("Profile picture removed");
                    }}
                    className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5 text-[var(--earth)]"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow text-xs">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Email</span>
                <input
                  value={user!.email}
                  disabled
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background/50 px-4 py-2.5 text-sm text-foreground/50"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Phone Number</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 …"
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm"
                />
              </label>
            </div>

            <button
              onClick={() => {
                updateProfile({ name: name.trim() || user!.name, phone: phone.trim() });
                toast.success("Profile updated");
              }}
              className="mt-6 rounded-full bg-foreground text-background px-6 py-2.5 text-sm"
            >
              Save Changes
            </button>
          </div>

          {/* Addresses */}
          <div className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl">Saved Addresses</h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-1.5 text-sm underline"
              >
                <Plus size={12} /> Add address
              </button>
            </div>
            {addresses.length === 0 && !showForm && (
              <p className="mt-4 text-sm text-foreground/60">No addresses saved yet.</p>
            )}
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-foreground/10 p-5 flex items-start justify-between gap-4"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {a.fullName} · {a.phone}
                    </p>
                    <p className="mt-1 text-foreground/70">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                    </p>
                    {a.landmark && <p className="text-foreground/60">Near {a.landmark}</p>}
                    <p className="text-foreground/70">
                      {a.city}, {a.state} {a.pincode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditing(a);
                        setShowForm(true);
                      }}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeAddress(a.id)}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5 text-[var(--earth)]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {showForm && (
              <AddressForm
                initial={editing}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                onSubmit={(a) => {
                  if (editing) updateAddress(editing.id, a);
                  else addAddress(a);
                  setShowForm(false);
                  setEditing(null);
                  toast.success(editing ? "Address updated" : "Address added");
                }}
              />
            )}
          </div>

          {/* Quick links */}
          <div className="mt-12 grid sm:grid-cols-3 gap-3">
            <Link
              to="/bag"
              className="rounded-2xl border border-foreground/10 p-5 hover:bg-foreground/5"
            >
              <p className="eyebrow text-xs">Shop</p>
              <p className="mt-2 font-display text-lg">My Bag</p>
            </Link>
            <Link
              to="/orders"
              className="rounded-2xl border border-foreground/10 p-5 hover:bg-foreground/5"
            >
              <p className="eyebrow text-xs">History</p>
              <p className="mt-2 font-display text-lg">Orders</p>
            </Link>
            <Link
              to="/appointments"
              className="rounded-2xl border border-foreground/10 p-5 hover:bg-foreground/5"
            >
              <p className="eyebrow text-xs">Salons</p>
              <p className="mt-2 font-display text-lg">Appointments</p>
            </Link>
          </div>

          <button
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            className="mt-12 rounded-full border border-foreground/15 px-6 py-3 text-sm text-[var(--earth)] hover:bg-[var(--earth)]/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </section>
    </PageShell>
  );
}

function AddressForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Address | null;
  onSubmit: (a: Omit<Address, "id">) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<Omit<Address, "id">>({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    landmark: initial?.landmark ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pincode: initial?.pincode ?? "",
  });
  const [err, setErr] = useState<string | null>(null);
  const u = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });

  return (
    <div className="mt-5 rounded-2xl border border-foreground/10 p-6 space-y-4 bg-background">
      <div className="grid sm:grid-cols-2 gap-3">
        {(
          ["fullName", "phone", "line1", "line2", "landmark", "city", "state", "pincode"] as const
        ).map((k) => {
          const labels: Record<string, string> = {
            fullName: "Full Name",
            phone: "Phone Number",
            line1: "Address Line 1",
            line2: "Address Line 2",
            landmark: "Landmark",
            city: "City",
            state: "State",
            pincode: "Pincode",
          };
          const span = k === "line1" || k === "line2" ? "sm:col-span-2" : "";
          return (
            <label key={k} className={`block ${span}`}>
              <span className="eyebrow text-xs">{labels[k]}</span>
              <input
                value={(f[k] ?? "") as string}
                onChange={u(k)}
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm"
              />
            </label>
          );
        })}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (!f.fullName || !f.phone || !f.line1 || !f.city || !f.state || !f.pincode) {
              setErr("Please complete required fields.");
              return;
            }
            onSubmit(f);
          }}
          className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm"
        >
          {initial ? "Save changes" : "Save address"}
        </button>
        <button onClick={onCancel} className="text-sm text-foreground/60 hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}
