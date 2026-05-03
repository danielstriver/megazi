export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          brand: string
          category: string
          cover_url: string | null
          created_at: string
          duration: string
          featured: boolean
          id: string
          initials: string
          reward_megazi: number
          tagline: string
        }
        Insert: {
          brand: string
          category: string
          cover_url?: string | null
          created_at?: string
          duration: string
          featured?: boolean
          id?: string
          initials: string
          reward_megazi?: number
          tagline: string
        }
        Update: {
          brand?: string
          category?: string
          cover_url?: string | null
          created_at?: string
          duration?: string
          featured?: boolean
          id?: string
          initials?: string
          reward_megazi?: number
          tagline?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget_frw: number
          cover_url: string | null
          created_at: string
          current_subs: number
          current_views: number
          goal_type: string
          id: string
          status: string
          target_subs: number
          target_views: number
          title: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          budget_frw: number
          cover_url?: string | null
          created_at?: string
          current_subs?: number
          current_views?: number
          goal_type?: string
          id?: string
          status?: string
          target_subs?: number
          target_views?: number
          title: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          budget_frw?: number
          cover_url?: string | null
          created_at?: string
          current_subs?: number
          current_views?: number
          goal_type?: string
          id?: string
          status?: string
          target_subs?: number
          target_views?: number
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          category: string
          cover_url: string
          created_at: string
          duration: string
          id: string
          players: number
          reward_megazi: number
          title: string
        }
        Insert: {
          category: string
          cover_url: string
          created_at?: string
          duration: string
          id?: string
          players?: number
          reward_megazi?: number
          title: string
        }
        Update: {
          category?: string
          cover_url?: string
          created_at?: string
          duration?: string
          id?: string
          players?: number
          reward_megazi?: number
          title?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_megazi: number
          created_at: string
          id: string
          label: string
          type: string
          user_id: string
        }
        Insert: {
          amount_megazi: number
          created_at?: string
          id?: string
          label: string
          type: string
          user_id: string
        }
        Update: {
          amount_megazi?: number
          created_at?: string
          id?: string
          label?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          artist: string
          aspect: string | null
          campaign_id: string | null
          cover_url: string
          created_at: string
          duration: string
          id: string
          is_active: boolean
          reward_megazi: number
          title: string
          views: number
        }
        Insert: {
          artist: string
          aspect?: string | null
          campaign_id?: string | null
          cover_url: string
          created_at?: string
          duration: string
          id?: string
          is_active?: boolean
          reward_megazi?: number
          title: string
          views?: number
        }
        Update: {
          artist?: string
          aspect?: string | null
          campaign_id?: string | null
          cover_url?: string
          created_at?: string
          duration?: string
          id?: string
          is_active?: boolean
          reward_megazi?: number
          title?: string
          views?: number
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance_megazi: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_megazi?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_megazi?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          reward_megazi: number
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          reward_megazi?: number
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          reward_megazi?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_subscribe_reward: {
        Args: {
          _campaign_id: string
          _label: string
          _reward: number
        }
        Returns: number
      }
      claim_watch_reward: {
        Args: {
          _content_id: string
          _content_type: string
          _label: string
          _reward: number
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_views: {
        Args: { _campaign_id: string }
        Returns: undefined
      }
      topup_campaign: {
        Args: { _campaign_id: string; _extra_views: number }
        Returns: undefined
      }
      topup_campaign_subs: {
        Args: { _campaign_id: string; _extra_subs: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
