
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const mockRules = [
  {
    id: '1',
    name: 'Validación Código Barras',
    type: 'Formato',
    pattern: '^[0-9]{13}$',
    active: true,
    description: 'Valida códigos EAN-13'
  },
  {
    id: '2',
    name: 'Verificación Ubicación',
    type: 'Existencia',
    pattern: null,
    active: true,
    description: 'Verifica que la ubicación existe'
  }
];

export const ScanValidationRules = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>Agregar Regla</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Patrón</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">{rule.name}</TableCell>
              <TableCell>{rule.type}</TableCell>
              <TableCell className="font-mono text-sm">
                {rule.pattern || 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={rule.active ? 'default' : 'secondary'}>
                  {rule.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell>{rule.description}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
