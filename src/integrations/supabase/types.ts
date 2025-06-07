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
      accounts: {
        Row: {
          account_type: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_type: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          contact_type: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_type: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_connections: {
        Row: {
          api_key_encrypted: string | null
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          platform_id: string
          settings: Json | null
          store_name: string
          store_url: string | null
          sync_enabled: boolean
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform_id: string
          settings?: Json | null
          store_name: string
          store_url?: string | null
          sync_enabled?: boolean
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform_id?: string
          settings?: Json | null
          store_name?: string
          store_url?: string | null
          sync_enabled?: boolean
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_connections_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_orders: {
        Row: {
          billing_address: Json | null
          connection_id: string
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          external_order_id: string
          financial_status: string | null
          fulfillment_status: string | null
          id: string
          last_synced_at: string | null
          line_items: Json
          order_date: string
          order_number: string
          shipping_address: Json | null
          sync_status: string
          total_amount: number
          updated_at: string
          warehouse_status: string
        }
        Insert: {
          billing_address?: Json | null
          connection_id: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id: string
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          last_synced_at?: string | null
          line_items?: Json
          order_date: string
          order_number: string
          shipping_address?: Json | null
          sync_status?: string
          total_amount: number
          updated_at?: string
          warehouse_status?: string
        }
        Update: {
          billing_address?: Json | null
          connection_id?: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id?: string
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          last_synced_at?: string | null
          line_items?: Json
          order_date?: string
          order_number?: string
          shipping_address?: Json | null
          sync_status?: string
          total_amount?: number
          updated_at?: string
          warehouse_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_orders_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_platforms: {
        Row: {
          api_url: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          api_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          api_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      ecommerce_products: {
        Row: {
          compare_at_price: number | null
          connection_id: string
          created_at: string
          description: string | null
          external_product_id: string
          id: string
          images: Json | null
          inventory_quantity: number | null
          last_synced_at: string | null
          price: number | null
          product_type: string | null
          sku: string | null
          sync_status: string
          tags: string[] | null
          title: string
          updated_at: string
          variants: Json | null
          vendor: string | null
          weight: number | null
        }
        Insert: {
          compare_at_price?: number | null
          connection_id: string
          created_at?: string
          description?: string | null
          external_product_id: string
          id?: string
          images?: Json | null
          inventory_quantity?: number | null
          last_synced_at?: string | null
          price?: number | null
          product_type?: string | null
          sku?: string | null
          sync_status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          variants?: Json | null
          vendor?: string | null
          weight?: number | null
        }
        Update: {
          compare_at_price?: number | null
          connection_id?: string
          created_at?: string
          description?: string | null
          external_product_id?: string
          id?: string
          images?: Json | null
          inventory_quantity?: number | null
          last_synced_at?: string | null
          price?: number | null
          product_type?: string | null
          sku?: string | null
          sync_status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          variants?: Json | null
          vendor?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_products_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      ecommerce_sync_logs: {
        Row: {
          completed_at: string | null
          connection_id: string
          duration_seconds: number | null
          error_message: string | null
          id: string
          records_failed: number | null
          records_processed: number | null
          records_success: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          records_failed?: number | null
          records_processed?: number | null
          records_success?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecommerce_sync_logs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "ecommerce_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          tax_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          tax_rate?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          tax_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          contact_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          notes: string | null
          paid_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number | null
          debit_amount: number | null
          description: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number | null
          debit_amount?: number | null
          description?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          api_rate_limit: number | null
          backup_frequency: string | null
          cache_enabled: boolean | null
          created_at: string
          debug_mode: boolean | null
          id: string
          log_level: string | null
          maintenance_mode: boolean | null
          session_timeout_minutes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_rate_limit?: number | null
          backup_frequency?: string | null
          cache_enabled?: boolean | null
          created_at?: string
          debug_mode?: boolean | null
          id?: string
          log_level?: string | null
          maintenance_mode?: boolean | null
          session_timeout_minutes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_rate_limit?: number | null
          backup_frequency?: string | null
          cache_enabled?: boolean | null
          created_at?: string
          debug_mode?: boolean | null
          id?: string
          log_level?: string | null
          maintenance_mode?: boolean | null
          session_timeout_minutes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          reference: string | null
          status: string
          total_amount: number
          transaction_date: string
          transaction_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          reference?: string | null
          status?: string
          total_amount: number
          transaction_date: string
          transaction_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          reference?: string | null
          status?: string
          total_amount?: number
          transaction_date?: string
          transaction_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          email_frequency: string | null
          email_order_updates: boolean | null
          email_security_alerts: boolean | null
          email_stock_alerts: boolean | null
          email_system_updates: boolean | null
          id: string
          in_app_enabled: boolean | null
          in_app_order_updates: boolean | null
          in_app_sound: boolean | null
          in_app_stock_alerts: boolean | null
          in_app_system_messages: boolean | null
          in_app_task_assignments: boolean | null
          sms_critical_only: boolean | null
          sms_emergency_alerts: boolean | null
          sms_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          email_frequency?: string | null
          email_order_updates?: boolean | null
          email_security_alerts?: boolean | null
          email_stock_alerts?: boolean | null
          email_system_updates?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          in_app_order_updates?: boolean | null
          in_app_sound?: boolean | null
          in_app_stock_alerts?: boolean | null
          in_app_system_messages?: boolean | null
          in_app_task_assignments?: boolean | null
          sms_critical_only?: boolean | null
          sms_emergency_alerts?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          email_frequency?: string | null
          email_order_updates?: boolean | null
          email_security_alerts?: boolean | null
          email_stock_alerts?: boolean | null
          email_system_updates?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          in_app_order_updates?: boolean | null
          in_app_sound?: boolean | null
          in_app_stock_alerts?: boolean | null
          in_app_system_messages?: boolean | null
          in_app_task_assignments?: boolean | null
          sms_critical_only?: boolean | null
          sms_emergency_alerts?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_security_settings: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          login_alerts: boolean | null
          session_timeout: boolean | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          login_alerts?: boolean | null
          session_timeout?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          login_alerts?: boolean | null
          session_timeout?: boolean | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          compact_view: boolean | null
          company_name: string | null
          created_at: string
          currency: string | null
          dark_mode: boolean | null
          date_format: string | null
          id: string
          language: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compact_view?: boolean | null
          company_name?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          date_format?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compact_view?: boolean | null
          company_name?: string | null
          created_at?: string
          currency?: string | null
          dark_mode?: boolean | null
          date_format?: string | null
          id?: string
          language?: string | null
          timezone?: string | null
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
      [_ in never]: never
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
