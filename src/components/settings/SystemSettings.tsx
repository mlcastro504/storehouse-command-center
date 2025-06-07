
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Server, Database, HardDrive, Activity, Download, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function SystemSettings() {
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    sessionTimeout: '30',
    backupFrequency: 'daily',
    cacheEnabled: true,
    apiRateLimit: '1000'
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configuración del sistema guardada",
      description: "Los cambios se aplicarán en el próximo reinicio del sistema.",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Backup iniciado",
      description: "Se ha iniciado el proceso de respaldo del sistema.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportación iniciada",
      description: "Los datos se están preparando para la descarga.",
    });
  };

  const systemInfo = {
    version: '2.1.4',
    uptime: '15 días, 8 horas',
    database: 'PostgreSQL 15.3',
    storage: { used: 45, total: 100 },
    memory: { used: 68, total: 100 },
    cpu: 23
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Información del Sistema
          </CardTitle>
          <CardDescription>
            Estado actual del sistema y recursos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Versión</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{systemInfo.version}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tiempo Activo</Label>
              <p className="text-sm text-muted-foreground">{systemInfo.uptime}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Base de Datos</Label>
              <p className="text-sm text-muted-foreground">{systemInfo.database}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">CPU</Label>
              <div className="flex items-center gap-2">
                <Progress value={systemInfo.cpu} className="flex-1" />
                <span className="text-sm text-muted-foreground">{systemInfo.cpu}%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <Label>Almacenamiento</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span>{systemInfo.storage.used} GB de {systemInfo.storage.total} GB</span>
                </div>
                <Progress value={(systemInfo.storage.used / systemInfo.storage.total) * 100} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <Label>Memoria RAM</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usado</span>
                  <span>{systemInfo.memory.used}% de 8 GB</span>
                </div>
                <Progress value={systemInfo.memory.used} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
          <CardDescription>
            Ajustes avanzados del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Desactivar acceso para usuarios
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar logs detallados
                  </p>
                </div>
                <Switch
                  checked={systemSettings.debugMode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, debugMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache del Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Mejorar rendimiento
                  </p>
                </div>
                <Switch
                  checked={systemSettings.cacheEnabled}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, cacheEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nivel de Logs</Label>
                <Select 
                  value={systemSettings.logLevel} 
                  onValueChange={(value) => setSystemSettings({ ...systemSettings, logLevel: value })}
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
                <Label>Timeout de Sesión (minutos)</Label>
                <Input
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Límite de API (req/hora)</Label>
                <Input
                  value={systemSettings.apiRateLimit}
                  onChange={(e) => setSystemSettings({ ...systemSettings, apiRateLimit: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>
            Herramientas para backup y exportación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frecuencia de Backup Automático</Label>
              <Select 
                value={systemSettings.backupFrequency} 
                onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}
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

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleBackup} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Crear Backup Manual
              </Button>

              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Exportar Datos
              </Button>

              <Button variant="outline">
                Restaurar desde Backup
              </Button>

              <Button variant="destructive">
                Limpiar Logs Antiguos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
