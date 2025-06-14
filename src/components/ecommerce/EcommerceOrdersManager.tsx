import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Package, 
  Truck,
  Eye,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EcommerceAdvancedService } from '@/services/ecommerceAdvancedService';
import { toast } from 'sonner';

export const EcommerceOrdersManager = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    channel: '',
    search: ''
  });
  const queryClient = useQueryClient();

  // Query para obtener órdenes
  const { data: orders, isLoading } = useQuery({
    queryKey: ['ecommerce-orders', filters],
    queryFn: () => EcommerceAdvancedService.getOrders(filters)
  });

  // Query para obtener canales (para filtros)
  const { data: channels } = useQuery({
    queryKey: ['ecommerce-channels'],
    queryFn: EcommerceAdvancedService.getChannels
  });

  // Mutación para actualizar estado de orden
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status, trackingNumber }: {
      orderId: string;
      status: string;
      trackingNumber?: string;
    }) => EcommerceAdvancedService.updateOrderStatus(orderId, status, trackingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecommerce-orders'] });
      toast.success('Estado de orden actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });

  // New useState for sync loading
  const [isSyncing, setIsSyncing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'picking': return 'secondary';
      case 'packed': return 'default';
      case 'shipped': return 'default';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'picking': return 'En Picking';
      case 'packed': return 'Empacado';
      case 'shipped': return 'Enviado';
      default: return status;
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    let trackingNumber;
    if (newStatus === 'shipped') {
      trackingNumber = `TRACK-${Date.now()}`;
    }
    
    updateOrderMutation.mutate({
      orderId,
      status: newStatus,
      trackingNumber
    });
  };

  // New helper: sync all channels to create sample orders
  const handleSyncAllChannels = async () => {
    setIsSyncing(true);
    try {
      if (channels && channels.length > 0) {
        for (const channel of channels) {
          await EcommerceAdvancedService.syncChannel(channel.id, 'orders');
        }
        queryClient.invalidateQueries({ queryKey: ['ecommerce-orders'] });
        toast.success('Synchronized. Sample orders created!');
      } else {
        toast.error('No channels available to sync.');
      }
    } catch (e) {
      toast.error('Could not sync channels.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando órdenes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
          <p className="text-gray-600">Administra órdenes de todos los canales</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Número de orden..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="picking">En Picking</SelectItem>
                  <SelectItem value="packed">Empacado</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Canal</label>
              <Select
                value={filters.channel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, channel: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los canales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {channels?.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: '', channel: '', search: '' })}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de órdenes */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{order.order_number}</div>
                      <div className="text-xs text-gray-500">{order.external_order_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.channel?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Cliente ID: {order.customer_id || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${order.total_amount} {order.currency}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.warehouse_status)}>
                      {getStatusText(order.warehouse_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(order.order_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      
                      {order.warehouse_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'picking')}
                          disabled={updateOrderMutation.isPending}
                        >
                          <Package className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {order.warehouse_status === 'packed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          disabled={updateOrderMutation.isPending}
                        >
                          <Truck className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Updated "No orders" section */}
          {(!orders || orders.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay órdenes</h3>
              <p className="text-gray-600 mb-4">No se encontraron órdenes con los filtros aplicados.</p>
              <Button
                disabled={isSyncing}
                onClick={handleSyncAllChannels}
                className="mt-2"
              >
                {isSyncing ? 'Sincronizando...' : 'Importar Pedidos de Canales'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
                Si aún no has sincronizado ningún canal, pulsa este botón para importar pedidos de prueba.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles de orden */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Orden - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Información General</h4>
                  <div className="space-y-1 text-sm">
                    <p>ID Externo: {selectedOrder.external_order_id}</p>
                    <p>Canal: {selectedOrder.channel?.name}</p>
                    <p>Estado: {getStatusText(selectedOrder.warehouse_status)}</p>
                    <p>Total: ${selectedOrder.total_amount} {selectedOrder.currency}</p>
                    <p>Fecha: {new Date(selectedOrder.order_date).toLocaleString()}</p>
                    {selectedOrder.tracking_number && (
                      <p>Tracking: {selectedOrder.tracking_number}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Dirección de Envío</h4>
                  <div className="text-sm">
                    {selectedOrder.shipping_address ? (
                      <div>
                        <p>{selectedOrder.shipping_address.street}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                        <p>{selectedOrder.shipping_address.postal_code}</p>
                        <p>{selectedOrder.shipping_address.country}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No disponible</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <div className="border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_lines?.map((line: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{line.product_name}</TableCell>
                          <TableCell>{line.sku || 'N/A'}</TableCell>
                          <TableCell>{line.quantity}</TableCell>
                          <TableCell>${line.unit_price}</TableCell>
                          <TableCell>${line.total_price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold">Notas</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
