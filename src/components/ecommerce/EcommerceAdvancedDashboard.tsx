
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { EcommerceAdvancedService } from '@/services/ecommerceAdvancedService';
import { EcommerceChannelsManager } from './EcommerceChannelsManager';
import { EcommerceOrdersManager } from './EcommerceOrdersManager';
import { EcommerceReturnsManager } from './EcommerceReturnsManager';
import { EcommerceSyncManager } from './EcommerceSyncManager';

export const EcommerceAdvancedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Queries para datos
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['ecommerce-metrics'],
    queryFn: EcommerceAdvancedService.getMetrics,
    refetchInterval: 30000
  });

  const { data: channels } = useQuery({
    queryKey: ['ecommerce-channels'],
    queryFn: EcommerceAdvancedService.getChannels
  });

  const { data: syncLogs } = useQuery({
    queryKey: ['ecommerce-sync-logs'],
    queryFn: () => EcommerceAdvancedService.getSyncLogs(),
    refetchInterval: 10000
  });

  const handleCreatePickingTasks = async () => {
    const tasksCreated = await EcommerceAdvancedService.createPickingTasksFromOrders();
    console.log(`Created ${tasksCreated} picking tasks`);
  };

  if (metricsLoading) {
    return <div className="flex items-center justify-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">E-commerce Avanzado</h1>
          <p className="text-gray-600">Gestión integral de canales de venta online</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreatePickingTasks} className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Crear Tareas de Picking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="channels">Canales</TabsTrigger>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="returns">Devoluciones</TabsTrigger>
          <TabsTrigger value="sync">Sincronización</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Canales Activos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.active_channels}</div>
                <p className="text-xs text-muted-foreground">
                  de {metrics?.total_channels} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Hoy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_orders_today}</div>
                <p className="text-xs text-muted-foreground">
                  ${metrics?.total_revenue_today?.toFixed(2)} en ventas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pending_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.processing_orders} en proceso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Devoluciones</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.pending_returns}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.sync_errors > 0 && (
                    <span className="text-red-500">{metrics.sync_errors} errores de sync</span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance por canal */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Canal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.channel_performance?.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{channel.channel_name}</span>
                        <span className="text-sm text-gray-500">
                          {channel.orders_count} órdenes
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${channel.revenue.toFixed(2)}</span>
                      <Badge variant={
                        channel.sync_status === 'connected' ? 'default' :
                        channel.sync_status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {channel.sync_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente de Sincronización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {syncLogs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {log.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : log.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        {log.channel?.name} - {log.sync_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {log.records_success}/{log.records_processed} registros
                      </span>
                      <Badge variant={
                        log.status === 'completed' ? 'default' :
                        log.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <EcommerceChannelsManager />
        </TabsContent>

        <TabsContent value="orders">
          <EcommerceOrdersManager />
        </TabsContent>

        <TabsContent value="returns">
          <EcommerceReturnsManager />
        </TabsContent>

        <TabsContent value="sync">
          <EcommerceSyncManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
