import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { useVideos } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: Index,
});

const chips = ["All", "Hip-Hop", "Afrobeats", "Drill", "R&B", "Trap", "Gospel", "Amapiano", "Live", "New", "Most rewarded"];

function Index() {
  const { data: videos, isLoading } = useVideos();

  return (
    <Layout>
      <div className="mb-5 flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {chips.map((c, i) => (
          <button
            key={c}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              i === 0
                ? "bg-foreground text-background"
                : "bg-surface text-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !videos || videos.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No videos yet.</p>
      ) : (
        <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </Layout>
  );
}
