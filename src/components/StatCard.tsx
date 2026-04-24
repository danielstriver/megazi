import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "success";
}) {
  const accentClass = {
    primary: "from-primary/20 to-transparent text-primary",
    secondary: "from-secondary/20 to-transparent text-secondary",
    success: "from-success/20 to-transparent text-success",
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition hover:border-primary/40">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accentClass} opacity-60 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-surface ${accentClass.split(" ").pop()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
