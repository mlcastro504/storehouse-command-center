
import { User, Role } from '@/types/warehouse';

// Enhanced security: Mock data con roles más específicos
export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    displayName: 'Administrator',
    level: 1,
    permissions: [{ id: '1', action: 'manage', resource: '*' }],
    moduleAccess: [{ moduleId: '*', canAccess: true, permissions: ['*'] }]
  },
  {
    id: '2',
    name: 'manager',
    displayName: 'Warehouse Manager',
    level: 3,
    permissions: [
      { id: '2', action: 'read', resource: 'dashboard' },
      { id: '3', action: 'manage', resource: 'inventory' },
      { id: '4', action: 'assign', resource: 'tasks' },
      { id: '5', action: 'read', resource: 'reports' }
    ],
    moduleAccess: [
      { moduleId: 'dashboard', canAccess: true, permissions: ['read'] },
      { moduleId: 'inventory', canAccess: true, permissions: ['manage'] },
      { moduleId: 'picking', canAccess: true, permissions: ['manage'] },
      { moduleId: 'putaway', canAccess: true, permissions: ['manage'] },
      { moduleId: 'stock-movements', canAccess: true, permissions: ['read', 'create'] },
      { moduleId: 'locations', canAccess: true, permissions: ['read', 'create'] },
      { moduleId: 'suppliers', canAccess: true, permissions: ['read'] },
      { moduleId: 'reports', canAccess: true, permissions: ['read'] }
    ]
  },
  {
    id: '3',
    name: 'operator',
    displayName: 'Warehouse Operator',
    level: 5,
    permissions: [
      { id: '6', action: 'read', resource: 'dashboard' },
      { id: '7', action: 'execute', resource: 'tasks' },
      { id: '8', action: 'update', resource: 'stock' }
    ],
    moduleAccess: [
      { moduleId: 'dashboard', canAccess: true, permissions: ['read'] },
      { moduleId: 'picking', canAccess: true, permissions: ['read', 'execute'] },
      { moduleId: 'putaway', canAccess: true, permissions: ['read', 'execute'] },
      { moduleId: 'scanner', canAccess: true, permissions: ['read', 'execute'] },
      { moduleId: 'stock-move', canAccess: true, permissions: ['read', 'execute'] }
    ]
  },
  {
    id: '4',
    name: 'driver',
    displayName: 'Driver',
    level: 7,
    permissions: [
      { id: '9', action: 'read', resource: 'tasks' },
      { id: '10', action: 'update', resource: 'deliveries' }
    ],
    moduleAccess: [
      { moduleId: 'dashboard', canAccess: true, permissions: ['read'] },
      { moduleId: 'loading', canAccess: true, permissions: ['read', 'update'] }
    ]
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@warehouseos.com',
    firstName: 'Admin',
    lastName: 'User',
    role: mockRoles[0],
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: '2',
    email: 'manager@warehouseos.com',
    firstName: 'John',
    lastName: 'Manager',
    role: mockRoles[1],
    teamId: 'team-1',
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: '3',
    email: 'operator@warehouseos.com',
    firstName: 'Jane',
    lastName: 'Operator',
    role: mockRoles[2],
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: '4',
    email: 'driver@warehouseos.com',
    firstName: 'Mike',
    lastName: 'Driver',
    role: mockRoles[3],
    teamId: 'team-3',
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];
