
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Phone, Mail } from 'lucide-react';

const mockCustomers = [
  {
    id: '1',
    code: 'CUST-001',
    name: 'Empresa ABC S.L.',
    contact: 'Juan Pérez',
    email: 'juan@empresa-abc.com',
    phone: '+34 912 345 678',
    status: 'Activo',
    orders: 25
  },
  {
    id: '2',
    code: 'CUST-002',
    name: 'Comercial XYZ',
    contact: 'María García',
    email: 'maria@comercial-xyz.com',
    phone: '+34 913 456 789',
    status: 'Activo',
    orders: 42
  }
];

export const CustomersList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Pedidos</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockCustomers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.code}</TableCell>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.contact}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {customer.email}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {customer.phone}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="default">{customer.status}</Badge>
            </TableCell>
            <TableCell>{customer.orders}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
