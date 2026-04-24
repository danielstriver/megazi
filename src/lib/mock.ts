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
};

export const videos: Video[] = titles.map((t, i) => ({
  id: `v${i + 1}`,
  title: t,
  artist: artists[i],
  cover: covers[i],
  views: Math.floor(Math.random() * 480_000) + 12_000,
  duration: `${2 + (i % 4)}:${(10 + i * 3).toString().padStart(2, "0")}`,
  reward: [5, 8, 10, 12, 15, 20][i % 6],
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
