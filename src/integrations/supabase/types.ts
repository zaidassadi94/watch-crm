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
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          brand: string
          category: string
          cost_price: number
          date_added: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          sku: string
          stock_level: number
          stock_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand: string
          category: string
          cost_price?: number
          date_added?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          sku: string
          stock_level?: number
          stock_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          category?: string
          cost_price?: number
          date_added?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sku?: string
          stock_level?: number
          stock_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      return_items: {
        Row: {
          cost_price: number | null
          id: string
          price: number
          product_name: string
          quantity: number
          return_id: string
          sku: string | null
          subtotal: number
        }
        Insert: {
          cost_price?: number | null
          id?: string
          price: number
          product_name: string
          quantity?: number
          return_id: string
          sku?: string | null
          subtotal: number
        }
        Update: {
          cost_price?: number | null
          id?: string
          price?: number
          product_name?: string
          quantity?: number
          return_id?: string
          sku?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_return"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          id: string
          reason: string | null
          return_date: string
          sale_id: string
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          id?: string
          reason?: string | null
          return_date?: string
          sale_id: string
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          id?: string
          reason?: string | null
          return_date?: string
          sale_id?: string
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sale"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          cost_price: number | null
          created_at: string
          id: string
          inventory_id: string | null
          price: number
          product_name: string
          quantity: number
          sale_id: string
          sku: string | null
          subtotal: number
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          price: number
          product_name: string
          quantity?: number
          sale_id: string
          sku?: string | null
          subtotal: number
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          id?: string
          inventory_id?: string | null
          price?: number
          product_name?: string
          quantity?: number
          sale_id?: string
          sku?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          payment_method: string | null
          status: string
          total_amount: number
          total_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_amount: number
          total_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          payment_method?: string | null
          status?: string
          total_amount?: number
          total_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          estimated_completion: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          price: number | null
          serial_number: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
          watch_brand: string
          watch_model: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          serial_number?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
          watch_brand: string
          watch_model?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          price?: number | null
          serial_number?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          watch_brand?: string
          watch_model?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          company_name: string
          created_at: string
          currency: string
          date_format: string
          enable_dark_mode: boolean
          enable_notifications: boolean
          gst_number: string | null
          gst_percentage: number | null
          id: string
          language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          currency?: string
          date_format?: string
          enable_dark_mode?: boolean
          enable_notifications?: boolean
          gst_number?: string | null
          gst_percentage?: number | null
          id?: string
          language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          currency?: string
          date_format?: string
          enable_dark_mode?: boolean
          enable_notifications?: boolean
          gst_number?: string | null
          gst_percentage?: number | null
          id?: string
          language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      nextval: {
        Args: {
          seq_name: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
