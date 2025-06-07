
// Tipos para el módulo de escáner

import { Product, Location } from './inventory';

export interface ScanSession {
  id: string;
  session_id: string;
  user_id: string;
  device_id?: string;
  session_type: 'receiving' | 'picking' | 'putaway' | 'cycle_count' | 'inventory_check' | 'shipping';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  started_at: string;
  ended_at?: string;
  total_scans: number;
  successful_scans: number;
  error_scans: number;
  notes?: string;
  scan_records?: ScanRecord[];
}

export interface ScanRecord {
  id: string;
  session_id: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid' | 'manual_entry';
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
}

export interface ScanValidationRule {
  id: string;
  rule_name: string;
  scan_type: 'barcode' | 'qr_code' | 'rfid';
  validation_type: 'format' | 'existence' | 'location_match' | 'quantity_check' | 'custom';
  rule_pattern?: string;
  error_message: string;
  warning_message?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScanDevice {
  id: string;
  device_id: string;
  device_name: string;
  device_type: 'handheld' | 'fixed' | 'mobile_app' | 'tablet';
  device_model?: string;
  firmware_version?: string;
  battery_level?: number;
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
  assigned_to?: string;
  location_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScanTemplate {
  id: string;
  template_name: string;
  description?: string;
  scan_sequence: ScanStep[];
  validation_rules: string[];
  completion_actions: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScanStep {
  step_number: number;
  step_name: string;
  scan_type: 'product' | 'location' | 'quantity' | 'batch' | 'serial' | 'custom';
  is_required: boolean;
  validation_rule?: string;
  prompt_message: string;
  help_text?: string;
}
