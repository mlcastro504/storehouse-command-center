
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Package, MapPin, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { StockMoveService } from '@/services/stockMoveService';
import { toast } from 'sonner';

interface MyTasksListProps {
  onTaskAction: (task: any, action: 'execute' | 'view') => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

export const MyTasksList: React.FC<MyTasksListProps> = ({
  onTaskAction,
  refreshTrigger,
  onRefresh
}) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await StockMoveService.getMyTasks('current-user-id'); // TODO: Get actual user ID
      setTasks(data);
    } catch (error) {
      console.error('Error loading my tasks:', error);
      toast.error('Error al cargar mis tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const success = await StockMoveService.startTask(taskId);
      if (success) {
        toast.success('Tarea iniciada');
        onRefresh();
      } else {
        toast.error('Error al iniciar la tarea');
      }
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Error al iniciar la tarea');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignada';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando mis tareas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes tareas asignadas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Ve a la pestaña "Tareas Pendientes" para tomar una nueva tarea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estado</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Asignada</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{task.products?.name}</div>
                  <div className="text-sm text-gray-500">SKU: {task.products?.sku}</div>
                </div>
              </TableCell>
              <TableCell>{task.quantity_needed}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{task.source_location?.code}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{task.destination_location?.code}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(task.assigned_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                {task.status === 'assigned' ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleStartTask(task.id)}
                    className="mr-2"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Iniciar
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => onTaskAction(task, 'execute')}
                    className="mr-2"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Ejecutar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
