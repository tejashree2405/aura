import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function Footer() {
  const { user } = useAuth();
  const role = user?.role;

  const exploreLinks = role === "SALON"
    ? [
        { to: "/marketplace", label: "Marketplace" },
        { to: "/journal", label: "Journal" },
      ]
    : role === "ADMIN"
      ? []
      : [
          { to: "/salons", label: "Salons" },
          { to: "/marketplace", label: "Marketplace" },
          { to: "/journal", label: "Journal" },
        ];

  const accountLinks = role === "SALON"
    ? [
        { to: "/salon/profile", label: "Profile" },
        { to: "/orders", label: "Orders" },
      ]
    : role === "ADMIN"
      ? [
          { to: "/admin/dashboard", label: "Dashboard" },
        ]
      : [
          { to: "/profile", label: "Profile" },
          { to: "/bag", label: "My Bag" },
          { to: "/orders", label: "Orders" },
          { to: "/appointments", label: "Appointments" },
        ];

  const aiLinks = role === "ADMIN"
    ? []
    : [
        { to: "/ask-aura", label: "Ask Aûra" },
      ];

  return (
    <footer className="bg-foreground text-background pt-20 md:pt-24 pb-10 px-6 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-14 border-b border-background/15">
          <div>
            <Link to="/" className="font-display text-3xl text-background">
              A<span className="italic">û</span>ra<span className="text-[var(--gold)]">.</span>
            </Link>
            <p className="mt-4 text-sm text-background/60 max-w-[24ch]">
              Luxury beauty concierge for Bangalore.
            </p>
          </div>
          {exploreLinks.length > 0 && (
            <div>
              <p className="eyebrow" style={{ color: "var(--sand)" }}>Explore</p>
              <ul className="mt-5 space-y-3 text-sm text-background/70">
                {exploreLinks.map((l) => (
                  <li key={l.to}><Link to={l.to} className="hover:text-background">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {accountLinks.length > 0 && (
            <div>
              <p className="eyebrow" style={{ color: "var(--sand)" }}>Account</p>
              <ul className="mt-5 space-y-3 text-sm text-background/70">
                {accountLinks.map((l) => (
                  <li key={l.to}><Link to={l.to} className="hover:text-background">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
          {aiLinks.length > 0 && (
            <div>
              <p className="eyebrow" style={{ color: "var(--sand)" }}>AI</p>
              <ul className="mt-5 space-y-3 text-sm text-background/70">
                {aiLinks.map((l) => (
                  <li key={l.to}><Link to={l.to} className="hover:text-background">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-xs text-background/50">
          <span>Bangalore, India · hello@aura.beauty</span>
          <p>© {new Date().getFullYear()} Aûra. All rituals reserved.</p>
        </div>
      </div>
    </footer>
  );
}
