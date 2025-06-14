
import { useQuery } from '@tanstack/react-query';
import { connectToDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function EcommerceProducts() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['ecommerce-products', searchTerm],
    queryFn: async () => {
      const db = await connectToDatabase();
      let all = await db.collection('ecommerce_products').find().sort({ created_at: -1 }).toArray();
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        all = all.filter(
          (p: any) =>
            (p.title && p.title.toLowerCase().includes(lower)) ||
            (p.sku && p.sku.toLowerCase().includes(lower))
        );
      }
      return all;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'default';
      case 'pending': return 'secondary';
      case 'error': return 'destructive';
      case 'out_of_sync': return 'outline';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Productos Sincronizados</h2>
          <p className="text-muted-foreground">
            Productos importados desde tus tiendas de e-commerce
          </p>
        </div>
        <Button>
          <RefreshCw className="w-4 h-4 mr-2" />
          Sincronizar
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay productos sincronizados</h3>
              <p className="text-muted-foreground">
                Los productos aparecerán aquí una vez que configures y sincronices tus tiendas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base line-clamp-2">{product.title}</CardTitle>
                  <Badge variant={getStatusColor(product.sync_status)}>
                    {product.sync_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.sku && (
                    <p className="text-sm"><span className="font-medium">SKU:</span> {product.sku}</p>
                  )}
                  {product.price && (
                    <p className="text-sm"><span className="font-medium">Precio:</span> ${product.price}</p>
                  )}
                  {product.inventory_quantity !== null && (
                    <p className="text-sm">
                      <span className="font-medium">Stock:</span> {product.inventory_quantity}
                    </p>
                  )}
                  {product.vendor && (
                    <p className="text-sm"><span className="font-medium">Proveedor:</span> {product.vendor}</p>
                  )}
                  {product.last_synced_at && (
                    <p className="text-xs text-muted-foreground">
                      Última sync: {new Date(product.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
