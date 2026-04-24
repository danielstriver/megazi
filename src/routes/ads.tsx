import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ads, fmt, megaziToFrw } from "@/lib/mock";
import { Play, Sparkles, Tv } from "lucide-react";

export const Route = createFileRoute("/ads")({ component: AdsPage });

function AdsPage() {
  const featured = ads.filter((a) => a.featured);
  const rest = ads.filter((a) => !a.featured);

  return (
    <Layout>
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
            <Tv className="h-3 w-3" /> Brand partners
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold">Watch ads. Earn rewards.</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Short, skippable brand spots from local businesses. Every completed view pays you in MEGAZI — instantly.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Today's ad earnings</p>
          <p className="font-display text-lg font-bold">+ 86 MGZ <span className="text-xs font-normal text-muted-foreground">≈ 9 FRW</span></p>
        </div>
      </div>

      {/* Featured Brands */}
      <h2 className="mt-8 mb-3 font-display text-lg font-bold">Featured brands</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {featured.map((a, i) => (
          <article
            key={a.id}
            className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 ${
              i === 0 ? "md:col-span-2" : ""
            }`}
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={a.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              <div className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium backdrop-blur">{a.duration}</div>
            </div>
            <div className="flex items-start gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-sm font-bold text-primary-foreground">
                {a.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{a.brand}</h3>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{a.category}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> +{a.reward} MGZ
                  </span>
                  <Button size="sm" className="bg-gradient-brand hover:opacity-90">
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch ad
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="my-8 h-px bg-border/70" />

      {/* All ads */}
      <h2 className="mb-3 font-display text-lg font-bold">More ads to watch</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <div key={a.id} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface text-sm font-bold text-foreground">
              {a.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{a.brand}</h3>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">· {a.category}</span>
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">{a.tagline}</p>
              <p className="mt-1 text-xs">
                <span className="font-semibold text-primary">+{a.reward} MGZ</span>
                <span className="text-muted-foreground"> · ≈ {fmt(megaziToFrw(a.reward))} FRW · {a.duration}</span>
              </p>
            </div>
            <Button size="icon" variant="ghost" className="shrink-0 hover:bg-surface" aria-label="Watch ad">
              <Play className="h-4 w-4 fill-current" />
            </Button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
