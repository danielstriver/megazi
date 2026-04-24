import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { fmt, megaziToFrw, videos } from "@/lib/mock";
import { Clock, Coins, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/earn")({ component: Earn });

function Earn() {
  const earnings = 12_480;

  return (
    <Layout>
      <h1 className="font-display text-3xl font-bold">Viewer dashboard</h1>
      <p className="mt-1 text-muted-foreground">Watch tracks. Stack MEGAZI. Cash out anytime.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={PlayCircle} label="Videos watched" value="248" hint="this month" accent="primary" />
        <StatCard icon={Clock} label="Watch time" value="14.2 h" hint="≈ 38 min/day" accent="secondary" />
        <StatCard icon={Coins} label="Earnings" value={`${fmt(earnings)} MGZ`} hint={`≈ ${fmt(megaziToFrw(earnings))} FRW`} accent="success" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/15 via-secondary/10 to-transparent p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand shadow-glow">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Earnings highlight</p>
              <h2 className="mt-1 font-display text-xl font-bold">Watch 100 videos ≈ Earn 1,000 FRW</h2>
              <p className="mt-1 text-sm text-muted-foreground">Avg 10 MEGAZI per play · Daily streak boosts up to 2×.</p>
            </div>
          </div>
          <Button className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
            <TrendingUp className="mr-2 h-4 w-4" /> Start earning
          </Button>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-bold">Available videos to watch</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {videos.slice(0, 6).map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40">
            <img src={v.cover} alt={v.title} className="h-20 w-32 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{v.title}</p>
              <p className="text-xs text-muted-foreground">{v.artist} · {v.duration}</p>
              <p className="mt-1 text-sm font-semibold text-primary">+{v.reward} MGZ <span className="text-xs font-normal text-muted-foreground">(≈ {megaziToFrw(v.reward)} FRW)</span></p>
            </div>
            <Link
              to="/watch/$id"
              params={{ id: v.id }}
              className="shrink-0 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold shadow-glow transition hover:opacity-90"
            >
              Watch
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}
