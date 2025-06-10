
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Users, ArrowRight } from 'lucide-react'
import { BrowserStorage } from '@/lib/browserStorage'
import { useMemo } from 'react'

export function TaskList() {
  const taskData = useMemo(() => {
    // Get data from mock storage
    const putawayTasks = BrowserStorage.get('putaway_tasks') || [];
    const pickingTasks = BrowserStorage.get('picking_tasks') || [];
    const stockMoveTasks = BrowserStorage.get('stock_move_tasks') || [];
    const users = BrowserStorage.get('users') || [];
    const products = BrowserStorage.get('products') || [];
    const pallets = BrowserStorage.get('pallets') || [];
    const ecommerceOrders = BrowserStorage.get('ecommerce_orders') || [];
    const locations = BrowserStorage.get('locations') || [];

    // Combine all tasks with enriched information
    const allTasks = [
      ...putawayTasks.map((task: any) => {
        const pallet = pallets.find((p: any) => p.id === task.pallet_id);
        const product = pallet ? products.find((p: any) => p.id === pallet.product_id) : null;
        const assignedUser = task.assigned_to ? users.find((u: any) => u.id === task.assigned_to) : null;
        const location = task.suggested_location_id ? locations.find((l: any) => l.id === task.suggested_location_id) : null;
        
        return {
          id: task.id,
          type: 'Put Away',
          title: `Palet ${pallet?.pallet_number || task.pallet_id}`,
          description: product ? `${product.name} (${pallet?.quantity || 0} unidades)` : 'Producto no encontrado',
          status: task.status,
          priority: task.priority,
          assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Sin asignar',
          location: location ? location.location_code : 'Sin ubicación',
          createdAt: task.created_at
        };
      }),
      ...pickingTasks.map((task: any) => {
        const product = products.find((p: any) => p.id === task.product_id);
        const order = ecommerceOrders.find((o: any) => o.id === task.order_id);
        const assignedUser = task.assigned_to ? users.find((u: any) => u.id === task.assigned_to) : null;
        const location = task.location_id ? locations.find((l: any) => l.id === task.location_id) : null;
        
        return {
          id: task.id,
          type: 'Picking',
          title: `Pedido ${order?.order_number || task.order_id}`,
          description: product ? `${product.name} (${task.quantity_requested} unidades)` : 'Producto no encontrado',
          status: task.status,
          priority: task.priority,
          assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Sin asignar',
          location: location ? location.location_code : 'Sin ubicación',
          createdAt: task.created_at
        };
      }),
      ...stockMoveTasks.map((task: any) => {
        const product = products.find((p: any) => p.id === task.product_id);
        const assignedUser = task.assigned_to ? users.find((u: any) => u.id === task.assigned_to) : null;
        const fromLocation = task.from_location_id ? locations.find((l: any) => l.id === task.from_location_id) : null;
        const toLocation = task.to_location_id ? locations.find((l: any) => l.id === task.to_location_id) : null;
        
        return {
          id: task.id,
          type: 'Stock Move',
          title: `${task.task_type === 'replenishment' ? 'Reposición' : 'Consolidación'}`,
          description: product ? `${product.name} (${task.quantity} unidades)` : 'Producto no encontrado',
          status: task.status,
          priority: task.priority,
          assignedTo: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Sin asignar',
          location: fromLocation && toLocation ? `${fromLocation.location_code} → ${toLocation.location_code}` : 'Ubicaciones no definidas',
          createdAt: task.created_at
        };
      })
    ];

    // Sort by created date (most recent first) and take top 8
    return allTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'text-red-600';
      case 'normal':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (taskData.length === 0) {
    return (
      <Card className="warehouse-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Tareas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay tareas disponibles. Genera datos mock para ver tareas activas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="warehouse-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Tareas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {taskData.map((task) => (
            <div key={`${task.type}-${task.id}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {task.type}
                  </Badge>
                  <span className="font-medium">{task.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(task.status)} text-white border-none`}
                  >
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {task.assignedTo}
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {task.location}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : 
                   task.priority === 'urgent' ? 'Urgente' :
                   task.priority === 'low' ? 'Baja' : 'Normal'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {new Date(task.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
