import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  COST_PER_SUB_FRW,
  COST_PER_VIEW_FRW,
  REWARD_PER_SUB_MGZ,
  REWARD_PER_VIEW_MGZ,
  computeTotalCost,
  fmt,
  getYouTubeThumbnail,
  type GoalType,
} from "@/lib/format";
import { Eye, ImageIcon, Link as LinkIcon, Loader2, Users, Zap } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useCampaigns, useProfile } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

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

const promoteSchema = z
  .object({
    title: z.string().trim().min(2, "Title required").max(120),
    videoUrl: z
      .string()
      .trim()
      .url("Enter a valid URL")
      .refine((val) => {
        try {
          const u = new URL(val);
          return (
            (u.protocol === "https:" || u.protocol === "http:") &&
            ALLOWED_HOSTS.includes(u.hostname.toLowerCase())
          );
        } catch {
          return false;
        }
      }, "Only YouTube, TikTok, or Instagram links are allowed"),
    coverUrl: z.string().trim().url("Enter a valid thumbnail URL"),
    goalType: z.enum(["views", "subs", "both"]),
    targetViews: z.number().int().min(100, "Minimum 100 views").max(10_000_000).optional(),
    targetSubs: z.number().int().min(10, "Minimum 10 subscribers").max(1_000_000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.goalType !== "subs" && !data.targetViews) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["targetViews"], message: "Minimum 100 views" });
    }
    if (data.goalType !== "views" && !data.targetSubs) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["targetSubs"], message: "Minimum 10 subscribers" });
    }
  });

const VIEW_PRESETS = [1_000, 5_000, 10_000, 50_000];
const SUB_PRESETS = [50, 100, 500, 1_000];

const GOAL_OPTIONS: { value: GoalType; label: string; hint: string }[] = [
  { value: "views", label: "Views", hint: `${COST_PER_VIEW_FRW} FRW/view` },
  { value: "subs", label: "Subscribers", hint: `${COST_PER_SUB_FRW} FRW/sub` },
  { value: "both", label: "Both", hint: "views + subs" },
];

function Promote() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: campaigns } = useCampaigns();

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("views");
  const [targetViews, setTargetViews] = useState("10000");
  const [targetSubs, setTargetSubs] = useState("100");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const parsedViews = goalType !== "subs" ? Math.max(0, Number(targetViews) || 0) : 0;
  const parsedSubs = goalType !== "views" ? Math.max(0, Number(targetSubs) || 0) : 0;
  const costFrw = computeTotalCost(parsedViews, parsedSubs, goalType);

  useEffect(() => {
    const thumb = getYouTubeThumbnail(videoUrl);
    if (thumb) setCoverUrl(thumb);
  }, [videoUrl]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sign in to create a campaign");
      navigate({ to: "/login" });
      return;
    }

    const result = promoteSchema.safeParse({
      title,
      videoUrl,
      coverUrl,
      goalType,
      targetViews: goalType !== "subs" ? Number(targetViews) : undefined,
      targetSubs: goalType !== "views" ? Number(targetSubs) : undefined,
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

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        user_id: user.id,
        title: result.data.title,
        video_url: result.data.videoUrl,
        cover_url: result.data.coverUrl,
        budget_frw: costFrw,
        goal_type: result.data.goalType,
        target_views: result.data.targetViews ?? 0,
        target_subs: result.data.targetSubs ?? 0,
        current_views: 0,
        current_subs: 0,
        status: "Active",
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      setSubmitting(false);
      toast.error(campaignError?.message ?? "Failed to create campaign");
      return;
    }

    const artistName = profile?.display_name ?? user.email?.split("@")[0] ?? "Artist";

    const { error: videoError } = await supabase.from("videos").insert({
      title: result.data.title,
      artist: artistName,
      cover_url: result.data.coverUrl,
      duration: "Promoted",
      reward_megazi: REWARD_PER_VIEW_MGZ,
      campaign_id: campaign.id,
      is_active: true,
    });

    setSubmitting(false);

    if (videoError) {
      toast.error(`Campaign created but video failed: ${videoError.message}`);
      return;
    }

    toast.success("Campaign live! Your video is now in the feed.");
    qc.invalidateQueries({ queryKey: ["campaigns"] });
    qc.invalidateQueries({ queryKey: ["videos"] });
    setTitle("");
    setVideoUrl("");
    setCoverUrl("");
    setTargetViews("10000");
    setTargetSubs("100");
    setGoalType("views");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-foreground">Create campaign</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold">Promote your track</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set a goal. Pay once. Your video goes live in the feed — viewers earn MGZ for engaging.
        </p>

        <div className="mt-8 space-y-5 rounded-xl border border-border bg-surface p-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Campaign title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My new single"
              className="h-10"
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Video link
            </Label>
            <Input
              placeholder="https://youtube.com/watch?v=…"
              className="h-10"
              value={videoUrl}
              maxLength={2048}
              onChange={(e) => setVideoUrl(e.target.value)}
              aria-invalid={!!errors.videoUrl}
            />
            {errors.videoUrl ? (
              <p className="text-xs text-destructive">{errors.videoUrl}</p>
            ) : (
              <p className="text-xs text-muted-foreground">YouTube, TikTok, or Instagram Reels.</p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Cover thumbnail URL
            </Label>
            <div className="flex gap-3">
              <Input
                placeholder="https://…"
                className="h-10 flex-1"
                value={coverUrl}
                maxLength={2048}
                onChange={(e) => setCoverUrl(e.target.value)}
                aria-invalid={!!errors.coverUrl}
              />
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="preview"
                  className="h-10 w-16 shrink-0 rounded-lg object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                />
              )}
            </div>
            {errors.coverUrl ? (
              <p className="text-xs text-destructive">{errors.coverUrl}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Auto-filled from YouTube. For TikTok/Instagram, paste a direct image URL.
              </p>
            )}
          </div>

          {/* Goal type */}
          <div className="space-y-2">
            <Label>Campaign goal</Label>
            <div className="flex gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoalType(opt.value)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition ${
                    goalType === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target views */}
          {goalType !== "subs" && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> Target views
              </Label>
              <Input
                type="number"
                min={100}
                max={10_000_000}
                value={targetViews}
                onChange={(e) => setTargetViews(e.target.value)}
                className="h-10"
                aria-invalid={!!errors.targetViews}
              />
              {errors.targetViews && (
                <p className="text-xs text-destructive">{errors.targetViews}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {VIEW_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTargetViews(String(n))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      parsedViews === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {fmt(n)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target subscribers */}
          {goalType !== "views" && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Target subscribers
              </Label>
              <Input
                type="number"
                min={10}
                max={1_000_000}
                value={targetSubs}
                onChange={(e) => setTargetSubs(e.target.value)}
                className="h-10"
                aria-invalid={!!errors.targetSubs}
              />
              {errors.targetSubs && (
                <p className="text-xs text-destructive">{errors.targetSubs}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {SUB_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTargetSubs(String(n))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      parsedSubs === n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {fmt(n)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="rounded-lg border border-border bg-background p-4 space-y-2">
            {goalType !== "subs" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Views — {fmt(parsedViews)} × {COST_PER_VIEW_FRW} FRW
                </span>
                <span className="font-medium">{fmt(parsedViews * COST_PER_VIEW_FRW)} FRW</span>
              </div>
            )}
            {goalType !== "subs" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" /> Viewer earns per view
                </span>
                <span className="font-medium">{REWARD_PER_VIEW_MGZ} MGZ</span>
              </div>
            )}
            {goalType !== "views" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Subs — {fmt(parsedSubs)} × {COST_PER_SUB_FRW} FRW
                </span>
                <span className="font-medium">{fmt(parsedSubs * COST_PER_SUB_FRW)} FRW</span>
              </div>
            )}
            {goalType !== "views" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" /> Viewer earns per sub
                </span>
                <span className="font-medium">{REWARD_PER_SUB_MGZ} MGZ</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3 mt-1">
              <span className="font-semibold">Total you pay</span>
              <span className="text-lg font-bold text-primary">{fmt(costFrw)} FRW</span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-11 w-full text-base font-semibold"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Launch campaign · {fmt(costFrw)} FRW
          </Button>
        </div>

        {/* Existing campaigns list */}
        {campaigns && campaigns.length > 0 && (
          <>
            <h2 className="mt-10 mb-3 text-lg font-semibold">My campaigns</h2>
            <ul className="space-y-2">
              {campaigns.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
                >
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(Number(c.budget_frw))} FRW ·{" "}
                      {c.goal_type !== "subs" && `${fmt(Number(c.target_views))} views`}
                      {c.goal_type === "both" && " · "}
                      {c.goal_type !== "views" && `${fmt(Number(c.target_subs))} subs`}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-success/20 text-success"
                        : c.status === "Suspended"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
