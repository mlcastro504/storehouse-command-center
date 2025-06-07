
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare } from 'lucide-react';

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

  if (!settings) return null;

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
            <Label>Habilitar notificaciones por email</Label>
            <Switch
              checked={settings.email_enabled}
              onCheckedChange={(checked) => updateSettings({ email_enabled: checked })}
            />
          </div>

          {settings.email_enabled && (
            <>
              <div className="space-y-2">
                <Label>Frecuencia de notificaciones</Label>
                <Select 
                  value={settings.email_frequency} 
                  onValueChange={(value) => updateSettings({ email_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instantáneo</SelectItem>
                    <SelectItem value="hourly">Cada hora</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Actualizaciones de pedidos</Label>
                  <Switch
                    checked={settings.email_order_updates}
                    onCheckedChange={(checked) => updateSettings({ email_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de stock bajo</Label>
                  <Switch
                    checked={settings.email_stock_alerts}
                    onCheckedChange={(checked) => updateSettings({ email_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Actualizaciones del sistema</Label>
                  <Switch
                    checked={settings.email_system_updates}
                    onCheckedChange={(checked) => updateSettings({ email_system_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de seguridad</Label>
                  <Switch
                    checked={settings.email_security_alerts}
                    onCheckedChange={(checked) => updateSettings({ email_security_alerts: checked })}
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
            Notificaciones en la Aplicación
          </CardTitle>
          <CardDescription>
            Configura las notificaciones que aparecen dentro de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>Habilitar notificaciones en la app</Label>
            <Switch
              checked={settings.in_app_enabled}
              onCheckedChange={(checked) => updateSettings({ in_app_enabled: checked })}
            />
          </div>

          {settings.in_app_enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sonido de notificaciones</Label>
                <Switch
                  checked={settings.in_app_sound}
                  onCheckedChange={(checked) => updateSettings({ in_app_sound: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Actualizaciones de pedidos</Label>
                  <Switch
                    checked={settings.in_app_order_updates}
                    onCheckedChange={(checked) => updateSettings({ in_app_order_updates: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de inventario</Label>
                  <Switch
                    checked={settings.in_app_stock_alerts}
                    onCheckedChange={(checked) => updateSettings({ in_app_stock_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Asignación de tareas</Label>
                  <Switch
                    checked={settings.in_app_task_assignments}
                    onCheckedChange={(checked) => updateSettings({ in_app_task_assignments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mensajes del sistema</Label>
                  <Switch
                    checked={settings.in_app_system_messages}
                    onCheckedChange={(checked) => updateSettings({ in_app_system_messages: checked })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Notificaciones SMS
          </CardTitle>
          <CardDescription>
            Configura las notificaciones por mensaje de texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Habilitar notificaciones SMS</Label>
            <Switch
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => updateSettings({ sms_enabled: checked })}
            />
          </div>

          {settings.sms_enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Solo alertas críticas</Label>
                <Switch
                  checked={settings.sms_critical_only}
                  onCheckedChange={(checked) => updateSettings({ sms_critical_only: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Alertas de emergencia</Label>
                <Switch
                  checked={settings.sms_emergency_alerts}
                  onCheckedChange={(checked) => updateSettings({ sms_emergency_alerts: checked })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
