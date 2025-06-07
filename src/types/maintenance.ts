
// Tipos para el módulo de mantenimiento

export interface Equipment {
  id: string;
  equipment_number: string;
  name: string;
  description?: string;
  equipment_type: 'forklift' | 'conveyor' | 'scanner' | 'dock_door' | 'lighting' | 'hvac' | 'other';
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  location_id?: string;
  status: 'operational' | 'maintenance' | 'repair' | 'out_of_service' | 'retired';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  specifications?: Record<string, any>;
  photos?: string[];
  documents?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface MaintenanceSchedule {
  id: string;
  equipment_id: string;
  task_name: string;
  description?: string;
  maintenance_type: 'preventive' | 'predictive' | 'corrective' | 'emergency';
  frequency_type: 'hours' | 'days' | 'weeks' | 'months' | 'cycles';
  frequency_value: number;
  last_performed?: string;
  next_due: string;
  estimated_duration_hours: number;
  required_skills?: string[];
  required_parts?: MaintenancePart[];
  instructions?: string;
  safety_notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface MaintenancePart {
  part_id: string;
  quantity_required: number;
  description?: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  work_order_number: string;
  equipment_id: string;
  schedule_id?: string;
  title: string;
  description: string;
  work_type: 'preventive' | 'corrective' | 'emergency' | 'inspection' | 'upgrade';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'created' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  assigned_to?: string;
  requested_by: string;
  approved_by?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  estimated_hours: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  failure_description?: string;
  work_performed?: string;
  parts_used?: WorkOrderPart[];
  labor_records?: LaborRecord[];
  photos_before?: string[];
  photos_after?: string[];
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
  schedule?: MaintenanceSchedule;
}

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  part_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

export interface LaborRecord {
  id: string;
  work_order_id: string;
  technician_id: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  hourly_rate: number;
  total_cost: number;
  work_description?: string;
}

export interface MaintenanceInspection {
  id: string;
  equipment_id: string;
  inspection_type: 'safety' | 'performance' | 'compliance' | 'routine';
  scheduled_date: string;
  performed_date?: string;
  performed_by?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  overall_result: 'pass' | 'fail' | 'conditional';
  checklist_items?: InspectionItem[];
  findings?: string;
  recommendations?: string;
  photos?: string[];
  next_inspection_due?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  item_name: string;
  description?: string;
  result: 'pass' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
}

export interface Technician {
  id: string;
  employee_id: string;
  specializations: string[];
  certifications?: Certification[];
  hourly_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  name: string;
  issuing_authority: string;
  issued_date: string;
  expiry_date?: string;
  certificate_number?: string;
}
