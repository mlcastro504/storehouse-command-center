
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Monitor } from 'lucide-react';

export function NotificationSettings() {
  const { settings, loading, updateSettings } = useNotificationSettings();

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
            <p className="text-muted-foreground">No se pudieron cargar las configuraciones de notificaciones.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificaciones por Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Notificaciones por Email
          </CardTitle>
          <CardDescription>
            Configura qué notificaciones quieres recibir por correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activar notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones generales por correo electrónico
              </p>
            </div>
            <Switch
              checked={settings.email_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
            />
          </div>

          {settings.email_enabled !== false && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de pedidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre cambios en pedidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_order_updates !== false}
                    onCheckedChange={(checked) => updateSettings({ email_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de inventario</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas cuando el stock está bajo
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_stock_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ email_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de seguridad</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones importantes de seguridad
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_security_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ email_security_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones del sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Información sobre actualizaciones y mantenimiento
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_system_updates !== false}
                    onCheckedChange={(checked) => updateSettings({ email_system_updates: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia de emails</Label>
                  <Select 
                    value={settings.email_frequency || 'instant'} 
                    onValueChange={(value) => updateSettings({ email_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Inmediato</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones SMS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Notificaciones SMS
          </CardTitle>
          <CardDescription>
            Configura las notificaciones por mensaje de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activar notificaciones SMS</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones por mensaje de texto
              </p>
            </div>
            <Switch
              checked={settings.sms_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ sms_enabled: checked })}
            />
          </div>

          {settings.sms_enabled !== false && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Solo alertas críticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Únicamente notificaciones urgentes
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_critical_only !== false}
                    onCheckedChange={(checked) => updateSettings({ sms_critical_only: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de emergencia</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones de emergencias del sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_emergency_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ sms_emergency_alerts: checked })}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones en la App */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Notificaciones en la Aplicación
          </CardTitle>
          <CardDescription>
            Configura las notificaciones dentro de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activar notificaciones en la app</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones dentro de la aplicación
              </p>
            </div>
            <Switch
              checked={settings.in_app_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ in_app_enabled: checked })}
            />
          </div>

          {settings.in_app_enabled !== false && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sonido de notificaciones</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproducir sonido al recibir notificaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_sound !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_sound: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de pedidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre cambios en pedidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_order_updates !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de inventario</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas cuando el stock está bajo
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_stock_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Asignación de tareas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando se asignan nuevas tareas
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_task_assignments !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_task_assignments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mensajes del sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Mensajes importantes del administrador
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_system_messages !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_system_messages: checked })}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
