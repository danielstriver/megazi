import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { fmt, megaziToFrw, frwToMegazi } from "@/lib/mock";
import { Eye, Link as LinkIcon, Target, Wallet } from "lucide-react";

export const Route = createFileRoute("/promote")({ component: Promote });

function Promote() {
  const [budgetFrw, setBudgetFrw] = useState(50_000);

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>›</span>
          <span className="text-foreground">Create campaign</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold">Promote your track</h1>
        <p className="mt-1 text-muted-foreground">Set a goal, fund it in FRW, and we'll send real listeners.</p>

        <div className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-primary" /> Video link</Label>
            <Input
              placeholder="https://youtube.com/… · TikTok · Instagram Reel"
              className="h-11 bg-surface"
            />
            <p className="text-xs text-muted-foreground">We accept YouTube, TikTok and Instagram Reels.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Target views</Label>
              <Input type="number" defaultValue={10_000} className="h-11 bg-surface" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Avg watch time (sec)</Label>
              <Input type="number" defaultValue={45} className="h-11 bg-surface" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Budget (FRW)</Label>
            <Input
              type="number"
              value={budgetFrw}
              onChange={(e) => setBudgetFrw(Number(e.target.value) || 0)}
              className="h-11 bg-surface text-lg font-semibold"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
              <span className="text-muted-foreground">You're loading</span>
              <span className="font-display text-xl font-bold text-primary">
                {fmt(frwToMegazi(budgetFrw))} MGZ
              </span>
              <span className="text-muted-foreground">≈ {fmt(budgetFrw)} FRW · ~{fmt(Math.floor(frwToMegazi(budgetFrw) / 10))} plays</span>
            </div>
            <p className="text-xs text-muted-foreground">MEGAZI takes a 30% platform fee — the rest goes to viewer rewards.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[20_000, 50_000, 100_000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBudgetFrw(amt)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  budgetFrw === amt
                    ? "border-primary bg-primary/10 text-primary shadow-glow"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                {fmt(amt)} FRW
              </button>
            ))}
          </div>

          <Button className="h-12 w-full bg-gradient-brand text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90">
            Pay with Mobile Money — {fmt(budgetFrw)} FRW
          </Button>
          <p className="text-center text-xs text-muted-foreground">Secure checkout via MTN MoMo · Airtel Money</p>
        </div>
      </div>
    </Layout>
  );
}
