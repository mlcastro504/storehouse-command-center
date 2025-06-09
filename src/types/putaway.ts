
// Tipos para el módulo de almacenaje (Put Away)

import { Product, Location } from './inventory';

export interface Pallet {
  id: string;
  pallet_number: string;
  product_id: string;
  quantity: number;
  status: 'unloaded' | 'waiting_putaway' | 'in_process' | 'stored';
  received_at: string;
  assigned_to?: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  location_id?: string;
  batch_number?: string;
  expiry_date?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  special_requirements?: string[];
  created_by: string;
  product?: Product;
  location?: Location;
}

export interface PutAwayTask {
  id: string;
  task_number: string;
  pallet_id: string;
  operator_id: string;
  suggested_location_id: string;
  actual_location_id?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  started_at: string;
  completed_at?: string;
  confirmation_code_entered?: string;
  notes?: string;
  duration_minutes?: number;
  pallet?: Pallet;
  suggested_location?: Location;
  actual_location?: Location;
}

export interface LocationConfirmation {
  location_id: string;
  confirmation_code: string;
  is_occupied: boolean;
  last_verified_at?: string;
}

export interface PutAwayRule {
  id: string;
  rule_name: string;
  description?: string;
  product_category?: string;
  product_type?: string;
  conditions: PutAwayCondition[];
  location_preference: 'ground_level' | 'upper_shelf' | 'cold_zone' | 'dry_zone' | 'any';
  priority: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PutAwayCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface OperatorPerformance {
  id: string;
  operator_id: string;
  date: string;
  total_tasks: number;
  completed_tasks: number;
  total_pallets: number;
  average_time_per_task: number;
  errors_count: number;
  efficiency_score: number;
  created_at: string;
}

export interface PutAwayMetrics {
  today_tasks: number;
  pending_pallets: number;
  active_operators: number;
  average_completion_time: number;
  error_rate: number;
  efficiency_percentage: number;
}
