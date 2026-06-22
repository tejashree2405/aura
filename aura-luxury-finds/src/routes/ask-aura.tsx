import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Nav } from "@/components/aura/Nav";
import { RequireAuth } from "@/components/aura/RequireAuth";

export const Route = createFileRoute("/ask-aura")({
  head: () => ({ meta: [{ title: "Ask Aura AI - Concierge" }] }),
  component: AskAuraLayout,
});

function AskAuraLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isIndex = pathname.replace(/\/$/, "") === "/ask-aura";

  return (
    <RequireAuth>
      <Outlet />
      {isIndex && <AskAuraIndex />}
    </RequireAuth>
  );
}

function AskAuraIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({
      to: "/ask-aura/$conversationId",
      params: { conversationId: "new" },
      replace: true,
    });
  }, [navigate]);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <Nav />
      <div className="pt-32 grid place-items-center min-h-[60vh] text-sm text-foreground/50">
        <p>Preparing your consultation...</p>
      </div>
    </main>
  );
}
