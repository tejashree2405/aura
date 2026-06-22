import { Link } from "@tanstack/react-router";

export function Footer() {
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
          <div>
            <p className="eyebrow" style={{ color: "var(--sand)" }}>Explore</p>
            <ul className="mt-5 space-y-3 text-sm text-background/70">
              <li><Link to="/salons" className="hover:text-background">Salons</Link></li>
              <li><Link to="/marketplace" className="hover:text-background">Marketplace</Link></li>
              <li><Link to="/journal" className="hover:text-background">Journal</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow" style={{ color: "var(--sand)" }}>Account</p>
            <ul className="mt-5 space-y-3 text-sm text-background/70">
              <li><Link to="/profile" className="hover:text-background">Profile</Link></li>
              <li><Link to="/bag" className="hover:text-background">My Bag</Link></li>
              <li><Link to="/orders" className="hover:text-background">Orders</Link></li>
              <li><Link to="/appointments" className="hover:text-background">Appointments</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow" style={{ color: "var(--sand)" }}>AI</p>
            <ul className="mt-5 space-y-3 text-sm text-background/70">
              <li><Link to="/ask-aura" className="hover:text-background">Ask Aûra</Link></li>
              <li><Link to="/recommendations" className="hover:text-background">Recommendations</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-xs text-background/50">
          <span>Bangalore, India · hello@aura.beauty</span>
          <p>© {new Date().getFullYear()} Aûra. All rituals reserved.</p>
        </div>
      </div>
    </footer>
  );
}
