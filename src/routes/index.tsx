import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { videos } from "@/lib/mock";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const chips = ["All", "Hip-Hop", "Afrobeats", "Drill", "R&B", "Trap", "Gospel", "Amapiano", "Live", "New", "Most rewarded"];

function Index() {
  return (
    <Layout>
      {/* Hero strip */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-background to-background p-6 md:p-8">
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Live rewards
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              Watch the underground. <span className="text-gradient-brand">Get paid.</span>
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Every play supports an artist and earns you MEGAZI. 100 videos ≈ <span className="font-semibold text-foreground">1,000 FRW</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Today's earnings</p>
              <p className="font-display text-lg font-bold">+ 240 MGZ</p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="font-display text-lg font-bold">7 days 🔥</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {chips.map((c, i) => (
          <button
            key={c}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              i === 0
                ? "border-transparent bg-foreground text-background"
                : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </Layout>
  );
}
