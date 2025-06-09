
// Tipos para el módulo de picking

export interface PickingTask {
  id: string;
  task_number: string;
  order_id?: string;
  stock_move_task_id?: string;
  product_id: string;
  quantity_requested: number;
  quantity_picked: number;
  source_location_id: string;
  destination_location_id: string;
  task_type: 'sale' | 'transfer' | 'replenishment' | 'quality_control';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'partial';
  assigned_to?: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration_minutes: number;
  actual_duration_minutes?: number;
  validation_code_required: boolean;
  validation_code_used?: string;
  notes?: string;
  error_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  channel_origin?: string;
  is_training_mode: boolean;
  // Relaciones
  product?: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
  };
  source_location?: {
    id: string;
    code: string;
    name: string;
    confirmation_code: string;
  };
  destination_location?: {
    id: string;
    code: string;
    name: string;
    confirmation_code: string;
  };
  assigned_user?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface PickingLine {
  id: string;
  picking_task_id: string;
  product_id: string;
  location_id: string;
  quantity_to_pick: number;
  quantity_picked: number;
  status: 'pending' | 'picked' | 'short_picked' | 'not_found';
  sequence_number: number;
  scanned_barcode?: string;
  picked_by?: string;
  picked_at?: string;
  notes?: string;
  validation_errors: any[];
  user_id: string;
}

export interface PickingHistory {
  id: string;
  picking_task_id: string;
  action_type: 'created' | 'assigned' | 'started' | 'scanned' | 'completed' | 'cancelled' | 'error';
  performed_by: string;
  timestamp: string;
  details: any;
  location_id?: string;
  product_id?: string;
  quantity?: number;
  notes?: string;
  user_id: string;
}

export interface UserPickingZone {
  id: string;
  user_id: string;
  location_id: string;
  can_pick: boolean;
  can_assign_tasks: boolean;
  is_zone_leader: boolean;
  created_at: string;
  updated_at: string;
}

export interface PickingMetrics {
  id: string;
  user_id: string;
  operator_id: string;
  date: string;
  tasks_completed: number;
  tasks_assigned: number;
  total_items_picked: number;
  total_duration_minutes: number;
  average_time_per_task: number;
  error_count: number;
  accuracy_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePickingTaskRequest {
  order_id?: string;
  stock_move_task_id?: string;
  product_id: string;
  quantity_requested: number;
  source_location_id: string;
  destination_location_id: string;
  task_type: 'sale' | 'transfer' | 'replenishment' | 'quality_control';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration_minutes?: number;
  validation_code_required?: boolean;
  notes?: string;
  channel_origin?: string;
  is_training_mode?: boolean;
}

export interface UpdatePickingTaskRequest {
  status?: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'partial';
  assigned_to?: string;
  quantity_picked?: number;
  validation_code_used?: string;
  notes?: string;
  error_reason?: string;
  actual_duration_minutes?: number;
}

export interface PickingTaskFilter {
  status?: string[];
  priority?: string[];
  task_type?: string[];
  assigned_to?: string;
  created_from?: string;
  created_to?: string;
  channel_origin?: string;
}
