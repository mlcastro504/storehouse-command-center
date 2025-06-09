
import { connectToDatabase } from '@/lib/mongodb';
import { BrowserStorage } from '@/lib/browserStorage';

export interface ScanSession {
  id: string;
  session_id: string;
  device_id: string;
  user_id: string;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
  ended_at?: string;
  total_scans: number;
  successful_scans: number;
  error_scans: number;
  scan_records: ScanRecord[];
}

export interface ScanRecord {
  id: string;
  session_id: string;
  scanned_data: string;
  scan_type: 'barcode' | 'qr_code' | 'manual';
  timestamp: string;
  location?: string;
  validation_status: 'valid' | 'invalid' | 'pending';
  error_message?: string;
}

export interface ScanDevice {
  id: string;
  device_name: string;
  device_type: 'handheld' | 'fixed' | 'mobile';
  is_active: boolean;
  last_seen: string;
  battery_level?: number;
  firmware_version?: string;
}

export interface ScanValidationRule {
  id: string;
  rule_name: string;
  pattern: string;
  description: string;
  is_active: boolean;
}

export interface ScanTemplate {
  id: string;
  template_name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    validation?: string;
  }>;
}

export interface ScannerMetrics {
  totalScans: number;
  successRate: number;
  avgScanTime: number;
  deviceUsage: Array<{
    deviceId: string;
    scans: number;
  }>;
}

export interface ScannerSettings {
  autoSave: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  duplicateCheck: boolean;
  batchSize: number;
}

export interface DeviceAssignment {
  id: string;
  device_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  is_active: boolean;
  assignment_type: 'permanent' | 'temporary' | 'shift_based';
}

export interface ScanEvent {
  id: string;
  session_id: string;
  event_type: 'scan_start' | 'scan_end' | 'error' | 'validation';
  event_data: any;
  timestamp: string;
  device_id: string;
  user_id: string;
}

export interface CameraScanConfig {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high';
  flashEnabled: boolean;
  autoFocus: boolean;
  formats: string[];
}

export class ScannerService {
  // Gestión de sesiones
  static async getSessions(): Promise<ScanSession[]> {
    try {
      const db = await connectToDatabase();
      const sessions = await db.collection('scan_sessions').find().sort({ started_at: -1 }).toArray() as ScanSession[];
      return sessions;
    } catch (error) {
      console.error('Error fetching scan sessions:', error);
      return [];
    }
  }

  static async getActiveSessions(): Promise<ScanSession[]> {
    try {
      const db = await connectToDatabase();
      const sessions = await db.collection('scan_sessions').find({ 
        status: { $in: ['active', 'paused'] }
      }).toArray() as ScanSession[];
      return sessions;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  static async createSession(sessionData: Partial<ScanSession>): Promise<ScanSession | null> {
    try {
      const session: ScanSession = {
        ...sessionData,
        id: `sess_${Date.now()}`,
        session_id: `SCAN-${Date.now()}`,
        status: 'active',
        started_at: new Date().toISOString(),
        total_scans: 0,
        successful_scans: 0,
        error_scans: 0,
        scan_records: []
      } as ScanSession;

      const db = await connectToDatabase();
      await db.collection('scan_sessions').insertOne(session);
      
      // Crear evento de inicio
      await this.createScanEvent({
        session_id: session.id,
        event_type: 'scan_start',
        device_id: session.device_id,
        user_id: session.user_id
      });
      
      return session;
    } catch (error) {
      console.error('Error creating scan session:', error);
      return null;
    }
  }

  static async pauseSession(sessionId: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('scan_sessions').updateOne(
        { id: sessionId },
        { $set: { status: 'paused' } }
      );
      
      return true;
    } catch (error) {
      console.error('Error pausing session:', error);
      return false;
    }
  }

  static async resumeSession(sessionId: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('scan_sessions').updateOne(
        { id: sessionId },
        { $set: { status: 'active' } }
      );
      return true;
    } catch (error) {
      console.error('Error resuming session:', error);
      return false;
    }
  }

  static async endSession(sessionId: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('scan_sessions').updateOne(
        { id: sessionId },
        { 
          $set: { 
            status: 'completed',
            ended_at: new Date().toISOString()
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }

  // Gestión de eventos
  static async createScanEvent(eventData: Partial<ScanEvent>): Promise<ScanEvent | null> {
    try {
      const event: ScanEvent = {
        id: `event_${Date.now()}`,
        session_id: eventData.session_id || '',
        event_type: eventData.event_type || 'scan_start',
        event_data: eventData.event_data || {},
        timestamp: new Date().toISOString(),
        device_id: eventData.device_id || '',
        user_id: eventData.user_id || ''
      };

      const db = await connectToDatabase();
      await db.collection('scan_events').insertOne(event);
      return event;
    } catch (error) {
      console.error('Error creating scan event:', error);
      return null;
    }
  }

  // Gestión de dispositivos
  static async getDevices(): Promise<ScanDevice[]> {
    try {
      const db = await connectToDatabase();
      const devices = await db.collection('scan_devices').find().toArray() as ScanDevice[];
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  static async registerDevice(deviceData: Partial<ScanDevice>): Promise<ScanDevice | null> {
    try {
      const device: ScanDevice = {
        id: `dev_${Date.now()}`,
        device_name: deviceData.device_name || 'Unknown Device',
        device_type: deviceData.device_type || 'mobile',
        is_active: true,
        last_seen: new Date().toISOString(),
        battery_level: deviceData.battery_level,
        firmware_version: deviceData.firmware_version
      };

      const db = await connectToDatabase();
      await db.collection('scan_devices').insertOne(device);
      return device;
    } catch (error) {
      console.error('Error registering device:', error);
      return null;
    }
  }

  // Asignación de dispositivos
  static async assignDevice(deviceId: string, userId: string, assignedBy: string, assignmentType: 'permanent' | 'temporary' | 'shift_based'): Promise<DeviceAssignment | null> {
    try {
      const assignment: DeviceAssignment = {
        id: `assign_${Date.now()}`,
        device_id: deviceId,
        user_id: userId,
        assigned_by: assignedBy,
        assigned_at: new Date().toISOString(),
        is_active: true,
        assignment_type: assignmentType
      };

      const db = await connectToDatabase();
      
      // Desactivar asignaciones anteriores del dispositivo
      const existingAssignments = await db.collection('device_assignments').find({ device_id: deviceId, is_active: true }).toArray();
      for (const existing of existingAssignments) {
        await db.collection('device_assignments').updateOne(
          { id: existing.id },
          { $set: { is_active: false } }
        );
      }

      await db.collection('device_assignments').insertOne(assignment);
      
      return assignment;
    } catch (error) {
      console.error('Error assigning device:', error);
      return null;
    }
  }

  // Procesamiento de escaneos
  static async processScan(sessionId: string, scannedData: string, scanType: 'barcode' | 'qr_code' | 'manual'): Promise<ScanRecord | null> {
    try {
      const record: ScanRecord = {
        id: `scan_${Date.now()}`,
        session_id: sessionId,
        scanned_data: scannedData,
        scan_type: scanType,
        timestamp: new Date().toISOString(),
        validation_status: 'pending'
      };

      // Validar el escaneo
      const isValid = await this.validateScan(scannedData);
      record.validation_status = isValid ? 'valid' : 'invalid';

      const db = await connectToDatabase();
      await db.collection('scan_records').insertOne(record);

      // Actualizar contadores de la sesión
      const updateFields = isValid 
        ? { $inc: { total_scans: 1, successful_scans: 1 } }
        : { $inc: { total_scans: 1, error_scans: 1 } };

      await db.collection('scan_sessions').updateOne(
        { id: sessionId },
        updateFields
      );

      return record;
    } catch (error) {
      console.error('Error processing scan:', error);
      return null;
    }
  }

  // Validación de escaneos
  static async validateScan(scannedData: string): Promise<boolean> {
    try {
      const rules = await this.getValidationRules();
      
      for (const rule of rules) {
        if (rule.is_active) {
          const regex = new RegExp(rule.pattern);
          if (regex.test(scannedData)) {
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error validating scan:', error);
      return false;
    }
  }

  // Reglas de validación
  static async getValidationRules(): Promise<ScanValidationRule[]> {
    try {
      const db = await connectToDatabase();
      const rules = await db.collection('scan_validation_rules').find().toArray() as ScanValidationRule[];
      return rules;
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      return [];
    }
  }

  // Métricas del scanner
  static async getMetrics(): Promise<ScannerMetrics> {
    try {
      const db = await connectToDatabase();
      const scans = await db.collection('scan_records').find().toArray();
      
      const totalScans = scans.length;
      const validScans = scans.filter(scan => scan.validation_status === 'valid').length;
      const successRate = totalScans > 0 ? (validScans / totalScans) * 100 : 0;
      
      return {
        totalScans,
        successRate,
        avgScanTime: 2.5, // Mock data
        deviceUsage: [] // Mock data
      };
    } catch (error) {
      console.error('Error fetching scanner metrics:', error);
      return {
        totalScans: 0,
        successRate: 0,
        avgScanTime: 0,
        deviceUsage: []
      };
    }
  }

  // Configuración del scanner
  static async getSettings(): Promise<ScannerSettings> {
    try {
      const db = await connectToDatabase();
      const settings = await db.collection('scanner_settings').findOne() as ScannerSettings;
      
      return settings || {
        autoSave: true,
        soundEnabled: true,
        vibrationEnabled: true,
        duplicateCheck: true,
        batchSize: 50
      };
    } catch (error) {
      console.error('Error fetching scanner settings:', error);
      return {
        autoSave: true,
        soundEnabled: true,
        vibrationEnabled: true,
        duplicateCheck: true,
        batchSize: 50
      };
    }
  }

  static async updateSettings(settings: ScannerSettings): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('scanner_settings').updateOne(
        {},
        { $set: settings },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('Error updating scanner settings:', error);
      return false;
    }
  }

  // Plantillas de escaneo
  static async getTemplates(): Promise<ScanTemplate[]> {
    try {
      const db = await connectToDatabase();
      const templates = await db.collection('scan_templates').find().toArray() as ScanTemplate[];
      return templates;
    } catch (error) {
      console.error('Error fetching scan templates:', error);
      return [];
    }
  }

  static async createTemplate(template: Partial<ScanTemplate>): Promise<ScanTemplate | null> {
    try {
      const newTemplate: ScanTemplate = {
        id: `template_${Date.now()}`,
        template_name: template.template_name || 'New Template',
        fields: template.fields || []
      };

      const db = await connectToDatabase();
      await db.collection('scan_templates').insertOne(newTemplate);
      return newTemplate;
    } catch (error) {
      console.error('Error creating scan template:', error);
      return null;
    }
  }

  // Configuración de cámara
  static async getCameraConfig(): Promise<CameraScanConfig> {
    try {
      const db = await connectToDatabase();
      const config = await db.collection('camera_config').findOne() as CameraScanConfig;
      
      return config || {
        enabled: true,
        quality: 'medium',
        flashEnabled: false,
        autoFocus: true,
        formats: ['CODE_128', 'QR_CODE', 'EAN_13']
      };
    } catch (error) {
      console.error('Error fetching camera config:', error);
      return {
        enabled: true,
        quality: 'medium',
        flashEnabled: false,
        autoFocus: true,
        formats: ['CODE_128', 'QR_CODE', 'EAN_13']
      };
    }
  }

  static async updateCameraConfig(config: CameraScanConfig): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('camera_config').updateOne(
        {},
        { $set: config },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('Error updating camera config:', error);
      return false;
    }
  }
}
