
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const defaultCompanyData = {
  name: 'WarehouseOS Company',
  commercialName: 'WarehouseOS Solutions',
  fiscalNumber: 'ES-12345678Z',
  phone: '+34 900 123 456',
  country: 'Spain',
  timezone: 'Europe/Madrid',
  baseCurrency: 'EUR',
  publicUrl: 'https://warehouseos.company.com',
  address: 'Main Street 123, Industrial Zone',
  logo: '',
};

export function CompanySettings() {
  const { t } = useTranslation('settings');
  const [companyData, setCompanyData] = useState(defaultCompanyData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedData = localStorage.getItem('warehouseos_company_settings');
    if (savedData) {
      setCompanyData(JSON.parse(savedData));
    }
  }, []);

  const handleInputChange = (field: keyof typeof companyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = () => {
    localStorage.setItem('warehouseos_company_settings', JSON.stringify(companyData));
    toast({
      title: t('company.informationSaved'),
    });
     // We might reload to update other parts of the UI, like the sidebar logo
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast({ title: t('common:error'), description: t('company.errorLogoUploadType'), variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast({ title: t('common:error'), description: t('company.errorLogoUploadSize'), variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      handleInputChange('logo', result);
      toast({ title: t('company.logoUploaded') });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleInputChange('logo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({ title: t('company.logoRemoved') });
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t('company.title')}
        </CardTitle>
        <CardDescription>
          {t('company.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('company.name')}</Label>
            <Input
              value={companyData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('company.commercialName')}</Label>
            <Input
              value={companyData.commercialName}
              onChange={(e) => handleInputChange('commercialName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('company.fiscalNumber')}</Label>
            <Input
              value={companyData.fiscalNumber}
              onChange={(e) => handleInputChange('fiscalNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('company.phone')}</Label>
            <Input
              value={companyData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('company.country')}</Label>
            <Select value={companyData.country} onValueChange={(value) => handleInputChange('country', value)}>
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
            <Label>{t('company.timezone')}</Label>
            <Select value={companyData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
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
            <Label>{t('company.baseCurrency')}</Label>
            <Select value={companyData.baseCurrency} onValueChange={(value) => handleInputChange('baseCurrency', value)}>
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
            <Label>{t('company.publicUrl')}</Label>
            <Input
              value={companyData.publicUrl}
              onChange={(e) => handleInputChange('publicUrl', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('company.address')}</Label>
          <Textarea
            value={companyData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('company.logo')}</Label>
          <div className="flex items-center gap-4">
            {companyData.logo ? (
              <div className="relative">
                <img 
                  src={companyData.logo} 
                  alt={t('company.altLogo')} 
                  className="w-20 h-20 object-contain border rounded-lg bg-slate-50"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                  onClick={handleRemoveLogo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center">
                <Building className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {companyData.logo ? t('company.changeLogo') : t('company.uploadLogo')}
              </Button>
              <p className="text-sm text-muted-foreground">{t('company.logoFormats')}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {t('company.saveInformation')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
