
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  MapPin, 
  Clock, 
  Play,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskExecutionDialog } from './TaskExecutionDialog';

export const MyTasksList = () => {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Obtener usuario actual
  const [currentUserId, setCurrentUserId] = useState<string>('');
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['picking-my-tasks', currentUserId],
    queryFn: () => currentUserId ? PickingService.getMyTasks(currentUserId) : Promise.resolve([]),
    enabled: !!currentUserId
  });

  const startTaskMutation = useMutation({
    mutationFn: PickingService.startTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-my-tasks'] });
      toast.success('Tarea iniciada');
    },
    onError: () => {
      toast.error('Error al iniciar la tarea');
    }
  });

  const cancelTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; reason?: string }) => 
      PickingService.cancelTask(data.taskId, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['picking-my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['picking-available-tasks'] });
      toast.success('Tarea cancelada');
    },
    onError: () => {
      toast.error('Error al cancelar la tarea');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      default: return 'outline';
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

  const handleStartTask = (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const handleExecuteTask = (task: any) => {
    setSelectedTask(task);
    setIsExecutionDialogOpen(true);
  };

  const handleCancelTask = (taskId: string) => {
    if (confirm('¿Estás seguro de que quieres cancelar esta tarea?')) {
      cancelTaskMutation.mutate({ 
        taskId, 
        reason: 'Cancelada por el operario' 
      });
    }
  };

  if (isLoading || !currentUserId) {
    return <div className="flex justify-center p-8">Cargando mis tareas...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes tareas asignadas</h3>
        <p className="text-muted-foreground">
          Ve a la pestaña "Tareas Disponibles" para tomar una nueva tarea.
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
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status === 'assigned' && 'Asignada'}
                    {task.status === 'in_progress' && 'En Progreso'}
                  </Badge>
                  <Badge variant="outline">
                    {getTaskTypeLabel(task.task_type)}
                  </Badge>
                  <Badge variant="secondary">
                    {task.task_number}
                  </Badge>
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
                      Asignada {formatDistanceToNow(new Date(task.assigned_at), { 
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
                {task.status === 'assigned' && (
                  <>
                    <Button
                      onClick={() => handleStartTask(task.id)}
                      disabled={startTaskMutation.isPending}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {startTaskMutation.isPending ? 'Iniciando...' : 'Iniciar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCancelTask(task.id)}
                      disabled={cancelTaskMutation.isPending}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}

                {task.status === 'in_progress' && (
                  <>
                    <Button
                      onClick={() => handleExecuteTask(task)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ejecutar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCancelTask(task.id)}
                      disabled={cancelTaskMutation.isPending}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}

                <div className="text-xs text-center text-muted-foreground">
                  ~{task.estimated_duration_minutes} min
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedTask && (
        <TaskExecutionDialog
          open={isExecutionDialogOpen}
          onOpenChange={setIsExecutionDialogOpen}
          task={selectedTask}
          onSuccess={() => {
            setIsExecutionDialogOpen(false);
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ['picking-my-tasks'] });
          }}
        />
      )}
    </div>
  );
};
