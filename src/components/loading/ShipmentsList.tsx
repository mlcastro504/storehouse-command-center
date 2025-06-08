
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Truck } from 'lucide-react';

const mockShipments = [
  {
    id: '1',
    number: 'SHIP-001',
    type: 'Salida',
    carrier: 'Transportes ABC',
    tracking: 'TRK123456',
    status: 'En Tránsito',
    destination: 'Madrid'
  },
  {
    id: '2',
    number: 'SHIP-002',
    type: 'Entrada',
    carrier: 'Logística XYZ',
    tracking: 'TRK789012',
    status: 'Entregado',
    destination: 'Barcelona'
  }
];

export const ShipmentsList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Envío</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Transportista</TableHead>
          <TableHead>Seguimiento</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Destino</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockShipments.map((shipment) => (
          <TableRow key={shipment.id}>
            <TableCell className="font-medium">{shipment.number}</TableCell>
            <TableCell>
              <Badge variant={shipment.type === 'Salida' ? 'default' : 'secondary'}>
                {shipment.type}
              </Badge>
            </TableCell>
            <TableCell>{shipment.carrier}</TableCell>
            <TableCell className="font-mono">{shipment.tracking}</TableCell>
            <TableCell>
              <Badge variant={shipment.status === 'En Tránsito' ? 'default' : 'secondary'}>
                {shipment.status}
              </Badge>
            </TableCell>
            <TableCell>{shipment.destination}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Truck className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
