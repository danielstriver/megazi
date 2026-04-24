import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { campaigns, fmt, megaziToFrw } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Eye, Plus, Wallet, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const spent = 80_000;
  const remaining = 36_580;

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Artist dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome back, Kayz Reign — here's how your music is performing.</p>
        </div>
        <Button asChild className="bg-gradient-brand shadow-glow hover:opacity-90">
          <Link to="/promote"><Plus className="mr-2 h-4 w-4" /> Create new campaign</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} label="Total campaigns" value="3" hint="2 active" accent="primary" />
        <StatCard icon={Eye} label="Total MEGAZI views" value="14.7K" hint="+12% vs last week" accent="secondary" />
        <StatCard icon={Zap} label="Budget spent" value={`${fmt(spent)} FRW`} hint={`${fmt(spent * 10)} MGZ`} accent="primary" />
        <StatCard icon={Wallet} label="Remaining balance" value={`${fmt(remaining)} FRW`} hint={`${fmt(remaining * 10)} MGZ`} accent="success" />
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-bold">My campaigns</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => {
          const pct = Math.min(100, Math.round((c.current / c.target) * 100));
          return (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:border-primary/40">
              <div className="relative">
                <img src={c.cover} alt={c.title} className="aspect-video w-full object-cover" />
                <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                  c.status === "Active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <h3 className="font-semibold">{c.title}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-semibold">{fmt(c.budget)} FRW <span className="text-muted-foreground">({fmt(c.budget * 10)} MGZ)</span></span>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">{fmt(c.current)} / {fmt(c.target)} views</span>
                    <span className="font-semibold text-primary">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2 bg-muted [&>div]:bg-gradient-brand" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="secondary" className="flex-1 bg-surface hover:bg-accent">View report</Button>
                  <Button variant="ghost" className="hover:bg-surface">Pause</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* dummy var to satisfy unused import in some bundlers */}
      <span className="hidden">{megaziToFrw(0)}</span>
    </Layout>
  );
}
