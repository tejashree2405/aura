import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/aura/PageShell";
import { useAuth } from "@/lib/auth-context";
import { takeRedirect } from "@/lib/redirect-after-login";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign In — Aûra" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    const back = takeRedirect();
    if (back) navigate({ to: back });
    else navigate({ to: "/ask-aura" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      goNext();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
    } finally { setLoading(false); }
  };

  const google = async () => {
    setErr(null); setLoading(true);
    try { await signInWithGoogle(); /* redirects */ }
    catch (e) { setErr(e instanceof Error ? e.message : "Google sign-in failed"); setLoading(false); }
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[460px] mx-auto">
          <span className="eyebrow">Sign In</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Welcome back.</h1>
          <p className="mt-3 text-sm text-foreground mb-8">A quieter beauty, waiting.</p>

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="eyebrow text-xs">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </label>
            <label className="block">
              <span className="eyebrow text-xs">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
              />
            </label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="mt-6 text-sm text-foreground/60">
            New to Aûra? <Link to="/auth/signup" className="underline">Create an account</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.8-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.2C40.8 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
