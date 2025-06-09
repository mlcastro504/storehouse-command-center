import { BrowserStorage } from '@/lib/browserStorage';
import { ScanSession, ScanDevice, ScanRecord, ScanValidationRule, ScannerMetrics } from '@/types/scanner';

export class ScannerService {
  static async getScanSessions(): Promise<ScanSession[]> {
    return await BrowserStorage.find('scan_sessions');
  }

  static async createScanSession(sessionData: Partial<ScanSession>): Promise<ScanSession> {
    const newSession: ScanSession = {
      id: Date.now().toString(),
      name: sessionData.name || `Session ${Date.now()}`,
      description: sessionData.description || '',
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
      user_id: sessionData.user_id || 'current_user',
      session_type: sessionData.session_type || 'inventory',
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

  static async updateScanSession(sessionId: string, updates: Partial<ScanSession>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_sessions', 
      { id: sessionId }, 
      { $set: { ...updates, updated_at: new Date() } }
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

  static async getScanDevices(): Promise<ScanDevice[]> {
    return await BrowserStorage.find('scan_devices');
  }

  static async createDevice(deviceData: Partial<ScanDevice>): Promise<ScanDevice> {
    const newDevice: ScanDevice = {
      id: Date.now().toString(),
      name: deviceData.name || `Device ${Date.now()}`,
      type: deviceData.type || 'mobile',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      last_ping_at: new Date(),
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

  static async updateDevice(deviceId: string, updates: Partial<ScanDevice>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { ...updates, updated_at: new Date() } }
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
      { $set: { last_ping_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async assignUserToDevice(deviceId: string, userId: string): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { user_id: userId, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async unassignUserFromDevice(deviceId: string): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_devices', 
      { id: deviceId }, 
      { $set: { user_id: null, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async getDevicesByUser(userId: string): Promise<ScanDevice[]> {
    return await BrowserStorage.find('scan_devices', { user_id: userId });
  }

  static async bulkUpdateDeviceStatus(deviceIds: string[], status: ScanDevice['status']): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_devices');
    const result = await collection.updateMany(
      { id: { $in: deviceIds } }, 
      { $set: { status, updated_at: new Date() } }
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
      timestamp: new Date(),
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

  static async validateScan(sessionId: string, scannedData: string, scanType: 'barcode' | 'qr_code' | 'manual' = 'barcode'): Promise<ScanRecord> {
    const validationRules = await this.getValidationRules();
    const errors: string[] = [];
    
    // Apply validation rules
    for (const rule of validationRules) {
      if (rule.is_active) {
        const regex = new RegExp(rule.pattern);
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
      name: ruleData.name || `Rule ${Date.now()}`,
      description: ruleData.description || '',
      pattern: ruleData.pattern || '.*',
      error_message: ruleData.error_message || 'Invalid format',
      is_active: ruleData.is_active !== false,
      created_at: new Date(),
      updated_at: new Date(),
      rule_type: ruleData.rule_type || 'format'
    };

    await BrowserStorage.insertOne('scan_validation_rules', newRule);
    return newRule;
  }

  static async updateValidationRule(ruleId: string, updates: Partial<ScanValidationRule>): Promise<boolean> {
    const result = await BrowserStorage.updateOne('scan_validation_rules', 
      { id: ruleId }, 
      { $set: { ...updates, updated_at: new Date() } }
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
      ? (records.filter(record => !record.is_valid).length / records.length) * 100 
      : 0;

    return {
      totalDevices: devices.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      scansToday,
      errorRate,
      devicesByType: devices.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      topErrors: records
        .filter(record => !record.is_valid)
        .flatMap(record => record.validation_errors)
        .reduce((acc, error) => {
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };
  }

  static async exportScanData(sessionId?: string): Promise<any[]> {
    const records = await this.getScanRecords(sessionId);
    return records.map(record => ({
      timestamp: record.timestamp,
      scanned_value: record.scanned_value,
      scan_type: record.scan_type,
      is_valid: record.is_valid,
      validation_errors: record.validation_errors.join(', '),
      session_id: record.session_id,
      device_id: record.device_id
    }));
  }

  static async updateDeviceConfig(deviceId: string, config: any): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_devices');
    const result = await collection.replaceOne(
      { id: deviceId },
      { config, updated_at: new Date() },
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
      { $set: { config: defaultConfig, updated_at: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  static async updateSessionConfig(sessionId: string, config: any): Promise<boolean> {
    const collection = BrowserStorage.collection('scan_sessions');
    const result = await collection.replaceOne(
      { id: sessionId },
      { config, updated_at: new Date() },
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
      created_at: new Date(),
      updated_at: new Date(),
      status: 'pending'
    };

    await BrowserStorage.insertOne('stock_move_tasks', newTask);
    return newTask;
  }

  static async executeStockMove(taskId: string, scanData: any): Promise<any> {
    const result = await BrowserStorage.updateOne('stock_move_tasks', 
      { id: taskId }, 
      { $set: { status: 'completed', scan_data: scanData, completed_at: new Date() } }
    );
    
    return {
      success: result.modifiedCount > 0,
      executionStatus: result.modifiedCount > 0 ? 'completed' : 'failed'
    };
  }

  // Device assignment methods
  static async getDeviceAssignments(): Promise<any[]> {
    const devices = await this.getScanDevices();
    return devices.filter(device => device.user_id).map(device => ({
      device_id: device.id,
      user_id: device.user_id,
      assigned_at: device.updated_at
    }));
  }
}
