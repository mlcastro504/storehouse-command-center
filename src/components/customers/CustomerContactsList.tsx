
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Phone, Mail } from 'lucide-react';

const mockContacts = [
  {
    id: '1',
    customer: 'Empresa ABC S.L.',
    name: 'Juan Pérez',
    type: 'Principal',
    email: 'juan@empresa-abc.com',
    phone: '+34 912 345 678',
    department: 'Compras'
  },
  {
    id: '2',
    customer: 'Comercial XYZ',
    name: 'María García',
    type: 'Facturación',
    email: 'facturacion@comercial-xyz.com',
    phone: '+34 913 456 789',
    department: 'Administración'
  }
];

export const CustomerContactsList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockContacts.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell className="font-medium">{contact.customer}</TableCell>
            <TableCell>{contact.name}</TableCell>
            <TableCell>
              <Badge variant={contact.type === 'Principal' ? 'default' : 'secondary'}>
                {contact.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {contact.email}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {contact.phone}
              </div>
            </TableCell>
            <TableCell>{contact.department}</TableCell>
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
