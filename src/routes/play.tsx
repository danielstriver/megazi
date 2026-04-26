import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useGames } from "@/lib/queries";
import { fmt } from "@/lib/format";
import { Loader2, Play, Trophy, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/play")({ component: PlayPage });

function GameCard({ g, onPlay, pending }: { g: Tables<"games">; onPlay: (g: Tables<"games">) => void; pending: boolean }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative aspect-video overflow-hidden">
        <img src={g.cover_url} alt={g.title} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium">+{g.reward_megazi} MGZ</span>
        <span className="absolute right-2 top-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium">{g.duration}</span>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">{g.title}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" /> {fmt(Number(g.players))} players
          </p>
        </div>
        <Button size="sm" onClick={() => onPlay(g)} disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Play
        </Button>
      </div>
    </div>
  );
}

function PlayPage() {
  const { data: games, isLoading } = useGames();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const playGame = async (g: Tables<"games">) => {
    if (!user) {
      toast.error("Sign in to play and earn");
      navigate({ to: "/login" });
      return;
    }
    setPending(g.id);
    // Simulate gameplay with a timeout
    await new Promise((r) => setTimeout(r, 1500));
    const { data, error } = await supabase.rpc("claim_watch_reward", {
      _content_type: "game",
      _content_id: g.id,
      _reward: g.reward_megazi,
      _label: `Played '${g.title}'`,
    });
    setPending(null);
    if (error) { toast.error(error.message); return; }
    if (data === -1) {
      toast.info("You already earned for this game today");
    } else {
      toast.success(`+${g.reward_megazi} MGZ for playing ${g.title}`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["watch_history"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }
  };

  const quick = (games || []).filter((g) => g.category === "Quick");
  const high = (games || []).filter((g) => g.category === "High Reward");
  const trending = (games || []).filter((g) => g.category === "Trending");

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Play & Earn</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Quick rounds, real rewards. Top the leaderboard each week for bonus payouts.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3 text-sm">
          <p className="flex items-center gap-2 font-medium"><Trophy className="h-4 w-4" /> Weekly leaderboard coming soon</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : (
        <>
          <Section title="Quick games" items={quick} onPlay={playGame} pending={pending} />
          <Section title="High reward games" items={high} onPlay={playGame} pending={pending} />
          <Section title="Trending now" items={trending} onPlay={playGame} pending={pending} />
        </>
      )}
    </Layout>
  );
}

function Section({ title, items, onPlay, pending }: { title: string; items: Tables<"games">[]; onPlay: (g: Tables<"games">) => void; pending: string | null }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => <GameCard key={g.id} g={g} onPlay={onPlay} pending={pending === g.id} />)}
      </div>
    </section>
  );
}
