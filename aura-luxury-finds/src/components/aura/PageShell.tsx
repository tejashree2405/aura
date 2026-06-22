import type { ReactNode } from "react";
import { Nav } from "@/components/aura/Nav";
import { Footer } from "@/components/aura/Footer";
import { useLenis } from "@/hooks/use-lenis";

export function PageShell({
  children,
  bare = false,
}: {
  children: ReactNode;
  bare?: boolean;
}) {
  useLenis();
  return (
    <main className="bg-background text-foreground overflow-x-hidden min-h-screen">
      <Nav />
      {bare ? children : <div className="pt-28 md:pt-32">{children}</div>}
      <Footer />
    </main>
  );
}
