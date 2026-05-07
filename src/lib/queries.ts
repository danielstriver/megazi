import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("is_active", true)
        .not("campaign_id", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useVideoSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["videoSearch", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .or(`title.ilike.%${q}%,artist.ilike.%${q}%`)
        .eq("is_active", true)
        .not("campaign_id", "is", null)
        .order("views", { ascending: false })
        .limit(24);
      if (error) throw error;
      return data;
    },
  });
}

function buildDays() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().slice(0, 10);
    return { date, label: date.slice(5), views: 0 };
  });
}

export function useCampaignDailyViews(campaignId: string) {
  return useQuery({
    queryKey: ["campaignDailyViews", campaignId],
    queryFn: async () => {
      const days = buildDays();
      const { data: vid } = await supabase
        .from("videos")
        .select("id")
        .eq("campaign_id", campaignId)
        .maybeSingle();
      if (!vid) return days;

      const since = new Date();
      since.setDate(since.getDate() - 13);
      const { data: history } = await supabase
        .from("watch_history")
        .select("created_at")
        .eq("content_id", vid.id)
        .eq("content_type", "video")
        .gte("created_at", since.toISOString());

      const counts: Record<string, number> = {};
      for (const h of history ?? []) {
        const day = h.created_at.slice(0, 10);
        counts[day] = (counts[day] || 0) + 1;
      }
      return days.map((d) => ({ ...d, views: counts[d.date] || 0 }));
    },
  });
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAds() {
  return useQuery({
    queryKey: ["ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .order("featured", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("players", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useWalletBalance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("wallets")
        .select("balance_megazi")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return Number(data?.balance_megazi ?? 0);
    },
  });
}

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useCampaigns() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["campaigns", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useWatchHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["watch_history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watch_history")
        .select("content_id, content_type")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useCampaign(id: string | null) {
  return useQuery({
    queryKey: ["campaign", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useHasSubscribed(campaignId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", campaignId, user?.id],
    enabled: !!user && !!campaignId,
    queryFn: async () => {
      if (!user || !campaignId) return false;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("campaign_id", campaignId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
