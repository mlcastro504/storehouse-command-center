
// Tipos para el módulo de control de calidad

export interface QualityCheck {
  id: string;
  check_number: string;
  product_id: string;
  location_id?: string;
  batch_number?: string;
  check_type: 'incoming' | 'outgoing' | 'random' | 'cycle_count' | 'complaint';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'on_hold';
  scheduled_date?: string;
  performed_date?: string;
  performed_by?: string;
  approved_by?: string;
  quantity_checked: number;
  quantity_passed: number;
  quantity_failed: number;
  overall_result: 'pass' | 'fail' | 'conditional';
  notes?: string;
  corrective_actions?: string;
  photos?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  quality_criteria?: QualityCriteria[];
  product?: Product;
  location?: Location;
}

export interface QualityCriteria {
  id: string;
  quality_check_id: string;
  criterion_name: string;
  criterion_type: 'visual' | 'measurement' | 'functional' | 'documentation';
  expected_value?: string;
  actual_value?: string;
  tolerance?: string;
  result: 'pass' | 'fail' | 'na';
  severity: 'minor' | 'major' | 'critical';
  notes?: string;
  photos?: string[];
}

export interface NonConformance {
  id: string;
  ncr_number: string;
  quality_check_id?: string;
  product_id: string;
  supplier_id?: string;
  customer_id?: string;
  nonconformance_type: 'product_defect' | 'process_deviation' | 'documentation_error' | 'other';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  root_cause?: string;
  corrective_action: string;
  preventive_action?: string;
  status: 'open' | 'investigating' | 'correcting' | 'verifying' | 'closed';
  reported_by: string;
  assigned_to?: string;
  target_close_date?: string;
  actual_close_date?: string;
  cost_impact?: number;
  photos?: string[];
  documents?: string[];
  created_at: string;
  updated_at: string;
  product?: Product;
  supplier?: Supplier;
  customer?: Customer;
}

export interface QualityDocument {
  id: string;
  document_type: 'certificate' | 'specification' | 'test_report' | 'sds' | 'other';
  title: string;
  description?: string;
  product_id?: string;
  supplier_id?: string;
  document_url: string;
  version: string;
  effective_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'draft' | 'archived';
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}
