
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const AvailableTasksList = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['picking-available-tasks'],
    queryFn: PickingService.getAvailableTasks
  });

  const takeTaskMutation = useMutation({
    mutationFn: PickingService.takeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-available-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['picking-my-tasks'] });
      toast.success('Tarea asignada correctamente');
    },
    onError: () => {
      toast.error('Error al asignar la tarea');
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
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

  const handleTakeTask = (taskId: string) => {
    takeTaskMutation.mutate(taskId);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando tareas disponibles...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">¡No hay tareas pendientes!</h3>
        <p className="text-muted-foreground">
          Todas las tareas han sido asignadas o completadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority === 'urgent' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {task.priority.toUpperCase()}
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
                    <span>{task.quantity_requested}</span>
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
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      Creada {formatDistanceToNow(new Date(task.created_at), { 
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

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  onClick={() => handleTakeTask(task.id)}
                  disabled={takeTaskMutation.isPending}
                  className="w-full"
                >
                  {takeTaskMutation.isPending ? 'Asignando...' : 'Tomar Tarea'}
                </Button>
                <div className="text-xs text-center text-muted-foreground">
                  ~{task.estimated_duration_minutes} min
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
