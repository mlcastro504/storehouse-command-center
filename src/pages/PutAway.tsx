
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PutAwayTasksList } from '@/components/putaway/PutAwayTasksList';
import { CreatePutAwayTaskDialog } from '@/components/putaway/CreatePutAwayTaskDialog';
import { PutAwayRulesList } from '@/components/putaway/PutAwayRulesList';
import { PutAwayPerformanceChart } from '@/components/putaway/PutAwayPerformanceChart';
import { Package, Settings, BarChart3, Plus } from 'lucide-react';

export default function PutAway() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Put Away</h1>
            <p className="text-muted-foreground">
              Gestiona tareas de almacenaje y ubicación de productos
            </p>
          </div>
          <CreatePutAwayTaskDialog />
        </div>

        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tareas
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Reglas
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rendimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tareas de Put Away</CardTitle>
              </CardHeader>
              <CardContent>
                <PutAwayTasksList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <PutAwayRulesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <PutAwayPerformanceChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
