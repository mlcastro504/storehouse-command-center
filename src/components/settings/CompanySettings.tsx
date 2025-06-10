
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function CompanySettings() {
  const [companyData, setCompanyData] = useState({
    name: 'WarehouseOS Company',
    fiscalNumber: 'ES-12345678Z',
    address: 'Main Street 123, Industrial Zone',
    country: 'Spain',
    timezone: 'Europe/Madrid',
    phone: '+34 900 123 456',
    baseCurrency: 'EUR',
    publicUrl: 'https://warehouseos.company.com',
    commercialName: 'WarehouseOS Solutions'
  });

  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Información de la empresa guardada",
      description: "Los datos de la empresa se han actualizado correctamente.",
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: "Logo subido",
      description: "El logo de la empresa se ha actualizado.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Información de la Empresa
        </CardTitle>
        <CardDescription>
          Configura los datos básicos de tu empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre de la Empresa</Label>
            <Input
              value={companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre Comercial</Label>
            <Input
              value={companyData.commercialName}
              onChange={(e) => setCompanyData({ ...companyData, commercialName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Número Fiscal</Label>
            <Input
              value={companyData.fiscalNumber}
              onChange={(e) => setCompanyData({ ...companyData, fiscalNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={companyData.phone}
              onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>País</Label>
            <Select value={companyData.country} onValueChange={(value) => setCompanyData({ ...companyData, country: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spain">España</SelectItem>
                <SelectItem value="France">Francia</SelectItem>
                <SelectItem value="Germany">Alemania</SelectItem>
                <SelectItem value="Italy">Italia</SelectItem>
                <SelectItem value="Portugal">Portugal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Zona Horaria</Label>
            <Select value={companyData.timezone} onValueChange={(value) => setCompanyData({ ...companyData, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                <SelectItem value="Europe/Lisbon">Europe/Lisbon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Moneda Base</Label>
            <Select value={companyData.baseCurrency} onValueChange={(value) => setCompanyData({ ...companyData, baseCurrency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="GBP">GBP - Libra</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>URL Pública</Label>
            <Input
              value={companyData.publicUrl}
              onChange={(e) => setCompanyData({ ...companyData, publicUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dirección</Label>
          <Textarea
            value={companyData.address}
            onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Logo de la Empresa</Label>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogoUpload} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Subir Logo
            </Button>
            <span className="text-sm text-muted-foreground">Formatos aceptados: PNG, JPG, SVG (max 2MB)</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Guardar Información
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
