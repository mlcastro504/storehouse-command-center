
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, Package, Users, TrendingUp } from 'lucide-react';

export function EcommerceDashboard() {
  const { data: connections = [] } = useQuery({
    queryKey: ['ecommerce-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ecommerce_connections')
        .select(`
          *,
          platform:ecommerce_platforms(*)
        `)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['ecommerce-stats'],
    queryFn: async () => {
      const [productsResult, ordersResult, recentOrdersResult] = await Promise.all([
        supabase
          .from('ecommerce_products')
          .select('id, sync_status')
          .eq('sync_status', 'synced'),
        supabase
          .from('ecommerce_orders')
          .select('id, warehouse_status, total_amount')
          .gte('order_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('ecommerce_orders')
          .select('*')
          .order('order_date', { ascending: false })
          .limit(5)
      ]);

      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      
      return {
        totalProducts: productsResult.data?.length || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalRevenue,
        recentOrders: recentOrdersResult.data || []
      };
    },
    enabled: connections.length > 0,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexiones Activas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground">
              Plataformas conectadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Productos sincronizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos (30d)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conexiones Activas */}
      <Card>
        <CardHeader>
          <CardTitle>Conexiones de E-commerce</CardTitle>
          <CardDescription>
            Estado de tus integraciones con plataformas de e-commerce
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay conexiones configuradas</h3>
              <p className="text-muted-foreground">
                Conecta tu primera tienda para comenzar a sincronizar datos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection: any) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{connection.store_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {connection.platform?.display_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={connection.sync_enabled ? "default" : "secondary"}>
                      {connection.sync_enabled ? "Activo" : "Inactivo"}
                    </Badge>
                    {connection.last_sync_at && (
                      <p className="text-xs text-muted-foreground">
                        Última sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pedidos Recientes */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Últimos pedidos recibidos de tus tiendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name || order.customer_email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total_amount}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(order.warehouse_status)}`}
                    >
                      {order.warehouse_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
