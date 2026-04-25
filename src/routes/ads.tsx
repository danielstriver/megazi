import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ads, fmt, megaziToFrw } from "@/lib/mock";
import { Play } from "lucide-react";

export const Route = createFileRoute("/ads")({ component: AdsPage });

function AdsPage() {
  const featured = ads.filter((a) => a.featured);
  const rest = ads.filter((a) => !a.featured);

  return (
    <Layout>
      {/* Header — plain, no badge chip, no gradient panel */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sponsored ads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch short ads from brands and earn MEGAZI for every completed view.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Today's ad earnings:{" "}
          <span className="font-medium text-foreground">86 MGZ</span>
          <span className="text-muted-foreground"> · ≈ 9 FRW</span>
        </div>
      </div>

      {/* Featured — YouTube-like row of larger thumbnails */}
      <section className="mt-8">
        <h2 className="mb-4 text-base font-semibold">Featured brands</h2>
        <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <article key={a.id} className="group flex flex-col gap-3">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <img
                  src={a.cover}
                  alt={a.brand}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {a.duration}
                </span>
              </div>
              <div className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium">{a.brand}</h3>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {a.tagline}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.category} · +{a.reward} MGZ
                  </p>
                </div>
                <Button size="sm" variant="secondary" className="self-start">
                  <Play className="h-3.5 w-3.5" />
                  Watch
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* All ads — compact list, like YouTube's secondary rows */}
      <section className="mt-10">
        <h2 className="mb-4 text-base font-semibold">More ads</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {rest.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-4 px-4 py-3 transition hover:bg-muted/40"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                {a.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-medium">{a.brand}</h3>
                  <span className="text-xs text-muted-foreground">
                    · {a.category}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {a.tagline}
                </p>
              </div>
              <div className="hidden text-right text-xs text-muted-foreground sm:block">
                <p className="font-medium text-foreground">+{a.reward} MGZ</p>
                <p>≈ {fmt(megaziToFrw(a.reward))} FRW · {a.duration}</p>
              </div>
              <Button size="sm" variant="ghost">
                <Play className="h-4 w-4" />
                Watch
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
