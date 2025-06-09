
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Package,
  Database
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EcommerceAdvancedService } from '@/services/ecommerceAdvancedService';
import { toast } from 'sonner';

export const EcommerceSyncManager = () => {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [syncType, setSyncType] = useState<'products' | 'orders' | 'inventory' | 'full'>('orders');
  const queryClient = useQueryClient();

  // Queries
  const { data: channels } = useQuery({
    queryKey: ['ecommerce-channels'],
    queryFn: EcommerceAdvancedService.getChannels
  });

  const { data: syncLogs, isLoading } = useQuery({
    queryKey: ['ecommerce-sync-logs', selectedChannel],
    queryFn: () => EcommerceAdvancedService.getSyncLogs(selectedChannel || undefined),
    refetchInterval: 5000 // Refrescar cada 5 segundos para ver el progreso
  });

  // Mutación para sincronizar
  const syncMutation = useMutation({
    mutationFn: ({ channelId, type }: { channelId: string; type: 'products' | 'orders' | 'inventory' | 'full' }) =>
      EcommerceAdvancedService.syncChannel(channelId, type),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['ecommerce-channels'] });
      
      if (data.status === 'completed') {
        toast.success('Sincronización completada exitosamente');
      } else if (data.status === 'partial') {
        toast.warning('Sincronización completada con algunos errores');
      } else {
        toast.error('Error en la sincronización');
      }
    },
    onError: () => {
      toast.error('Error al iniciar la sincronización');
    }
  });

  const handleSync = () => {
    if (!selectedChannel) {
      toast.error('Selecciona un canal para sincronizar');
      return;
    }

    syncMutation.mutate({
      channelId: selectedChannel,
      type: syncType
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'started': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'partial': return 'secondary';
      case 'started': return 'outline';
      default: return 'outline';
    }
  };

  const getSyncTypeIcon = (type: string) => {
    switch (type) {
      case 'products': return <Package className="w-4 h-4" />;
      case 'orders': return <Download className="w-4 h-4" />;
      case 'inventory': return <Upload className="w-4 h-4" />;
      case 'full': return <Database className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  const getSyncTypeText = (type: string) => {
    switch (type) {
      case 'products': return 'Productos';
      case 'orders': return 'Órdenes';
      case 'inventory': return 'Inventario';
      case 'full': return 'Completa';
      default: return type;
    }
  };

  const calculateSuccessRate = (log: any) => {
    if (log.records_processed === 0) return 0;
    return Math.round((log.records_success / log.records_processed) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Sincronización</h2>
          <p className="text-gray-600">Sincroniza datos entre canales y el warehouse</p>
        </div>
      </div>

      {/* Panel de control de sincronización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Control de Sincronización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Canal</label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar canal" />
                </SelectTrigger>
                <SelectContent>
                  {channels?.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Sincronización</label>
              <Select value={syncType} onValueChange={(value: any) => setSyncType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Órdenes</SelectItem>
                  <SelectItem value="products">Productos</SelectItem>
                  <SelectItem value="inventory">Inventario</SelectItem>
                  <SelectItem value="full">Sincronización Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                {syncType === 'orders' && 'Importar nuevas órdenes desde el canal'}
                {syncType === 'products' && 'Sincronizar catálogo de productos'}
                {syncType === 'inventory' && 'Actualizar niveles de stock'}
                {syncType === 'full' && 'Sincronización completa de todos los datos'}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSync}
                disabled={!selectedChannel || syncMutation.isPending}
                className="w-full flex items-center gap-2"
              >
                {syncMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar Sync
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de sincronización */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {syncLogs?.filter(log => log.status === 'completed').length || 0}
                </div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {syncLogs?.filter(log => log.status === 'failed').length || 0}
                </div>
                <div className="text-sm text-gray-600">Fallidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">
                  {syncLogs?.filter(log => log.status === 'started').length || 0}
                </div>
                <div className="text-sm text-gray-600">En Proceso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {syncLogs?.reduce((sum, log) => sum + log.records_processed, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Registros Totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de sincronizaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronizaciones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Errores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium">{log.channel?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSyncTypeIcon(log.sync_type)}
                      <span>{getSyncTypeText(log.sync_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <Badge variant={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress 
                        value={calculateSuccessRate(log)} 
                        className="w-20 h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {calculateSuccessRate(log)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium text-green-600">
                        ✓ {log.records_success}
                      </div>
                      {log.records_failed > 0 && (
                        <div className="text-red-600">
                          ✗ {log.records_failed}
                        </div>
                      )}
                      <div className="text-gray-500">
                        / {log.records_processed}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {log.duration_seconds ? `${log.duration_seconds}s` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.started_at).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.error_message && (
                      <div className="max-w-xs truncate text-sm text-red-600">
                        {log.error_message}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {syncLogs?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay registros de sincronización</h3>
              <p className="text-gray-600">Inicia tu primera sincronización para ver el historial</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
