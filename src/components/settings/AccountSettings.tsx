
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';

export function AccountSettings() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();

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

  if (!profile) return null;

  const handleSaveProfile = () => {
    // Los cambios se guardan automáticamente
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal y de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-lg">
                {profile.first_name?.[0] || ''}{profile.last_name?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline">Cambiar Foto</Button>
              <p className="text-sm text-muted-foreground mt-1">
                Formatos: JPG, PNG. Máximo 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={profile.first_name || ''}
                onChange={(e) => updateProfile({ first_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={profile.last_name || ''}
                onChange={(e) => updateProfile({ last_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => updateProfile({ email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone || ''}
                onChange={(e) => updateProfile({ phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={profile.position || ''}
                onChange={(e) => updateProfile({ position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={profile.department || ''}
                onChange={(e) => updateProfile({ department: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuenta</CardTitle>
          <CardDescription>
            Detalles de tu cuenta en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Rol</Label>
              <p className="text-sm text-muted-foreground">{user?.role.displayName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Estado</Label>
              <p className="text-sm text-muted-foreground">
                {user?.isActive ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Último Acceso</Label>
              <p className="text-sm text-muted-foreground">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Cuenta Creada</Label>
              <p className="text-sm text-muted-foreground">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
