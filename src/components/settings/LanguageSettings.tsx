
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, Check } from 'lucide-react';
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
    detectBrowserLanguage: localStorage.getItem('warehouseOS_detectBrowser') !== 'false',
    defaultLanguage: localStorage.getItem('warehouseOS_defaultLanguage') || 'en',
    enabledLanguages: JSON.parse(localStorage.getItem('warehouseOS_enabledLanguages') || '["en", "es"]')
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are unsaved changes
    const originalSettings = {
      detectBrowserLanguage: localStorage.getItem('warehouseOS_detectBrowser') !== 'false',
      defaultLanguage: localStorage.getItem('warehouseOS_defaultLanguage') || 'en',
      enabledLanguages: JSON.parse(localStorage.getItem('warehouseOS_enabledLanguages') || '["en", "es"]')
    };

    const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanged);
  }, [settings]);

  const handleSaveSettings = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('warehouseOS_detectBrowser', settings.detectBrowserLanguage.toString());
      localStorage.setItem('warehouseOS_defaultLanguage', settings.defaultLanguage);
      localStorage.setItem('warehouseOS_enabledLanguages', JSON.stringify(settings.enabledLanguages));

      // Update i18n fallback language
      i18n.options.fallbackLng = settings.defaultLanguage;

      setHasChanges(false);

      toast({
        title: t('common:success'),
        description: t('settings:language.settingsSaved', 'Language settings saved successfully'),
      });
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast({
        title: t('common:error'),
        description: 'Error saving language settings',
        variant: 'destructive'
      });
    }
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

    // If disabling the current default language, change default to the first enabled one
    if (!updatedLanguages.includes(settings.defaultLanguage) && updatedLanguages.length > 0) {
      setSettings({ 
        ...settings, 
        enabledLanguages: updatedLanguages,
        defaultLanguage: updatedLanguages[0]
      });
    } else {
      setSettings({ ...settings, enabledLanguages: updatedLanguages });
    }
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
            <p className="text-sm text-muted-foreground">
              Current language: {availableLanguages.find(l => l.code === i18n.language)?.nativeName || 'Unknown'}
            </p>
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
                {availableLanguages
                  .filter(language => settings.enabledLanguages.includes(language.code))
                  .map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.flag} {language.nativeName} ({language.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default language used for new users and when browser detection is disabled
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('settings:language.detectBrowser')}</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and use browser language preference for new users
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
                  {language.code === i18n.language && (
                    <Check className="w-4 h-4 text-green-500 ml-2" />
                  )}
                </div>
                <Switch
                  checked={settings.enabledLanguages.includes(language.code)}
                  onCheckedChange={() => toggleLanguage(language.code)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={() => {
              // Reset to original settings
              setSettings({
                detectBrowserLanguage: localStorage.getItem('warehouseOS_detectBrowser') !== 'false',
                defaultLanguage: localStorage.getItem('warehouseOS_defaultLanguage') || 'en',
                enabledLanguages: JSON.parse(localStorage.getItem('warehouseOS_enabledLanguages') || '["en", "es"]')
              });
            }}>
              {t('common:buttons.cancel')}
            </Button>
          )}
          <Button 
            onClick={handleSaveSettings}
            disabled={!hasChanges}
          >
            {t('common:buttons.save')}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded">
          <h4 className="font-semibold mb-2">Language Information</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Current language: <strong>{i18n.language}</strong></p>
            <p>• Default system language: <strong>{settings.defaultLanguage}</strong></p>
            <p>• Browser detection: <strong>{settings.detectBrowserLanguage ? 'Enabled' : 'Disabled'}</strong></p>
            <p>• Enabled languages: <strong>{settings.enabledLanguages.join(', ')}</strong></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
