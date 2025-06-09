
import React from 'react';
import { useProducts } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';

export const ProductsList = () => {
  const { data: products, isLoading, error } = useProducts();

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
            Error al cargar los productos
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No hay productos registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{product.sku}</Badge>
                  <Badge variant="secondary">Categoría: {product.category_id}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                {product.is_active ? (
                  <Badge variant="default">Activo</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Precio de costo</div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${product.cost_price || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Precio de venta</div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${product.sale_price || 0}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Stock mínimo</div>
                <div className="flex items-center gap-1">
                  {product.min_stock_level <= 10 && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  {product.min_stock_level}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Punto de reorden</div>
                <div>{product.reorder_point}</div>
              </div>
            </div>
            {product.description && (
              <div className="mt-3 text-sm text-gray-600">
                {product.description}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
