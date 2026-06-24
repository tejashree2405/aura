import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/aura/PageShell";
import { useAuth } from "@/lib/auth-context";
import { takeRedirect } from "@/lib/redirect-after-login";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Join Aûra" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    const back = takeRedirect();
    if (back) navigate({ to: back });
    else navigate({ to: "/" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setInfo(null);
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!email.includes("@")) return setErr("Enter a valid email.");
    if (password.length < 6) return setErr("Password must be at least 6 characters.");
    if (password !== confirm) return setErr("Passwords don't match.");
    setLoading(true);
    try {
      await signUp(name.trim(), email, password);
      // If email confirmation is on, there'll be no session yet
      setInfo("Account created. If your inbox requires confirmation, check your email; otherwise you'll be signed in shortly.");
      setTimeout(goNext, 800);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-up failed");
    } finally { setLoading(false); }
  };

  const google = async () => {
    setErr(null); setLoading(true);
    try { await signInWithGoogle(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Google sign-in failed"); setLoading(false); }
  };

  return (
    <PageShell>
      <section className="px-6 md:px-16 pb-20">
        <div className="max-w-[460px] mx-auto">
          <span className="eyebrow">Join Aûra</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">Begin quietly.</h1>
          <p className="mt-3 text-sm text-foreground/60"></p>

          <form onSubmit={submit} className="space-y-5">
            {[
              ["Name", name, setName, "text"],
              ["Email", email, setEmail, "email"],
              ["Password", password, setPassword, "password"],
              ["Confirm Password", confirm, setConfirm, "password"],
            ].map(([label, val, set, type]) => (
              <label key={label as string} className="block">
                <span className="eyebrow text-xs">{label as string}</span>
                <input
                  type={type as string}
                  value={val as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-foreground/40"
                />
              </label>
            ))}
            {err && <p className="text-sm text-destructive">{err}</p>}
            {info && <p className="text-sm text-foreground/70">{info}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-foreground/60">
            Already a member? <Link to="/auth/login" className="underline">Sign in</Link>
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
