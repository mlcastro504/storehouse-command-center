
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
  ArrowUpDown,
  ClipboardList,
  Truck
} from 'lucide-react';

export const modules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    displayName: 'dashboard:title',
    description: 'Vista general del sistema y métricas principales',
    icon: 'BarChart3',
    path: '/dashboard',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'inventory',
    name: 'Inventory',
    displayName: 'inventory:title',
    description: 'Gestión de productos, categorías y control de stock',
    icon: 'Package',
    path: '/inventory',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'locations',
    name: 'Locations',
    displayName: 'locations:title',
    description: 'Gestión de almacenes, zonas y ubicaciones físicas',
    icon: 'MapPin',
    path: '/locations',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'suppliers',
    name: 'Suppliers',
    displayName: 'suppliers:title',
    description: 'Gestión de proveedores y relaciones comerciales',
    icon: 'Truck',
    path: '/suppliers',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'picking',
    name: 'Picking',
    displayName: 'picking:title',
    description: 'Gestión de tareas de recolección de productos',
    icon: 'ClipboardList',
    path: '/picking',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'stock-movements',
    name: 'StockMovements',
    displayName: 'stock-movements:title',
    description: 'Registro y seguimiento de movimientos de inventario',
    icon: 'TruckIcon',
    path: '/stock-movements',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'stock-move',
    name: 'StockMove',
    displayName: 'stock-move:title',
    description: 'Módulo de reposición automática y movimientos de stock',
    icon: 'ArrowUpDown',
    path: '/stock-move',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'putaway',
    name: 'PutAway',
    displayName: 'putaway:title',
    description: 'Gestión de tareas de almacenamiento y ubicación',
    icon: 'Archive',
    path: '/putaway',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'scanner',
    name: 'Scanner',
    displayName: 'scanner:title',
    description: 'Sistema de escaneo y captura de códigos de barras',
    icon: 'ScanLine',
    path: '/scanner',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'loading',
    name: 'Loading',
    displayName: 'loading:title',
    description: 'Gestión de muelles de carga y programación de citas',
    icon: 'TruckIcon',
    path: '/loading',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'users',
    name: 'Users',
    displayName: 'users:title',
    description: 'Gestión de usuarios, roles y permisos del sistema',
    icon: 'Users',
    path: '/users',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'customers',
    name: 'Customers',
    displayName: 'customers:title',
    description: 'Gestión de clientes y relaciones comerciales',
    icon: 'UserPlus',
    path: '/customers',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    displayName: 'ecommerce:title',
    description: 'Integración con plataformas de comercio electrónico',
    icon: 'ShoppingCart',
    path: '/ecommerce',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'accounting',
    name: 'Accounting',
    displayName: 'accounting:title',
    description: 'Gestión contable, facturas y transacciones financieras',
    icon: 'Calculator',
    path: '/accounting',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'chat',
    name: 'Chat',
    displayName: 'chat:title',
    description: 'Sistema de comunicación interna y colaboración',
    icon: 'MessageSquare',
    path: '/chat',
    isActive: true,
    requiredRoleLevel: 1
  },
  {
    id: 'settings',
    name: 'Settings',
    displayName: 'settings:title',
    description: 'Configuración del sistema y preferencias de usuario',
    icon: 'Settings',
    path: '/settings',
    isActive: true,
    requiredRoleLevel: 1
  }
];

export const getModulesForUser = (userRoleLevel: number) => {
  console.log('Filtering modules for role level:', userRoleLevel);
  const filteredModules = modules.filter(module => 
    module.isActive && userRoleLevel >= module.requiredRoleLevel
  );
  console.log('Filtered modules:', filteredModules);
  return filteredModules;
};
