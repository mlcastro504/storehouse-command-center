
// Tipos para el módulo de órdenes y picking

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  required_date?: string;
  promised_date?: string;
  status: 'draft' | 'confirmed' | 'picking' | 'picked' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  shipping_address: Address;
  billing_address?: Address;
  notes?: string;
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  order_lines?: SalesOrderLine[];
  customer?: Customer;
}

export interface SalesOrderLine {
  id: string;
  sales_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_picked?: number;
  quantity_shipped?: number;
  unit_price: number;
  discount_percentage?: number;
  line_total: number;
  notes?: string;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_date?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'receiving' | 'received' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  order_lines?: PurchaseOrderLine[];
  supplier?: Supplier;
}

export interface PurchaseOrderLine {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_cost: number;
  line_total: number;
  notes?: string;
  product?: Product;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  billing_address?: Address;
  shipping_address?: Address;
  tax_id?: string;
  payment_terms?: string;
  credit_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PickingList {
  id: string;
  list_number: string;
  sales_order_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_date: string;
  assigned_date?: string;
  started_date?: string;
  completed_date?: string;
  notes?: string;
  picking_lines?: PickingLine[];
  sales_order?: SalesOrder;
}

export interface PickingLine {
  id: string;
  picking_list_id: string;
  product_id: string;
  location_id: string;
  quantity_to_pick: number;
  quantity_picked?: number;
  status: 'pending' | 'picked' | 'short_picked' | 'not_found';
  sequence_number: number;
  notes?: string;
  picked_by?: string;
  picked_at?: string;
  product?: Product;
  location?: Location;
}

export interface TransferOrder {
  id: string;
  order_number: string;
  from_location_id: string;
  to_location_id: string;
  status: 'draft' | 'confirmed' | 'in_transit' | 'received' | 'cancelled';
  transfer_date: string;
  expected_date?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  transfer_lines?: TransferOrderLine[];
  from_location?: Location;
  to_location?: Location;
}

export interface TransferOrderLine {
  id: string;
  transfer_order_id: string;
  product_id: string;
  quantity_to_transfer: number;
  quantity_transferred?: number;
  quantity_received?: number;
  notes?: string;
  product?: Product;
}
