import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fmt, videos } from "@/lib/mock";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/trending")({ component: Trending });

function Trending() {
  const ranked = [...videos].sort((a, b) => b.views - a.views);

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand"><Flame className="h-5 w-5" /></div>
        <div>
          <h1 className="font-display text-3xl font-bold">Trending Music</h1>
          <p className="text-muted-foreground">Top tracks earning the most plays this week.</p>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {ranked.map((v, i) => (
          <Link
            key={v.id}
            to="/watch/$id"
            params={{ id: v.id }}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-glow"
          >
            <span className="w-8 text-center font-display text-2xl font-bold text-muted-foreground">{i + 1}</span>
            <img src={v.cover} alt={v.title} className="h-16 w-28 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{v.title}</p>
              <p className="text-sm text-muted-foreground">{v.artist}</p>
            </div>
            <div className="hidden text-right text-sm sm:block">
              <p className="font-semibold">{fmt(v.views)}</p>
              <p className="text-xs text-muted-foreground">views</p>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              +{v.reward} MGZ
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
