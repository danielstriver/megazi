import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Eye, Plus, Wallet, Zap } from "lucide-react";
import { useCampaigns } from "@/lib/queries";
import { fmt } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data: campaigns } = useCampaigns();
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
          <Link to="/promote"><Plus className="mr-2 h-4 w-4" /> Create new campaign</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} label="Campaigns" value={String((campaigns || []).length)} hint={`${active} active`} />
        <StatCard icon={Eye} label="Total views" value={fmt(totalViews)} />
        <StatCard icon={Zap} label="Budget" value={`${fmt(totalBudget)} FRW`} hint={`${fmt(totalBudget * 10)} MGZ`} />
        <StatCard icon={Wallet} label="Status" value={active > 0 ? "Active" : "Idle"} />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">My campaigns</h2>
      {!campaigns || campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">You don't have any campaigns yet.</p>
          <Button asChild className="mt-4"><Link to="/promote">Create your first campaign</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const pct = Math.min(100, Math.round((Number(c.current_views) / Number(c.target_views)) * 100));
            return (
              <div key={c.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                {c.cover_url && (
                  <div className="relative">
                    <img src={c.cover_url} alt={c.title} className="aspect-video w-full object-cover" />
                    <span className={`absolute right-3 top-3 rounded px-2 py-0.5 text-xs font-medium ${
                      c.status === "Active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                    }`}>{c.status}</span>
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
                      <span className="text-muted-foreground">{fmt(Number(c.current_views))} / {fmt(Number(c.target_views))} views</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
