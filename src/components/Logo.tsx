import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-1.5 ${className}`}>
      <div className="grid h-7 w-10 place-items-center rounded-md bg-primary">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary-foreground"><path d="M8 5v14l11-7z" /></svg>
      </div>
      <span className="font-display text-xl font-bold tracking-tight">MEGAZI</span>
    </Link>
  );
}
