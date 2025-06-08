
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Play, Square } from 'lucide-react';

const mockSessions = [
  {
    id: '1',
    sessionId: 'SCAN-001',
    type: 'Recepción',
    status: 'Activa',
    totalScans: 45,
    successfulScans: 43,
    startTime: '10:30',
    user: 'Juan Pérez'
  },
  {
    id: '2',
    sessionId: 'SCAN-002',
    type: 'Picking',
    status: 'Completada',
    totalScans: 28,
    successfulScans: 28,
    startTime: '09:15',
    user: 'María García'
  }
];

export const ScanSessionsList = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Sesión</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Escaneos</TableHead>
          <TableHead>Éxito</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockSessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.sessionId}</TableCell>
            <TableCell>{session.type}</TableCell>
            <TableCell>
              <Badge variant={session.status === 'Activa' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
            </TableCell>
            <TableCell>{session.totalScans}</TableCell>
            <TableCell className="text-green-600">{session.successfulScans}</TableCell>
            <TableCell>{session.user}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                {session.status === 'Activa' ? (
                  <Button variant="ghost" size="sm">
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
