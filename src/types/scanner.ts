
// Tipos para el módulo de escáner

import { Product, Location } from './inventory';

export interface ScanSession {
  id: string;
  session_id: string;
  user_id: string;
  device_id?: string;
  session_type: 'receiving' | 'picking' | 'putaway' | 'cycle_count' | 'inventory_check' | 'shipping' | 'validation';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
  total_scans: number;
  successful_scans: number;
  error_scans: number;
  notes?: string;
  scan_records?: ScanRecord[];
  related_module?: string;
  task_id?: string;
}

export interface ScanRecord {
  id: string;
  session_id: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'manual_entry' | 'camera_scan';
  scanned_value: string;
  product_id?: string;
  location_id?: string;
  quantity?: number;
  timestamp: string;
  validation_status: 'valid' | 'invalid' | 'warning';
  validation_message?: string;
  action_taken?: string;
  user_id: string;
  device_coordinates?: {
    latitude: number;
    longitude: number;
  };
  product?: Product;
  location?: Location;
  error_details?: string;
  retry_count?: number;
}

export interface ScanValidationRule {
  id: string;
  rule_name: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'camera_scan' | 'any';
  validation_type: 'format' | 'existence' | 'location_match' | 'quantity_check' | 'task_validation' | 'custom';
  rule_pattern?: string;
  error_message: string;
  warning_message?: string;
  is_active: boolean;
  module_context?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScanDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: 'handheld' | 'fixed' | 'mobile_app' | 'tablet' | 'camera_device';
  device_model?: string;
  firmware_version?: string;
  battery_level?: number;
  connection_status: 'connected' | 'disconnected' | 'error' | 'idle';
  last_sync_at?: string;
  assigned_to?: string;
  location_id?: string;
  is_active: boolean;
  capabilities: DeviceCapabilities;
  settings: DeviceSettings;
  created_at: string;
  updated_at: string;
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
  max_session_duration?: number;
}

export interface DeviceSettings {
  preferred_camera: 'rear' | 'front' | 'auto';
  vibration_enabled: boolean;
  sound_enabled: boolean;
  flashlight_enabled: boolean;
  auto_focus: boolean;
  scan_timeout: number;
  validation_mode: 'strict' | 'normal' | 'lenient';
}

export interface ScanTemplate {
  id: string;
  template_name: string;
  description?: string;
  scan_sequence: ScanStep[];
  validation_rules: string[];
  completion_actions: string[];
  module_integration: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScanStep {
  step_number: number;
  step_name: string;
  scan_type: 'product' | 'location' | 'quantity' | 'batch' | 'serial' | 'task_confirmation' | 'custom';
  is_required: boolean;
  validation_rule?: string;
  prompt_message: string;
  help_text?: string;
  expected_format?: string;
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
  id: string;
  user_id: string;
  max_session_duration: number;
  auto_pause_timeout: number;
  validation_strictness: 'low' | 'medium' | 'high';
  allowed_device_types: string[];
  camera_settings: CameraScanConfig;
  notification_settings: {
    sound_enabled: boolean;
    vibration_enabled: boolean;
    visual_feedback: boolean;
  };
  integration_settings: {
    auto_sync_modules: boolean;
    real_time_validation: boolean;
    offline_mode_enabled: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DeviceAssignment {
  id: string;
  device_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  assignment_type: 'permanent' | 'temporary' | 'shift_based';
  notes?: string;
}

export interface ScanEvent {
  id: string;
  session_id: string;
  event_type: 'scan_start' | 'scan_success' | 'scan_error' | 'validation_pass' | 'validation_fail' | 'session_pause' | 'session_resume';
  event_data: any;
  timestamp: string;
  device_id: string;
  user_id: string;
}
