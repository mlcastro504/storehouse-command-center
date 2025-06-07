
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

// Mock roles para mantener compatibilidad
const mockRoles: Role[] = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'admin',
    displayName: 'Administrator',
    level: 1,
    permissions: [{ id: '1', action: 'manage', resource: '*' }],
    moduleAccess: [{ moduleId: '*', canAccess: true, permissions: ['*'] }]
  },
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
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
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
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

// Función para convertir usuario de Supabase a formato de aplicación
function convertSupabaseUserToAppUser(supabaseUser: SupabaseUser): User {
  // Determinar rol basado en el email (temporal)
  let role = mockRoles[2]; // driver por defecto
  
  if (supabaseUser.email === 'webmastertodoaca@gmail.com') {
    role = mockRoles[0]; // admin
  } else if (supabaseUser.email?.includes('manager')) {
    role = mockRoles[1]; // manager
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    firstName: supabaseUser.user_metadata?.first_name || 'Usuario',
    lastName: supabaseUser.user_metadata?.last_name || '',
    role: role,
    isActive: true,
    createdAt: new Date(supabaseUser.created_at),
    lastLoginAt: new Date()
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        
        if (session?.user) {
          const appUser = convertSupabaseUserToAppUser(session.user);
          setUser(appUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Current session:', session);
      setSession(session);
      
      if (session?.user) {
        const appUser = convertSupabaseUserToAppUser(session.user);
        setUser(appUser);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        const appUser = convertSupabaseUserToAppUser(data.user);
        setUser(appUser);
        setSession(data.session);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login exception:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setSession(null);
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
