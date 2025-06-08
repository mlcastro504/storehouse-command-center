
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

const mockPermissions = [
  {
    id: '1',
    name: 'inventory.create',
    module: 'Inventario',
    description: 'Crear productos y ubicaciones',
    type: 'Escritura'
  },
  {
    id: '2',
    name: 'inventory.read',
    module: 'Inventario',
    description: 'Ver información de inventario',
    type: 'Lectura'
  },
  {
    id: '3',
    name: 'putaway.manage',
    module: 'Put Away',
    description: 'Gestionar tareas de ubicación',
    type: 'Gestión'
  },
  {
    id: '4',
    name: 'users.admin',
    module: 'Usuarios',
    description: 'Administrar usuarios y roles',
    type: 'Administración'
  }
];

export const UserPermissionsList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Permiso</TableHead>
          <TableHead>Módulo</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockPermissions.map((permission) => (
          <TableRow key={permission.id}>
            <TableCell className="font-mono text-sm">{permission.name}</TableCell>
            <TableCell>{permission.module}</TableCell>
            <TableCell>{permission.description}</TableCell>
            <TableCell>
              <Badge variant="outline">{permission.type}</Badge>
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
