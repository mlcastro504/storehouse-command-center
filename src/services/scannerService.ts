import { BrowserStorage } from '@/lib/browserStorage';
import { ScanSession, ScanDevice, ScanRecord, ScanValidationRule, ScannerMetrics } from '@/types/scanner';

export class ScannerService {
  static async getScanSessions(): Promise<ScanSession[]> {
    return await BrowserStorage.find('scan_sessions');
  }

  static async createScanSession(sessionData: Partial<ScanSession>): Promise<ScanSession> {
    const newSession: ScanSession = {
      id: Date.now().toString(),
      session_id: `session_${Date.now()}`,
      session_type: sessionData.session_type || 'inventory',
      device_id: sessionData.device_id || '',
      user_id: sessionData.user_id || 'current_user',
      status: 'active',
      started_at: new Date().toISOString(),
      total_scans: 0,
      successful_scans: 0,
      error_scans: 0,
      scan_records: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: sessionData.name || `Session ${Date.now()}`,
      description: sessionData.description || '',
      is_active: true,
      scan_count: 0,
      error_count: 0,
      last_scan_at: null,
      config: sessionData.config || {
        validation_enabled: true,
        allow_duplicates: false,
        auto_complete: false,
        sound_enabled: true,
        vibration_enabled: true,
        continuous_mode: false
      }
    };

    await BrowserStorage.insertOne('scan_sessions', newSession);
    return newSession;
  }

  static async getSessions(): Promise<ScanSession[]> {
    return this.getScanSessions();
  }

  static async createSession(sessionData: Partial<ScanSession>): Promise<ScanSession> {
    return this.createScanSession(sessionData);
  }

  static async getActiveSessions(): Promise<ScanSession[]> {
    return await BrowserStorage.find('scan_sessions', { is_active: true });
  }

  static async getDevices(): Promise<ScanDevice[]> {
    return this.getScanDevices();
  }

  static async getScanDevices(): Promise<ScanDevice[]> {
    return await BrowserStorage.find('scan_devices');
  }

  static async createDevice(deviceData: Partial<ScanDevice>): Promise<ScanDevice> {
    const newDevice: ScanDevice = {
      id: Date.now().toString(),
      device_id: `${deviceData.device_type || 'device'}_${Date.now()}`,
      device_type: deviceData.device_type || 'mobile_app',
      device_name: deviceData.device_name || deviceData.name || `Device ${Date.now()}`,
      connection_status: 'connected',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sync_at: new Date().toISOString(),
      status: 'active',
      name: deviceData.device_name || deviceData.name || `Device ${Date.now()}`,
      type: deviceData.device_type === 'mobile_app' ? 'mobile' : 
            deviceData.device_type === 'camera_device' ? 'camera' :
            deviceData.device_type === 'tablet' ? 'tablet' : 'handheld',
      capabilities: {
        has_camera: deviceData.device_type === 'mobile_app' || deviceData.device_type === 'tablet' || deviceData.device_type === 'camera_device',
        has_rear_camera: deviceData.device_type === 'mobile_app' || deviceData.device_type === 'tablet',
        has_front_camera: deviceData.device_type === 'mobile_app' || deviceData.device_type === 'tablet',
        supports_barcode: true,
        supports_qr: true,
        supports_rfid: deviceData.device_type === 'handheld',
        can_vibrate: deviceData.device_type === 'mobile_app' || deviceData.device_type === 'tablet',
        has_flashlight: deviceData.device_type === 'mobile_app' || deviceData.device_type === 'tablet' || deviceData.device_type === 'handheld'
      },
      settings: {
        preferred_camera: 'rear',
        vibration_enabled: true,
        sound_enabled: true,
        flashlight_enabled: false,
        auto_focus: true,
        scan_timeout: 5000,
        validation_mode: 'normal'
      },
      config: deviceData.config || {
        preferred_camera: 'rear',
        enabled: true,
        resolution: 'medium',
        auto_focus: true,
        flash_mode: 'auto',
        scan_area_overlay: true,
        continuous_scan: false,
        beep_on_scan: true,
        vibrate_on_scan: true,
        quality: 'medium',
        flashEnabled: false,
        autoFocus: true,
        formats: ['CODE_128', 'QR_CODE']
      }
    };

    await BrowserStorage.insertOne('scan_devices', newDevice);
    return newDevice;
  }

  static async updateScanSession(sessionId: string, updates: Partial<ScanSession>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_sessions', 
      { id: sessionId }, 
      { $set: { ...updates, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async deleteScanSession(sessionId: string): Promise<boolean> {
    const result = await BrowserStorage.deleteOne('scan_sessions', { id: sessionId });
    return result.deletedCount > 0;
  }

  static async getActiveScanSession(): Promise<ScanSession | null> {
    return await BrowserStorage.findOne('scan_sessions', { is_active: true });
  }

  static async updateDevice(deviceId: string, updates: Partial<ScanDevice>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { ...updates, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async deleteDevice(deviceId: string): Promise<boolean> {
    const result = await BrowserStorage.deleteOne('scan_devices', { id: deviceId });
    return result.deletedCount > 0;
  }

  static async pingDevice(deviceId: string): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { last_sync_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async assignUserToDevice(deviceId: string, userId: string): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { user_id: userId, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async unassignUserFromDevice(deviceId: string): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { user_id: null, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async getDevicesByUser(userId: string): Promise<ScanDevice[]> {
    return await BrowserStorage.find('scan_devices', { user_id: userId });
  }

  static async bulkUpdateDeviceStatus(deviceIds: string[], status: string): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_devices');
    const result = await collection.updateMany(
      { id: { $in: deviceIds } }, 
      { $set: { status, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async isCameraSupported(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera not supported:', error);
      return false;
    }
  }

  static async initializeCamera(config: any): Promise<MediaStream | null> {
    try {
      const constraints = {
        video: {
          facingMode: config.preferred_camera === 'rear' ? 'environment' : 'user',
          width: { ideal: config.resolution === 'high' ? 1920 : config.resolution === 'medium' ? 1280 : 640 },
          height: { ideal: config.resolution === 'high' ? 1080 : config.resolution === 'medium' ? 720 : 480 }
        }
      };
      
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error('Error initializing camera:', error);
      return null;
    }
  }

  static async getScanRecords(sessionId?: string): Promise<ScanRecord[]> {
    const filter = sessionId ? { session_id: sessionId } : {};
    return await BrowserStorage.find('scan_records', filter);
  }

  static async createScanRecord(recordData: Partial<ScanRecord>): Promise<ScanRecord> {
    const newRecord: ScanRecord = {
      id: Date.now().toString(),
      session_id: recordData.session_id || '',
      device_id: recordData.device_id || '',
      scanned_value: recordData.scanned_value || '',
      scan_type: recordData.scan_type || 'barcode',
      timestamp: new Date().toISOString(),
      validation_status: recordData.is_valid !== false ? 'valid' : 'invalid',
      user_id: recordData.user_id || 'current_user',
      retry_count: 0,
      is_valid: recordData.is_valid !== false,
      validation_errors: recordData.validation_errors || [],
      metadata: recordData.metadata || {}
    };

    await BrowserStorage.insertOne('scan_records', newRecord);
    
    // Update session scan count
    if (recordData.session_id) {
      const collection = BrowserStorage.collection('scan_sessions');
      await collection.updateOne(
        { id: recordData.session_id },
        { $inc: { scan_count: 1 }, $set: { last_scan_at: new Date() } }
      );
    }

    return newRecord;
  }

  static async validateScan(sessionId: string, scannedData: string, scanType: 'barcode' | 'qr_code' | 'manual_entry' = 'barcode'): Promise<ScanRecord> {
    const validationRules = await this.getValidationRules();
    const errors: string[] = [];
    
    // Apply validation rules
    for (const rule of validationRules) {
      if (rule.is_active && rule.rule_pattern) {
        const regex = new RegExp(rule.rule_pattern);
        if (!regex.test(scannedData)) {
          errors.push(rule.error_message);
        }
      }
    }

    const record = await this.createScanRecord({
      session_id: sessionId,
      scanned_value: scannedData,
      scan_type: scanType,
      is_valid: errors.length === 0,
      validation_errors: errors
    });

    return record;
  }

  static async processScan(data: { sessionId: string; scannedData: string; scanType: string }): Promise<ScanRecord> {
    return this.validateScan(data.sessionId, data.scannedData, data.scanType as 'barcode' | 'qr_code' | 'manual_entry');
  }

  static async deleteScanRecord(recordId: string): Promise<boolean> {
    const result = await BrowserStorage.deleteOne('scan_records', { id: recordId });
    return result.deletedCount > 0;
  }

  static async getValidationRules(): Promise<ScanValidationRule[]> {
    return await BrowserStorage.find('scan_validation_rules');
  }

  static async createValidationRule(ruleData: Partial<ScanValidationRule>): Promise<ScanValidationRule> {
    const newRule: ScanValidationRule = {
      id: Date.now().toString(),
      rule_name: ruleData.rule_name || ruleData.name || `Rule ${Date.now()}`,
      description: ruleData.description || '',
      scan_type: ruleData.scan_type || 'any',
      validation_type: ruleData.validation_type || 'format',
      rule_pattern: ruleData.rule_pattern || ruleData.pattern || '.*',
      error_message: ruleData.error_message || 'Invalid format',
      is_active: ruleData.is_active !== false,
      priority: ruleData.priority || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: ruleData.rule_name || ruleData.name || `Rule ${Date.now()}`,
      pattern: ruleData.rule_pattern || ruleData.pattern || '.*',
      rule_type: ruleData.rule_type || 'format'
    };

    await BrowserStorage.insertOne('scan_validation_rules', newRule);
    return newRule;
  }

  static async updateValidationRule(ruleId: string, updates: Partial<ScanValidationRule>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_validation_rules', 
      { id: ruleId }, 
      { $set: { ...updates, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async deleteValidationRule(ruleId: string): Promise<boolean> {
    const result = await BrowserStorage.deleteOne('scan_validation_rules', { id: ruleId });
    return result.deletedCount > 0;
  }

  static async getScannerMetrics(): Promise<ScannerMetrics> {
    const devices = await this.getScanDevices();
    const sessions = await this.getScanSessions();
    const records = await this.getScanRecords();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scansToday = records.filter(record => 
      new Date(record.timestamp) >= today
    ).length;
    
    const errorRate = records.length > 0 
      ? (records.filter(record => record.validation_status === 'invalid' || record.is_valid === false).length / records.length) * 100 
      : 0;

    return {
      total_devices: devices.length,
      active_sessions: sessions.filter(s => s.is_active || s.status === 'active').length,
      scans_today: scansToday,
      error_rate: errorRate,
      devices_by_type: devices.reduce((acc, device) => {
        const deviceType = device.type || 'mobile';
        acc[deviceType as keyof typeof acc] = (acc[deviceType as keyof typeof acc] || 0) + 1;
        return acc;
      }, { handheld: 0, mobile: 0, tablet: 0, camera: 0 }),
      top_errors: records
        .filter(record => record.validation_status === 'invalid' || record.is_valid === false)
        .flatMap(record => record.validation_errors || [])
        .reduce((acc, error) => {
          const existing = acc.find(item => item.error_type === error);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ error_type: error, count: 1 });
          }
          return acc;
        }, [] as Array<{ error_type: string; count: number }>)
    };
  }

  static async getMetrics(): Promise<ScannerMetrics> {
    return this.getScannerMetrics();
  }

  static async exportScanData(sessionId?: string): Promise<any[]> {
    const records = await this.getScanRecords(sessionId);
    return records.map(record => ({
      timestamp: record.timestamp,
      scanned_value: record.scanned_value,
      scan_type: record.scan_type,
      is_valid: record.is_valid || record.validation_status === 'valid',
      validation_errors: (record.validation_errors || []).join(', '),
      session_id: record.session_id,
      device_id: record.device_id
    }));
  }

  static async updateDeviceConfig(deviceId: string, config: any): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_devices');
    const result = await collection.replaceOne(
      { id: deviceId },
      { config, updated_at: new Date().toISOString() },
      { upsert: false }
    );
    return result.modifiedCount > 0;
  }

  static async getDeviceConfig(deviceId: string): Promise<any | null> {
    const device = await BrowserStorage.findOne('scan_devices', { id: deviceId });
    return device?.config || null;
  }

  static async resetDeviceConfig(deviceId: string): Promise<boolean> {
    const defaultConfig = {
      preferred_camera: 'rear',
      enabled: true,
      resolution: 'medium',
      auto_focus: true,
      flash_mode: 'auto',
      scan_area_overlay: true,
      continuous_scan: false,
      beep_on_scan: true,
      vibrate_on_scan: true,
      quality: 'medium',
      flashEnabled: false,
      autoFocus: true,
      formats: ['CODE_128', 'QR_CODE']
    };

    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { config: defaultConfig, updated_at: new Date().toISOString() } }
    );
    return result.modifiedCount > 0;
  }

  static async updateSessionConfig(sessionId: string, config: any): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_sessions');
    const result = await collection.replaceOne(
      { id: sessionId },
      { config, updated_at: new Date().toISOString() },
      { upsert: false }
    );
    return result.modifiedCount > 0;
  }

  static async getSessionConfig(sessionId: string): Promise<any | null> {
    const session = await BrowserStorage.findOne('scan_sessions', { id: sessionId });
    return session?.config || null;
  }

  // Stock move integration methods
  static async getPendingStockMoveTasks(): Promise<any[]> {
    return await BrowserStorage.find('stock_move_tasks', { status: 'pending' });
  }

  static async createStockMoveTask(taskData: any): Promise<any> {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending'
    };

    await BrowserStorage.insertOne('stock_move_tasks', newTask);
    return newTask;
  }

  static async executeStockMove(taskId: string, scanData: any): Promise<any> {
    const result = await BrowserStorage.updateOne('stock_move_tasks', 
      { id: taskId }, 
      { $set: { status: 'completed', scan_data: scanData, completed_at: new Date().toISOString() } }
    );
    
    return {
      success: result.modifiedCount > 0,
      executionStatus: result.modifiedCount > 0 ? 'completed' : 'failed'
    };
  }

  // Device assignment methods
  static async getDeviceAssignments(userId?: string): Promise<any[]> {
    const filter = userId ? { user_id: userId } : {};
    return await BrowserStorage.find('device_assignments', filter);
  }

  static async assignDevice(deviceId: string, userId: string, assignedBy: string, assignmentType: string): Promise<any> {
    const assignment = {
      id: Date.now().toString(),
      device_id: deviceId,
      user_id: userId,
      assigned_by: assignedBy,
      assignment_type: assignmentType,
      assigned_at: new Date().toISOString(),
      is_active: true
    };

    await BrowserStorage.insertOne('device_assignments', assignment);
    
    // Update device with user assignment
    await this.assignUserToDevice(deviceId, userId);
    
    return assignment;
  }
}
