
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function CompanySettings() {
  const { t } = useTranslation(['settings', 'common']);
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
      title: t('common:success'),
      description: t('settings:company.informationSaved'),
    });
  };

  const handleLogoUpload = () => {
    toast({
      title: t('common:success'),
      description: t('settings:company.logoUploaded'),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          {t('settings:company.title')}
        </CardTitle>
        <CardDescription>
          {t('settings:company.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('settings:company.name')}</Label>
            <Input
              value={companyData.name}
              onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings:company.commercialName')}</Label>
            <Input
              value={companyData.commercialName}
              onChange={(e) => setCompanyData({ ...companyData, commercialName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings:company.fiscalNumber')}</Label>
            <Input
              value={companyData.fiscalNumber}
              onChange={(e) => setCompanyData({ ...companyData, fiscalNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings:company.phone')}</Label>
            <Input
              value={companyData.phone}
              onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('settings:company.country')}</Label>
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
            <Label>{t('settings:company.timezone')}</Label>
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
            <Label>{t('settings:company.baseCurrency')}</Label>
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
            <Label>{t('settings:company.publicUrl')}</Label>
            <Input
              value={companyData.publicUrl}
              onChange={(e) => setCompanyData({ ...companyData, publicUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('settings:company.address')}</Label>
          <Textarea
            value={companyData.address}
            onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('settings:company.logo')}</Label>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogoUpload} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t('settings:company.uploadLogo')}
            </Button>
            <span className="text-sm text-muted-foreground">{t('settings:company.logoFormats')}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {t('settings:company.saveInformation')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
