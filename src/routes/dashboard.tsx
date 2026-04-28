import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Activity, Eye, Loader2, Plus, Wallet, Zap } from "lucide-react";
import { useCampaigns } from "@/lib/queries";
import { COST_PER_VIEW_FRW, fmt } from "@/lib/format";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function TopUpForm({ campaignId, onDone }: { campaignId: string; onDone: () => void }) {
  const [extraViews, setExtraViews] = useState("5000");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const parsed = Math.max(0, Number(extraViews) || 0);
  const cost = parsed * COST_PER_VIEW_FRW;

  const handleTopUp = async () => {
    if (parsed < 100) {
      toast.error("Minimum top-up is 100 views");
      return;
    }
    setLoading(true);
    const { error } = await supabase.rpc("topup_campaign", {
      _campaign_id: campaignId,
      _extra_views: parsed,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Campaign reactivated with +${fmt(parsed)} views`);
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    qc.invalidateQueries({ queryKey: ["videos"] });
    onDone();
  };

  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Add more views</p>
      <div className="flex gap-2">
        <Input
          type="number"
          min={100}
          value={extraViews}
          onChange={(e) => setExtraViews(e.target.value)}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleTopUp} disabled={loading} className="shrink-0">
          {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Pay {fmt(cost)} FRW
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {fmt(parsed)} views × {COST_PER_VIEW_FRW} FRW/view
      </p>
    </div>
  );
}

function Dashboard() {
  const { data: campaigns } = useCampaigns();
  const [toppingUp, setToppingUp] = useState<string | null>(null);

  const totalBudget = (campaigns || []).reduce((s, c) => s + Number(c.budget_frw), 0);
  const totalViews = (campaigns || []).reduce((s, c) => s + Number(c.current_views), 0);
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
        <StatCard
          icon={Zap}
          label="Budget spent"
          value={`${fmt(totalBudget)} FRW`}
          hint={`${fmt(totalBudget * 10)} MGZ rewarded`}
        />
        <StatCard icon={Wallet} label="Status" value={active > 0 ? "Active" : "Idle"} />
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
            const pct = Math.min(
              100,
              Math.round((Number(c.current_views) / Number(c.target_views)) * 100),
            );
            const isSuspended = c.status === "Suspended";
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
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {fmt(Number(c.current_views))} / {fmt(Number(c.target_views))} views
                      </span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress
                      value={pct}
                      className={`h-1.5 ${isSuspended ? "[&>div]:bg-destructive" : ""}`}
                    />
                  </div>

                  {isSuspended && (
                    <>
                      <p className="text-xs text-destructive">
                        Target reached — video hidden from feed.
                      </p>
                      {toppingUp === c.id ? (
                        <TopUpForm campaignId={c.id} onDone={() => setToppingUp(null)} />
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
