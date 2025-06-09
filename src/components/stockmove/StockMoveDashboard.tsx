
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, AlertTriangle, CheckCircle, Play, Users } from 'lucide-react';
import { StockMoveService } from '@/services/stockMoveService';
import { PendingTasksList } from './PendingTasksList';
import { MyTasksList } from './MyTasksList';
import { CreateTaskDialog } from './CreateTaskDialog';
import { TaskExecutionDialog } from './TaskExecutionDialog';
import { ExecutionHistoryList } from './ExecutionHistoryList';

export const StockMoveDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalPendingTasks: 0,
    totalInProgress: 0,
    totalCompletedToday: 0,
    averageCompletionTime: 0,
    urgentTasks: 0,
  });
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadMetrics();
  }, [refreshTrigger]);

  const loadMetrics = async () => {
    const data = await StockMoveService.getMetrics();
    setMetrics(data);
  };

  const handleTaskAction = (task: any, action: 'execute' | 'view') => {
    setSelectedTask(task);
    if (action === 'execute') {
      setShowExecutionDialog(true);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Move</h1>
          <p className="text-muted-foreground">
            Gestión de reposición y movimientos de stock
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Package className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPendingTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCompletedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCompletionTime}min</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.urgentTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de contenido */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Tareas Pendientes</TabsTrigger>
          <TabsTrigger value="my-tasks">Mis Tareas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes</CardTitle>
              <CardDescription>
                Tareas de reposición y movimiento disponibles para tomar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingTasksList 
                onTaskAction={handleTaskAction}
                refreshTrigger={refreshTrigger}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tasks">
          <Card>
            <CardHeader>
              <CardTitle>Mis Tareas Asignadas</CardTitle>
              <CardDescription>
                Tareas que tienes asignadas y en progreso
              </CardDescription>
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

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Ejecuciones</CardTitle>
              <CardDescription>
                Registro completo de movimientos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionHistoryList refreshTrigger={refreshTrigger} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTaskDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTaskCreated={handleRefresh}
      />

      <TaskExecutionDialog 
        open={showExecutionDialog}
        onOpenChange={setShowExecutionDialog}
        task={selectedTask}
        onTaskCompleted={handleRefresh}
      />
    </div>
  );
};
