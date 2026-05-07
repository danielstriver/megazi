import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VideoCard } from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoSearch } from "@/lib/queries";
import { Search } from "lucide-react";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: videos, isLoading } = useVideoSearch(q);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
        {videos && q && (
          <p className="mt-1 text-sm text-muted-foreground">
            {videos.length} {videos.length === 1 ? "video" : "videos"} found
          </p>
        )}
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
      ) : !q || q.trim().length < 2 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Search className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">Type at least 2 characters to search.</p>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <Search className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">No results for &ldquo;{q}&rdquo;.</p>
        </div>
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
