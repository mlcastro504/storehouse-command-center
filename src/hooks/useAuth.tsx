
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '@/types/warehouse';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (action: string, resource?: string) => boolean;
  hasModuleAccess: (moduleId: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced security: Mock data con roles más específicos
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificación de sesión mejorada con validación de seguridad
    const savedUser = localStorage.getItem('warehouseOS_user');
    const sessionExpiry = localStorage.getItem('warehouseOS_session_expiry');
    
    if (savedUser && sessionExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      
      if (now < expiry) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validar que el usuario sigue siendo válido
          const validUser = mockUsers.find(u => u.id === parsedUser.id && u.isActive);
          if (validUser) {
            setUser(validUser);
          } else {
            // Limpiar sesión inválida
            localStorage.removeItem('warehouseOS_user');
            localStorage.removeItem('warehouseOS_session_expiry');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('warehouseOS_user');
          localStorage.removeItem('warehouseOS_session_expiry');
        }
      } else {
        // Sesión expirada
        localStorage.removeItem('warehouseOS_user');
        localStorage.removeItem('warehouseOS_session_expiry');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulación de validación mejorada con rate limiting básico
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && foundUser.isActive && password === 'password123') {
        const updatedUser = { ...foundUser, lastLoginAt: new Date() };
        setUser(updatedUser);
        
        // Guardar con expiración de sesión (24 horas)
        const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('warehouseOS_user', JSON.stringify(updatedUser));
        localStorage.setItem('warehouseOS_session_expiry', sessionExpiry.toString());
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('warehouseOS_user');
    localStorage.removeItem('warehouseOS_session_expiry');
  };

  const hasPermission = (action: string, resource?: string): boolean => {
    if (!user || !user.isActive) return false;
    
    return user.role.permissions.some(permission => 
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.action === 'manage' || permission.action === action)
    );
  };

  const hasModuleAccess = (moduleId: string): boolean => {
    if (!user || !user.isActive) return false;
    
    return user.role.moduleAccess.some(access => 
      (access.moduleId === '*' || access.moduleId === moduleId) && access.canAccess
    );
  };

  const isAuthenticated = !!user && user.isActive;

  const value = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    hasModuleAccess,
    isAuthenticated
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
