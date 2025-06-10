
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  showFlag?: boolean;
}

export function LanguageSelector({ variant = 'default', showFlag = true }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) return;
    
    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      
      // Save user preference to localStorage
      localStorage.setItem('warehouseOS_language', languageCode);
      
      // If user is logged in, we could also save to user profile
      const savedUser = localStorage.getItem('warehouseOS_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          user.preferredLanguage = languageCode;
          localStorage.setItem('warehouseOS_user', JSON.stringify(user));
        } catch (error) {
          console.log('Error updating user language preference:', error);
        }
      }

      toast({
        title: languageCode === 'es' ? 'Idioma cambiado' : 'Language changed',
        description: languageCode === 'es' 
          ? `Idioma cambiado a ${currentLanguage.name}` 
          : `Language changed to ${currentLanguage.name}`,
      });
    } catch (error) {
      console.error('Error changing language:', error);
      toast({
        title: 'Error',
        description: 'Error al cambiar el idioma / Error changing language',
        variant: 'destructive'
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-auto px-2"
        disabled={isChanging}
        onClick={() => {
          const nextLang = i18n.language === 'en' ? 'es' : 'en';
          handleLanguageChange(nextLang);
        }}
      >
        {showFlag && currentLanguage.flag}
        <Globe className="w-4 h-4 ml-1" />
      </Button>
    );
  }

  return (
    <Select
      value={i18n.language}
      onValueChange={handleLanguageChange}
      disabled={isChanging}
    >
      <SelectTrigger className="w-40">
        <SelectValue>
          {showFlag && currentLanguage.flag} {currentLanguage.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {showFlag && language.flag} {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
