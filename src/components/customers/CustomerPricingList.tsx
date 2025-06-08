
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

const mockPricing = [
  {
    id: '1',
    customer: 'Empresa ABC S.L.',
    product: 'Producto A',
    type: 'Descuento %',
    value: '10%',
    minQuantity: 100,
    active: true
  },
  {
    id: '2',
    customer: 'Comercial XYZ',
    product: 'Categoría General',
    type: 'Precio Fijo',
    value: '€25.00',
    minQuantity: 50,
    active: true
  }
];

export const CustomerPricingList = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>Agregar Precio</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Cantidad Mín.</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPricing.map((pricing) => (
            <TableRow key={pricing.id}>
              <TableCell className="font-medium">{pricing.customer}</TableCell>
              <TableCell>{pricing.product}</TableCell>
              <TableCell>{pricing.type}</TableCell>
              <TableCell className="font-semibold">{pricing.value}</TableCell>
              <TableCell>{pricing.minQuantity}</TableCell>
              <TableCell>
                <Badge variant={pricing.active ? 'default' : 'secondary'}>
                  {pricing.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
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
