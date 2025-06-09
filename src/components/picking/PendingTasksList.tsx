
import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  MapPin, 
  Clock, 
  Filter,
  User,
  Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateTaskDialog } from './CreateTaskDialog';

export const PendingTasksList = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    task_type: ''
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['picking-all-tasks', filters],
    queryFn: () => PickingService.getPickingTasks({
      status: filters.status ? [filters.status] : undefined,
      priority: filters.priority ? [filters.priority] : undefined,
      task_type: filters.task_type ? [filters.task_type] : undefined
    })
  });

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          task.task_number.toLowerCase().includes(searchLower) ||
          task.product?.name.toLowerCase().includes(searchLower) ||
          task.product?.sku.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [tasks, filters.search]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'assigned': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'assigned': return 'Asignada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'Venta';
      case 'transfer': return 'Transferencia';
      case 'replenishment': return 'Reposición';
      case 'quality_control': return 'Control Calidad';
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando tareas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros y controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, producto o SKU..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="assigned">Asignada</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.task_type} onValueChange={(value) => setFilters({ ...filters, task_type: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="sale">Venta</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="replenishment">Reposición</SelectItem>
              <SelectItem value="quality_control">Control Calidad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CreateTaskDialog />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredTasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredTasks.filter(t => t.status === 'assigned').length}
            </div>
            <p className="text-xs text-muted-foreground">Asignadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">En Progreso</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredTasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getTaskTypeLabel(task.task_type)}
                    </Badge>
                    <Badge variant="secondary">
                      {task.task_number}
                    </Badge>
                    {task.channel_origin && (
                      <Badge variant="outline">
                        {task.channel_origin}
                      </Badge>
                    )}
                    {task.is_training_mode && (
                      <Badge variant="destructive">
                        ENTRENAMIENTO
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{task.product?.name} ({task.product?.sku})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Cantidad:</span>
                      <span>{task.quantity_picked || 0}/{task.quantity_requested}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Desde: {task.source_location?.code}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Hacia: {task.destination_location?.code}</span>
                    </div>
                    {task.assigned_user && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{task.assigned_user.first_name} {task.assigned_user.last_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(new Date(task.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  </div>

                  {task.notes && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Notas:</span> {task.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 ml-4 text-right">
                  <div className="text-xs text-muted-foreground">
                    ~{task.estimated_duration_minutes} min
                  </div>
                  {task.actual_duration_minutes && (
                    <div className="text-xs text-muted-foreground">
                      Real: {task.actual_duration_minutes} min
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron tareas</h3>
            <p className="text-muted-foreground">
              Intenta ajustar los filtros o crear una nueva tarea.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
