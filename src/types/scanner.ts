
import { ObjectId } from 'mongodb';

// Tipos principales del sistema de escaneo

export interface ScanDevice {
  _id?: ObjectId;
  id: string;
  device_id: string;
  device_type: 'handheld' | 'mobile_app' | 'tablet' | 'camera_device' | 'fixed';
  device_name: string;
  model?: string;
  os_version?: string;
  app_version?: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'idle';
  battery_level?: number;
  last_sync_at?: string;
  is_active: boolean;
  capabilities: DeviceCapabilities;
  settings: DeviceSettings;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface DeviceCapabilities {
  has_camera: boolean;
  has_rear_camera: boolean;
  has_front_camera: boolean;
  supports_barcode: boolean;
  supports_qr: boolean;
  supports_rfid: boolean;
  can_vibrate: boolean;
  has_flashlight: boolean;
  max_resolution?: string;
}

export interface DeviceSettings {
  preferred_camera: 'rear' | 'front' | 'auto';
  vibration_enabled: boolean;
  sound_enabled: boolean;
  flashlight_enabled: boolean;
  auto_focus: boolean;
  scan_timeout: number;
  validation_mode: 'normal' | 'strict' | 'permissive';
}

export interface ScanSession {
  _id?: ObjectId;
  id: string;
  session_id: string;
  session_type: 'inventory' | 'picking' | 'receiving' | 'cycle_count' | 'stock_move';
  device_id: string;
  user_id: string;
  location_id?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
  total_scans: number;
  successful_scans: number;
  error_scans: number;
  scan_records: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScanRecord {
  _id?: ObjectId;
  id: string;
  session_id: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'camera_scan' | 'manual_entry';
  scanned_value: string;
  product_id?: string;
  location_id?: string;
  quantity?: number;
  timestamp: string;
  validation_status: 'valid' | 'invalid' | 'warning';
  validation_message?: string;
  user_id: string;
  device_id?: string;
  retry_count: number;
  metadata?: Record<string, any>;
}

export interface ScanValidationRule {
  _id?: ObjectId;
  id: string;
  rule_name: string;
  description?: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'any';
  validation_type: 'format' | 'length' | 'existence' | 'range' | 'quantity_check';
  rule_pattern?: string;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  error_message: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ScanTemplate {
  _id?: ObjectId;
  id: string;
  template_name: string;
  description?: string;
  scan_sequence: ScanStep[];
  validation_rules: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScanStep {
  step_number: number;
  step_name: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'manual_entry';
  is_required: boolean;
  validation_rules: string[];
  prompt_message: string;
}

export interface ScannerMetrics {
  total_devices: number;
  active_sessions: number;
  scans_today: number;
  error_rate: number;
  devices_by_type: {
    handheld: number;
    mobile: number;
    tablet: number;
    camera: number;
  };
  top_errors: Array<{
    error_type: string;
    count: number;
  }>;
}

export interface ScannerSettings {
  _id?: ObjectId;
  id: string;
  user_id: string;
  default_scan_mode: 'continuous' | 'single';
  auto_advance: boolean;
  confirmation_required: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  scan_timeout: number;
  retry_attempts: number;
  preferred_camera: 'rear' | 'front';
  created_at: string;
  updated_at: string;
}

export interface DeviceAssignment {
  _id?: ObjectId;
  id: string;
  device_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  unassigned_at?: string;
  is_active: boolean;
  assignment_type: 'permanent' | 'temporary' | 'shift_based';
  notes?: string;
}

export interface ScanEvent {
  _id?: ObjectId;
  id: string;
  session_id: string;
  event_type: 'scan_start' | 'scan_success' | 'scan_error' | 'session_pause' | 'session_resume' | 'session_end';
  event_data: Record<string, any>;
  timestamp: string;
  device_id: string;
  user_id: string;
}

export interface CameraScanConfig {
  enabled: boolean;
  preferred_camera: 'rear' | 'front';
  resolution: 'low' | 'medium' | 'high';
  auto_focus: boolean;
  flash_mode: 'auto' | 'on' | 'off';
  scan_area_overlay: boolean;
  continuous_scan: boolean;
  beep_on_scan: boolean;
  vibrate_on_scan: boolean;
}

// Tipos para el nuevo módulo Stock Move
export interface StockMoveTask {
  _id?: ObjectId;
  id: string;
  product_id: string;
  quantity_needed: number;
  source_location_id: string;
  destination_location_id: string;
  task_type: 'replenishment' | 'relocation' | 'consolidation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  validation_code_required: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StockMoveExecution {
  _id?: ObjectId;
  id: string;
  task_id: string;
  executed_by: string;
  quantity_moved: number;
  validation_code_used: string;
  scan_records: string[];
  execution_status: 'completed' | 'partial' | 'failed';
  execution_notes?: string;
  started_at: string;
  completed_at: string;
}
