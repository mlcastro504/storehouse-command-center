
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, Smartphone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: true,
    emailNotifications: true,
    loginAlerts: true
  });

  const { toast } = useToast();

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña ha sido cambiada correctamente.",
    });

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSecuritySave = () => {
    toast({
      title: "Configuración de seguridad guardada",
      description: "Los cambios se han aplicado correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>

          <Button onClick={handlePasswordChange}>
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription>
            Configura las opciones de seguridad avanzadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Autenticación de Dos Factores
              </Label>
              <p className="text-sm text-muted-foreground">
                Añade una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <Switch
              checked={securitySettings.twoFactorEnabled}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
            />
          </div>

          {securitySettings.twoFactorEnabled && (
            <Alert>
              <AlertDescription>
                La autenticación de dos factores está habilitada. Usa tu aplicación de autenticación para generar códigos.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Expiración de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Cerrar sesión automáticamente después de inactividad
              </p>
            </div>
            <Switch
              checked={securitySettings.sessionTimeout}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, sessionTimeout: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones de Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones por email sobre actividad de seguridad
              </p>
            </div>
            <Switch
              checked={securitySettings.emailNotifications}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Inicio de Sesión</Label>
              <p className="text-sm text-muted-foreground">
                Notificar sobre inicios de sesión desde nuevos dispositivos
              </p>
            </div>
            <Switch
              checked={securitySettings.loginAlerts}
              onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSecuritySave}>
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
