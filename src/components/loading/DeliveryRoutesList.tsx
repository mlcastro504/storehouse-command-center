
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin } from 'lucide-react';

const mockRoutes = [
  {
    id: '1',
    number: 'RUTA-001',
    driver: 'Carlos López',
    vehicle: 'VAN-001',
    stops: 5,
    status: 'En Progreso',
    estimatedTime: '4.5h'
  },
  {
    id: '2',
    number: 'RUTA-002',
    driver: 'Ana Martín',
    vehicle: 'TRUCK-002',
    stops: 3,
    status: 'Completada',
    estimatedTime: '3.0h'
  }
];

export const DeliveryRoutesList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ruta</TableHead>
          <TableHead>Conductor</TableHead>
          <TableHead>Vehículo</TableHead>
          <TableHead>Paradas</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Tiempo Est.</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockRoutes.map((route) => (
          <TableRow key={route.id}>
            <TableCell className="font-medium">{route.number}</TableCell>
            <TableCell>{route.driver}</TableCell>
            <TableCell>{route.vehicle}</TableCell>
            <TableCell>{route.stops}</TableCell>
            <TableCell>
              <Badge variant={route.status === 'En Progreso' ? 'default' : 'secondary'}>
                {route.status}
              </Badge>
            </TableCell>
            <TableCell>{route.estimatedTime}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
