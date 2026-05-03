import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useVideo, useVideos, useWatchHistory, useCampaign, useHasSubscribed } from "@/lib/queries";
import { MessageCircle, Share2, ThumbsUp, Heart, Loader2, Check, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmt, initialsOf, REWARD_PER_SUB_MGZ } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/watch/$id")({
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useParams();
  const { data: video, isLoading } = useVideo(id);
  const { data: allVideos } = useVideos();
  const { data: history } = useWatchHistory();
  const { data: campaign } = useCampaign(video?.campaign_id ?? null);
  const { data: hasSubscribed } = useHasSubscribed(video?.campaign_id ?? null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [claiming, setClaiming] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const recs = (allVideos || []).filter((x) => x.id !== id).slice(0, 8);
  const alreadyWatched = !!history?.find((h) => h.content_id === id && h.content_type === "video");

  // For "both" campaigns, each goal can be independently exhausted before the other.
  // Show the button as disabled (goal met globally) so the viewer understands why they can't earn.
  const viewsGoalMet =
    video?.goal_type === "both" &&
    !!campaign &&
    Number(campaign.current_views) >= Number(campaign.target_views);
  const subsGoalMet =
    !!campaign &&
    Number(campaign.target_subs) > 0 &&
    Number(campaign.current_subs) >= Number(campaign.target_subs);

  const showSubscribeSection =
    !!video?.campaign_id &&
    (video.goal_type === "subs" || video.goal_type === "both");

  const claim = async () => {
    if (!user) {
      toast.error("Please sign in to earn rewards");
      navigate({ to: "/login" });
      return;
    }
    if (!video) return;
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_watch_reward", {
      _content_type: "video",
      _content_id: video.id,
      _reward: video.reward_megazi,
      _label: `Watched '${video.title}'`,
    });
    setClaiming(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data === -1) {
      toast.info("You've already earned for this video");
    } else {
      toast.success(`+${video.reward_megazi} MGZ added to your wallet`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["watch_history"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["videos"] });
      if (video.campaign_id) {
        qc.invalidateQueries({ queryKey: ["campaigns"] });
      }
    }
  };

  const subscribe = async () => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate({ to: "/login" });
      return;
    }
    if (!video?.campaign_id) return;
    setSubscribing(true);
    const { data, error } = await supabase.rpc("claim_subscribe_reward", {
      _campaign_id: video.campaign_id,
      _label: `Subscribed to '${video.artist}'`,
      _reward: REWARD_PER_SUB_MGZ,
    });
    setSubscribing(false);
    if (error) { toast.error(error.message); return; }
    if (data === -1) {
      toast.info("You're already subscribed");
    } else {
      toast.success(`+${REWARD_PER_SUB_MGZ} MGZ for subscribing!`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["subscription", video.campaign_id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaign", video.campaign_id] });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="mt-4 h-8 w-2/3" />
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <p className="text-muted-foreground">Video not found.</p>
      </Layout>
    );
  }

  if (!video.is_active) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-7 w-7 text-destructive"
            >
              <circle cx={12} cy={12} r={10} />
              <line x1={12} y1={8} x2={12} y2={12} />
              <line x1={12} y1={16} x2={12.01} y2={16} />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Promotion ended</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This video reached its target views. The artist can top up the campaign to make it
            available again.
          </p>
          <Link to="/" className="mt-6 inline-block text-sm text-primary hover:underline">
            Browse other videos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <img
              src={video.cover_url}
              alt={video.title}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            {video.campaign_id && (
              <span className="absolute left-3 top-3 rounded bg-primary/90 px-2 py-0.5 text-xs font-semibold text-white">
                Promoted
              </span>
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <button
                onClick={claim}
                disabled={claiming}
                className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                aria-label="Play and claim reward"
              >
                {claiming ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-8 w-8">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <h1 className="mt-4 text-xl font-semibold">{video.title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-surface text-sm font-semibold">
                {initialsOf(video.artist)}
              </div>
              <div>
                <p className="text-sm font-semibold">{video.artist}</p>
                <p className="text-xs text-muted-foreground">{fmt(Number(video.views))} views</p>
              </div>
              <Button className="ml-2 rounded-full">Subscribe</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={claim}
                disabled={claiming || alreadyWatched || viewsGoalMet}
                variant="secondary"
                className="rounded-full"
              >
                {alreadyWatched || viewsGoalMet ? (
                  <Check className="h-4 w-4" />
                ) : claiming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {alreadyWatched
                  ? `Earned ${video.reward_megazi} MGZ`
                  : viewsGoalMet
                    ? "Views goal met"
                    : `Earn +${video.reward_megazi} MGZ`}
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-surface p-4 text-sm">
            <span className="font-semibold">{fmt(Number(video.views))} views</span>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              New single from {video.artist}. Watch the full track to earn {video.reward_megazi}{" "}
              MGZ.
            </p>
          </div>

          {/* Subscribe prompt — only for campaigns with a sub goal */}
          {showSubscribeSection && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div>
                <p className="font-semibold">Subscribe to {video.artist}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subsGoalMet ? (
                    "Subscriber goal reached for this campaign."
                  ) : (
                    <>
                      Earn an extra{" "}
                      <span className="font-medium text-yellow-400">+{REWARD_PER_SUB_MGZ} MGZ</span>{" "}
                      for subscribing
                    </>
                  )}
                </p>
              </div>
              <Button
                onClick={subscribe}
                disabled={subscribing || !!hasSubscribed || subsGoalMet}
                variant={hasSubscribed || subsGoalMet ? "secondary" : "default"}
                className="ml-4 shrink-0 rounded-full"
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasSubscribed ? (
                  <><Check className="mr-1.5 h-4 w-4" /> Subscribed</>
                ) : subsGoalMet ? (
                  <><Check className="mr-1.5 h-4 w-4" /> Goal met</>
                ) : (
                  <><Bell className="mr-1.5 h-4 w-4" /> Subscribe</>
                )}
              </Button>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Up next</h2>
          {recs.map((r) => (
            <Link
              key={r.id}
              to="/watch/$id"
              params={{ id: r.id }}
              className="group flex gap-3 rounded-lg p-1 transition hover:bg-surface"
            >
              <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg">
                <img src={r.cover_url} alt={r.title} className="h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1 text-[10px]">
                  {r.duration}
                </span>
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.artist}</p>
                <p className="text-xs text-muted-foreground">+{r.reward_megazi} MGZ</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </Layout>
  );
}
