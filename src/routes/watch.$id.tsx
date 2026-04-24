import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { videos, fmt } from "@/lib/mock";
import { Heart, MessageCircle, Share2, Sparkles, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/watch/$id")({
  component: WatchPage,
  loader: ({ params }) => {
    const v = videos.find((x) => x.id === params.id);
    if (!v) throw notFound();
    return v;
  },
  notFoundComponent: () => (
    <Layout>
      <p className="text-muted-foreground">Video not found.</p>
    </Layout>
  ),
});

function WatchPage() {
  const v = Route.useLoaderData();
  const recs = videos.filter((x) => x.id !== v.id).slice(0, 8);

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-black aspect-video shadow-card">
            <img src={v.cover} alt={v.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
                <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-8 w-8"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
            {/* Floating reward indicator */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-primary/40 bg-black/80 px-3 py-2 text-sm font-semibold text-primary backdrop-blur shadow-glow">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Earning {v.reward} MGZ
            </div>
          </div>

          <h1 className="mt-5 font-display text-2xl font-bold">{v.title}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-brand text-sm font-bold">
                {v.artist.split(" ").map(s => s[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="font-semibold">{v.artist}</p>
                <p className="text-xs text-muted-foreground">{fmt(v.views)} views</p>
              </div>
              <Button className="ml-2 rounded-full bg-foreground text-background hover:bg-foreground/90">Subscribe</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="rounded-full bg-surface hover:bg-accent gap-2"><ThumbsUp className="h-4 w-4" />12K</Button>
              <Button variant="secondary" className="rounded-full bg-surface hover:bg-accent gap-2"><MessageCircle className="h-4 w-4" />Comment</Button>
              <Button variant="secondary" className="rounded-full bg-surface hover:bg-accent gap-2"><Share2 className="h-4 w-4" />Share</Button>
              <Button variant="secondary" className="rounded-full bg-surface hover:bg-accent" size="icon"><Heart className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{fmt(v.views)} views · 2 days ago</span>
            <p className="mt-2 leading-relaxed">
              New single off the upcoming tape. Shot in Kigali. Drop a comment below — top voted gets a shoutout
              in the next video. #MEGAZI
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Up next</h2>
          {recs.map((r) => (
            <Link
              key={r.id}
              to="/watch/$id"
              params={{ id: r.id }}
              className="group flex gap-3 rounded-xl p-2 transition hover:bg-surface"
            >
              <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg">
                <img src={r.cover} alt={r.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px]">{r.duration}</span>
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.artist}</p>
                <p className="text-xs text-primary font-semibold">+{r.reward} MGZ</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </Layout>
  );
}
