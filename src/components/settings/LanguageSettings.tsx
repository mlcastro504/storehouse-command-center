
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Languages } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { LanguageSelector } from '../LanguageSelector';

const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' }
];

export function LanguageSettings() {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    detectBrowserLanguage: localStorage.getItem('warehouseOS_detectBrowser') === 'true',
    defaultLanguage: localStorage.getItem('warehouseOS_defaultLanguage') || 'en',
    enabledLanguages: JSON.parse(localStorage.getItem('warehouseOS_enabledLanguages') || '["en", "es"]')
  });

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('warehouseOS_detectBrowser', settings.detectBrowserLanguage.toString());
    localStorage.setItem('warehouseOS_defaultLanguage', settings.defaultLanguage);
    localStorage.setItem('warehouseOS_enabledLanguages', JSON.stringify(settings.enabledLanguages));

    // Update i18n fallback language
    i18n.options.fallbackLng = settings.defaultLanguage;

    toast({
      title: t('common:success'),
      description: t('settings:language.settingsSaved'),
    });
  };

  const toggleLanguage = (languageCode: string) => {
    const updatedLanguages = settings.enabledLanguages.includes(languageCode)
      ? settings.enabledLanguages.filter((code: string) => code !== languageCode)
      : [...settings.enabledLanguages, languageCode];
    
    // Ensure at least one language is enabled
    if (updatedLanguages.length === 0) {
      toast({
        title: t('common:warning'),
        description: "At least one language must be enabled",
        variant: "destructive"
      });
      return;
    }

    setSettings({ ...settings, enabledLanguages: updatedLanguages });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          {t('settings:language.title')}
        </CardTitle>
        <CardDescription>
          Configure language preferences and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('settings:language.current')}</Label>
            <LanguageSelector />
          </div>

          <div className="space-y-2">
            <Label>{t('settings:language.defaultSystem')}</Label>
            <Select 
              value={settings.defaultLanguage} 
              onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.flag} {language.nativeName} ({language.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings:language.detectBrowser')}</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and use browser language preference
              </p>
            </div>
            <Switch
              checked={settings.detectBrowserLanguage}
              onCheckedChange={(checked) => setSettings({ ...settings, detectBrowserLanguage: checked })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t('settings:language.available')}</Label>
          <div className="space-y-2">
            {availableLanguages.map((language) => (
              <div key={language.code} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <div>
                    <p className="font-medium">{language.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{language.name}</p>
                  </div>
                </div>
                <Switch
                  checked={settings.enabledLanguages.includes(language.code)}
                  onCheckedChange={() => toggleLanguage(language.code)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            {t('common:buttons.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
