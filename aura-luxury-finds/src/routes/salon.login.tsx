import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/salon/login")({
  component: SalonLoginRedirect,
});

function SalonLoginRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to: "/auth/login" }); }, [navigate]);
  return null;
}
