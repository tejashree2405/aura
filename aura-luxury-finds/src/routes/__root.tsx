import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth-context";
import { AccountProvider } from "../lib/account-store";
import { Toaster } from "@/components/ui/sonner";
import { useAdminRouteGuard } from "@/components/aura/AdminGuard";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">This page drifted away.</p>
        <Link to="/" className="mt-6 inline-block underline underline-offset-4">Return home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-display">Something interrupted the calm.</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground"
        >Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aura — Bangalore's Finest Beauty, Discovered by AI" },
      { name: "description", content: "Aura is a luxury beauty discovery platform — curated salons, premium products, and personalized recommendations powered by Aura AI." },
      { property: "og:title", content: "Aura — Bangalore's Finest Beauty, Discovered by AI" },
      { property: "og:description", content: "Aura is a luxury beauty discovery platform — curated salons, premium products, and personalized recommendations powered by Aura AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Aura — Bangalore's Finest Beauty, Discovered by AI" },
      { name: "twitter:description", content: "Aura is a luxury beauty discovery platform — curated salons, premium products, and personalized recommendations powered by Aura AI." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65ea9ab1-1f8b-4848-886d-875d41e10628/id-preview-898471fd--b7adfda3-46bf-4705-9f07-0abc91c45447.lovable.app-1781612488826.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65ea9ab1-1f8b-4848-886d-875d41e10628/id-preview-898471fd--b7adfda3-46bf-4705-9f07-0abc91c45447.lovable.app-1781612488826.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AdminRouteGuardInner() {
  useAdminRouteGuard();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountProvider>
          <AdminRouteGuardInner />
          <Outlet />
          <Toaster position="top-center" />
        </AccountProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
