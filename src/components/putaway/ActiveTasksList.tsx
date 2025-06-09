
import React from 'react';
import { useActiveTasks, useCompleteTask, useCancelTask } from '@/hooks/usePutAway';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CompleteTaskDialog } from './CompleteTaskDialog';
import { CancelTaskDialog } from './CancelTaskDialog';
import { Package, MapPin, Clock, User, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ActiveTasksList = () => {
  const { user } = useAuth();
  const { data: tasks, isLoading, error } = useActiveTasks();
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error al cargar las tareas activas
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay tareas activas en este momento</p>
        <p className="text-sm">Las tareas aparecerán aquí cuando tomes un palet</p>
      </div>
    );
  }

  const handleCompleteTask = (taskId: string) => {
    setSelectedTask(taskId);
    setShowCompleteDialog(true);
  };

  const handleCancelTask = (taskId: string) => {
    setSelectedTask(taskId);
    setShowCancelDialog(true);
  };

  const selectedTaskData = tasks.find(t => t.id === selectedTask);

  return (
    <>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{task.task_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Palet: {task.pallet?.pallet_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">En Progreso</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Producto</p>
                    <p className="font-medium">
                      {task.pallet?.product?.name || 'Desconocido'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación Sugerida</p>
                    <p className="font-medium">
                      {task.suggested_location?.name || 'No asignada'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Iniciado</p>
                    <p className="font-medium">
                      {format(new Date(task.started_at), 'dd/MM HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Asignado a: {task.operator_id === user?.id ? 'Ti' : task.operator_id}
                </span>
              </div>

              {task.operator_id === user?.id && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelTask(task.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTaskData && (
        <>
          <CompleteTaskDialog
            open={showCompleteDialog}
            onOpenChange={setShowCompleteDialog}
            task={selectedTaskData}
          />
          <CancelTaskDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            task={selectedTaskData}
          />
        </>
      )}
    </>
  );
};
