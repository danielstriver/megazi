import { Link } from "@tanstack/react-router";
import { Play, Sparkles } from "lucide-react";
import type { Video } from "@/lib/mock";
import { fmt } from "@/lib/mock";

export function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: video.id }}
      className="group flex flex-col gap-3 rounded-2xl p-2 transition hover:bg-surface"
    >
      <div className="relative overflow-hidden rounded-xl bg-surface">
        <img
          src={video.cover}
          alt={video.title}
          loading="lazy"
          className={`w-full object-cover transition duration-500 group-hover:scale-[1.04] ${
            video.aspect === "tall" ? "aspect-[4/5]" : video.aspect === "wide" ? "aspect-[16/8]" : "aspect-video"
          }`}
        />
        <div className="absolute inset-0 rounded-xl ring-0 ring-primary/0 transition group-hover:ring-1 group-hover:ring-primary/40" />
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium">
          {video.duration}
        </div>
        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-primary backdrop-blur">
          <Sparkles className="h-3 w-3" />
          +{video.reward} MGZ
        </div>
        <div className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/95 text-primary-foreground shadow-lg">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 px-1">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-brand grid place-items-center text-xs font-bold">
          {video.artist
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{video.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{video.artist}</p>
          <p className="text-xs text-muted-foreground">{fmt(video.views)} views</p>
        </div>
      </div>
    </Link>
  );
}
