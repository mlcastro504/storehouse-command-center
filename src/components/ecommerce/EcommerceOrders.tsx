
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Package } from 'lucide-react';
import { useState } from 'react';

export function EcommerceOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ecommerce-orders', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('ecommerce_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
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
          <h2 className="text-2xl font-bold">Pedidos de E-commerce</h2>
          <p className="text-muted-foreground">
            Pedidos recibidos desde tus tiendas online
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay pedidos sincronizados</h3>
              <p className="text-muted-foreground">
                Los pedidos aparecerán aquí una vez que configures y sincronices tus tiendas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">#{order.order_number}</CardTitle>
                    <p className="text-muted-foreground">
                      {order.customer_name || order.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${order.total_amount}</p>
                    <p className="text-sm text-muted-foreground">{order.currency}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Fecha:</span> {new Date(order.order_date).toLocaleDateString()}
                    </p>
                    {order.customer_phone && (
                      <p className="text-sm">
                        <span className="font-medium">Teléfono:</span> {order.customer_phone}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Estado financiero:</span> {order.financial_status || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant={getStatusColor(order.warehouse_status)}>
                      {order.warehouse_status}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Package className="w-4 h-4 mr-1" />
                        Procesar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
