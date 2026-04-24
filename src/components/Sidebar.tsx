import { Link, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Flame,
  Gamepad2,
  Home,
  LayoutDashboard,
  LogIn,
  Megaphone,
  Settings,
  Sparkles,
  Tv,
  Wallet,
} from "lucide-react";

const primary = [
  { to: "/", label: "Watch Videos", icon: Home },
  { to: "/ads", label: "Sponsored Ads", icon: Tv },
  { to: "/play", label: "Play & Earn", icon: Gamepad2 },
] as const;

const browse = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/trending", label: "Trending", icon: Flame },
  { to: "/earn", label: "Earn", icon: Sparkles },
] as const;

const account = [
  { to: "/promote", label: "Promote", icon: Megaphone },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

function NavGroup({ items, open, label, pathname }: { items: readonly Item[]; open: boolean; label?: string; pathname: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      {open && label && (
        <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          {label}
        </div>
      )}
      {items.map(({ to, label: l, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-surface text-foreground"
                : "text-muted-foreground hover:bg-surface/70 hover:text-foreground"
            }`}
            title={!open ? l : undefined}
          >
            <Icon className={`h-5 w-5 shrink-0 transition ${active ? "text-primary" : "group-hover:text-foreground"}`} />
            {open && <span className="truncate">{l}</span>}
            {active && open && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ open }: { open: boolean }) {
  const { pathname } = useLocation();

  return (
    <aside
      className={`sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 border-r border-border bg-background transition-all duration-300 md:block ${
        open ? "w-60" : "w-[72px]"
      }`}
    >
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3 pb-6 scrollbar-thin">
        <NavGroup items={primary} open={open} pathname={pathname} />
        {open && <div className="mx-2 my-2 h-px bg-border/70" />}
        <NavGroup items={browse} open={open} label="Browse" pathname={pathname} />
        {open && <div className="mx-2 my-2 h-px bg-border/70" />}
        <NavGroup items={account} open={open} label="Account" pathname={pathname} />

        {open && (
          <div className="mt-6 rounded-2xl border border-border bg-surface/40 p-4">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Earn today</div>
            <p className="text-sm text-muted-foreground">
              Watch 100 videos ≈ <span className="font-semibold text-foreground">1,000 FRW</span>
            </p>
          </div>
        )}

        {open && (
          <Link
            to="/login"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <LogIn className="h-3.5 w-3.5" /> Sign in
          </Link>
        )}
      </nav>
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  if (!open) return null;
  const all = [...primary, ...browse, ...account];
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-4 animate-in slide-in-from-left">
        <nav className="flex flex-col gap-1">
          {all.map(({ to, label, icon: Icon }) => {
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
