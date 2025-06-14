
// Tipos principales del sistema WarehouseOS

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  teamId?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number; // 1-10, donde 1 es admin supremo
  permissions: Permission[];
  moduleAccess: ModuleAccess[];
}

export interface Permission {
  id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'assign' | 'manage' | 'execute';
  resource: string;
}

export interface ModuleAccess {
  moduleId: string;
  canAccess: boolean;
  permissions: string[];
}

export interface WarehouseModule {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
  requiredRoleLevel: number;
  path: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  moduleAccess: string[];
}

export interface KPI {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  format: 'number' | 'percentage' | 'currency';
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  module: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplierId?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'zone' | 'aisle' | 'rack' | 'shelf' | 'bin';
  parentId?: string;
  capacity: number;
  currentOccupancy: number;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  toLocationId: string;
  quantity: number;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  reason: string;
  performedBy: string;
  timestamp: Date;
}
