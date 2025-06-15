
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/warehouse';
import * as authService from '@/lib/auth/authService';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performRestoreSession = async () => {
      const sessionUser = await authService.restoreSession();
      if (sessionUser) {
        setUser(sessionUser);
      }
      setIsLoading(false);
    };

    performRestoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const loggedInUser = await authService.login(email, password);
    setIsLoading(false);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
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
