
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocationsList } from '@/components/inventory/LocationsList';
import { CreateLocationDialog } from '@/components/inventory/CreateLocationDialog';
import { WarehousesList } from '@/components/inventory/WarehousesList';
import { CreateWarehouseDialog } from '@/components/inventory/CreateWarehouseDialog';
import { MapPin, Package } from 'lucide-react';

export default function Locations() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Ubicaciones</h1>
            <p className="text-muted-foreground">
              Administra almacenes, ubicaciones y zonas de tu inventario
            </p>
          </div>
        </div>

        <Tabs defaultValue="locations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicaciones
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Almacenes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ubicaciones del Inventario</CardTitle>
                  <CreateLocationDialog />
                </div>
              </CardHeader>
              <CardContent>
                <LocationsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Almacenes</CardTitle>
                  <CreateWarehouseDialog />
                </div>
              </CardHeader>
              <CardContent>
                <WarehousesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
