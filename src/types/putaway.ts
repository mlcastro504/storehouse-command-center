
// Tipos para el módulo de almacenaje (Put Away)

import { Product, Location } from './inventory';

export interface PutAwayTask {
  id: string;
  task_number: string;
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity_to_putaway: number;
  quantity_completed?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by: string;
  created_date: string;
  assigned_date?: string;
  started_date?: string;
  completed_date?: string;
  estimated_duration_minutes?: number;
  actual_duration_minutes?: number;
  notes?: string;
  batch_number?: string;
  expiry_date?: string;
  quality_check_required: boolean;
  quality_check_status?: 'pending' | 'passed' | 'failed';
  product?: Product;
  from_location?: Location;
  to_location?: Location;
}

export interface PutAwayRule {
  id: string;
  rule_name: string;
  description?: string;
  product_id?: string;
  category_id?: string;
  conditions: PutAwayCondition[];
  suggested_location_id?: string;
  location_type?: 'warehouse' | 'zone' | 'aisle' | 'rack' | 'shelf' | 'bin';
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

export interface PutAwayStrategy {
  id: string;
  strategy_name: string;
  description?: string;
  strategy_type: 'fifo' | 'lifo' | 'fefo' | 'closest_location' | 'abc_analysis' | 'custom';
  rules: PutAwayRule[];
  is_default: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PutAwayPerformance {
  id: string;
  user_id: string;
  date: string;
  total_tasks: number;
  completed_tasks: number;
  total_items: number;
  completion_rate: number;
  average_time_per_task: number;
  errors_count: number;
  efficiency_score: number;
  created_at: string;
}
