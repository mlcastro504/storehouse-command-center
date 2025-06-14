
export class SecurityUtils {
  // Validación de entrada para prevenir inyecciones
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.replace(/[<>'"]/g, '');
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  // Validación de permisos en operaciones
  static validateOperation(operation: string, resource: string, userPermissions: any[]): boolean {
    return userPermissions.some(permission => 
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.action === 'manage' || permission.action === operation)
    );
  }

  // Validación de rate limiting básico
  static checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowKey = `${key}_${Math.floor(now / windowMs)}`;
    
    const currentCount = parseInt(localStorage.getItem(windowKey) || '0');
    if (currentCount >= maxRequests) {
      return false;
    }
    
    localStorage.setItem(windowKey, (currentCount + 1).toString());
    return true;
  }

  // Validación de tokens de sesión
  static validateSession(): boolean {
    const sessionExpiry = localStorage.getItem('warehouseOS_session_expiry');
    if (!sessionExpiry) return false;
    
    const now = new Date().getTime();
    const expiry = parseInt(sessionExpiry);
    
    return now < expiry;
  }

  // Generar logs de auditoría
  static logActivity(action: string, resource: string, userId: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      resource,
      userId,
      details: details || {},
      userAgent: navigator.userAgent,
      ip: 'localhost' // En producción, obtener IP real
    };
    
    const logs = JSON.parse(localStorage.getItem('warehouseOS_audit_logs') || '[]');
    logs.push(logEntry);
    
    // Mantener solo los últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('warehouseOS_audit_logs', JSON.stringify(logs));
  }

  // Validar estructura de datos
  static validateDataStructure(data: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`Campo requerido: ${field}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
