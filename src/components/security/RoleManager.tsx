
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Key, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGuard } from './PermissionGuard';

interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string;
}

interface ModuleAccess {
  moduleId: string;
  canAccess: boolean;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  permissions: Permission[];
  moduleAccess: ModuleAccess[];
}

const systemPermissions: Permission[] = [
  { id: '1', action: 'read', resource: 'dashboard', description: 'Ver dashboard' },
  { id: '2', action: 'manage', resource: 'inventory', description: 'Gestionar inventario' },
  { id: '3', action: 'read', resource: 'inventory', description: 'Ver inventario' },
  { id: '4', action: 'create', resource: 'products', description: 'Crear productos' },
  { id: '5', action: 'update', resource: 'products', description: 'Actualizar productos' },
  { id: '6', action: 'delete', resource: 'products', description: 'Eliminar productos' },
  { id: '7', action: 'manage', resource: 'users', description: 'Gestionar usuarios' },
  { id: '8', action: 'execute', resource: 'tasks', description: 'Ejecutar tareas' },
  { id: '9', action: 'assign', resource: 'tasks', description: 'Asignar tareas' },
  { id: '10', action: 'read', resource: 'reports', description: 'Ver reportes' },
  { id: '11', action: 'create', resource: 'suppliers', description: 'Crear proveedores' },
  { id: '12', action: 'update', resource: 'suppliers', description: 'Actualizar proveedores' },
  { id: '13', action: 'delete', resource: 'suppliers', description: 'Eliminar proveedores' },
];

export function RoleManager() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const getPermissionLevel = (action: string): 'high' | 'medium' | 'low' => {
    if (['manage', 'delete'].includes(action)) return 'high';
    if (['create', 'update', 'assign'].includes(action)) return 'medium';
    return 'low';
  };

  const getPermissionColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  return (
    <PermissionGuard action="manage" resource="users">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Gestión de Roles y Permisos
            </h2>
            <p className="text-muted-foreground">
              Administra los roles del sistema y sus permisos asociados
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </Button>
        </div>

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Auditoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.role && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        {user.role.displayName}
                      </CardTitle>
                      <Badge variant="default">Actual</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Nivel: </span>
                      <Badge variant="secondary">{user.role.level}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Permisos: </span>
                      <span className="text-sm text-muted-foreground">
                        {user.role.permissions.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Módulos: </span>
                      <span className="text-sm text-muted-foreground">
                        {user.role.moduleAccess.filter(m => m.canAccess).length}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permisos del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemPermissions.map((permission) => {
                    const level = getPermissionLevel(permission.action);
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={getPermissionColor(level)}>
                            {permission.action}
                          </Badge>
                          <div>
                            <span className="font-medium">{permission.resource}</span>
                            {permission.description && (
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Auditoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Inicio de sesión</span>
                      <p className="text-sm text-muted-foreground">
                        {user?.email} - {user?.lastLoginAt?.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="default">Exitoso</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Acceso a módulo</span>
                      <p className="text-sm text-muted-foreground">
                        Dashboard - {new Date().toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary">Autorizado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
