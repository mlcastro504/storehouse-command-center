
import { 
  BarChart3, 
  Package, 
  Users, 
  MapPin, 
  TruckIcon, 
  ScanLine,
  Settings,
  Calculator,
  MessageSquare,
  UserPlus,
  ShoppingCart,
  Archive,
  ArrowUpDown
} from 'lucide-react';

export const modules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    displayName: 'Panel Principal',
    description: 'Vista general del sistema y métricas principales',
    icon: 'BarChart3',
    path: '/dashboard',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'inventory',
    name: 'Inventory',
    displayName: 'Inventario',
    description: 'Gestión de productos, categorías y control de stock',
    icon: 'Package',
    path: '/inventory',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'locations',
    name: 'Locations',
    displayName: 'Ubicaciones',
    description: 'Gestión de almacenes, zonas y ubicaciones físicas',
    icon: 'MapPin',
    path: '/locations',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'stock-movements',
    name: 'StockMovements',
    displayName: 'Movimientos de Stock',
    description: 'Registro y seguimiento de movimientos de inventario',
    icon: 'TruckIcon',
    path: '/stock-movements',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'stock-move',
    name: 'StockMove',
    displayName: 'Stock Move',
    description: 'Módulo de reposición automática y movimientos de stock',
    icon: 'ArrowUpDown',
    path: '/stock-move',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'putaway',
    name: 'PutAway',
    displayName: 'Put Away',
    description: 'Gestión de tareas de almacenamiento y ubicación',
    icon: 'Archive',
    path: '/putaway',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'scanner',
    name: 'Scanner',
    displayName: 'Escáner',
    description: 'Sistema de escaneo y captura de códigos de barras',
    icon: 'ScanLine',
    path: '/scanner',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'loading',
    name: 'Loading',
    displayName: 'Carga',
    description: 'Gestión de muelles de carga y programación de citas',
    icon: 'TruckIcon',
    path: '/loading',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'users',
    name: 'Users',
    displayName: 'Usuarios',
    description: 'Gestión de usuarios, roles y permisos del sistema',
    icon: 'Users',
    path: '/users',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'customers',
    name: 'Customers',
    displayName: 'Clientes',
    description: 'Gestión de clientes y relaciones comerciales',
    icon: 'UserPlus',
    path: '/customers',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    displayName: 'E-commerce',
    description: 'Integración con plataformas de comercio electrónico',
    icon: 'ShoppingCart',
    path: '/ecommerce',
    isActive: true,
    requiredRoleLevel: 2
  },
  {
    id: 'accounting',
    name: 'Accounting',
    displayName: 'Contabilidad',
    description: 'Gestión contable, facturas y transacciones financieras',
    icon: 'Calculator',
    path: '/accounting',
    isActive: true,
    requiredRoleLevel: 3
  },
  {
    id: 'chat',
    name: 'Chat',
    displayName: 'Chat',
    description: 'Sistema de comunicación interna y colaboración',
    icon: 'MessageSquare',
    path: '/chat',
    isActive: true,
    requiredRoleLevel: 5
  },
  {
    id: 'settings',
    name: 'Settings',
    displayName: 'Configuración',
    description: 'Configuración del sistema y preferencias de usuario',
    icon: 'Settings',
    path: '/settings',
    isActive: true,
    requiredRoleLevel: 1
  }
];

export const getModulesForUser = (userRoleLevel: number) => {
  return modules.filter(module => 
    module.isActive && userRoleLevel >= module.requiredRoleLevel
  );
};
