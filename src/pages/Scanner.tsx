
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanSessionsList } from '@/components/scanner/ScanSessionsList';
import { CreateScanSessionDialog } from '@/components/scanner/CreateScanSessionDialog';
import { ScanDevicesList } from '@/components/scanner/ScanDevicesList';
import { ScanValidationRules } from '@/components/scanner/ScanValidationRules';
import { Smartphone, Settings, Activity, CheckSquare } from 'lucide-react';

export default function Scanner() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Escáner</h1>
            <p className="text-muted-foreground">
              Gestiona sesiones de escaneo y dispositivos
            </p>
          </div>
          <CreateScanSessionDialog />
        </div>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Dispositivos
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Validación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones de Escaneo</CardTitle>
              </CardHeader>
              <CardContent>
                <ScanSessionsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos de Escaneo</CardTitle>
              </CardHeader>
              <CardContent>
                <ScanDevicesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Validación</CardTitle>
              </CardHeader>
              <CardContent>
                <ScanValidationRules />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
