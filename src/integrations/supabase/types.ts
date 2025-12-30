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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      outfits: {
        Row: {
          created_at: string | null
          id: string
          is_favorite: boolean | null
          items: string[]
          last_worn_at: string | null
          name: string | null
          occasion: string | null
          scheduled_date: string | null
          season: Database["public"]["Enums"]["season"] | null
          try_on_image_url: string | null
          try_on_images: Json | null
          user_id: string
          visualization_style: string | null
          wear_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          items: string[]
          last_worn_at?: string | null
          name?: string | null
          occasion?: string | null
          scheduled_date?: string | null
          season?: Database["public"]["Enums"]["season"] | null
          try_on_image_url?: string | null
          try_on_images?: Json | null
          user_id: string
          visualization_style?: string | null
          wear_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          items?: string[]
          last_worn_at?: string | null
          name?: string | null
          occasion?: string | null
          scheduled_date?: string | null
          season?: Database["public"]["Enums"]["season"] | null
          try_on_image_url?: string | null
          try_on_images?: Json | null
          user_id?: string
          visualization_style?: string | null
          wear_count?: number | null
        }
        Relationships: []
      }
      packing_lists: {
        Row: {
          created_at: string | null
          destination: string
          end_date: string
          id: string
          items: Json
          start_date: string
          trip_type: Database["public"]["Enums"]["style_type"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          end_date: string
          id?: string
          items?: Json
          start_date: string
          trip_type?: Database["public"]["Enums"]["style_type"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          end_date?: string
          id?: string
          items?: Json
          start_date?: string
          trip_type?: Database["public"]["Enums"]["style_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          morphology: Database["public"]["Enums"]["body_morphology"] | null
          onboarding_completed: boolean | null
          style_preferences: Database["public"]["Enums"]["style_type"][] | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          height_cm?: number | null
          id: string
          morphology?: Database["public"]["Enums"]["body_morphology"] | null
          onboarding_completed?: boolean | null
          style_preferences?: Database["public"]["Enums"]["style_type"][] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          morphology?: Database["public"]["Enums"]["body_morphology"] | null
          onboarding_completed?: boolean | null
          style_preferences?: Database["public"]["Enums"]["style_type"][] | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      wardrobe: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          color: string
          created_at: string | null
          id: string
          image_url: string
          last_worn_at: string | null
          name: string | null
          notes: string | null
          season: Database["public"]["Enums"]["season"] | null
          secondary_color: string | null
          status: Database["public"]["Enums"]["clothing_status"] | null
          style: Database["public"]["Enums"]["style_type"] | null
          updated_at: string | null
          user_id: string
          wear_count: number | null
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["clothing_category"]
          color: string
          created_at?: string | null
          id?: string
          image_url: string
          last_worn_at?: string | null
          name?: string | null
          notes?: string | null
          season?: Database["public"]["Enums"]["season"] | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["clothing_status"] | null
          style?: Database["public"]["Enums"]["style_type"] | null
          updated_at?: string | null
          user_id: string
          wear_count?: number | null
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["clothing_category"]
          color?: string
          created_at?: string | null
          id?: string
          image_url?: string
          last_worn_at?: string | null
          name?: string | null
          notes?: string | null
          season?: Database["public"]["Enums"]["season"] | null
          secondary_color?: string | null
          status?: Database["public"]["Enums"]["clothing_status"] | null
          style?: Database["public"]["Enums"]["style_type"] | null
          updated_at?: string | null
          user_id?: string
          wear_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      body_morphology:
        | "rectangle"
        | "hourglass"
        | "inverted_triangle"
        | "triangle"
        | "oval"
        | "athletic"
      clothing_category:
        | "top"
        | "bottom"
        | "dress"
        | "outerwear"
        | "shoes"
        | "accessory"
        | "underwear"
        | "swimwear"
        | "sportswear"
      clothing_status: "available" | "laundry"
      season: "spring" | "summer" | "fall" | "winter" | "all"
      style_type:
        | "casual"
        | "formal"
        | "sport"
        | "business"
        | "evening"
        | "vacation"
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
      body_morphology: [
        "rectangle",
        "hourglass",
        "inverted_triangle",
        "triangle",
        "oval",
        "athletic",
      ],
      clothing_category: [
        "top",
        "bottom",
        "dress",
        "outerwear",
        "shoes",
        "accessory",
        "underwear",
        "swimwear",
        "sportswear",
      ],
      clothing_status: ["available", "laundry"],
      season: ["spring", "summer", "fall", "winter", "all"],
      style_type: [
        "casual",
        "formal",
        "sport",
        "business",
        "evening",
        "vacation",
      ],
    },
  },
} as const
