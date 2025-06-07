
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      frequency: 'instant',
      orderUpdates: true,
      stockAlerts: true,
      systemUpdates: false,
      securityAlerts: true
    },
    inApp: {
      enabled: true,
      sound: true,
      orderUpdates: true,
      stockAlerts: true,
      taskAssignments: true,
      systemMessages: true
    },
    sms: {
      enabled: false,
      criticalOnly: true,
      emergencyAlerts: true
    }
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias de notificaciones han sido actualizadas.",
    });
  };

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
              checked={notifications.email.enabled}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                email: { ...notifications.email, enabled: checked }
              })}
            />
          </div>

          {notifications.email.enabled && (
            <>
              <div className="space-y-2">
                <Label>Frecuencia de notificaciones</Label>
                <Select 
                  value={notifications.email.frequency} 
                  onValueChange={(value) => setNotifications({
                    ...notifications,
                    email: { ...notifications.email, frequency: value }
                  })}
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
                    checked={notifications.email.orderUpdates}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      email: { ...notifications.email, orderUpdates: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de stock bajo</Label>
                  <Switch
                    checked={notifications.email.stockAlerts}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      email: { ...notifications.email, stockAlerts: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Actualizaciones del sistema</Label>
                  <Switch
                    checked={notifications.email.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      email: { ...notifications.email, systemUpdates: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de seguridad</Label>
                  <Switch
                    checked={notifications.email.securityAlerts}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      email: { ...notifications.email, securityAlerts: checked }
                    })}
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
              checked={notifications.inApp.enabled}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                inApp: { ...notifications.inApp, enabled: checked }
              })}
            />
          </div>

          {notifications.inApp.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sonido de notificaciones</Label>
                <Switch
                  checked={notifications.inApp.sound}
                  onCheckedChange={(checked) => setNotifications({
                    ...notifications,
                    inApp: { ...notifications.inApp, sound: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Actualizaciones de pedidos</Label>
                  <Switch
                    checked={notifications.inApp.orderUpdates}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      inApp: { ...notifications.inApp, orderUpdates: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alertas de inventario</Label>
                  <Switch
                    checked={notifications.inApp.stockAlerts}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      inApp: { ...notifications.inApp, stockAlerts: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Asignación de tareas</Label>
                  <Switch
                    checked={notifications.inApp.taskAssignments}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      inApp: { ...notifications.inApp, taskAssignments: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mensajes del sistema</Label>
                  <Switch
                    checked={notifications.inApp.systemMessages}
                    onCheckedChange={(checked) => setNotifications({
                      ...notifications,
                      inApp: { ...notifications.inApp, systemMessages: checked }
                    })}
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
              checked={notifications.sms.enabled}
              onCheckedChange={(checked) => setNotifications({
                ...notifications,
                sms: { ...notifications.sms, enabled: checked }
              })}
            />
          </div>

          {notifications.sms.enabled && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Solo alertas críticas</Label>
                <Switch
                  checked={notifications.sms.criticalOnly}
                  onCheckedChange={(checked) => setNotifications({
                    ...notifications,
                    sms: { ...notifications.sms, criticalOnly: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Alertas de emergencia</Label>
                <Switch
                  checked={notifications.sms.emergencyAlerts}
                  onCheckedChange={(checked) => setNotifications({
                    ...notifications,
                    sms: { ...notifications.sms, emergencyAlerts: checked }
                  })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
