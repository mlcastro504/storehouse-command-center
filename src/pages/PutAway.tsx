
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingPalletsList } from '@/components/putaway/PendingPalletsList';
import { ActiveTasksList } from '@/components/putaway/ActiveTasksList';
import { TaskHistoryList } from '@/components/putaway/TaskHistoryList';
import { PutAwayMetricsDashboard } from '@/components/putaway/PutAwayMetricsDashboard';
import { PutAwayRulesList } from '@/components/putaway/PutAwayRulesList';
import { Package, Clock, History, BarChart3, Settings } from 'lucide-react';

export default function PutAway() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Put Away</h1>
            <p className="text-muted-foreground">
              Gestión de almacenaje de palets en ubicaciones del warehouse
            </p>
          </div>
        </div>

        {/* Dashboard de métricas */}
        <PutAwayMetricsDashboard />

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Palets Pendientes
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tareas Activas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Reglas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Palets Disponibles para Almacenar</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecciona un palet para iniciar el proceso de Put Away
                </p>
              </CardHeader>
              <CardContent>
                <PendingPalletsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tareas en Progreso</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tareas de Put Away actualmente en proceso
                </p>
              </CardHeader>
              <CardContent>
                <ActiveTasksList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Tareas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Registro de todas las tareas completadas y canceladas
                </p>
              </CardHeader>
              <CardContent>
                <TaskHistoryList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalladas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análisis de rendimiento y estadísticas del módulo Put Away
                </p>
              </CardHeader>
              <CardContent>
                {/* Aquí irían gráficos más detallados */}
                <div className="text-center text-muted-foreground py-8">
                  Métricas detalladas en desarrollo
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Put Away</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configuración de reglas automáticas para ubicación de palets
                </p>
              </CardHeader>
              <CardContent>
                <PutAwayRulesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
