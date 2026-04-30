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
      banners: {
        Row: {
          active_from: string | null
          active_until: string | null
          created_at: string
          cta: string | null
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          placement: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string
          cta?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string
          cta?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          icon_url: string | null
          id: string
          is_visible: boolean
          name: string
          name_telugu: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_visible?: boolean
          name: string
          name_telugu?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          name_telugu?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["coupon_type"]
          discount_value: number
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_value: number
          scope: string
          scope_ref: string | null
          scope_targets: string[]
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["coupon_type"]
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number
          scope?: string
          scope_ref?: string | null
          scope_targets?: string[]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_type"]
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number
          scope?: string
          scope_ref?: string | null
          scope_targets?: string[]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: Json
          body: string
          channel: string
          id: string
          recipients: number
          sent_at: string
          sent_by: string | null
          title: string
        }
        Insert: {
          audience?: Json
          body: string
          channel: string
          id?: string
          recipients?: number
          sent_at?: string
          sent_by?: string | null
          title: string
        }
        Update: {
          audience?: Json
          body?: string
          channel?: string
          id?: string
          recipients?: number
          sent_at?: string
          sent_by?: string | null
          title?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          pack_breakdown: Json | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          qty: number
          unit_price: number
          weight: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          pack_breakdown?: Json | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          qty: number
          unit_price: number
          weight: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          pack_breakdown?: Json | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          qty?: number
          unit_price?: number
          weight?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          courier: string | null
          discount: number
          id: string
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          placed_at: string
          ship_city: string
          ship_line: string
          ship_name: string
          ship_phone: string
          ship_pincode: string
          ship_state: string
          shipping: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          courier?: string | null
          discount?: number
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          placed_at?: string
          ship_city: string
          ship_line: string
          ship_name: string
          ship_phone: string
          ship_pincode: string
          ship_state: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          courier?: string | null
          discount?: number
          id?: string
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          placed_at?: string
          ship_city?: string
          ship_line?: string
          ship_name?: string
          ship_phone?: string
          ship_pincode?: string
          ship_state?: string
          shipping?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          auto_approve_vendors: boolean
          default_commission: number
          free_ship_threshold: number
          id: string
          min_payout: number
          platform_name: string
          public_catalog: boolean
          singleton: boolean
          support_email: string
          two_factor: boolean
          updated_at: string
        }
        Insert: {
          auto_approve_vendors?: boolean
          default_commission?: number
          free_ship_threshold?: number
          id?: string
          min_payout?: number
          platform_name?: string
          public_catalog?: boolean
          singleton?: boolean
          support_email?: string
          two_factor?: boolean
          updated_at?: string
        }
        Update: {
          auto_approve_vendors?: boolean
          default_commission?: number
          free_ship_threshold?: number
          id?: string
          min_payout?: number
          platform_name?: string
          public_catalog?: boolean
          singleton?: boolean
          support_email?: string
          two_factor?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          approval_status: string
          badge: string | null
          category_id: string | null
          category_name: string | null
          created_at: string
          default_weight: string
          description: string
          diet: string[]
          highlights: string[]
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          is_flagged: boolean
          mrp: number | null
          name: string
          name_telugu: string | null
          pack_sizes: number[]
          popularity: number
          price: number
          sku: string
          slug: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          badge?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          default_weight?: string
          description?: string
          diet?: string[]
          highlights?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_flagged?: boolean
          mrp?: number | null
          name: string
          name_telugu?: string | null
          pack_sizes?: number[]
          popularity?: number
          price: number
          sku: string
          slug: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          badge?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          default_weight?: string
          description?: string
          diet?: string[]
          highlights?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_flagged?: boolean
          mrp?: number | null
          name?: string
          name_telugu?: string | null
          pack_sizes?: number[]
          popularity?: number
          price?: number
          sku?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin_if_first: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
      coupon_type: "flat" | "percent"
      order_status: "Pending" | "Packed" | "Shipped" | "Delivered" | "Cancelled"
      payment_method: "UPI" | "Card" | "NetBanking" | "COD"
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
      coupon_type: ["flat", "percent"],
      order_status: ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"],
      payment_method: ["UPI", "Card", "NetBanking", "COD"],
    },
  },
} as const
