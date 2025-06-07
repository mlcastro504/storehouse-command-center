
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Shield, Zap, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function SystemSettings() {
  const { settings, loading, updateSettings } = useSystemSettings();
  const [sessionTimeout, setSessionTimeout] = useState('');
  const [rateLimit, setRateLimit] = useState('');

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

  const handleSaveTimeout = () => {
    const timeout = parseInt(sessionTimeout);
    if (timeout && timeout > 0) {
      updateSettings({ session_timeout_minutes: timeout });
      setSessionTimeout('');
    }
  };

  const handleSaveRateLimit = () => {
    const limit = parseInt(rateLimit);
    if (limit && limit > 0) {
      updateSettings({ api_rate_limit: limit });
      setRateLimit('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración General del Sistema
          </CardTitle>
          <CardDescription>
            Configura los parámetros generales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Modo de Mantenimiento
              </Label>
              <p className="text-sm text-muted-foreground">
                Activar para realizar mantenimiento del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.maintenance_mode && <Badge variant="destructive">Activo</Badge>}
              <Switch
                checked={settings.maintenance_mode || false}
                onCheckedChange={(checked) => updateSettings({ maintenance_mode: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Caché Habilitado
              </Label>
              <p className="text-sm text-muted-foreground">
                Mejorar el rendimiento usando caché del sistema
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.cache_enabled !== false && <Badge variant="outline">Activo</Badge>}
              <Switch
                checked={settings.cache_enabled !== false}
                onCheckedChange={(checked) => updateSettings({ cache_enabled: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Modo Debug
              </Label>
              <p className="text-sm text-muted-foreground">
                Activar información de depuración detallada
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.debug_mode && <Badge variant="outline">Activo</Badge>}
              <Switch
                checked={settings.debug_mode || false}
                onCheckedChange={(checked) => updateSettings({ debug_mode: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Configuración de Sesiones
          </CardTitle>
          <CardDescription>
            Configura los parámetros de las sesiones de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Tiempo de Espera de Sesión (minutos)</Label>
            <div className="flex space-x-2">
              <Input
                id="sessionTimeout"
                type="number"
                value={sessionTimeout || settings.session_timeout_minutes || ''}
                onChange={(e) => setSessionTimeout(e.target.value)}
                placeholder="Ej: 30"
                min="1"
                max="1440"
              />
              <Button onClick={handleSaveTimeout} variant="outline" disabled={!sessionTimeout}>
                Guardar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Actual: {settings.session_timeout_minutes} minutos
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configuración de API
          </CardTitle>
          <CardDescription>
            Configura los límites y parámetros de la API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rateLimit">Límite de Velocidad de API (requests/hora)</Label>
            <div className="flex space-x-2">
              <Input
                id="rateLimit"
                type="number"
                value={rateLimit || settings.api_rate_limit || ''}
                onChange={(e) => setRateLimit(e.target.value)}
                placeholder="Ej: 1000"
                min="100"
                max="10000"
              />
              <Button onClick={handleSaveRateLimit} variant="outline" disabled={!rateLimit}>
                Guardar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Actual: {settings.api_rate_limit} requests por hora
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configuración de Respaldos
          </CardTitle>
          <CardDescription>
            Configura la frecuencia y gestión de respaldos automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Frecuencia de Respaldos</Label>
            <Select 
              value={settings.backup_frequency || 'daily'} 
              onValueChange={(value) => updateSettings({ backup_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona frecuencia" />
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

          <div className="space-y-2">
            <Label>Nivel de Log del Sistema</Label>
            <Select 
              value={settings.log_level || 'info'} 
              onValueChange={(value) => updateSettings({ log_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug (Muy detallado)</SelectItem>
                <SelectItem value="info">Info (Normal)</SelectItem>
                <SelectItem value="warn">Warning (Solo advertencias)</SelectItem>
                <SelectItem value="error">Error (Solo errores)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones del Sistema</CardTitle>
          <CardDescription>
            Herramientas de administración y mantenimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Database className="w-4 h-4 mr-2" />
              Limpiar Caché
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Reiniciar Servicios
            </Button>
            <Button variant="outline" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Verificar Integridad
            </Button>
            <Button variant="outline" className="justify-start">
              <Database className="w-4 h-4 mr-2" />
              Crear Respaldo Manual
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
