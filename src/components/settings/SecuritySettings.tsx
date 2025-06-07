
import { useSecuritySettings } from '@/hooks/useSecuritySettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Bell, Clock } from 'lucide-react';

export function SecuritySettings() {
  const { settings, loading, updateSettings } = useSecuritySettings();

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
            <p className="text-muted-foreground">No se pudieron cargar las configuraciones de seguridad.</p>
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
            <Shield className="w-5 h-5" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Protege tu cuenta con una capa adicional de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Activar 2FA
              </Label>
              <p className="text-sm text-muted-foreground">
                Requerir código de verificación además de la contraseña
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {settings.two_factor_enabled && (
                <Badge variant="outline">Activo</Badge>
              )}
              <Switch
                checked={settings.two_factor_enabled || false}
                onCheckedChange={(checked) => updateSettings({ two_factor_enabled: checked })}
              />
            </div>
          </div>

          {settings.two_factor_enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La autenticación de dos factores está activa. Usa tu aplicación de autenticación para generar códigos.
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Mostrar Códigos de Respaldo</Button>
                  <Button variant="outline" size="sm">Regenerar Códigos</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Gestión de Sesiones
          </CardTitle>
          <CardDescription>
            Configura el comportamiento de las sesiones de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tiempo de Espera de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Cerrar sesión automáticamente después de inactividad
              </p>
            </div>
            <Switch
              checked={settings.session_timeout || false}
              onCheckedChange={(checked) => updateSettings({ session_timeout: checked })}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Sesiones Activas</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Navegador Actual</p>
                  <p className="text-sm text-muted-foreground">Chrome en Windows • Ahora</p>
                </div>
                <Badge variant="outline">Actual</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Dispositivo Móvil</p>
                  <p className="text-sm text-muted-foreground">Safari en iPhone • Hace 2 horas</p>
                </div>
                <Button variant="outline" size="sm">Cerrar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas de Seguridad
          </CardTitle>
          <CardDescription>
            Configura las notificaciones de eventos de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas de seguridad por correo electrónico
              </p>
            </div>
            <Switch
              checked={settings.email_notifications !== false}
              onCheckedChange={(checked) => updateSettings({ email_notifications: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Inicio de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Notificar cuando se inicie sesión desde un nuevo dispositivo
              </p>
            </div>
            <Switch
              checked={settings.login_alerts !== false}
              onCheckedChange={(checked) => updateSettings({ login_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Actualiza tu contraseña regularmente para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Última actualización: Hace 45 días
          </p>
          <Button variant="outline">Cambiar Contraseña</Button>
        </CardContent>
      </Card>
    </div>
  );
}
