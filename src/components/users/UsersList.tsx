
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Edit, Lock } from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    role: 'Administrador',
    status: 'Activo',
    lastLogin: '2024-01-15 10:30',
    avatar: 'JP'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    role: 'Operador',
    status: 'Activo',
    lastLogin: '2024-01-15 09:15',
    avatar: 'MG'
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    role: 'Supervisor',
    status: 'Inactivo',
    lastLogin: '2024-01-10 16:45',
    avatar: 'CL'
  }
];

export const UsersList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Último Acceso</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'Administrador' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === 'Activo' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {user.lastLogin}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
