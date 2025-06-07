
import { useUserSettings } from '@/hooks/useUserSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Globe, Building, Palette } from 'lucide-react';

export function GeneralSettings() {
  const { settings, loading, updateSettings } = useUserSettings();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
            <p className="text-muted-foreground">No se pudieron cargar las configuraciones.</p>
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
            <Building className="w-5 h-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Configura la información básica de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la Empresa</Label>
            <Input
              id="companyName"
              value={settings.company_name || ''}
              onChange={(e) => updateSettings({ company_name: e.target.value })}
              placeholder="Mi Empresa S.A. de C.V."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configuración Regional
          </CardTitle>
          <CardDescription>
            Personaliza el idioma, zona horaria y formato de fecha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select 
                value={settings.language || 'es'} 
                onValueChange={(value) => updateSettings({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select 
                value={settings.timezone || 'America/Mexico_City'} 
                onValueChange={(value) => updateSettings({ timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select 
                value={settings.currency || 'MXN'} 
                onValueChange={(value) => updateSettings({ currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">Libra Esterlina (GBP)</SelectItem>
                  <SelectItem value="CAD">Dólar Canadiense (CAD)</SelectItem>
                  <SelectItem value="JPY">Yen Japonés (JPY)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Fecha</Label>
              <Select 
                value={settings.date_format || 'dd/MM/yyyy'} 
                onValueChange={(value) => updateSettings({ date_format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY (31/12/2024)</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY (12/31/2024)</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD (2024-12-31)</SelectItem>
                  <SelectItem value="dd-MM-yyyy">DD-MM-YYYY (31-12-2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Preferencias de Interfaz
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia y comportamiento de la interfaz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Modo Oscuro</Label>
              <p className="text-sm text-muted-foreground">
                Cambiar entre tema claro y oscuro
              </p>
            </div>
            <Switch
              checked={settings.dark_mode || false}
              onCheckedChange={(checked) => updateSettings({ dark_mode: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vista Compacta</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar más información en menos espacio
              </p>
            </div>
            <Switch
              checked={settings.compact_view || false}
              onCheckedChange={(checked) => updateSettings({ compact_view: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
