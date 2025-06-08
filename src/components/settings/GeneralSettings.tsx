
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function GeneralSettings() {
  const [settings, setSettings] = useState({
    companyName: 'Mi Empresa',
    companyLogo: '',
    language: 'es',
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    dateFormat: 'dd/MM/yyyy',
    darkMode: false,
    compactView: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo de imagen válido.",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (máximo 2MB)
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
        setSettings({ ...settings, companyLogo: result });
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('companyLogo', result);
        localStorage.setItem('companyName', settings.companyName);
        
        toast({
          title: "Logo actualizado",
          description: "El logo de la empresa se ha actualizado correctamente.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setSettings({ ...settings, companyLogo: '' });
    localStorage.removeItem('companyLogo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
      title: "Logo eliminado",
      description: "El logo de la empresa se ha eliminado.",
    });
  };

  const handleSave = () => {
    // Guardar configuraciones en localStorage
    localStorage.setItem('generalSettings', JSON.stringify(settings));
    localStorage.setItem('companyName', settings.companyName);
    if (settings.companyLogo) {
      localStorage.setItem('companyLogo', settings.companyLogo);
    }

    toast({
      title: "Configuración guardada",
      description: "Los cambios se han aplicado correctamente.",
    });

    // Recargar la página para aplicar cambios en el sidebar
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Cargar configuraciones guardadas al inicializar
  useState(() => {
    const savedSettings = localStorage.getItem('generalSettings');
    const savedLogo = localStorage.getItem('companyLogo');
    const savedName = localStorage.getItem('companyName');
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings({
        ...parsed,
        companyLogo: savedLogo || '',
        companyName: savedName || parsed.companyName || 'Mi Empresa'
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Configura las preferencias básicas de tu aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Logo de la Empresa</Label>
            <div className="flex items-center gap-4">
              {settings.companyLogo ? (
                <div className="relative">
                  <img 
                    src={settings.companyLogo} 
                    alt="Logo de la empresa" 
                    className="w-20 h-20 object-contain border rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0"
                    onClick={handleRemoveLogo}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {settings.companyLogo ? 'Cambiar Logo' : 'Subir Logo'}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Formatos: PNG, JPG, SVG. Máximo 2MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nombre de la Empresa</Label>
              <Input
                id="company"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                  <SelectItem value="America/New_York">New York</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Angeles</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                  <SelectItem value="America/Sao_Paulo">São Paulo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Formato de Fecha</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preferencias de Interfaz</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Oscuro</Label>
                <p className="text-sm text-muted-foreground">
                  Activar tema oscuro para la interfaz
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vista Compacta</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar más información en menos espacio
                </p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={(checked) => setSettings({ ...settings, compactView: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
