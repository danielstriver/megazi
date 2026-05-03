import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Activity, Eye, Loader2, Plus, Users, Wallet, Zap } from "lucide-react";
import { useCampaigns } from "@/lib/queries";
import { COST_PER_SUB_FRW, COST_PER_VIEW_FRW, fmt } from "@/lib/format";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Campaign = NonNullable<ReturnType<typeof useCampaigns>["data"]>[number];

function TopUpForm({ campaign, onDone }: { campaign: Campaign; onDone: () => void }) {
  const [extraViews, setExtraViews] = useState("5000");
  const [extraSubs, setExtraSubs] = useState("100");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const showViews = campaign.goal_type !== "subs";
  const showSubs = campaign.goal_type !== "views";
  const parsedViews = showViews ? Math.max(0, Number(extraViews) || 0) : 0;
  const parsedSubs = showSubs ? Math.max(0, Number(extraSubs) || 0) : 0;
  const totalCost = parsedViews * COST_PER_VIEW_FRW + parsedSubs * COST_PER_SUB_FRW;

  const handleTopUp = async () => {
    if (showViews && parsedViews < 100) { toast.error("Minimum 100 views"); return; }
    if (showSubs && parsedSubs < 10) { toast.error("Minimum 10 subscribers"); return; }
    setLoading(true);
    if (showViews && parsedViews > 0) {
      const { error } = await supabase.rpc("topup_campaign", {
        _campaign_id: campaign.id,
        _extra_views: parsedViews,
      });
      if (error) { setLoading(false); toast.error(error.message); return; }
    }
    if (showSubs && parsedSubs > 0) {
      const { error } = await supabase.rpc("topup_campaign_subs", {
        _campaign_id: campaign.id,
        _extra_subs: parsedSubs,
      });
      if (error) { setLoading(false); toast.error(error.message); return; }
    }
    setLoading(false);
    toast.success("Campaign reactivated!");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    qc.invalidateQueries({ queryKey: ["videos"] });
    onDone();
  };

  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Add more reach</p>
      {showViews && (
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <Input
            type="number"
            min={100}
            value={extraViews}
            onChange={(e) => setExtraViews(e.target.value)}
            className="h-8 text-sm"
            placeholder="Views"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {fmt(parsedViews * COST_PER_VIEW_FRW)} FRW
          </span>
        </div>
      )}
      {showSubs && (
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <Input
            type="number"
            min={10}
            value={extraSubs}
            onChange={(e) => setExtraSubs(e.target.value)}
            className="h-8 text-sm"
            placeholder="Subscribers"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {fmt(parsedSubs * COST_PER_SUB_FRW)} FRW
          </span>
        </div>
      )}
      <Button size="sm" onClick={handleTopUp} disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        Pay {fmt(totalCost)} FRW
      </Button>
    </div>
  );
}

function Dashboard() {
  const { data: campaigns } = useCampaigns();
  const [toppingUp, setToppingUp] = useState<string | null>(null);

  const totalBudget = (campaigns || []).reduce((s, c) => s + Number(c.budget_frw), 0);
  const totalViews = (campaigns || []).reduce((s, c) => s + Number(c.current_views), 0);
  const totalSubs = (campaigns || []).reduce((s, c) => s + Number(c.current_subs), 0);
  const active = (campaigns || []).filter((c) => c.status === "Active").length;

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Artist dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your campaigns and reach.</p>
        </div>
        <Button asChild>
          <Link to="/promote">
            <Plus className="mr-2 h-4 w-4" /> Create new campaign
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          label="Campaigns"
          value={String((campaigns || []).length)}
          hint={`${active} active`}
        />
        <StatCard icon={Eye} label="Total views" value={fmt(totalViews)} />
        <StatCard icon={Users} label="Total subscribers" value={fmt(totalSubs)} />
        <StatCard
          icon={Zap}
          label="Budget spent"
          value={`${fmt(totalBudget)} FRW`}
          hint={`${fmt(totalBudget * 10)} MGZ rewarded`}
        />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">My campaigns</h2>
      {!campaigns || campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">You don't have any campaigns yet.</p>
          <Button asChild className="mt-4">
            <Link to="/promote">Create your first campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const viewPct = c.target_views > 0
              ? Math.min(100, Math.round((Number(c.current_views) / Number(c.target_views)) * 100))
              : 0;
            const subPct = c.target_subs > 0
              ? Math.min(100, Math.round((Number(c.current_subs) / Number(c.target_subs)) * 100))
              : 0;
            const isSuspended = c.status === "Suspended";
            const showViews = c.goal_type !== "subs";
            const showSubs = c.goal_type !== "views";
            return (
              <div
                key={c.id}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                {c.cover_url && (
                  <div className="relative">
                    <img
                      src={c.cover_url}
                      alt={c.title}
                      className="aspect-video w-full object-cover"
                    />
                    <span
                      className={`absolute right-3 top-3 rounded px-2 py-0.5 text-xs font-medium ${
                        isSuspended
                          ? "bg-destructive/20 text-destructive"
                          : c.status === "Active"
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                )}
                <div className="space-y-3 p-4">
                  <h3 className="font-semibold">{c.title}</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">{fmt(Number(c.budget_frw))} FRW</span>
                  </div>
                  {showViews && (
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {fmt(Number(c.current_views))} / {fmt(Number(c.target_views))} views
                        </span>
                        <span className="font-medium">{viewPct}%</span>
                      </div>
                      <Progress
                        value={viewPct}
                        className={`h-1.5 ${isSuspended ? "[&>div]:bg-destructive" : ""}`}
                      />
                    </div>
                  )}
                  {showSubs && (
                    <div>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {fmt(Number(c.current_subs))} / {fmt(Number(c.target_subs))} subscribers
                        </span>
                        <span className="font-medium">{subPct}%</span>
                      </div>
                      <Progress
                        value={subPct}
                        className={`h-1.5 ${isSuspended ? "[&>div]:bg-destructive" : ""}`}
                      />
                    </div>
                  )}


                  {isSuspended && (
                    <>
                      <p className="text-xs text-destructive">
                        Target reached — video hidden from feed.
                      </p>
                      {toppingUp === c.id ? (
                        <TopUpForm campaign={c} onDone={() => setToppingUp(null)} />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => setToppingUp(c.id)}
                        >
                          Top up views
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
