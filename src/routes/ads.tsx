import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAds } from "@/lib/queries";
import { Loader2, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useWatchHistory } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/ads")({ component: AdsPage });

function AdsPage() {
  const { data: ads, isLoading } = useAds();
  const { data: history } = useWatchHistory();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const watched = new Set((history || []).filter((h) => h.content_type === "ad").map((h) => h.content_id));

  const watchAd = async (ad: { id: string; reward_megazi: number; brand: string }) => {
    if (!user) {
      toast.error("Please sign in to earn rewards");
      navigate({ to: "/login" });
      return;
    }
    setPending(ad.id);
    const { data, error } = await supabase.rpc("claim_watch_reward", {
      _content_type: "ad",
      _content_id: ad.id,
      _reward: ad.reward_megazi,
      _label: `Watched ad: ${ad.brand}`,
    });
    setPending(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data === -1) {
      toast.info("Already watched");
    } else {
      toast.success(`+${ad.reward_megazi} MGZ`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["watch_history"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    }
  };

  const featured = (ads || []).filter((a) => a.featured);
  const rest = (ads || []).filter((a) => !a.featured);

  return (
    <Layout>
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-semibold">Sponsored ads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Watch short ads from brands and earn MEGAZI for every completed view.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-xl" />)}
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-4 text-base font-semibold">Featured brands</h2>
            <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((a) => (
                <article key={a.id} className="group flex flex-col gap-3">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
                    {a.cover_url && <img src={a.cover_url} alt={a.brand} loading="lazy" className="h-full w-full object-cover" />}
                    <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium">{a.duration}</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-semibold">{a.initials}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium">{a.brand}</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{a.tagline}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{a.category} · +{a.reward_megazi} MGZ</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="self-start"
                      onClick={() => watchAd(a)}
                      disabled={pending === a.id || watched.has(a.id)}
                    >
                      {pending === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      {watched.has(a.id) ? "Watched" : "Watch"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-base font-semibold">More ads</h2>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rest.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-surface">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-xs font-semibold">{a.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-medium">{a.brand}</h3>
                      <span className="text-xs text-muted-foreground">· {a.category}</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{a.tagline}</p>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <p className="font-medium text-foreground">+{a.reward_megazi} MGZ</p>
                    <p>{a.duration}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => watchAd(a)}
                    disabled={pending === a.id || watched.has(a.id)}
                  >
                    {pending === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {watched.has(a.id) ? "Watched" : "Watch"}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </Layout>
  );
}
