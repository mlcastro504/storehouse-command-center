
// Tipos avanzados para el módulo de e-commerce

export interface EcommerceChannel {
  id: string;
  name: string;
  platform_type: 'shopify' | 'woocommerce' | 'amazon' | 'etsy' | 'mercadolibre';
  api_endpoint?: string;
  api_key_encrypted?: string;
  oauth_token_encrypted?: string;
  webhook_url?: string;
  is_active: boolean;
  is_sandbox: boolean;
  sync_frequency_minutes: number;
  last_sync_at?: string;
  sync_status: 'connected' | 'disconnected' | 'error' | 'syncing';
  settings: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EcommerceOrderAdvanced {
  id: string;
  channel_id: string;
  external_order_id: string;
  order_number: string;
  customer_id?: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  financial_status?: 'pending' | 'paid' | 'refunded';
  total_amount: number;
  currency: string;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  tracking_number?: string;
  sync_status: 'pending' | 'synced' | 'error' | 'processing';
  warehouse_status: 'pending' | 'picking' | 'packed' | 'shipped';
  picking_task_id?: string;
  order_date: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  channel?: EcommerceChannel;
  order_lines?: EcommerceOrderLine[];
}

export interface EcommerceOrderLine {
  id: string;
  ecommerce_order_id: string;
  product_id?: string;
  external_product_id?: string;
  sku?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_info?: Record<string, any>;
  user_id: string;
  created_at: string;
  product?: any;
}

export interface EcommerceReturn {
  id: string;
  ecommerce_order_id: string;
  channel_id: string;
  external_return_id?: string;
  return_number: string;
  return_reason: string;
  return_type: 'full' | 'partial';
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  total_refund_amount?: number;
  quality_check_status: 'pending' | 'passed' | 'failed';
  quality_check_notes?: string;
  processed_by?: string;
  processed_at?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  return_lines?: EcommerceReturnLine[];
  order?: EcommerceOrderAdvanced;
}

export interface EcommerceReturnLine {
  id: string;
  ecommerce_return_id: string;
  ecommerce_order_line_id?: string;
  product_id?: string;
  quantity_returned: number;
  reason: string;
  condition_received?: 'good' | 'damaged' | 'defective';
  restockable: boolean;
  refund_amount?: number;
  user_id: string;
  created_at: string;
  product?: any;
}

export interface EcommerceSyncLogAdvanced {
  id: string;
  channel_id: string;
  sync_type: 'products' | 'orders' | 'inventory' | 'full';
  status: 'started' | 'completed' | 'failed' | 'partial';
  records_processed: number;
  records_success: number;
  records_failed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  user_id: string;
  channel?: EcommerceChannel;
}

export interface EcommerceProductMapping {
  id: string;
  product_id: string;
  channel_id: string;
  external_product_id: string;
  external_sku?: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_synced_at?: string;
  sync_status: 'pending' | 'synced' | 'error';
  user_id: string;
  created_at: string;
  updated_at: string;
  product?: any;
  channel?: EcommerceChannel;
}

export interface EcommerceMetrics {
  total_channels: number;
  active_channels: number;
  total_orders_today: number;
  pending_orders: number;
  processing_orders: number;
  total_revenue_today: number;
  pending_returns: number;
  sync_errors: number;
  popular_products: Array<{
    product_name: string;
    total_sold: number;
    revenue: number;
  }>;
  channel_performance: Array<{
    channel_name: string;
    orders_count: number;
    revenue: number;
    sync_status: string;
  }>;
}

export interface ChannelSettings {
  auto_sync_inventory: boolean;
  auto_create_picking_tasks: boolean;
  auto_update_tracking: boolean;
  stock_sync_threshold: number;
  order_import_frequency: number;
  enable_returns_processing: boolean;
  quality_check_required: boolean;
}
