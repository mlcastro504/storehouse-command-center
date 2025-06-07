
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Server, Shield, Database } from 'lucide-react';

export function SystemSettings() {
  const { settings, loading, updateSettings } = useSystemSettings();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No se pudieron cargar las configuraciones del sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Configuración del Servidor
          </CardTitle>
          <CardDescription>
            Configura los parámetros del sistema y servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.session_timeout_minutes || 30}
                onChange={(e) => updateSettings({ session_timeout_minutes: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiRateLimit">Límite de API (por minuto)</Label>
              <Input
                id="apiRateLimit"
                type="number"
                value={settings.api_rate_limit || 1000}
                onChange={(e) => updateSettings({ api_rate_limit: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">Nivel de Logs</Label>
              <Select 
                value={settings.log_level || 'info'} 
                onValueChange={(value) => updateSettings({ log_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Frecuencia de Backup</Label>
              <Select 
                value={settings.backup_frequency || 'daily'} 
                onValueChange={(value) => updateSettings({ backup_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Cada hora</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estados del Sistema</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Modo de Mantenimiento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activar para realizar mantenimiento del sistema
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode || false}
                onCheckedChange={(checked) => updateSettings({ maintenance_mode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Debug</Label>
                <p className="text-sm text-muted-foreground">
                  Activar logs detallados para desarrollo
                </p>
              </div>
              <Switch
                checked={settings.debug_mode || false}
                onCheckedChange={(checked) => updateSettings({ debug_mode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Caché Habilitado
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mejorar rendimiento mediante caché
                </p>
              </div>
              <Switch
                checked={settings.cache_enabled !== false}
                onCheckedChange={(checked) => updateSettings({ cache_enabled: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>
            Información actual del estado del servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Estado</Badge>
              <p className="text-2xl font-bold text-green-600">Activo</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Uptime</Badge>
              <p className="text-2xl font-bold">99.9%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Carga</Badge>
              <p className="text-2xl font-bold">12%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
