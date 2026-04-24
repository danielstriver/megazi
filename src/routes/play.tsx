import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { fmt, games, leaderboard, megaziToFrw } from "@/lib/mock";
import { Crown, Gamepad2, Medal, Play, Sparkles, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/play")({ component: PlayPage });

function GameCard({ g, size = "md" }: { g: (typeof games)[number]; size?: "sm" | "md" | "lg" }) {
  const aspect = size === "lg" ? "aspect-[16/10]" : "aspect-video";
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40">
      <div className={`relative ${aspect} overflow-hidden`}>
        <img src={g.cover} alt={g.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/20 to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-primary backdrop-blur">
          <Sparkles className="h-3 w-3" /> +{g.reward} MGZ
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-0.5 text-[11px] backdrop-blur">{g.duration}</div>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{g.title}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" /> {fmt(g.players)} players
          </p>
        </div>
        <Button size="sm" className="bg-gradient-brand hover:opacity-90">
          <Play className="h-3.5 w-3.5 fill-current" /> Play
        </Button>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: typeof games }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <button className="text-xs font-medium text-muted-foreground transition hover:text-foreground">See all</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => (
          <GameCard key={g.id} g={g} />
        ))}
      </div>
    </section>
  );
}

function PlayPage() {
  const quick = games.filter((g) => g.category === "Quick");
  const high = games.filter((g) => g.category === "High Reward");
  const trending = games.filter((g) => g.category === "Trending");

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Gamepad2 className="h-3 w-3" /> Play & Earn
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">Play short games. Stack MEGAZI.</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Quick rounds, real rewards. Top the leaderboard each week for bonus payouts.
          </p>
        </div>

        {/* Leaderboard preview */}
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-primary" /> Weekly leaders</p>
            <span className="text-[11px] text-muted-foreground">resets Sun</span>
          </div>
          <ul className="space-y-2">
            {leaderboard.map((u) => (
              <li key={u.rank} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-xs font-bold">
                  {u.rank === 1 ? <Crown className="h-3.5 w-3.5 text-primary" /> : u.rank === 2 ? <Medal className="h-3.5 w-3.5 text-muted-foreground" /> : u.rank}
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold">{u.initials}</div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{u.name}</p>
                <p className="text-xs font-semibold text-primary">{fmt(u.earned)} MGZ</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
            ≈ {fmt(megaziToFrw(leaderboard[0].earned))} FRW for #1 this week
          </p>
        </div>
      </div>

      <Section title="Quick games" items={quick} />
      <div className="my-8 h-px bg-border/70" />
      <Section title="High reward games" items={high} />
      <div className="my-8 h-px bg-border/70" />
      <Section title="Trending now" items={trending} />
    </Layout>
  );
}
