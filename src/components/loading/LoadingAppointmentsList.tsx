
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';

const mockAppointments = [
  {
    id: '1',
    appointmentNumber: 'APPT-001',
    dock: 'Muelle 1',
    carrier: 'Transportes ABC',
    type: 'Carga',
    date: '2024-01-15',
    time: '10:00',
    status: 'Programada'
  },
  {
    id: '2',
    appointmentNumber: 'APPT-002',
    dock: 'Muelle 2',
    carrier: 'Logística XYZ',
    type: 'Descarga',
    date: '2024-01-15',
    time: '14:30',
    status: 'En Progreso'
  }
];

export const LoadingAppointmentsList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cita</TableHead>
          <TableHead>Muelle</TableHead>
          <TableHead>Transportista</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockAppointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell className="font-medium">{appointment.appointmentNumber}</TableCell>
            <TableCell>{appointment.dock}</TableCell>
            <TableCell>{appointment.carrier}</TableCell>
            <TableCell>
              <Badge variant={appointment.type === 'Carga' ? 'default' : 'secondary'}>
                {appointment.type}
              </Badge>
            </TableCell>
            <TableCell>{appointment.date}</TableCell>
            <TableCell>{appointment.time}</TableCell>
            <TableCell>
              <Badge variant={appointment.status === 'En Progreso' ? 'default' : 'secondary'}>
                {appointment.status}
              </Badge>
            </TableCell>
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
