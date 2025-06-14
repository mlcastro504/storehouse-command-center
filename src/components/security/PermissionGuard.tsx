
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  action?: string;
  resource?: string;
  moduleId?: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  action, 
  resource, 
  moduleId,
  fallback 
}: PermissionGuardProps) {
  const { user, hasPermission, hasModuleAccess } = useAuth();

  // Verificar autenticación
  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Acceso Restringido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Debes iniciar sesión para acceder a esta funcionalidad.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Verificar acceso al módulo
  if (moduleId && !hasModuleAccess(moduleId)) {
    return fallback || (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Sin Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a este módulo.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Verificar permisos específicos
  if (action && resource && !hasPermission(action, resource)) {
    return fallback || (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Acción No Permitida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No tienes permisos para realizar esta acción.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
