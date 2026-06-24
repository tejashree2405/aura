import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginRedirect,
});

function AdminLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth/login" }); }, [navigate]);
  return null;
}
