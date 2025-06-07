
import { WarehouseModule } from '@/types/warehouse';

export const warehouseModules: WarehouseModule[] = [
  {
    id: 'dashboard',
    name: 'dashboard',
    displayName: 'Dashboard',
    description: 'Panel principal con KPIs y resumen general',
    icon: 'LayoutDashboard',
    isActive: true,
    requiredRoleLevel: 10,
    path: '/dashboard'
  },
  {
    id: 'inventory',
    name: 'inventory',
    displayName: 'Inventario',
    description: 'Gestión de productos y stock',
    icon: 'Package',
    isActive: true,
    requiredRoleLevel: 5,
    path: '/inventory'
  },
  {
    id: 'locations',
    name: 'locations',
    displayName: 'Ubicaciones',
    description: 'Gestión de ubicaciones del almacén',
    icon: 'MapPin',
    isActive: true,
    requiredRoleLevel: 4,
    path: '/locations'
  },
  {
    id: 'putaway',
    name: 'putaway',
    displayName: 'Put Away',
    description: 'Proceso de almacenamiento de productos',
    icon: 'ArrowDownToLine',
    isActive: true,
    requiredRoleLevel: 6,
    path: '/putaway'
  },
  {
    id: 'stockmove',
    name: 'stockmove',
    displayName: 'Movimientos',
    description: 'Movimientos de stock y transferencias',
    icon: 'ArrowRightLeft',
    isActive: true,
    requiredRoleLevel: 6,
    path: '/stock-movements'
  },
  {
    id: 'picking',
    name: 'picking',
    displayName: 'Picking',
    description: 'Sistema de picking por voz',
    icon: 'Mic',
    isActive: true,
    requiredRoleLevel: 7,
    path: '/picking'
  },
  {
    id: 'scanner',
    name: 'scanner',
    displayName: 'Escáner',
    description: 'Escáner de códigos de barras',
    icon: 'ScanLine',
    isActive: true,
    requiredRoleLevel: 8,
    path: '/scanner'
  },
  {
    id: 'loading',
    name: 'loading',
    displayName: 'Carga/Descarga',
    description: 'Gestión de carga y descarga',
    icon: 'Truck',
    isActive: true,
    requiredRoleLevel: 7,
    path: '/loading'
  },
  {
    id: 'docks',
    name: 'docks',
    displayName: 'Muelles',
    description: 'Gestión de muelles de carga',
    icon: 'Anchor',
    isActive: true,
    requiredRoleLevel: 6,
    path: '/docks'
  },
  {
    id: 'customers',
    name: 'customers',
    displayName: 'Clientes',
    description: 'Gestión de clientes y proveedores',
    icon: 'Users',
    isActive: true,
    requiredRoleLevel: 4,
    path: '/customers'
  },
  {
    id: 'ecommerce',
    name: 'ecommerce',
    displayName: 'E-commerce',
    description: 'Integración con plataformas de e-commerce',
    icon: 'ShoppingCart',
    isActive: true,
    requiredRoleLevel: 3,
    path: '/ecommerce'
  },
  {
    id: 'accounting',
    name: 'accounting',
    displayName: 'Contabilidad',
    description: 'Módulo de contabilidad y facturación',
    icon: 'Calculator',
    isActive: true,
    requiredRoleLevel: 3,
    path: '/accounting'
  },
  {
    id: 'chat',
    name: 'chat',
    displayName: 'Chat',
    description: 'Chat interno del equipo',
    icon: 'MessageSquare',
    isActive: true,
    requiredRoleLevel: 8,
    path: '/chat'
  },
  {
    id: 'users',
    name: 'users',
    displayName: 'Usuarios',
    description: 'Gestión de usuarios y operadores',
    icon: 'UserCog',
    isActive: true,
    requiredRoleLevel: 2,
    path: '/users'
  },
  {
    id: 'reports',
    name: 'reports',
    displayName: 'Reportes',
    description: 'Reportes y analítica avanzada',
    icon: 'BarChart3',
    isActive: true,
    requiredRoleLevel: 4,
    path: '/reports'
  },
  {
    id: 'help',
    name: 'help',
    displayName: 'Manual',
    description: 'Manual de usuario y ayuda',
    icon: 'HelpCircle',
    isActive: true,
    requiredRoleLevel: 10,
    path: '/help'
  }
];

export const getModulesForUser = (userRoleLevel: number) => {
  return warehouseModules.filter(module => 
    module.isActive && userRoleLevel <= module.requiredRoleLevel
  );
};
