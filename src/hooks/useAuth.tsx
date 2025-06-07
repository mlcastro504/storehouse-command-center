
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types/warehouse';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (action: string, resource?: string) => boolean;
  hasModuleAccess: (moduleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data para desarrollo - reemplazar con Supabase
const mockRoles: Role[] = [
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
      { id: '4', action: 'assign', resource: 'tasks' }
    ],
    moduleAccess: [
      { moduleId: 'dashboard', canAccess: true, permissions: ['read'] },
      { moduleId: 'inventory', canAccess: true, permissions: ['manage'] },
      { moduleId: 'reports', canAccess: true, permissions: ['read'] }
    ]
  },
  {
    id: '3',
    name: 'driver',
    displayName: 'Driver',
    level: 7,
    permissions: [
      { id: '5', action: 'read', resource: 'tasks' },
      { id: '6', action: 'update', resource: 'deliveries' }
    ],
    moduleAccess: [
      { moduleId: 'dashboard', canAccess: true, permissions: ['read'] },
      { moduleId: 'loading', canAccess: true, permissions: ['read', 'update'] }
    ]
  }
];

const mockUsers: User[] = [
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
    email: 'driver@warehouseos.com',
    firstName: 'Mike',
    lastName: 'Driver',
    role: mockRoles[2],
    teamId: 'team-2',
    isActive: true,
    createdAt: new Date(),
    lastLoginAt: new Date()
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de sesión existente
    const savedUser = localStorage.getItem('warehouseOS_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular autenticación - reemplazar con Supabase
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password123') {
      const updatedUser = { ...foundUser, lastLoginAt: new Date() };
      setUser(updatedUser);
      localStorage.setItem('warehouseOS_user', JSON.stringify(updatedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('warehouseOS_user');
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!user) return false;
    
    return user.role.permissions.some(permission => 
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.action === 'manage' || permission.action === action)
    );
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user) return false;
    
    return user.role.moduleAccess.some(access => 
      (access.moduleId === '*' || access.moduleId === moduleId) && access.canAccess
    );
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasModuleAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
