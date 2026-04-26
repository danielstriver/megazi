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
