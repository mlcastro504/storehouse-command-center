
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Package, MapPin, ArrowRight, Play } from 'lucide-react';
import { StockMoveService } from '@/services/stockMoveService';
import { toast } from 'sonner';

interface PendingTasksListProps {
  onTaskAction: (task: any, action: 'execute' | 'view') => void;
  refreshTrigger: number;
  onRefresh: () => void;
}

export const PendingTasksList: React.FC<PendingTasksListProps> = ({
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
      const data = await StockMoveService.getPendingTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTask = async (taskId: string) => {
    try {
      const success = await StockMoveService.takeTask(taskId, 'current-user-id'); // TODO: Get actual user ID
      if (success) {
        toast.success('Tarea tomada exitosamente');
        onRefresh();
      } else {
        toast.error('Error al tomar la tarea');
      }
    } catch (error) {
      console.error('Error taking task:', error);
      toast.error('Error al tomar la tarea');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando tareas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas pendientes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Todas las tareas han sido asignadas o completadas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Prioridad</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
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
                <Badge variant="outline">
                  {task.task_type === 'replenishment' ? 'Reposición' : 
                   task.task_type === 'relocation' ? 'Reubicación' : 'Consolidación'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(task.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <Button 
                  size="sm" 
                  onClick={() => handleTakeTask(task.id)}
                  className="mr-2"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Tomar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
