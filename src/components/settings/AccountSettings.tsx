
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Briefcase, Building2, Camera } from 'lucide-react';
import { useState } from 'react';

export function AccountSettings() {
  const { profile, loading, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    position: '',
    department: ''
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

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No se pudo cargar el perfil del usuario.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (field: string) => {
    const value = formData[field as keyof typeof formData];
    if (value.trim()) {
      updateProfile({ [field]: value.trim() });
      setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Gestiona tu información personal y datos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {profile.first_name} {profile.last_name}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {profile.position && (
                <p className="text-sm text-muted-foreground">{profile.position}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <div className="flex space-x-2">
                <Input
                  id="firstName"
                  value={formData.first_name || profile.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Ingresa tu nombre"
                />
                <Button 
                  onClick={() => handleSave('first_name')} 
                  variant="outline"
                  disabled={!formData.first_name}
                >
                  Guardar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <div className="flex space-x-2">
                <Input
                  id="lastName"
                  value={formData.last_name || profile.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Ingresa tu apellido"
                />
                <Button 
                  onClick={() => handleSave('last_name')} 
                  variant="outline"
                  disabled={!formData.last_name}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              El correo electrónico no se puede cambiar desde aquí
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono
            </Label>
            <div className="flex space-x-2">
              <Input
                id="phone"
                value={formData.phone || profile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ingresa tu teléfono"
              />
              <Button 
                onClick={() => handleSave('phone')} 
                variant="outline"
                disabled={!formData.phone}
              >
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Información Profesional
          </CardTitle>
          <CardDescription>
            Configura tu información laboral y organizacional
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Cargo/Posición
            </Label>
            <div className="flex space-x-2">
              <Input
                id="position"
                value={formData.position || profile.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ej: Gerente de Ventas"
              />
              <Button 
                onClick={() => handleSave('position')} 
                variant="outline"
                disabled={!formData.position}
              >
                Guardar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departamento
            </Label>
            <div className="flex space-x-2">
              <Input
                id="department"
                value={formData.department || profile.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Ej: Ventas y Marketing"
              />
              <Button 
                onClick={() => handleSave('department')} 
                variant="outline"
                disabled={!formData.department}
              >
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
