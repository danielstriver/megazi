import { Link, useLocation } from "@tanstack/react-router";
import {
  Compass,
  Flame,
  Gamepad2,
  Home,
  LayoutDashboard,
  Megaphone,
  Settings,
  Sparkles,
  Tv,
  Wallet,
} from "lucide-react";

const primary = [
  { to: "/", label: "Home", icon: Home },
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
        <div className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
      {items.map(({ to, label: l, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-5 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-surface font-medium text-foreground"
                : "text-foreground hover:bg-surface"
            }`}
            title={!open ? l : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {open && <span className="truncate">{l}</span>}
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
      className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 bg-background transition-all duration-200 md:block ${
        open ? "w-60" : "w-[72px]"
      }`}
    >
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3 pb-6 scrollbar-thin">
        <NavGroup items={primary} open={open} pathname={pathname} />
        <div className="mx-2 my-2 h-px bg-border" />
        <NavGroup items={browse} open={open} label={open ? "Explore" : undefined} pathname={pathname} />
        <div className="mx-2 my-2 h-px bg-border" />
        <NavGroup items={account} open={open} label={open ? "Account" : undefined} pathname={pathname} />
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-3">
        <nav className="flex flex-col gap-1">
          {all.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-5 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-surface font-medium" : "hover:bg-surface"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
