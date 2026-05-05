// Currency helpers for MEGAZI. 1 FRW = 10 MEGAZI.
export const RATE = 10;
export const megaziToFrw = (m: number) => Math.round(m / RATE);
export const frwToMegazi = (f: number) => f * RATE;
export const fmt = (n: number) => n.toLocaleString("en-US");
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Promoted video pricing: 5 FRW per view (= 50 MGZ viewer reward)
export const COST_PER_VIEW_FRW = 5;
export const REWARD_PER_VIEW_MGZ = COST_PER_VIEW_FRW * RATE; // 50 MGZ
export const computeCampaignCost = (targetViews: number) => targetViews * COST_PER_VIEW_FRW;

// Subscription pricing: 20 FRW per sub (= 150 MGZ viewer reward)
export const COST_PER_SUB_FRW = 20;
export const REWARD_PER_SUB_MGZ = 150;
export const computeSubCost = (targetSubs: number) => targetSubs * COST_PER_SUB_FRW;

export type GoalType = "views" | "subs" | "both";

export const computeTotalCost = (targetViews: number, targetSubs: number, goalType: GoalType) => {
  if (goalType === "views") return computeCampaignCost(targetViews);
  if (goalType === "subs") return computeSubCost(targetSubs);
  return computeCampaignCost(targetViews) + computeSubCost(targetSubs);
};

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}
