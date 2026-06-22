import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { setRedirect } from "@/lib/redirect-after-login";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setRedirect(href);
      navigate({ to: "/auth/login" });
    }
  }, [ready, user, href, navigate]);

  if (!ready || !user) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-sm text-foreground/50">
        <p>Loading…</p>
      </div>
    );
  }
  return <>{children}</>;
}
