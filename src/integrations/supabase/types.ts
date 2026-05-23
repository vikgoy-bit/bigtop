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
      blog_posts: {
        Row: {
          author_id: string | null
          body_html: string
          category: string
          created_at: string
          date_published: string | null
          excerpt: string | null
          id: string
          meta_desc: string
          og_image: string | null
          published: boolean
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body_html?: string
          category?: string
          created_at?: string
          date_published?: string | null
          excerpt?: string | null
          id?: string
          meta_desc?: string
          og_image?: string | null
          published?: boolean
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body_html?: string
          category?: string
          created_at?: string
          date_published?: string | null
          excerpt?: string | null
          id?: string
          meta_desc?: string
          og_image?: string | null
          published?: boolean
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          abandoned_email_sent_at: string | null
          cover_document_path: string | null
          created_at: string
          id: string
          mollie_customer_id: string | null
          mollie_mandate_id: string | null
          mollie_payment_id: string | null
          mollie_status: string | null
          mollie_subscription_id: string | null
          move_in_date: string
          protect_tier_id: string | null
          signed_at: string | null
          signed_contract_path: string | null
          signer_name: string | null
          status: Database["public"]["Enums"]["booking_status"]
          storeganise_order_id: string | null
          storeganise_user_id: string | null
          stripe_payment_intent_id: string | null
          stripe_verification_session_id: string | null
          total_pence: number
          unit_id: string
          unit_snapshot: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abandoned_email_sent_at?: string | null
          cover_document_path?: string | null
          created_at?: string
          id?: string
          mollie_customer_id?: string | null
          mollie_mandate_id?: string | null
          mollie_payment_id?: string | null
          mollie_status?: string | null
          mollie_subscription_id?: string | null
          move_in_date: string
          protect_tier_id?: string | null
          signed_at?: string | null
          signed_contract_path?: string | null
          signer_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          storeganise_order_id?: string | null
          storeganise_user_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_verification_session_id?: string | null
          total_pence?: number
          unit_id: string
          unit_snapshot?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abandoned_email_sent_at?: string | null
          cover_document_path?: string | null
          created_at?: string
          id?: string
          mollie_customer_id?: string | null
          mollie_mandate_id?: string | null
          mollie_payment_id?: string | null
          mollie_status?: string | null
          mollie_subscription_id?: string | null
          move_in_date?: string
          protect_tier_id?: string | null
          signed_at?: string | null
          signed_contract_path?: string | null
          signer_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          storeganise_order_id?: string | null
          storeganise_user_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_verification_session_id?: string | null
          total_pence?: number
          unit_id?: string
          unit_snapshot?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_protect_tier_id_fkey"
            columns: ["protect_tier_id"]
            isOneToOne: false
            referencedRelation: "protect_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          postcode: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          postcode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      protect_tiers: {
        Row: {
          cover_value_pence: number
          id: string
          label: string
          monthly_fee_pence: number
          sort_order: number
          storeganise_product_id: string | null
        }
        Insert: {
          cover_value_pence: number
          id?: string
          label: string
          monthly_fee_pence: number
          sort_order?: number
          storeganise_product_id?: string | null
        }
        Update: {
          cover_value_pence?: number
          id?: string
          label?: string
          monthly_fee_pence?: number
          sort_order?: number
          storeganise_product_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          available: boolean
          created_at: string
          features: string[]
          id: string
          image_url: string | null
          monthly_price_pence: number
          name: string
          offer_label: string | null
          size_group: Database["public"]["Enums"]["size_group"]
          size_sqft: number
          sort_order: number
          vat_rate: number
          weekly_price_pence: number
        }
        Insert: {
          available?: boolean
          created_at?: string
          features?: string[]
          id?: string
          image_url?: string | null
          monthly_price_pence: number
          name: string
          offer_label?: string | null
          size_group: Database["public"]["Enums"]["size_group"]
          size_sqft: number
          sort_order?: number
          vat_rate?: number
          weekly_price_pence: number
        }
        Update: {
          available?: boolean
          created_at?: string
          features?: string[]
          id?: string
          image_url?: string | null
          monthly_price_pence?: number
          name?: string
          offer_label?: string | null
          size_group?: Database["public"]["Enums"]["size_group"]
          size_sqft?: number
          sort_order?: number
          vat_rate?: number
          weekly_price_pence?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      booking_status:
        | "pending_payment"
        | "pending_verification"
        | "active"
        | "cancelled"
      size_group: "small" | "medium" | "large"
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
      app_role: ["admin", "customer"],
      booking_status: [
        "pending_payment",
        "pending_verification",
        "active",
        "cancelled",
      ],
      size_group: ["small", "medium", "large"],
    },
  },
} as const
