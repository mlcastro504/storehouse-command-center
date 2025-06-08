
import React from 'react';
import { useStockLevels } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const StockLevelsList = () => {
  const { data: stockLevels, isLoading, error } = useStockLevels();

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
            Error al cargar los niveles de stock
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stockLevels || stockLevels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay niveles de stock registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {stockLevels.map((stockLevel) => (
        <Card key={`${stockLevel.product_id}-${stockLevel.location_id}`} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {stockLevel.product?.name || 'Producto sin nombre'}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{stockLevel.product?.sku}</Badge>
                  {stockLevel.location && (
                    <Badge variant="secondary">{stockLevel.location.name}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                {stockLevel.quantity_available <= (stockLevel.product?.min_stock_level || 0) ? (
                  <Badge variant="destructive">Stock Bajo</Badge>
                ) : (
                  <Badge variant="default">Stock OK</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Disponible
                </div>
                <div className="text-lg font-bold">{stockLevel.quantity_available}</div>
              </div>
              <div>
                <div className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Reservado
                </div>
                <div className="text-lg font-bold">{stockLevel.quantity_reserved}</div>
              </div>
              <div>
                <div className="text-gray-500 flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  En pedido
                </div>
                <div className="text-lg font-bold">{stockLevel.quantity_on_order}</div>
              </div>
            </div>
            {stockLevel.last_updated && (
              <div className="mt-3 text-xs text-gray-500">
                Última actualización: {new Date(stockLevel.last_updated).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
