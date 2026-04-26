import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/explore")({ component: Explore });

const genres = ["Hip-Hop", "Afrobeats", "Drill", "R&B", "Trap", "Amapiano", "Gospel", "Live"];

function Explore() {
  const { data: videos, isLoading } = useVideos();
  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Explore</h1>
      <p className="mt-1 text-sm text-muted-foreground">Discover fresh sounds from underground artists.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {genres.map((g) => (
          <button
            key={g}
            className="aspect-square rounded-lg bg-surface p-3 text-left text-sm font-medium transition hover:bg-accent"
          >
            {g}
          </button>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Fresh drops</h2>
      {isLoading ? (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(videos || []).slice(0, 8).map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </Layout>
  );
}
