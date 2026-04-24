import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { fmt, frwToMegazi } from "@/lib/mock";
import { Eye, Link as LinkIcon, Target, Wallet } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/promote")({ component: Promote });

const ALLOWED_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com",
  "instagram.com",
  "www.instagram.com",
];

const promoteSchema = z.object({
  videoUrl: z
    .string()
    .trim()
    .min(1, "Video link is required")
    .max(2048, "Link is too long")
    .url("Enter a valid URL")
    .refine((val) => {
      try {
        const u = new URL(val);
        if (u.protocol !== "https:" && u.protocol !== "http:") return false;
        return ALLOWED_HOSTS.includes(u.hostname.toLowerCase());
      } catch {
        return false;
      }
    }, "Only YouTube, TikTok, or Instagram links are allowed"),
  targetViews: z.number().int().min(100, "At least 100 views").max(10_000_000, "Too high"),
  watchTime: z.number().int().min(5, "At least 5 seconds").max(600, "Max 600 seconds"),
  budgetFrw: z.number().int().min(1000, "Minimum budget is 1,000 FRW").max(10_000_000, "Maximum budget is 10,000,000 FRW"),
});

function Promote() {
  const [videoUrl, setVideoUrl] = useState("");
  const [targetViews, setTargetViews] = useState<string>("10000");
  const [watchTime, setWatchTime] = useState<string>("45");
  const [budgetFrw, setBudgetFrw] = useState(50_000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const result = promoteSchema.safeParse({
      videoUrl,
      targetViews: Number(targetViews),
      watchTime: Number(watchTime),
      budgetFrw,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors before continuing");
      return;
    }
    setErrors({});
    toast.success("Campaign ready — proceeding to payment");
  };

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
              value={videoUrl}
              maxLength={2048}
              onChange={(e) => setVideoUrl(e.target.value)}
              aria-invalid={!!errors.videoUrl}
            />
            {errors.videoUrl ? (
              <p className="text-xs text-destructive">{errors.videoUrl}</p>
            ) : (
              <p className="text-xs text-muted-foreground">We accept YouTube, TikTok and Instagram Reels.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /> Target views</Label>
              <Input
                type="number"
                min={100}
                max={10_000_000}
                value={targetViews}
                onChange={(e) => setTargetViews(e.target.value)}
                className="h-11 bg-surface"
                aria-invalid={!!errors.targetViews}
              />
              {errors.targetViews && <p className="text-xs text-destructive">{errors.targetViews}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Avg watch time (sec)</Label>
              <Input
                type="number"
                min={5}
                max={600}
                value={watchTime}
                onChange={(e) => setWatchTime(e.target.value)}
                className="h-11 bg-surface"
                aria-invalid={!!errors.watchTime}
              />
              {errors.watchTime && <p className="text-xs text-destructive">{errors.watchTime}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Budget (FRW)</Label>
            <Input
              type="number"
              min={1000}
              max={10_000_000}
              value={budgetFrw}
              onChange={(e) => setBudgetFrw(Number(e.target.value) || 0)}
              className="h-11 bg-surface text-lg font-semibold"
              aria-invalid={!!errors.budgetFrw}
            />
            {errors.budgetFrw && <p className="text-xs text-destructive">{errors.budgetFrw}</p>}
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

          <Button
            onClick={handleSubmit}
            className="h-12 w-full bg-gradient-brand text-base font-semibold text-primary-foreground shadow-glow hover:opacity-90"
          >
            Pay with Mobile Money — {fmt(budgetFrw)} FRW
          </Button>
          <p className="text-center text-xs text-muted-foreground">Secure checkout via MTN MoMo · Airtel Money</p>
        </div>
      </div>
    </Layout>
  );
}
