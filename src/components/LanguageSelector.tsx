
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

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
        const user = JSON.parse(savedUser);
        user.preferredLanguage = languageCode;
        localStorage.setItem('warehouseOS_user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error changing language:', error);
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
