
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanSessionsList } from '@/components/scanner/ScanSessionsList';
import { CreateScanSessionDialog } from '@/components/scanner/CreateScanSessionDialog';
import { ScanDevicesList } from '@/components/scanner/ScanDevicesList';
import { ScanValidationRules } from '@/components/scanner/ScanValidationRules';
import { ScannerMetricsDashboard } from '@/components/scanner/ScannerMetricsDashboard';
import { DeviceManagement } from '@/components/scanner/DeviceManagement';
import { CameraScanInterface } from '@/components/scanner/CameraScanInterface';
import { useProcessScan } from '@/hooks/useScanner';
import { Smartphone, Settings, Activity, CheckSquare, BarChart3, Camera, Cog } from 'lucide-react';

export default function Scanner() {
  const processScan = useProcessScan();

  const handleScanSuccess = (value: string) => {
    console.log('Scan successful:', value);
    // Aquí se procesaría el escaneo
    processScan.mutate({
      scanned_value: value,
      scan_type: 'barcode',
      session_id: 'current_session', // Se obtendría de la sesión activa
      device_id: 'current_device'
    });
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Escáner</h1>
            <p className="text-muted-foreground">
              Sistema integral de gestión de escaneo y dispositivos
            </p>
          </div>
          <CreateScanSessionDialog />
        </div>

        {/* Dashboard de métricas */}
        <ScannerMetricsDashboard />

        <Tabs defaultValue="camera" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Cámara
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Dispositivos
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Gestión
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Validación
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="camera" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Escaneo con Cámara</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Utiliza la cámara de tu dispositivo para escanear códigos de barras y QR
                </p>
              </CardHeader>
              <CardContent>
                <CameraScanInterface
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                  config={{
                    enabled: true,
                    preferred_camera: 'rear',
                    resolution: 'high',
                    auto_focus: true,
                    flash_mode: 'auto',
                    scan_area_overlay: true,
                    continuous_scan: false,
                    beep_on_scan: true,
                    vibrate_on_scan: true,
                    quality: 'medium',
                    flashEnabled: false,
                    autoFocus: true,
                    formats: ['CODE_128', 'QR_CODE']
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones de Escaneo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gestiona las sesiones activas y el historial de escaneos
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Lista de dispositivos registrados y su estado actual
                </p>
              </CardHeader>
              <CardContent>
                <ScanDevicesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Validación</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configura las reglas de validación para diferentes tipos de escaneo
                </p>
              </CardHeader>
              <CardContent>
                <ScanValidationRules />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Detalladas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Análisis de rendimiento y estadísticas del sistema de escaneo
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gráficos y análisis detallados en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajustes generales del módulo de escaneo
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Panel de configuración en desarrollo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
