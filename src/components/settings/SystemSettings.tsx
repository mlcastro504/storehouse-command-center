
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Server, Shield, Clock, Database } from 'lucide-react';

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
      {/* Configuración del Servidor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Configuración del Servidor
          </CardTitle>
          <CardDescription>
            Configuraciones relacionadas con el rendimiento y comportamiento del servidor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo de mantenimiento</Label>
              <p className="text-sm text-muted-foreground">
                Activar para realizar mantenimiento del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.maintenance_mode && (
                <Badge variant="destructive">Activo</Badge>
              )}
              <Switch
                checked={settings.maintenance_mode || false}
                onCheckedChange={(checked) => updateSettings({ maintenance_mode: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo de depuración</Label>
              <p className="text-sm text-muted-foreground">
                Activar información adicional para desarrollo
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.debug_mode && (
                <Badge variant="secondary">Activo</Badge>
              )}
              <Switch
                checked={settings.debug_mode || false}
                onCheckedChange={(checked) => updateSettings({ debug_mode: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de espera de sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.session_timeout_minutes || 30}
                onChange={(e) => updateSettings({ session_timeout_minutes: parseInt(e.target.value) || 30 })}
                min="5"
                max="480"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiRateLimit">Límite de peticiones API por minuto</Label>
              <Input
                id="apiRateLimit"
                type="number"
                value={settings.api_rate_limit || 1000}
                onChange={(e) => updateSettings({ api_rate_limit: parseInt(e.target.value) || 1000 })}
                min="100"
                max="10000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuración de Cache
          </CardTitle>
          <CardDescription>
            Configuraciones para optimizar el rendimiento del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activar cache</Label>
              <p className="text-sm text-muted-foreground">
                Mejora el rendimiento almacenando datos temporalmente
              </p>
            </div>
            <Switch
              checked={settings.cache_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ cache_enabled: checked })}
            />
          </div>

          {settings.cache_enabled !== false && (
            <>
              <Separator />
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Limpiar Cache</Button>
                <Button variant="outline" size="sm">Estadísticas de Cache</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configuración de Logs
          </CardTitle>
          <CardDescription>
            Configuraciones para el registro de eventos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="logLevel">Nivel de log</Label>
            <Select 
              value={settings.log_level || 'info'} 
              onValueChange={(value) => updateSettings({ log_level: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Advertencia</SelectItem>
                <SelectItem value="info">Información</SelectItem>
                <SelectItem value="debug">Depuración</SelectItem>
                <SelectItem value="trace">Traza</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Ver Logs</Button>
            <Button variant="outline" size="sm">Descargar Logs</Button>
            <Button variant="outline" size="sm">Limpiar Logs</Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Respaldos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configuración de Respaldos
          </CardTitle>
          <CardDescription>
            Configuraciones para los respaldos automáticos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Frecuencia de respaldos</Label>
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

          <Separator />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Último respaldo</Label>
              <p className="text-sm text-muted-foreground">
                Hoy a las 02:00 AM
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Crear Respaldo</Button>
              <Button variant="outline" size="sm">Ver Respaldos</Button>
              <Button variant="outline" size="sm">Restaurar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
          <CardDescription>
            Información técnica del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Versión del Sistema</Label>
              <p className="text-sm text-muted-foreground">v2.1.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Base de Datos</Label>
              <p className="text-sm text-muted-foreground">PostgreSQL 14.2</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Tiempo de actividad</Label>
              <p className="text-sm text-muted-foreground">15 días, 8 horas</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Uso de memoria</Label>
              <p className="text-sm text-muted-foreground">2.1 GB / 8 GB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
