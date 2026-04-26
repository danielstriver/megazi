import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { fmt, megaziToFrw } from "@/lib/format";
import { Clock, Coins, PlayCircle } from "lucide-react";
import { useVideos, useWalletBalance, useWatchHistory } from "@/lib/queries";

export const Route = createFileRoute("/earn")({ component: Earn });

function Earn() {
  const { data: balance = 0 } = useWalletBalance();
  const { data: history } = useWatchHistory();
  const { data: videos } = useVideos();
  const watched = history?.length ?? 0;

  return (
    <Layout>
      <h1 className="text-2xl font-semibold">Viewer dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Watch tracks. Stack MEGAZI. Cash out anytime.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={PlayCircle} label="Items watched" value={String(watched)} />
        <StatCard icon={Clock} label="Avg per item" value={watched > 0 ? `${Math.round(balance / watched)} MGZ` : "—"} />
        <StatCard icon={Coins} label="Earnings" value={`${fmt(balance)} MGZ`} hint={`≈ ${fmt(megaziToFrw(balance))} FRW`} />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Available videos to watch</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {(videos || []).slice(0, 6).map((v) => (
          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
            <img src={v.cover_url} alt={v.title} className="h-20 w-32 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{v.title}</p>
              <p className="text-xs text-muted-foreground">{v.artist} · {v.duration}</p>
              <p className="mt-1 text-sm font-medium">+{v.reward_megazi} MGZ</p>
            </div>
            <Link
              to="/watch/$id"
              params={{ id: v.id }}
              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Watch
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}
