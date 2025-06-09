
import { connectToDatabase } from '@/lib/mongodb';
import { BrowserStorage } from '@/lib/browserStorage';
import {
  ScanSession,
  ScanRecord,
  ScanDevice,
  ScanValidationRule,
  ScanTemplate,
  ScannerMetrics,
  ScannerSettings,
  DeviceAssignment,
  ScanEvent,
  CameraScanConfig,
  StockMoveTask,
  StockMoveExecution
} from '@/types/scanner';

export class ScannerService {
  // Gestión de dispositivos
  static async getDevices(): Promise<ScanDevice[]> {
    try {
      const db = await connectToDatabase();
      const devices = await db.collection('scan_devices').find({}).toArray() as ScanDevice[];
      return devices;
    } catch (error) {
      console.error('Error fetching scan devices:', error);
      return [];
    }
  }

  static async createDevice(deviceData: Partial<ScanDevice>): Promise<ScanDevice | null> {
    try {
      const device: ScanDevice = {
        ...deviceData,
        id: `dev_${Date.now()}`,
        device_id: deviceData.device_id || `${deviceData.device_type}_${Date.now()}`,
        connection_status: 'disconnected',
        is_active: true,
        capabilities: deviceData.capabilities || {
          has_camera: false,
          has_rear_camera: false,
          has_front_camera: false,
          supports_barcode: true,
          supports_qr: true,
          supports_rfid: false,
          can_vibrate: false,
          has_flashlight: false
        },
        settings: deviceData.settings || {
          preferred_camera: 'rear',
          vibration_enabled: true,
          sound_enabled: true,
          flashlight_enabled: false,
          auto_focus: true,
          scan_timeout: 5000,
          validation_mode: 'normal'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as ScanDevice;

      const db = await connectToDatabase();
      await db.collection('scan_devices').insertOne(device);
      return device;
    } catch (error) {
      console.error('Error creating scan device:', error);
      return null;
    }
  }

  static async updateDeviceStatus(deviceId: string, status: 'connected' | 'disconnected' | 'error' | 'idle'): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      await db.collection('scan_devices').updateOne(
        { id: deviceId },
        { 
          $set: { 
            connection_status: status,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Error updating device status:', error);
      return false;
    }
  }

  // Gestión de sesiones
  static async getSessions(): Promise<ScanSession[]> {
    try {
      const db = await connectToDatabase();
      const sessions = await db.collection('scan_sessions').find({}).sort({ started_at: -1 }).toArray() as ScanSession[];
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

  // Gestión de escaneos
  static async processScan(scanData: Partial<ScanRecord> & { device_id?: string }): Promise<ScanRecord | null> {
    try {
      const scan: ScanRecord = {
        id: `scan_${Date.now()}`,
        session_id: scanData.session_id || '',
        scan_type: scanData.scan_type || 'camera_scan',
        scanned_value: scanData.scanned_value || '',
        timestamp: new Date().toISOString(),
        validation_status: 'valid',
        user_id: scanData.user_id || '',
        retry_count: 0
      };

      // Validar el escaneo
      const validationResult = await this.validateScan(scan);
      scan.validation_status = validationResult.status;
      scan.validation_message = validationResult.message;

      const db = await connectToDatabase();
      await db.collection('scan_records').insertOne(scan);

      // Actualizar estadísticas de la sesión
      await this.updateSessionStats(scan.session_id, scan.validation_status === 'valid');

      return scan;
    } catch (error) {
      console.error('Error processing scan:', error);
      return null;
    }
  }

  static async validateScan(scan: ScanRecord): Promise<{ status: 'valid' | 'invalid' | 'warning'; message: string }> {
    try {
      const db = await connectToDatabase();
      const rules = await db.collection('scan_validation_rules').find({ is_active: true }).toArray() as ScanValidationRule[];

      for (const rule of rules) {
        // Verificar si la regla aplica al tipo de escaneo
        if (rule.scan_type !== 'any' && rule.scan_type !== scan.scan_type) {
          continue;
        }

        switch (rule.validation_type) {
          case 'format':
            if (rule.rule_pattern && !new RegExp(rule.rule_pattern).test(scan.scanned_value)) {
              return { status: 'invalid', message: rule.error_message };
            }
            break;

          case 'existence':
            // Verificar si el producto/ubicación existe
            if (scan.product_id) {
              const products = await db.collection('products').find({ id: scan.product_id }).toArray();
              if (products.length === 0) {
                return { status: 'invalid', message: 'Producto no encontrado en el sistema' };
              }
            }
            if (scan.location_id) {
              const locations = await db.collection('locations').find({ id: scan.location_id }).toArray();
              if (locations.length === 0) {
                return { status: 'invalid', message: 'Ubicación no encontrada en el sistema' };
              }
            }
            break;

          case 'quantity_check':
            if (scan.quantity && scan.quantity <= 0) {
              return { status: 'invalid', message: 'La cantidad debe ser mayor a cero' };
            }
            break;
        }
      }

      return { status: 'valid', message: 'Escaneo válido' };
    } catch (error) {
      console.error('Error validating scan:', error);
      return { status: 'invalid', message: 'Error en la validación' };
    }
  }

  static async updateSessionStats(sessionId: string, isSuccess: boolean): Promise<void> {
    try {
      const db = await connectToDatabase();
      const updateQuery = isSuccess 
        ? { $inc: { total_scans: 1, successful_scans: 1 } }
        : { $inc: { total_scans: 1, error_scans: 1 } };

      await db.collection('scan_sessions').updateOne(
        { id: sessionId },
        updateQuery
      );
    } catch (error) {
      console.error('Error updating session stats:', error);
    }
  }

  // Gestión de cámara
  static async isCameraSupported(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera support:', error);
      return false;
    }
  }

  static async getCameraDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }

  static async initializeCamera(config: CameraScanConfig): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: config.preferred_camera === 'rear' ? 'environment' : 'user',
          width: { ideal: config.resolution === 'high' ? 1920 : config.resolution === 'medium' ? 1280 : 640 },
          height: { ideal: config.resolution === 'high' ? 1080 : config.resolution === 'medium' ? 720 : 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Error initializing camera:', error);
      return null;
    }
  }

  // Gestión de métricas con fallback para missing database methods
  static async getMetrics(): Promise<ScannerMetrics> {
    try {
      const db = await connectToDatabase();
      
      const devices = await db.collection('scan_devices').find({}).toArray();
      const sessions = await db.collection('scan_sessions').find({ status: 'active' }).toArray();
      const scansToday = await db.collection('scan_records').find({
        timestamp: { $gte: new Date().toISOString().split('T')[0] }
      }).toArray();

      // Simple error aggregation fallback
      const errorRecords = await db.collection('scan_records').find({ validation_status: 'invalid' }).toArray();
      const errorStats = errorRecords.reduce((acc: any, record: any) => {
        const error = record.validation_message || 'Error desconocido';
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {});

      const topErrors = Object.entries(errorStats)
        .map(([error_type, count]) => ({ error_type, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const devicesByType = devices.reduce((acc: any, device: any) => {
        const type = device.device_type === 'mobile_app' ? 'mobile' : 
                    device.device_type === 'camera_device' ? 'camera' : device.device_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, { handheld: 0, mobile: 0, tablet: 0, camera: 0 });

      const totalScans = scansToday.length;
      const errorScans = scansToday.filter((scan: any) => scan.validation_status === 'invalid').length;

      return {
        total_devices: devices.length,
        active_sessions: sessions.length,
        scans_today: totalScans,
        error_rate: totalScans > 0 ? (errorScans / totalScans) * 100 : 0,
        devices_by_type: devicesByType,
        top_errors: topErrors
      };
    } catch (error) {
      console.error('Error getting scanner metrics:', error);
      return {
        total_devices: 0,
        active_sessions: 0,
        scans_today: 0,
        error_rate: 0,
        devices_by_type: { handheld: 0, mobile: 0, tablet: 0, camera: 0 },
        top_errors: []
      };
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

  // Gestión de reglas de validación
  static async getValidationRules(): Promise<ScanValidationRule[]> {
    try {
      const db = await connectToDatabase();
      const rules = await db.collection('scan_validation_rules').find({}).toArray() as ScanValidationRule[];
      return rules;
    } catch (error) {
      console.error('Error fetching validation rules:', error);
      return [];
    }
  }

  static async createValidationRule(ruleData: Partial<ScanValidationRule>): Promise<ScanValidationRule | null> {
    try {
      const rule: ScanValidationRule = {
        ...ruleData,
        id: `rule_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as ScanValidationRule;

      const db = await connectToDatabase();
      await db.collection('scan_validation_rules').insertOne(rule);
      return rule;
    } catch (error) {
      console.error('Error creating validation rule:', error);
      return null;
    }
  }

  // Asignación de dispositivos with updated collection method
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
      
      // Desactivar asignaciones anteriores del dispositivo usando updateOne en loop
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

  static async getDeviceAssignments(userId?: string): Promise<DeviceAssignment[]> {
    try {
      const db = await connectToDatabase();
      const filter = userId ? { user_id: userId, is_active: true } : { is_active: true };
      const assignments = await db.collection('device_assignments').find(filter).toArray() as DeviceAssignment[];
      return assignments;
    } catch (error) {
      console.error('Error fetching device assignments:', error);
      return [];
    }
  }

  // Gestión de configuración del escáner
  static async getScannerSettings(userId: string): Promise<ScannerSettings | null> {
    try {
      const db = await connectToDatabase();
      const settings = await db.collection('scanner_settings').find({ user_id: userId }).toArray();
      return settings.length > 0 ? settings[0] as ScannerSettings : null;
    } catch (error) {
      console.error('Error fetching scanner settings:', error);
      return null;
    }
  }

  static async updateScannerSettings(userId: string, settings: Partial<ScannerSettings>): Promise<ScannerSettings | null> {
    try {
      const db = await connectToDatabase();
      const updatedSettings = {
        ...settings,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // First try to find existing settings
      const existing = await db.collection('scanner_settings').find({ user_id: userId }).toArray();
      
      if (existing.length > 0) {
        // Update existing
        await db.collection('scanner_settings').updateOne(
          { user_id: userId },
          { $set: updatedSettings }
        );
      } else {
        // Insert new
        await db.collection('scanner_settings').insertOne({
          ...updatedSettings,
          id: `settings_${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }

      return await this.getScannerSettings(userId);
    } catch (error) {
      console.error('Error updating scanner settings:', error);
      return null;
    }
  }

  // NUEVOS MÉTODOS PARA STOCK MOVE
  static async createStockMoveTask(taskData: Partial<StockMoveTask>): Promise<StockMoveTask | null> {
    try {
      const task: StockMoveTask = {
        id: `task_${Date.now()}`,
        product_id: taskData.product_id || '',
        quantity_needed: taskData.quantity_needed || 0,
        source_location_id: taskData.source_location_id || '',
        destination_location_id: taskData.destination_location_id || '',
        task_type: taskData.task_type || 'replenishment',
        priority: taskData.priority || 'medium',
        status: 'pending',
        validation_code_required: true,
        created_by: taskData.created_by || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as StockMoveTask;

      const db = await connectToDatabase();
      await db.collection('stock_move_tasks').insertOne(task);
      return task;
    } catch (error) {
      console.error('Error creating stock move task:', error);
      return null;
    }
  }

  static async executeStockMove(executionData: Partial<StockMoveExecution>): Promise<StockMoveExecution | null> {
    try {
      const execution: StockMoveExecution = {
        id: `exec_${Date.now()}`,
        task_id: executionData.task_id || '',
        executed_by: executionData.executed_by || '',
        quantity_moved: executionData.quantity_moved || 0,
        validation_code_used: executionData.validation_code_used || '',
        scan_records: executionData.scan_records || [],
        execution_status: executionData.execution_status || 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      } as StockMoveExecution;

      const db = await connectToDatabase();
      await db.collection('stock_move_executions').insertOne(execution);
      
      // Actualizar el estado de la tarea
      await db.collection('stock_move_tasks').updateOne(
        { id: execution.task_id },
        { 
          $set: { 
            status: execution.execution_status === 'completed' ? 'completed' : 'in_progress',
            completed_at: execution.execution_status === 'completed' ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          }
        }
      );

      return execution;
    } catch (error) {
      console.error('Error executing stock move:', error);
      return null;
    }
  }

  static async getPendingStockMoveTasks(): Promise<StockMoveTask[]> {
    try {
      const db = await connectToDatabase();
      const tasks = await db.collection('stock_move_tasks').find({ 
        status: { $in: ['pending', 'assigned'] }
      }).sort({ priority: 1, created_at: 1 }).toArray() as StockMoveTask[];
      return tasks;
    } catch (error) {
      console.error('Error fetching pending stock move tasks:', error);
      return [];
    }
  }
}
