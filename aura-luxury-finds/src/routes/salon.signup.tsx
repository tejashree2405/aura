import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/salon/signup")({
  head: () => ({ meta: [{ title: "Register Salon — Aûra" }] }),
  component: SalonSignup,
});

function SalonSignup() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    salonName: "", ownerName: "", email: "", password: "", confirmPassword: "", phone: "",
    address: "", city: "Bangalore", description: "", services: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.salonName.trim()) { toast.error("Enter your salon name"); return; }
      setStep(2);
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.salonRegister({
        ...form,
        services: form.services.split(",").map((s) => s.trim()).filter(Boolean),
      });
      await refresh();
      toast.success("Salon registered! Complete your profile to get started.");
      navigate({ to: "/salon/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl tracking-wide">
            A<span className="italic">û</span>ra<span className="text-[var(--gold)]">.</span>
          </Link>
          <p className="mt-2 text-sm text-foreground/60">Register Your Salon</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className={`h-1.5 rounded-full transition-all ${step === 1 ? "w-8 bg-foreground" : "w-4 bg-foreground/20"}`} />
            <span className={`h-1.5 rounded-full transition-all ${step === 2 ? "w-8 bg-foreground" : "w-4 bg-foreground/20"}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <>
              <p className="text-sm text-foreground/60 mb-6">What's your salon called?</p>
              <label className="block">
                <span className="eyebrow text-xs">Salon Name</span>
                <input type="text" required value={form.salonName} onChange={set("salonName")} autoFocus
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Owner Name</span>
                <input type="text" required value={form.ownerName} onChange={set("ownerName")}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Phone</span>
                <input type="tel" required value={form.phone} onChange={set("phone")}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <button type="submit"
                className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm">
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-foreground/60 mb-6">Create your account for <strong>{form.salonName}</strong></p>
              <label className="block">
                <span className="eyebrow text-xs">Email</span>
                <input type="email" required value={form.email} onChange={set("email")} autoFocus
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Password</span>
                <input type="password" required value={form.password} onChange={set("password")} minLength={6}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <label className="block">
                <span className="eyebrow text-xs">Confirm Password</span>
                <input type="password" required value={form.confirmPassword} onChange={set("confirmPassword")} minLength={6}
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40" />
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 rounded-full border border-foreground/15 px-6 py-3 text-sm">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 rounded-full bg-foreground text-background px-6 py-3 text-sm disabled:opacity-50">
                  {loading ? "Creating…" : "Create Account"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-foreground/50">
          Already have a salon account?{" "}
          <Link to="/auth/login" className="underline underline-offset-4 text-foreground/70">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
