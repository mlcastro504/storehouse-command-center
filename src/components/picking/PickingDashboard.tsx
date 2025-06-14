import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';
import { AvailableTasksList } from './AvailableTasksList';
import { MyTasksList } from './MyTasksList';
import { PendingTasksList } from './PendingTasksList';
import { PickingMetricsDashboard } from './PickingMetricsDashboard';

export const PickingDashboard = () => {
  // Queries para métricas del dashboard
  const { data: availableTasks } = useQuery({
    queryKey: ['picking-available-tasks'],
    queryFn: PickingService.getAvailableTasks
  });

  const { data: allTasks } = useQuery({
    queryKey: ['picking-all-tasks'],
    queryFn: () => PickingService.getPickingTasks()
  });

  const { data: todayMetrics } = useQuery({
    queryKey: ['picking-today-metrics'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      return PickingService.getPickingMetrics(undefined, today, today);
    }
  });

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    if (!allTasks) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = allTasks.filter(task => 
      task.created_at.startsWith(today)
    );

    return {
      availableCount: availableTasks?.length || 0,
      inProgressCount: allTasks.filter(t => t.status === 'in_progress').length,
      completedToday: todayTasks.filter(t => t.status === 'completed').length,
      urgentCount: allTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
      totalToday: todayTasks.length
    };
  }, [allTasks, availableTasks]);

  // For MyTasksList required props:
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [selectedTask, setSelectedTask] = React.useState<any>(null);

  const handleTaskAction = (task: any, action: "execute" | "view") => {
    setSelectedTask(task);
    // Optionally open a modal or handle task execution.
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Picking</h1>
          <p className="text-muted-foreground">
            Gestión de tareas de recolección de productos
          </p>
        </div>
      </div>

      {/* Métricas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tareas Disponibles
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableCount}</div>
              <p className="text-xs text-muted-foreground">
                Listas para asignar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Progreso
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressCount}</div>
              <p className="text-xs text-muted-foreground">
                Siendo ejecutadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completadas Hoy
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalToday} tareas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Urgentes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgentCount}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Operarios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(allTasks?.filter(t => t.status === 'in_progress').map(t => t.assigned_to)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Trabajando ahora
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tareas Disponibles
            {stats?.availableCount > 0 && (
              <Badge variant="secondary">{stats.availableCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my-tasks" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Mis Tareas
          </TabsTrigger>
          <TabsTrigger value="all-tasks" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Todas las Tareas
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Disponibles para Asignar</CardTitle>
            </CardHeader>
            <CardContent>
              <AvailableTasksList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Tareas Asignadas</CardTitle>
            </CardHeader>
            <CardContent>
              <MyTasksList
                onTaskAction={handleTaskAction}
                refreshTrigger={refreshTrigger}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Todas las Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              <PendingTasksList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <PickingMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};
