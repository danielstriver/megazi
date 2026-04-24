import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
        <span className="font-display text-lg font-bold text-primary-foreground">M</span>
      </div>
      <span className="font-display text-xl font-bold tracking-tight">
        MEGA<span className="text-gradient-brand">ZI</span>
      </span>
    </Link>
  );
}
