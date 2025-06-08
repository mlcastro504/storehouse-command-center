
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingAppointmentsList } from '@/components/loading/LoadingAppointmentsList';
import { CreateAppointmentDialog } from '@/components/loading/CreateAppointmentDialog';
import { LoadingDocksList } from '@/components/loading/LoadingDocksList';
import { ShipmentsList } from '@/components/loading/ShipmentsList';
import { DeliveryRoutesList } from '@/components/loading/DeliveryRoutesList';
import { Truck, Calendar, Package, MapPin } from 'lucide-react';

export default function Loading() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Carga y Descarga</h1>
            <p className="text-muted-foreground">
              Gestiona muelles, citas y envíos
            </p>
          </div>
          <CreateAppointmentDialog />
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Citas
            </TabsTrigger>
            <TabsTrigger value="docks" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Muelles
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Envíos
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Rutas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Citas de Carga/Descarga</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingAppointmentsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Muelles de Carga</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingDocksList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Envíos</CardTitle>
              </CardHeader>
              <CardContent>
                <ShipmentsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rutas de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryRoutesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
