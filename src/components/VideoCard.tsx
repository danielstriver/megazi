import { Link } from "@tanstack/react-router";
import type { Tables } from "@/integrations/supabase/types";
import { fmt, initialsOf } from "@/lib/format";

export function VideoCard({ video }: { video: Tables<"videos"> }) {
  return (
    <Link
      to="/watch/$id"
      params={{ id: video.id }}
      className="group flex flex-col gap-3"
    >
      <div className="relative overflow-hidden rounded-xl bg-surface">
        <img
          src={video.cover_url}
          alt={video.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition group-hover:opacity-95"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium">
          {video.duration}
        </span>
        <span className="absolute left-2 top-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
          +{video.reward_megazi} MGZ
        </span>
      </div>

      <div className="flex gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-semibold">
          {initialsOf(video.artist)}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{video.artist}</p>
          <p className="text-xs text-muted-foreground">{fmt(Number(video.views))} views</p>
        </div>
      </div>
    </Link>
  );
}
