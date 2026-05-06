import { Bell, Menu, Search, Wallet } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt } from "@/lib/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useWalletBalance } from "@/lib/queries";
import { initialsOf } from "@/lib/format";
import { toast } from "sonner";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut, loading } = useAuth();
  const { data: balance = 0 } = useWalletBalance();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Guest";

  const handleSignOut = async () => {
    await signOut();
    toast.success("You've been signed out.");
    setTimeout(() => { window.location.href = "/login"; }, 800);
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background">
      <div className="flex h-full items-center gap-3 px-3 md:px-6">
        <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu className="h-5 w-5" />
        </Button>

        <Logo className="hidden sm:flex" />

        <div className="mx-2 flex flex-1 justify-center md:mx-8">
          <div className="relative w-full max-w-xl">
            <Input
              placeholder="Search"
              className="h-10 rounded-l-full rounded-r-none border-border bg-input pl-4 pr-4 text-sm focus-visible:ring-1"
            />
            <button
              className="absolute right-0 top-0 grid h-10 w-14 place-items-center rounded-r-full border border-l-0 border-border bg-surface hover:bg-accent"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!loading && user && (
          <Link
            to="/wallet"
            className="hidden items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-sm transition hover:bg-accent md:flex"
          >
            <Wallet className="h-4 w-4" />
            <span className="font-medium">{fmt(balance)}<span className="ml-1 text-muted-foreground font-normal">MGZ</span></span>
          </Link>
        )}

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        {loading ? (
          <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initialsOf(displayName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/dashboard">Artist dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/earn">Viewer dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/wallet">Wallet</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link to="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
