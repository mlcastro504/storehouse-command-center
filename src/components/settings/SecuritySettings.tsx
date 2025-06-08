
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Smartphone, Clock, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function SecuritySettings() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem('securitySettings');
    return saved ? JSON.parse(saved) : {
      twoFactorEnabled: false,
      sessionTimeout: true,
      emailNotifications: true,
      loginAlerts: true,
      passwordExpiration: 90,
      lockoutAfterAttempts: 5,
      requireStrongPassword: true
    };
  });

  const [sessions, setSessions] = useState([
    {
      id: '1',
      device: 'Chrome en Windows',
      location: 'Ciudad de México, México',
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      device: 'Safari en iPhone',
      location: 'Ciudad de México, México',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      current: false
    }
  ]);

  const { toast } = useToast();

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword) {
      toast({
        title: "Error",
        description: "Ingresa tu contraseña actual.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }

    // Simular validación de contraseña actual
    if (passwordForm.currentPassword !== 'password123') {
      toast({
        title: "Error",
        description: "La contraseña actual no es correcta.",
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
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    
    toast({
      title: "Configuración de seguridad guardada",
      description: "Los cambios se han aplicado correctamente.",
    });
  };

  const handleToggle2FA = (enabled: boolean) => {
    if (enabled) {
      toast({
        title: "2FA Habilitado",
        description: "Se ha enviado un código QR a tu email para configurar la autenticación de dos factores.",
      });
    } else {
      toast({
        title: "2FA Deshabilitado",
        description: "La autenticación de dos factores ha sido desactivada.",
      });
    }
    setSecuritySettings({ ...securitySettings, twoFactorEnabled: enabled });
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast({
      title: "Sesión terminada",
      description: "La sesión ha sido cerrada exitosamente.",
    });
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    if (score < 2) return { text: 'Débil', color: 'text-red-500' };
    if (score < 4) return { text: 'Media', color: 'text-yellow-500' };
    return { text: 'Fuerte', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

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
              placeholder="Ingresa tu contraseña actual"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Mínimo 8 caracteres"
            />
            {passwordForm.newPassword && (
              <p className={`text-sm ${passwordStrength.color}`}>
                Fortaleza: {passwordStrength.text}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Repite la nueva contraseña"
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
              onCheckedChange={handleToggle2FA}
            />
          </div>

          {securitySettings.twoFactorEnabled && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                La autenticación de dos factores está habilitada. Usa tu aplicación de autenticación para generar códigos.
                <Button variant="outline" size="sm" className="ml-2">
                  Ver códigos de respaldo
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expiración de Sesión
                </Label>
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
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Notificaciones de Email
                </Label>
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
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas de Inicio de Sesión
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notificar sobre inicios de sesión desde nuevos dispositivos
                </p>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSecuritySave}>
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
          <CardDescription>
            Administra las sesiones activas en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{session.device}</p>
                  {session.current && (
                    <Badge variant="secondary">Sesión actual</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{session.location}</p>
                <p className="text-sm text-muted-foreground">
                  Última actividad: {session.lastActive.toLocaleString()}
                </p>
              </div>
              {!session.current && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                >
                  Terminar Sesión
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
