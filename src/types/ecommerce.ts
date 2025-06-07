
// Tipos para el módulo de e-commerce

export interface EcommercePlatform {
  id: string;
  name: string;
  display_name: string;
  api_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface EcommerceConnection {
  id: string;
  platform_id: string;
  store_name: string;
  api_key_encrypted?: string;
  store_url?: string;
  webhook_url?: string;
  sync_enabled: boolean;
  last_sync_at?: string;
  user_id: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  platform?: EcommercePlatform;
}

export interface EcommerceProduct {
  id: string;
  connection_id: string;
  external_product_id: string;
  sku?: string;
  title: string;
  description?: string;
  price?: number;
  compare_at_price?: number;
  inventory_quantity?: number;
  weight?: number;
  product_type?: string;
  vendor?: string;
  tags?: string[];
  images: any[];
  variants: any[];
  sync_status: 'pending' | 'synced' | 'error' | 'out_of_sync';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EcommerceOrder {
  id: string;
  connection_id: string;
  external_order_id: string;
  order_number: string;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  financial_status?: string;
  fulfillment_status?: string;
  total_amount: number;
  currency: string;
  order_date: string;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  line_items: any[];
  sync_status: 'pending' | 'synced' | 'error' | 'processing';
  warehouse_status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EcommerceSyncLog {
  id: string;
  connection_id: string;
  sync_type: 'products' | 'orders' | 'inventory' | 'full';
  status: 'started' | 'completed' | 'failed' | 'partial';
  records_processed?: number;
  records_success?: number;
  records_failed?: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
}
