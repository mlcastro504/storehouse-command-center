
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Clock, HardDrive } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function BackupSettings() {
  const [backupConfig, setBackupConfig] = useState({
    autoBackupEnabled: true,
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    format: 'json',
    destination: 'local',
    emailNotifications: true
  });

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const { toast } = useToast();

  const createManualBackup = () => {
    setIsCreatingBackup(true);
    toast({
      title: "Creando backup",
      description: "El backup manual se está generando. Te notificaremos cuando esté listo.",
    });

    setTimeout(() => {
      setIsCreatingBackup(false);
      toast({
        title: "Backup completado",
        description: "El backup se ha creado exitosamente y está listo para descarga.",
      });
    }, 5000);
  };

  const handleRestore = () => {
    toast({
      title: "Restaurar desde backup",
      description: "Se abrirá el asistente para seleccionar y restaurar un backup.",
    });
  };

  const saveBackupConfig = () => {
    toast({
      title: "Configuración de backup guardada",
      description: "La configuración de backup automático se ha actualizado.",
    });
  };

  const recentBackups = [
    { id: '1', date: '2024-01-15 02:00', size: '245 MB', status: 'success' },
    { id: '2', date: '2024-01-14 02:00', size: '243 MB', status: 'success' },
    { id: '3', date: '2024-01-13 02:00', size: '241 MB', status: 'success' },
    { id: '4', date: '2024-01-12 02:00', size: '239 MB', status: 'error' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Gestión de Backups
        </CardTitle>
        <CardDescription>
          Configura backups automáticos y manuales de tu base de datos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3">
          <Button 
            onClick={createManualBackup} 
            disabled={isCreatingBackup}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isCreatingBackup ? 'Creando Backup...' : 'Crear Backup Manual'}
          </Button>

          <Button variant="outline" onClick={handleRestore} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Restaurar desde Backup
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Backup Automático</Label>
              <p className="text-xs text-muted-foreground">
                Crear backups automáticamente según la programación
              </p>
            </div>
            <Switch
              checked={backupConfig.autoBackupEnabled}
              onCheckedChange={(checked) => setBackupConfig({ ...backupConfig, autoBackupEnabled: checked })}
            />
          </div>

          {backupConfig.autoBackupEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select 
                  value={backupConfig.frequency} 
                  onValueChange={(value) => setBackupConfig({ ...backupConfig, frequency: value })}
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

              <div className="space-y-2">
                <Label>Hora de Ejecución</Label>
                <Input
                  type="time"
                  value={backupConfig.time}
                  onChange={(e) => setBackupConfig({ ...backupConfig, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Retención (días)</Label>
                <Input
                  type="number"
                  value={backupConfig.retentionDays}
                  onChange={(e) => setBackupConfig({ ...backupConfig, retentionDays: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Formato</Label>
                <Select 
                  value={backupConfig.format} 
                  onValueChange={(value) => setBackupConfig({ ...backupConfig, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="bson">BSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destino</Label>
                <Select 
                  value={backupConfig.destination} 
                  onValueChange={(value) => setBackupConfig({ ...backupConfig, destination: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gdrive">Google Drive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Notificaciones por Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Recibir emails sobre el estado de los backups
                  </p>
                </div>
                <Switch
                  checked={backupConfig.emailNotifications}
                  onCheckedChange={(checked) => setBackupConfig({ ...backupConfig, emailNotifications: checked })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Backups Recientes</Label>
          <div className="space-y-2">
            {recentBackups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{backup.date}</p>
                    <p className="text-xs text-muted-foreground">{backup.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {backup.status === 'success' ? (
                    <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
                  ) : (
                    <Badge variant="destructive">Error</Badge>
                  )}
                  {backup.status === 'success' && (
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Descargar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveBackupConfig}>
            Guardar Configuración
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
