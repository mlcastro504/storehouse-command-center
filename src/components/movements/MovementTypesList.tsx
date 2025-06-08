
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

const mockTypes = [
  { id: '1', name: 'Entrada', description: 'Recepción de mercancía', active: true },
  { id: '2', name: 'Salida', description: 'Envío de productos', active: true },
  { id: '3', name: 'Transferencia', description: 'Movimiento entre ubicaciones', active: true },
  { id: '4', name: 'Ajuste', description: 'Corrección de inventario', active: false }
];

export const MovementTypesList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockTypes.map((type) => (
          <TableRow key={type.id}>
            <TableCell className="font-medium">{type.name}</TableCell>
            <TableCell>{type.description}</TableCell>
            <TableCell>
              <Badge variant={type.active ? 'default' : 'secondary'}>
                {type.active ? 'Activo' : 'Inactivo'}
              </Badge>
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
