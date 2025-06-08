
import React from 'react';
import { useStockMovements } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown, ArrowRightLeft, Edit, BarChart } from 'lucide-react';

export const StockMovementsList = () => {
  const { data: movements, isLoading, error } = useStockMovements();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error al cargar los movimientos de stock
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay movimientos de stock registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'inbound':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'outbound':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      case 'adjustment':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'cycle_count':
        return <BarChart className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'inbound':
        return 'Entrada';
      case 'outbound':
        return 'Salida';
      case 'transfer':
        return 'Transferencia';
      case 'adjustment':
        return 'Ajuste';
      case 'cycle_count':
        return 'Conteo Cíclico';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {movements.map((movement) => (
        <Card key={movement.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {getMovementIcon(movement.movement_type)}
                  {movement.product?.name || 'Producto sin nombre'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{movement.product?.sku}</Badge>
                  <Badge variant="secondary">{getMovementTypeLabel(movement.movement_type)}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusColor(movement.status)}>
                  {movement.status === 'completed' ? 'Completado' : 
                   movement.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Cantidad</div>
                <div className="text-lg font-bold">{movement.quantity}</div>
              </div>
              <div>
                <div className="text-gray-500">Fecha</div>
                <div>{new Date(movement.timestamp).toLocaleString()}</div>
              </div>
              {movement.from_location && (
                <div>
                  <div className="text-gray-500">Desde</div>
                  <div>{movement.from_location.name}</div>
                </div>
              )}
              {movement.to_location && (
                <div>
                  <div className="text-gray-500">Hacia</div>
                  <div>{movement.to_location.name}</div>
                </div>
              )}
            </div>
            {movement.reason && (
              <div className="mt-3">
                <div className="text-gray-500 text-sm">Razón</div>
                <div className="text-sm">{movement.reason}</div>
              </div>
            )}
            {movement.notes && (
              <div className="mt-2">
                <div className="text-gray-500 text-sm">Notas</div>
                <div className="text-sm">{movement.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
