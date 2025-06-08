
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockMovementsList } from '@/components/movements/StockMovementsList';
import { CreateMovementDialog } from '@/components/movements/CreateMovementDialog';
import { MovementTypesList } from '@/components/movements/MovementTypesList';
import { ArrowUpDown, Plus, List, Settings } from 'lucide-react';

export default function StockMovements() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Movimientos de Stock</h1>
            <p className="text-muted-foreground">
              Gestiona y monitorea todos los movimientos de inventario
            </p>
          </div>
          <CreateMovementDialog />
        </div>

        <Tabs defaultValue="movements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Movimientos
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tipos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <StockMovementsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Movimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <MovementTypesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
