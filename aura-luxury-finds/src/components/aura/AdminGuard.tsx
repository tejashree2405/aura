import { useNavigate, useMatches } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

const ADMIN_ALLOWED = ["/admin/dashboard", "/admin/login", "/auth/login", "/auth/signup"];

export function useAdminRouteGuard() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath || "/";

  useEffect(() => {
    if (!ready || !user || user.role !== "ADMIN") return;
    const isAllowed = ADMIN_ALLOWED.some((p) => currentPath.startsWith(p));
    if (!isAllowed) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [ready, user, currentPath, navigate]);
}
