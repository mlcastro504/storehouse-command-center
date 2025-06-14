
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { DeleteStockMovementDialog } from './DeleteStockMovementDialog';
import { EditStockMovementDialog } from './EditStockMovementDialog';

const mockMovements = [
  {
    id: '1',
    product: 'Producto A',
    type: 'Entrada',
    quantity: 100,
    location: 'A-01-01',
    date: '2024-01-15',
    status: 'Completado'
  },
  {
    id: '2',
    product: 'Producto B',
    type: 'Salida',
    quantity: -50,
    location: 'B-02-03',
    date: '2024-01-14',
    status: 'Pendiente'
  }
];

export const StockMovementsList = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);

  const handleDelete = (movement: any) => {
    setSelectedMovement(movement);
    setDeleteOpen(true);
  };

  const handleEdit = (movement: any) => {
    setSelectedMovement(movement);
    setEditOpen(true);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockMovements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{movement.product}</TableCell>
              <TableCell>{movement.type}</TableCell>
              <TableCell className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
              </TableCell>
              <TableCell>{movement.location}</TableCell>
              <TableCell>{movement.date}</TableCell>
              <TableCell>
                <Badge variant={movement.status === 'Completado' ? 'default' : 'secondary'}>
                  {movement.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(movement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(movement)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DeleteStockMovementDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        movement={selectedMovement}
      />
      <EditStockMovementDialog
        open={editOpen}
        setOpen={setEditOpen}
        movement={selectedMovement}
      />
    </div>
  );
};
