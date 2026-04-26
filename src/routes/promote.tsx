import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { fmt, frwToMegazi } from "@/lib/format";
import { Eye, Link as LinkIcon, Loader2, Target, Wallet } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useCampaigns } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/promote")({ component: Promote });

const ALLOWED_HOSTS = [
  "youtube.com","www.youtube.com","m.youtube.com","youtu.be",
  "tiktok.com","www.tiktok.com","vm.tiktok.com",
  "instagram.com","www.instagram.com",
];

const promoteSchema = z.object({
  title: z.string().trim().min(2, "Title required").max(120),
  videoUrl: z.string().trim().url("Enter a valid URL").refine((val) => {
    try {
      const u = new URL(val);
      return (u.protocol === "https:" || u.protocol === "http:") && ALLOWED_HOSTS.includes(u.hostname.toLowerCase());
    } catch { return false; }
  }, "Only YouTube, TikTok, or Instagram links are allowed"),
  targetViews: z.number().int().min(100).max(10_000_000),
  watchTime: z.number().int().min(5).max(600),
  budgetFrw: z.number().int().min(1000).max(10_000_000),
});

function Promote() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: campaigns } = useCampaigns();
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [targetViews, setTargetViews] = useState("10000");
  const [watchTime, setWatchTime] = useState("45");
  const [budgetFrw, setBudgetFrw] = useState(50_000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("Sign in to create a campaign"); navigate({ to: "/login" }); return; }
    const result = promoteSchema.safeParse({
      title,
      videoUrl,
      targetViews: Number(targetViews),
      watchTime: Number(watchTime),
      budgetFrw,
    });
    if (!result.success) {
      const f: Record<string, string> = {};
      for (const i of result.error.issues) {
        const k = i.path[0] as string;
        if (!f[k]) f[k] = i.message;
      }
      setErrors(f);
      toast.error("Please fix the errors before continuing");
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      title: result.data.title,
      budget_frw: result.data.budgetFrw,
      target_views: result.data.targetViews,
      current_views: 0,
      status: "Active",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Campaign created");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    setTitle(""); setVideoUrl("");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>›</span>
          <span className="text-foreground">Create campaign</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">Promote your track</h1>
        <p className="mt-1 text-sm text-muted-foreground">Set a goal, fund it in FRW, and reach real listeners.</p>

        <div className="mt-8 space-y-5 rounded-xl border border-border bg-surface p-6">
          <div className="space-y-2">
            <Label>Campaign title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My new single" className="h-10" aria-invalid={!!errors.title} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><LinkIcon className="h-4 w-4" /> Video link</Label>
            <Input
              placeholder="https://youtube.com/…"
              className="h-10"
              value={videoUrl}
              maxLength={2048}
              onChange={(e) => setVideoUrl(e.target.value)}
              aria-invalid={!!errors.videoUrl}
            />
            {errors.videoUrl ? <p className="text-xs text-destructive">{errors.videoUrl}</p> : <p className="text-xs text-muted-foreground">YouTube, TikTok, or Instagram Reels.</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Eye className="h-4 w-4" /> Target views</Label>
              <Input type="number" min={100} max={10_000_000} value={targetViews} onChange={(e) => setTargetViews(e.target.value)} className="h-10" aria-invalid={!!errors.targetViews} />
              {errors.targetViews && <p className="text-xs text-destructive">{errors.targetViews}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Target className="h-4 w-4" /> Avg watch time (sec)</Label>
              <Input type="number" min={5} max={600} value={watchTime} onChange={(e) => setWatchTime(e.target.value)} className="h-10" aria-invalid={!!errors.watchTime} />
              {errors.watchTime && <p className="text-xs text-destructive">{errors.watchTime}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Budget (FRW)</Label>
            <Input type="number" min={1000} max={10_000_000} value={budgetFrw} onChange={(e) => setBudgetFrw(Number(e.target.value) || 0)} className="h-10 text-base font-medium" aria-invalid={!!errors.budgetFrw} />
            {errors.budgetFrw && <p className="text-xs text-destructive">{errors.budgetFrw}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background p-4 text-sm">
              <span className="text-muted-foreground">You're loading</span>
              <span className="text-lg font-semibold">{fmt(frwToMegazi(budgetFrw))} MGZ</span>
              <span className="text-muted-foreground">≈ {fmt(budgetFrw)} FRW</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[20_000, 50_000, 100_000].map((amt) => (
              <button
                key={amt}
                onClick={() => setBudgetFrw(amt)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  budgetFrw === amt ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent"
                }`}
              >
                {fmt(amt)} FRW
              </button>
            ))}
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="h-11 w-full text-base font-semibold">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create campaign
          </Button>
        </div>

        {campaigns && campaigns.length > 0 && (
          <>
            <h2 className="mt-10 mb-3 text-lg font-semibold">My campaigns</h2>
            <ul className="space-y-2">
              {campaigns.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-4">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{fmt(Number(c.budget_frw))} FRW · {fmt(Number(c.target_views))} target views</p>
                  </div>
                  <span className="rounded bg-background px-2 py-1 text-xs">{c.status}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
