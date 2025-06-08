
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Wifi, WifiOff } from 'lucide-react';

const mockDevices = [
  {
    id: '1',
    name: 'Scanner-001',
    type: 'Handheld',
    model: 'Zebra TC21',
    status: 'Conectado',
    battery: 85,
    assignedTo: 'Juan Pérez'
  },
  {
    id: '2',
    name: 'Scanner-002',
    type: 'Fixed',
    model: 'Honeywell 1900',
    status: 'Desconectado',
    battery: null,
    assignedTo: null
  }
];

export const ScanDevicesList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dispositivo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Batería</TableHead>
          <TableHead>Asignado a</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockDevices.map((device) => (
          <TableRow key={device.id}>
            <TableCell className="font-medium">{device.name}</TableCell>
            <TableCell>{device.type}</TableCell>
            <TableCell>{device.model}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {device.status === 'Conectado' ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={device.status === 'Conectado' ? 'default' : 'secondary'}>
                  {device.status}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              {device.battery ? `${device.battery}%` : 'N/A'}
            </TableCell>
            <TableCell>{device.assignedTo || 'Sin asignar'}</TableCell>
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
