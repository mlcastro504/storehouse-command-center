
// Tipos para el módulo de carga y descarga

import { Product } from './warehouse';
import { Address, Customer } from './orders';

export interface LoadingDock {
  id: string;
  dock_number: string;
  name: string;
  type: 'inbound' | 'outbound' | 'both';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  warehouse_id: string;
  capacity_weight?: number;
  capacity_volume?: number;
  equipment_required?: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoadingAppointment {
  id: string;
  appointment_number: string;
  dock_id: string;
  carrier_id?: string;
  truck_license_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  appointment_type: 'inbound' | 'outbound';
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  actual_arrival_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'arrived' | 'loading' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reference_orders: string[];
  total_weight?: number;
  total_volume?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  dock?: LoadingDock;
  carrier?: Carrier;
}

export interface Carrier {
  id: string;
  code: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  insurance_info?: string;
  performance_rating?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  shipment_number: string;
  appointment_id?: string;
  carrier_id?: string;
  tracking_number?: string;
  shipment_type: 'inbound' | 'outbound';
  status: 'created' | 'picked_up' | 'in_transit' | 'delivered' | 'exception' | 'cancelled';
  origin_address: Address;
  destination_address: Address;
  scheduled_pickup_date?: string;
  actual_pickup_date?: string;
  scheduled_delivery_date?: string;
  actual_delivery_date?: string;
  total_weight?: number;
  total_volume?: number;
  freight_cost?: number;
  insurance_value?: number;
  special_instructions?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  shipment_items?: ShipmentItem[];
  carrier?: Carrier;
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  reference_type: 'sales_order' | 'purchase_order' | 'transfer_order';
  reference_id: string;
  reference_line_id?: string;
  product_id?: string;
  quantity: number;
  weight?: number;
  volume?: number;
  package_type?: string;
  package_count?: number;
  notes?: string;
  product?: Product;
}

export interface DeliveryRoute {
  id: string;
  route_number: string;
  driver_id: string;
  vehicle_id?: string;
  route_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  total_distance_km?: number;
  fuel_cost?: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  route_stops?: RouteStop[];
  driver?: Driver;
}

export interface RouteStop {
  id: string;
  route_id: string;
  appointment_id?: string;
  customer_id?: string;
  stop_type: 'pickup' | 'delivery';
  sequence_number: number;
  address: Address;
  estimated_arrival_time?: string;
  actual_arrival_time?: string;
  estimated_departure_time?: string;
  actual_departure_time?: string;
  status: 'pending' | 'arrived' | 'loading' | 'completed' | 'failed';
  notes?: string;
  signature_required: boolean;
  signature_received?: boolean;
  photos_required: boolean;
  photos_taken?: string[];
  customer?: Customer;
}

export interface Driver {
  id: string;
  employee_id: string;
  license_number: string;
  license_expiry_date: string;
  phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  capacity_weight: number;
  capacity_volume: number;
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  insurance_expiry_date: string;
  maintenance_due_date?: string;
  gps_device_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
