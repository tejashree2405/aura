import { Sparkles, User, ShoppingBag, Calendar, Package, LogOut, ChevronDown, Store, Shield } from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { useAccount } from "@/lib/account-store";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/salons", label: "Salons" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
] as const;

const roleLinks: Record<UserRole, readonly { to: string; label: string }[]> = {
  USER: baseLinks,
  SALON: [
    { to: "/marketplace", label: "Marketplace" },
    { to: "/journal", label: "Journal" },
    { to: "/about", label: "About" },
    { to: "/salon/dashboard", label: "Appointments" },
  ],
  ADMIN: [
    { to: "/admin/dashboard", label: "Dashboard" },
  ],
};

type MenuItem = { to: string; icon: React.ReactNode; label: string; badge?: number };

function getUserMenuItems(role: UserRole, bagCount: number): MenuItem[] {
  if (role === "ADMIN") {
    return [
      { to: "/admin/dashboard", icon: <Shield size={14} />, label: "Dashboard" },
    ];
  }
  if (role === "SALON") {
    return [
      { to: "/salon/profile", icon: <Store size={14} />, label: "Salon Profile" },
    ];
  }
  return [
    { to: "/profile", icon: <User size={14} />, label: "Profile" },
    { to: "/bag", icon: <ShoppingBag size={14} />, label: "My Bag", badge: bagCount },
    { to: "/appointments", icon: <Calendar size={14} />, label: "Appointments" },
    { to: "/orders", icon: <Package size={14} />, label: "Orders" },
  ];
}

export function Nav() {
  const { user, signOut } = useAuth();
  const { bagCount } = useAccount();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  const initials = (user?.name ?? "?")
    .split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const navLinks = user ? roleLinks[user.role] : baseLinks;
  const menuItems = user ? getUserMenuItems(user.role, bagCount) : [];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[min(96%,1240px)]"
    >
      <nav className="glass rounded-full pl-6 pr-2 py-2 flex items-center justify-between shadow-[var(--shadow-soft)]">
        <Link to="/" className="font-display text-2xl tracking-tight leading-none">
          A<span className="italic">û</span>ra<span className="text-[var(--gold)]">.</span>
        </Link>
        <ul className="hidden md:flex items-center gap-8 text-sm text-foreground/80">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-foreground" }}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {user ? (
            <div
              ref={wrapRef}
              className="relative"
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
            >
              <button
                onClick={() => setOpen((v) => !v)}
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-foreground/15 pl-1.5 pr-3 py-1.5 text-sm hover:bg-foreground/5 transition-colors"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-foreground text-background grid place-items-center text-[11px] font-medium">
                    {initials}
                  </span>
                )}
                <span className="truncate max-w-[90px]">{user.name}</span>
                {user.role !== "USER" && (
                  <span className="rounded-full bg-foreground/10 text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
                    {user.role === "SALON" ? "Salon" : "Admin"}
                  </span>
                )}
                {bagCount > 0 && user.role === "USER" && (
                  <span className="rounded-full bg-[var(--gold)] text-foreground text-[10px] px-1.5 py-0.5 leading-none">
                    {bagCount}
                  </span>
                )}
                <ChevronDown size={12} className="text-foreground/50" />
              </button>
              {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-2xl border border-foreground/10 bg-background shadow-[var(--shadow-soft)] p-2 text-sm">
                  {menuItems.map((item) => (
                    <MenuLink key={item.to} to={item.to} icon={item.icon} label={item.label} badge={item.badge} onClick={() => setOpen(false)} />
                  ))}
                  <div className="my-2 h-px bg-foreground/10" />
                  <button
                    onClick={() => { setOpen(false); signOut(); navigate({ to: "/" }); }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-[var(--earth)] hover:bg-[var(--earth)]/10 transition-colors"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="hidden sm:inline-flex items-center rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5 transition-colors"
            >
              Sign In
            </Link>
          )}
          {(!user || user.role !== "ADMIN") && (
            <Link
              to="/ask-aura"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm hover:bg-[var(--earth)] transition-colors"
            >
              <Sparkles size={14} className="text-[var(--gold)]" />
              <span>Ask Aura AI</span>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}

function MenuLink({
  to, icon, label, badge, onClick,
}: { to: string; icon: React.ReactNode; label: string; badge?: number; onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-foreground/5 transition-colors"
    >
      <span className="text-foreground/60">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-[var(--gold)] text-foreground text-[10px] px-1.5 py-0.5">{badge}</span>
      ) : null}
    </Link>
  );
}
