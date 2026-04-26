import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fmt } from "@/lib/format";
import { useVideos } from "@/lib/queries";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/trending")({ component: Trending });

function Trending() {
  const { data: videos } = useVideos();
  const ranked = [...(videos || [])].sort((a, b) => Number(b.views) - Number(a.views));

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary"><Flame className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-semibold">Trending Music</h1>
          <p className="text-sm text-muted-foreground">Top tracks earning the most plays this week.</p>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {ranked.map((v, i) => (
          <Link
            key={v.id}
            to="/watch/$id"
            params={{ id: v.id }}
            className="flex items-center gap-4 rounded-lg p-3 transition hover:bg-surface"
          >
            <span className="w-8 text-center text-2xl font-bold text-muted-foreground">{i + 1}</span>
            <img src={v.cover_url} alt={v.title} className="h-16 w-28 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{v.title}</p>
              <p className="text-sm text-muted-foreground">{v.artist}</p>
            </div>
            <div className="hidden text-right text-sm sm:block">
              <p className="font-semibold">{fmt(Number(v.views))}</p>
              <p className="text-xs text-muted-foreground">views</p>
            </div>
            <div className="rounded-md bg-surface px-2 py-1 text-xs font-medium">+{v.reward_megazi} MGZ</div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
