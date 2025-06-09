import { ObjectId } from 'mongodb';

// Tipos para el módulo de inventario

export interface Product {
  _id?: ObjectId;
  id?: string;
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
  created_at: Date;
  updated_at: Date;
  user_id: string;
  special_requirements?: string[];
  storage_restrictions?: {
    temperature_controlled?: boolean;
    max_weight_per_location?: number;
    requires_ground_level?: boolean;
  };
}

export interface Category {
  _id?: ObjectId;
  id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export interface StockLevel {
  _id?: ObjectId;
  id?: string;
  product_id: string;
  location_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_order: number;
  last_updated: Date;
  user_id: string;
  product?: Product;
  location?: Location;
}

export interface Location {
  _id?: ObjectId;
  id?: string;
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
  confirmation_code: string; // Código único para confirmación de Put Away
  occupancy_status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  restrictions?: {
    max_weight?: number;
    temperature_controlled?: boolean;
    ground_level_only?: boolean;
    special_handling?: string[];
  };
  last_verified_at?: Date;
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export interface Warehouse {
  _id?: ObjectId;
  id?: string;
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
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export interface StockMovement {
  _id?: ObjectId;
  id?: string;
  product_id: string;
  from_location_id?: string;
  to_location_id: string;
  quantity: number;
  movement_type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'cycle_count' | 'putaway';
  reference_type?: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment' | 'cycle_count' | 'putaway_task';
  reference_id?: string;
  reason: string;
  notes?: string;
  performed_by: string;
  timestamp: Date;
  cost_per_unit?: number;
  total_cost?: number;
  batch_number?: string;
  expiry_date?: Date;
  status: 'pending' | 'completed' | 'cancelled';
  user_id: string;
  product?: Product;
  from_location?: Location;
  to_location?: Location;
  pallet_id?: string; // Referencia al palet en caso de Put Away
}

export interface CycleCount {
  _id?: ObjectId;
  id?: string;
  location_id: string;
  product_id?: string;
  scheduled_date: Date;
  completed_date?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  cycle_count_lines?: CycleCountLine[];
}

export interface CycleCountLine {
  _id?: ObjectId;
  id?: string;
  cycle_count_id: string;
  product_id: string;
  location_id: string;
  expected_quantity: number;
  counted_quantity?: number;
  variance?: number;
  notes?: string;
  counted_by?: string;
  counted_at?: Date;
  user_id: string;
  product?: Product;
  location?: Location;
}

export interface Supplier {
  _id?: ObjectId;
  id?: string;
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
  created_at: Date;
  updated_at: Date;
  user_id: string;
}

export interface ProductSupplier {
  _id?: ObjectId;
  id?: string;
  product_id: string;
  supplier_id: string;
  supplier_sku: string;
  cost_price: number;
  lead_time_days: number;
  min_order_quantity: number;
  is_preferred: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  product?: Product;
  supplier?: Supplier;
}
