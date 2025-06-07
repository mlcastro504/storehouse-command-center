
// Tipos para el módulo de clientes

export interface Customer {
  id: string;
  customer_number: string;
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  tax_id?: string;
  credit_limit?: number;
  payment_terms?: string;
  currency: string;
  language: string;
  customer_type: 'individual' | 'company' | 'government' | 'non_profit';
  industry?: string;
  customer_status: 'active' | 'inactive' | 'suspended' | 'prospect';
  assigned_salesperson?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  addresses?: CustomerAddress[];
  contacts?: CustomerContact[];
  orders_count?: number;
  total_orders_value?: number;
  last_order_date?: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: 'billing' | 'shipping' | 'both';
  is_primary: boolean;
  company_name?: string;
  contact_person?: string;
  street_address: string;
  street_address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  delivery_instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerContact {
  id: string;
  customer_id: string;
  contact_type: 'primary' | 'billing' | 'shipping' | 'technical' | 'sales' | 'other';
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  department?: string;
  is_primary: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCredit {
  id: string;
  customer_id: string;
  credit_limit: number;
  available_credit: number;
  credit_terms: string;
  credit_status: 'approved' | 'pending' | 'suspended' | 'denied';
  last_review_date?: string;
  next_review_date?: string;
  credit_score?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerPricing {
  id: string;
  customer_id: string;
  product_id?: string;
  category_id?: string;
  pricing_type: 'fixed' | 'discount_percentage' | 'discount_amount' | 'tier_pricing';
  price_value: number;
  min_quantity?: number;
  max_quantity?: number;
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note_type: 'general' | 'billing' | 'shipping' | 'sales' | 'support' | 'credit';
  title: string;
  content: string;
  is_important: boolean;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
