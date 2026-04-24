import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { videos } from "@/lib/mock";

export const Route = createFileRoute("/explore")({ component: Explore });

const genres = ["Hip-Hop", "Afrobeats", "Drill", "R&B", "Trap", "Amapiano", "Gospel", "Live"];

function Explore() {
  return (
    <Layout>
      <h1 className="font-display text-3xl font-bold">Explore</h1>
      <p className="mt-1 text-muted-foreground">Discover fresh sounds from underground artists.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {genres.map((g, i) => (
          <button
            key={g}
            className="aspect-square rounded-2xl border border-border bg-gradient-to-br from-surface to-background p-3 text-left text-sm font-semibold transition hover:border-primary/50 hover:shadow-glow"
            style={{ background: i % 2 ? "linear-gradient(135deg, oklch(0.25 0.06 280), oklch(0.18 0.02 270))" : undefined }}
          >
            {g}
          </button>
        ))}
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-bold">Fresh drops</h2>
      <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.slice(0, 8).map((v) => <VideoCard key={v.id} video={v} />)}
      </div>
    </Layout>
  );
}
