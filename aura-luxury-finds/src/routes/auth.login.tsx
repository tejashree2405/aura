import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/aura/PageShell";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { takeRedirect } from "@/lib/redirect-after-login";
import { User, Store, Shield } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign In — Aûra" }] }),
  component: LoginPage,
});

const roles: { key: UserRole; label: string; sub: string; icon: React.ReactNode }[] = [
  { key: "USER", label: "User", sub: "Browse salons, shop products, book appointments", icon: <User size={20} /> },
  { key: "SALON", label: "Salon Partner", sub: "Manage your salon, appointments & profile", icon: <Store size={20} /> },
  { key: "ADMIN", label: "Admin", sub: "Platform management & content", icon: <Shield size={20} /> },
];

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = (role: UserRole) => {
    if (role === "ADMIN") {
      navigate({ to: "/admin/dashboard" });
      return;
    }
    if (role === "SALON") {
      navigate({ to: "/salon/dashboard" });
      return;
    }
    const back = takeRedirect();
    if (back) {
      navigate({ to: back });
    } else {
      navigate({ to: "/" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setErr(null);
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const user = await signIn(email, password);
      if (user.role !== selectedRole) {
        const roleLabel = roles.find((r) => r.key === selectedRole)?.label || selectedRole;
        setErr(`This account is not registered as ${roleLabel}. It is a ${user.role} account.`);
        return;
      }
      goNext(user.role);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[520px] mx-auto">
          <span className="eyebrow">Sign In</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Welcome back.</h1>

          {!selectedRole ? (
            <>
              <p className="mt-3 text-sm text-foreground/60 mb-10">Continue as</p>
              <div className="space-y-3">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRole(r.key)}
                    className="w-full flex items-center gap-4 rounded-2xl border border-foreground/10 p-5 text-left hover:border-foreground/30 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <span className="h-11 w-11 rounded-full bg-foreground/5 grid place-items-center text-foreground/60">
                      {r.icon}
                    </span>
                    <div className="flex-1">
                      <p className="font-display text-lg">{r.label}</p>
                      <p className="text-xs text-foreground/50 mt-0.5">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-8 text-sm text-foreground/60">
                New to Aûra? <Link to="/auth/signup" className="underline">Create an account</Link>
              </p>
            </>
          ) : (
            <>
              <div className="mt-6 mb-8 flex items-center gap-3">
                <button
                  onClick={() => { setSelectedRole(null); setErr(null); }}
                  className="text-xs text-foreground/50 hover:text-foreground underline underline-offset-4"
                >
                  ← Change role
                </button>
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs">
                  {roles.find((r) => r.key === selectedRole)?.label}
                </span>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <label className="block">
                  <span className="eyebrow text-xs">Email</span>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
                  />
                </label>
                <label className="block">
                  <span className="eyebrow text-xs">Password</span>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
                  />
                </label>
                {err && <p className="text-sm text-destructive">{err}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              {selectedRole === "USER" && (
                <p className="mt-6 text-sm text-foreground/60">
                  New to Aûra? <Link to="/auth/signup" className="underline">Create an account</Link>
                </p>
              )}
              {selectedRole === "SALON" && (
                <p className="mt-6 text-sm text-foreground/60">
                  New salon partner? <Link to="/salon/signup" className="underline">Register your salon</Link>
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
