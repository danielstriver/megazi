import { Bell, Menu, Search, Wallet } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, megaziToFrw } from "@/lib/mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";

export function Navbar({ onMenuClick, balance }: { onMenuClick: () => void; balance: number }) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-3 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="hover:bg-surface"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Logo className="hidden sm:flex" />

        <div className="mx-2 flex flex-1 justify-center md:mx-8">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search artists, tracks, vibes…"
              className="h-10 rounded-full border-border bg-surface pl-11 pr-4 text-sm focus-visible:ring-primary"
            />
          </div>
        </div>

        <Link
          to="/wallet"
          className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm transition hover:border-primary/60 hover:shadow-glow md:flex"
        >
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-semibold">{fmt(balance)} <span className="text-muted-foreground font-normal">MGZ</span></span>
          <span className="text-xs text-muted-foreground">≈ {fmt(megaziToFrw(balance))} FRW</span>
        </Link>

        <Button variant="ghost" size="icon" className="relative hover:bg-surface" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full outline-none focus:ring-2 focus:ring-primary">
              <Avatar className="h-9 w-9 ring-2 ring-border">
                <AvatarFallback className="bg-gradient-brand text-primary-foreground font-semibold">KR</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Kayz Reign</span>
                <span className="text-xs font-normal text-muted-foreground">artist@megazi.app</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/dashboard">Artist dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/earn">Viewer dashboard</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/wallet">Wallet</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
