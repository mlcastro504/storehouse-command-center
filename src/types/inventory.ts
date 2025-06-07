
// Tipos para el módulo de inventario

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  brand?: string;
  model?: string;
  unit_of_measure: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  qr_code?: string;
  cost_price?: number;
  sale_price?: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockLevel {
  id: string;
  product_id: string;
  location_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_order: number;
  last_updated: string;
  product?: Product;
  location?: Location;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'zone' | 'aisle' | 'rack' | 'shelf' | 'bin';
  parent_id?: string;
  warehouse_id: string;
  capacity?: number;
  current_occupancy: number;
  is_active: boolean;
  coordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  barcode?: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  is_active: boolean;
  total_capacity?: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  from_location_id?: string;
  to_location_id: string;
  quantity: number;
  movement_type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'cycle_count';
  reference_type?: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment' | 'cycle_count';
  reference_id?: string;
  reason: string;
  notes?: string;
  performed_by: string;
  timestamp: string;
  cost_per_unit?: number;
  total_cost?: number;
  batch_number?: string;
  expiry_date?: string;
  status: 'pending' | 'completed' | 'cancelled';
  product?: Product;
  from_location?: Location;
  to_location?: Location;
}

export interface CycleCount {
  id: string;
  location_id: string;
  product_id?: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  cycle_count_lines?: CycleCountLine[];
}

export interface CycleCountLine {
  id: string;
  cycle_count_id: string;
  product_id: string;
  location_id: string;
  expected_quantity: number;
  counted_quantity?: number;
  variance?: number;
  notes?: string;
  counted_by?: string;
  counted_at?: string;
  product?: Product;
  location?: Location;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  lead_time_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSupplier {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_sku: string;
  cost_price: number;
  lead_time_days: number;
  min_order_quantity: number;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
  supplier?: Supplier;
}
