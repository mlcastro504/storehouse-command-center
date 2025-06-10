
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
  notes?: string;
}

export interface CreateSupplierData {
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
  notes?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  is_active?: boolean;
}
