
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Users,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PickingService } from '@/services/pickingService';

export const PickingMetricsDashboard = () => {
  // Obtener métricas de los últimos 7 días
  const { data: weekMetrics } = useQuery({
    queryKey: ['picking-week-metrics'],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      return PickingService.getPickingMetrics(
        undefined,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    }
  });

  // Obtener todas las tareas para calcular métricas generales
  const { data: allTasks } = useQuery({
    queryKey: ['picking-all-tasks-metrics'],
    queryFn: () => PickingService.getPickingTasks()
  });

  // Calcular métricas generales
  const generalMetrics = React.useMemo(() => {
    if (!allTasks) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = allTasks.filter(task => task.created_at.startsWith(today));
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    const inProgressTasks = allTasks.filter(task => task.status === 'in_progress');

    const totalDuration = completedTasks.reduce((sum, task) => 
      sum + (task.actual_duration_minutes || 0), 0
    );
    const avgDuration = completedTasks.length > 0 ? totalDuration / completedTasks.length : 0;

    const totalItems = completedTasks.reduce((sum, task) => sum + task.quantity_picked, 0);
    const totalExpected = completedTasks.reduce((sum, task) => sum + task.quantity_requested, 0);
    const accuracy = totalExpected > 0 ? (totalItems / totalExpected) * 100 : 100;

    const activeOperators = new Set(inProgressTasks.map(task => task.assigned_to)).size;

    return {
      totalTasksToday: todayTasks.length,
      completedToday: todayTasks.filter(task => task.status === 'completed').length,
      avgDuration: Math.round(avgDuration),
      accuracy: Math.round(accuracy * 100) / 100,
      activeOperators,
      urgentPending: allTasks.filter(task => 
        task.priority === 'urgent' && !['completed', 'cancelled'].includes(task.status)
      ).length
    };
  }, [allTasks]);

  // Preparar datos para gráficos
  const chartData = React.useMemo(() => {
    if (!weekMetrics) return [];

    const groupedByDate = weekMetrics.reduce((acc, metric) => {
      const date = metric.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          tasks_completed: 0,
          total_items_picked: 0,
          avg_duration: 0,
          accuracy: 0,
          count: 0
        };
      }
      
      acc[date].tasks_completed += metric.tasks_completed;
      acc[date].total_items_picked += metric.total_items_picked;
      acc[date].avg_duration += metric.average_time_per_task;
      acc[date].accuracy += metric.accuracy_percentage;
      acc[date].count += 1;
      
      return acc;
    }, {} as any);

    return Object.values(groupedByDate).map((day: any) => ({
      ...day,
      avg_duration: Math.round(day.avg_duration / day.count),
      accuracy: Math.round(day.accuracy / day.count),
      date: new Date(day.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [weekMetrics]);

  // Top operarios
  const topOperators = React.useMemo(() => {
    if (!weekMetrics) return [];

    const operatorStats = weekMetrics.reduce((acc, metric) => {
      const operatorId = metric.operator_id;
      if (!acc[operatorId]) {
        acc[operatorId] = {
          operator_id: operatorId,
          total_tasks: 0,
          total_items: 0,
          avg_accuracy: 0,
          avg_duration: 0,
          count: 0
        };
      }
      
      acc[operatorId].total_tasks += metric.tasks_completed;
      acc[operatorId].total_items += metric.total_items_picked;
      acc[operatorId].avg_accuracy += metric.accuracy_percentage;
      acc[operatorId].avg_duration += metric.average_time_per_task;
      acc[operatorId].count += 1;
      
      return acc;
    }, {} as any);

    return Object.values(operatorStats)
      .map((op: any) => ({
        ...op,
        avg_accuracy: Math.round(op.avg_accuracy / op.count),
        avg_duration: Math.round(op.avg_duration / op.count)
      }))
      .sort((a: any, b: any) => b.total_tasks - a.total_tasks)
      .slice(0, 5);
  }, [weekMetrics]);

  return (
    <div className="space-y-6">
      {/* Métricas generales */}
      {generalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Hoy</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalMetrics.totalTasksToday}</div>
              <p className="text-xs text-muted-foreground">
                {generalMetrics.completedToday} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalMetrics.avgDuration}m</div>
              <p className="text-xs text-muted-foreground">
                Por tarea completada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisión</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalMetrics.accuracy}%</div>
              <p className="text-xs text-muted-foreground">
                Cantidad correcta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{generalMetrics.activeOperators}</div>
              <p className="text-xs text-muted-foreground">
                Trabajando ahora
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{generalMetrics.urgentPending}</div>
              <p className="text-xs text-muted-foreground">
                Pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {generalMetrics.totalTasksToday > 0 ? 
                  Math.round((generalMetrics.completedToday / generalMetrics.totalTasksToday) * 100) : 0
                }%
              </div>
              <p className="text-xs text-muted-foreground">
                Completadas/Total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tareas Completadas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks_completed" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo Promedio por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg_duration" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top operarios */}
      <Card>
        <CardHeader>
          <CardTitle>Top Operarios (Última Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topOperators.map((operator, index) => (
              <div key={operator.operator_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">Operario {operator.operator_id.substring(0, 8)}</div>
                    <div className="text-sm text-muted-foreground">
                      {operator.total_tasks} tareas completadas
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{operator.total_items}</div>
                    <div className="text-muted-foreground">Items</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{operator.avg_duration}m</div>
                    <div className="text-muted-foreground">Promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{operator.avg_accuracy}%</div>
                    <div className="text-muted-foreground">Precisión</div>
                  </div>
                </div>
              </div>
            ))}
            
            {topOperators.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos de operarios disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
