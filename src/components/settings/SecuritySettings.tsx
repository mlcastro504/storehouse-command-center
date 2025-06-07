
import { useState } from 'react';
import { useSecuritySettings } from '@/hooks/useSecuritySettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, Smartphone } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export function SecuritySettings() {
  const { settings, loading, updateSettings } = useSecuritySettings();
  const { toast } = useToast();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
            <p className="text-muted-foreground">Cargando configuración de seguridad...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cambiar la contraseña.",
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
    } catch (error) {
      console.error('Error changing password:', error);
    }
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
              checked={settings.two_factor_enabled || false}
              onCheckedChange={(checked) => updateSettings({ two_factor_enabled: checked })}
            />
          </div>

          {settings.two_factor_enabled && (
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
              checked={settings.session_timeout !== false}
              onCheckedChange={(checked) => updateSettings({ session_timeout: checked })}
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
              checked={settings.email_notifications !== false}
              onCheckedChange={(checked) => updateSettings({ email_notifications: checked })}
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
              checked={settings.login_alerts !== false}
              onCheckedChange={(checked) => updateSettings({ login_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
