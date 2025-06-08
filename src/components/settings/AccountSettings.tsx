
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

export function AccountSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: localStorage.getItem('userPhone') || '',
    position: localStorage.getItem('userPosition') || '',
    department: localStorage.getItem('userDepartment') || '',
    avatar: localStorage.getItem('userAvatar') || ''
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido.",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "El archivo debe ser menor a 2MB.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile({ ...profile, avatar: result });
        localStorage.setItem('userAvatar', result);
        
        toast({
          title: "Foto actualizada",
          description: "Tu foto de perfil se ha actualizado correctamente.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setProfile({ ...profile, avatar: '' });
    localStorage.removeItem('userAvatar');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Foto eliminada",
      description: "Tu foto de perfil se ha eliminado.",
    });
  };

  const handleSaveProfile = () => {
    // Guardar en localStorage (en una app real esto iría a la base de datos)
    localStorage.setItem('userPhone', profile.phone);
    localStorage.setItem('userPosition', profile.position);
    localStorage.setItem('userDepartment', profile.department);
    localStorage.setItem('userFirstName', profile.firstName);
    localStorage.setItem('userLastName', profile.lastName);
    localStorage.setItem('userEmail', profile.email);

    toast({
      title: "Perfil actualizado",
      description: "Los cambios en tu perfil se han guardado correctamente.",
    });
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
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {profile.avatar && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0"
                  onClick={handleRemoveAvatar}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {profile.avatar ? 'Cambiar Foto' : 'Subir Foto'}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Formatos: JPG, PNG. Máximo 2MB.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile}>
              Guardar Cambios
            </Button>
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

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferencias de Cuenta</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ID de Usuario</Label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Nivel de Acceso</Label>
                <p className="text-sm text-muted-foreground">Nivel {user?.role.level}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
