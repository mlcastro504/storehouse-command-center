
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Users } from 'lucide-react';

const mockRoles = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    level: 1,
    userCount: 2,
    permissions: ['Crear', 'Leer', 'Actualizar', 'Eliminar']
  },
  {
    id: '2',
    name: 'Supervisor',
    description: 'Gestión de operaciones y reportes',
    level: 2,
    userCount: 5,
    permissions: ['Crear', 'Leer', 'Actualizar']
  },
  {
    id: '3',
    name: 'Operador',
    description: 'Operaciones básicas del almacén',
    level: 3,
    userCount: 15,
    permissions: ['Leer', 'Actualizar']
  },
  {
    id: '4',
    name: 'Visualizador',
    description: 'Solo consulta de información',
    level: 4,
    userCount: 3,
    permissions: ['Leer']
  }
];

export const UserRolesList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rol</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Usuarios</TableHead>
          <TableHead>Permisos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockRoles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell>
              <Badge variant="outline">{role.level}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {role.userCount}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
