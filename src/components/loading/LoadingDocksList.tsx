
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const mockDocks = [
  {
    id: '1',
    number: 'Muelle 1',
    type: 'Ambos',
    status: 'Disponible',
    capacity: '40 ton',
    equipment: ['Montacargas', 'Rampa']
  },
  {
    id: '2',
    number: 'Muelle 2',
    type: 'Carga',
    status: 'Ocupado',
    capacity: '25 ton',
    equipment: ['Rampa']
  }
];

export const LoadingDocksList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Muelle</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Capacidad</TableHead>
          <TableHead>Equipamiento</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockDocks.map((dock) => (
          <TableRow key={dock.id}>
            <TableCell className="font-medium">{dock.number}</TableCell>
            <TableCell>{dock.type}</TableCell>
            <TableCell>
              <Badge variant={dock.status === 'Disponible' ? 'default' : 'secondary'}>
                {dock.status}
              </Badge>
            </TableCell>
            <TableCell>{dock.capacity}</TableCell>
            <TableCell>{dock.equipment.join(', ')}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
