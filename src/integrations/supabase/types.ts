export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Actions: {
        Row: {
          created_at: string
          description: string | null
          id: number
          label: string
          point_value: number | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          label: string
          point_value?: number | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          label?: string
          point_value?: number | null
          title?: string
        }
        Relationships: []
      }
      Challenges: {
        Row: {
          action_ids: string[] | null
          created_at: string
          description: string | null
          end_time: string
          id: number
          start_time: string
          title: string | null
        }
        Insert: {
          action_ids?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: number
          start_time?: string
          title?: string | null
        }
        Update: {
          action_ids?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: number
          start_time?: string
          title?: string | null
        }
        Relationships: []
      }
      Users: {
        Row: {
          arera_portal_access: boolean | null
          city: string | null
          completed_challenges: number | null
          created_at: string | null
          discovery_source: string | null
          email: string
          id: string
          instagram_account: string | null
          name: string | null
          password: string
          profile_completed: boolean | null
          selected_actions: string[] | null
          streak: number | null
          total_points: number | null
        }
        Insert: {
          arera_portal_access?: boolean | null
          city?: string | null
          completed_challenges?: number | null
          created_at?: string | null
          discovery_source?: string | null
          email?: string
          id?: string
          instagram_account?: string | null
          name?: string | null
          password?: string
          profile_completed?: boolean | null
          selected_actions?: string[] | null
          streak?: number | null
          total_points?: number | null
        }
        Update: {
          arera_portal_access?: boolean | null
          city?: string | null
          completed_challenges?: number | null
          created_at?: string | null
          discovery_source?: string | null
          email?: string
          id?: string
          instagram_account?: string | null
          name?: string | null
          password?: string
          profile_completed?: boolean | null
          selected_actions?: string[] | null
          streak?: number | null
          total_points?: number | null
        }
        Relationships: []
      }
      Users_Challenges: {
        Row: {
          actions_done: string[] | null
          challenge_id: number
          completed_at: string | null
          id: number
          joined_at: string
          points: number | null
          user_id: string
        }
        Insert: {
          actions_done?: string[] | null
          challenge_id: number
          completed_at?: string | null
          id?: number
          joined_at?: string
          points?: number | null
          user_id?: string
        }
        Update: {
          actions_done?: string[] | null
          challenge_id?: number
          completed_at?: string | null
          id?: number
          joined_at?: string
          points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Users_Challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_community_points: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
