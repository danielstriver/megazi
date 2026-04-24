// Mock data + currency helpers for MEGAZI
export const RATE = 10; // 1 FRW = 10 MEGAZI
export const megaziToFrw = (m: number) => Math.round(m / RATE);
export const frwToMegazi = (f: number) => f * RATE;
export const fmt = (n: number) => n.toLocaleString("en-US");

const covers = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520170350707-b2da59970118?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?w=800&auto=format&fit=crop",
];

const titles = [
  "Midnight in Kigali",
  "Streets Talk Back",
  "Hustle Anthem",
  "Ngoma ya Kabiri",
  "Underground Kings",
  "Neon Dreams",
  "Hood Symphony",
  "Block Heat",
  "Late Night Cypher",
  "Echoes of 250",
  "Gold Chain Gospel",
  "Murder the Beat",
];

const artists = [
  "Kayz Reign",
  "Mighty Ish",
  "Lola Kx",
  "Drey 250",
  "Sankara Soundz",
  "B-Roy",
  "Tasha Vibes",
  "OG Manzi",
  "JP Flow",
  "Ariane M.",
  "Kid Imana",
  "Ras Ngabo",
];

export type Video = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  views: number;
  duration: string;
  reward: number; // MEGAZI
  aspect?: "tall" | "wide" | "default";
};

// Deterministic mock view counts (avoid SSR hydration mismatches)
const seedViews = [264_065, 88_421, 412_903, 19_780, 156_220, 73_644, 301_119, 47_002, 222_870, 11_355, 195_610, 63_488];

export const videos: Video[] = titles.map((t, i) => ({
  id: `v${i + 1}`,
  title: t,
  artist: artists[i],
  cover: covers[i],
  views: seedViews[i],
  duration: `${2 + (i % 4)}:${(10 + i * 3).toString().padStart(2, "0")}`,
  reward: [5, 8, 10, 12, 15, 20][i % 6],
  // subtle aspect-ratio variation for a less robotic grid
  aspect: (i % 5 === 0 ? "tall" : i % 7 === 0 ? "wide" : "default") as "tall" | "wide" | "default",
}));

export const campaigns = [
  { id: "c1", title: "Midnight in Kigali", cover: covers[0], budget: 50_000, target: 10_000, current: 6_420, status: "Active" as const },
  { id: "c2", title: "Hustle Anthem",      cover: covers[2], budget: 30_000, target:  5_000, current: 5_000, status: "Completed" as const },
  { id: "c3", title: "Neon Dreams",        cover: covers[5], budget: 80_000, target: 20_000, current: 3_280, status: "Active" as const },
];

export const transactions = [
  { id: "t1", type: "Earning",    label: "Watched 'Hustle Anthem'", amount: 10,    date: "Today, 14:22" },
  { id: "t2", type: "Earning",    label: "Watched 'Neon Dreams'",   amount: 15,    date: "Today, 13:08" },
  { id: "t3", type: "Withdrawal", label: "MoMo · 0788****21",       amount: -5000, date: "Yesterday" },
  { id: "t4", type: "Earning",    label: "Daily streak bonus",      amount: 50,    date: "Yesterday" },
  { id: "t5", type: "Earning",    label: "Watched 'Block Heat'",    amount: 8,     date: "2 days ago" },
];

// ── Sponsored Ads ─────────────────────────────────────────────
export type Ad = {
  id: string;
  brand: string;
  initials: string;
  tagline: string;
  reward: number;
  duration: string;
  category: string;
  featured?: boolean;
  cover?: string;
};

export const ads: Ad[] = [
  { id: "a1", brand: "MTN Rwanda",   initials: "MT", tagline: "5GB bundle for 1,500 FRW — only this week.", reward: 25, duration: "0:30", category: "Telecom", featured: true,  cover: covers[3] },
  { id: "a2", brand: "Bralirwa",     initials: "BR", tagline: "Refresh your night. New Primus campaign.",   reward: 18, duration: "0:20", category: "Beverage", featured: true, cover: covers[6] },
  { id: "a3", brand: "Equity Bank",  initials: "EQ", tagline: "Open a youth account in 60 seconds.",        reward: 12, duration: "0:15", category: "Finance" },
  { id: "a4", brand: "BK Group",     initials: "BK", tagline: "Send money to MoMo — zero fees this month.", reward: 15, duration: "0:18", category: "Finance" },
  { id: "a5", brand: "Inyange",      initials: "IN", tagline: "Pure water, pure energy. Try our new juice.", reward: 10, duration: "0:15", category: "Beverage" },
  { id: "a6", brand: "Yego Cabs",    initials: "YG", tagline: "Ride home for less. Code MEGAZI = 20% off.",  reward: 14, duration: "0:20", category: "Mobility" },
  { id: "a7", brand: "Skol Brewery", initials: "SK", tagline: "Cold one, warm vibes. Skol nights are back.", reward: 16, duration: "0:22", category: "Beverage" },
  { id: "a8", brand: "Kasha",        initials: "KA", tagline: "Health products at your door. Discreet & fast.", reward: 12, duration: "0:18", category: "Retail" },
];

// ── Play & Earn ───────────────────────────────────────────────
export type Game = {
  id: string;
  title: string;
  cover: string;
  reward: number;
  players: number;
  category: "Quick" | "High Reward" | "Trending";
  duration: string;
};

export const games: Game[] = [
  { id: "g1", title: "Beat Tap Rush",    cover: covers[1],  reward: 5,  players: 12_400, category: "Quick",       duration: "1 min" },
  { id: "g2", title: "Lyric Match",      cover: covers[7],  reward: 8,  players:  8_910, category: "Quick",       duration: "2 min" },
  { id: "g3", title: "Memory Mixtape",   cover: covers[4],  reward: 6,  players:  5_320, category: "Quick",       duration: "90 sec" },
  { id: "g4", title: "Studio Tycoon",    cover: covers[10], reward: 80, players:  2_140, category: "High Reward", duration: "10 min" },
  { id: "g5", title: "Crate Digger",     cover: covers[8],  reward: 60, players:  1_780, category: "High Reward", duration: "8 min" },
  { id: "g6", title: "Cypher Battle",    cover: covers[9],  reward: 120,players:    980, category: "High Reward", duration: "15 min" },
  { id: "g7", title: "Drop the Bass",    cover: covers[2],  reward: 12, players: 22_310, category: "Trending",    duration: "3 min" },
  { id: "g8", title: "Flow Runner",      cover: covers[11], reward: 15, players: 18_770, category: "Trending",    duration: "4 min" },
  { id: "g9", title: "Crowd Hype",       cover: covers[0],  reward: 10, players: 14_002, category: "Trending",    duration: "2 min" },
];

export const leaderboard = [
  { rank: 1, name: "Ariane M.",   earned: 18_450, initials: "AM" },
  { rank: 2, name: "OG Manzi",    earned: 16_120, initials: "OM" },
  { rank: 3, name: "Kid Imana",   earned: 14_760, initials: "KI" },
];
