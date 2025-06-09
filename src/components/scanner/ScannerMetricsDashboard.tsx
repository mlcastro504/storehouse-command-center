
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useScannerMetrics } from '@/hooks/useScanner';
import { Smartphone, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

export const ScannerMetricsDashboard = () => {
  const { data: metrics, isLoading } = useScannerMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos Totales</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_devices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dispositivos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.active_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              En curso ahora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.scans_today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total del día
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Error</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.error_rate ? `${metrics.error_rate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Errores vs éxitos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de dispositivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.devices_by_type && Object.entries(metrics.devices_by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type === 'handheld' ? 'Portátil' : 
                       type === 'mobile' ? 'Móvil' :
                       type === 'tablet' ? 'Tablet' : 'Cámara'}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errores Más Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.top_errors && metrics.top_errors.length > 0 ? (
                metrics.top_errors.map((error, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate flex-1">
                      {error.error_type}
                    </span>
                    <Badge variant="destructive" className="ml-2">
                      {error.count}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay errores registrados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
