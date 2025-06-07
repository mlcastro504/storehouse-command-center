
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Smartphone, Volume2, Clock } from 'lucide-react';

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
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Habilitar Email
              </Label>
              <p className="text-sm text-muted-foreground">
                Activar/desactivar todas las notificaciones por email
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.email_enabled && <Badge variant="outline">Activo</Badge>}
              <Switch
                checked={settings.email_enabled || false}
                onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
              />
            </div>
          </div>

          {settings.email_enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de Pedidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre cambios en el estado de los pedidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_order_updates !== false}
                    onCheckedChange={(checked) => updateSettings({ email_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Stock</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando los productos están por agotarse
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_stock_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ email_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Seguridad</Label>
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
                    <Label>Actualizaciones del Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre nuevas funciones y mantenimiento
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_system_updates || false}
                    onCheckedChange={(checked) => updateSettings({ email_system_updates: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Frecuencia de Email
                  </Label>
                  <Select 
                    value={settings.email_frequency || 'instant'} 
                    onValueChange={(value) => updateSettings({ email_frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instantáneo</SelectItem>
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
              <Label className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Habilitar SMS
              </Label>
              <p className="text-sm text-muted-foreground">
                Activar/desactivar notificaciones por SMS
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.sms_enabled && <Badge variant="outline">Activo</Badge>}
              <Switch
                checked={settings.sms_enabled || false}
                onCheckedChange={(checked) => updateSettings({ sms_enabled: checked })}
              />
            </div>
          </div>

          {settings.sms_enabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Solo Críticas</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar SMS solo para notificaciones críticas
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_critical_only !== false}
                    onCheckedChange={(checked) => updateSettings({ sms_critical_only: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Emergencia</Label>
                    <p className="text-sm text-muted-foreground">
                      SMS para situaciones de emergencia del sistema
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones en la App
          </CardTitle>
          <CardDescription>
            Configura las notificaciones dentro de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Habilitar Notificaciones
              </Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones dentro de la aplicación
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.in_app_enabled && <Badge variant="outline">Activo</Badge>}
              <Switch
                checked={settings.in_app_enabled !== false}
                onCheckedChange={(checked) => updateSettings({ in_app_enabled: checked })}
              />
            </div>
          </div>

          {settings.in_app_enabled !== false && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Actualizaciones de Pedidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificaciones de cambios en pedidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_order_updates !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Stock</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar alertas de inventario bajo
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_stock_alerts !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Asignación de Tareas</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando se te asignen nuevas tareas
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_task_assignments !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_task_assignments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mensajes del Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar mensajes importantes del sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_system_messages !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_system_messages: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Sonidos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reproducir sonidos para las notificaciones
                    </p>
                  </div>
                  <Switch
                    checked={settings.in_app_sound !== false}
                    onCheckedChange={(checked) => updateSettings({ in_app_sound: checked })}
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
