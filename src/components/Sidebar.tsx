import { Link, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Flame,
  Home,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/earn", label: "Earn", icon: Sparkles },
  { to: "/promote", label: "Promote", icon: Megaphone },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ open }: { open: boolean }) {
  const { pathname } = useLocation();

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border bg-background transition-all duration-300 md:block ${
        open ? "w-60" : "w-[72px]"
      }`}
    >
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-surface text-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition ${active ? "text-primary" : "group-hover:text-primary"}`} />
              {open && <span className="truncate">{label}</span>}
              {active && open && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
            </Link>
          );
        })}

        {open && (
          <div className="mt-auto rounded-2xl border border-border bg-gradient-to-br from-surface to-background p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Earn today</div>
            <p className="text-sm text-muted-foreground">Watch 100 videos ≈ <span className="font-semibold text-foreground">1,000 FRW</span></p>
          </div>
        )}
      </nav>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-4 animate-slide-in-right" style={{ animationDirection: "reverse" } as React.CSSProperties}>
        <nav className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
