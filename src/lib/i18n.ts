
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from '../locales/en/common.json';
import authEN from '../locales/en/auth.json';
import dashboardEN from '../locales/en/dashboard.json';
import settingsEN from '../locales/en/settings.json';
import systemEN from '../locales/en/system.json';
import inventoryEN from '../locales/en/inventory.json';
import accountingEN from '../locales/en/accounting.json';

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import settingsES from '../locales/es/settings.json';
import systemES from '../locales/es/system.json';
import inventoryES from '../locales/es/inventory.json';
import accountingES from '../locales/es/accounting.json';

const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    settings: settingsEN,
    system: systemEN,
    inventory: inventoryEN,
    accounting: accountingEN,
  },
  es: {
    common: commonES,
    auth: authES,
    dashboard: dashboardES,
    settings: settingsES,
    system: systemES,
    inventory: inventoryES,
    accounting: accountingES,
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'warehouseOS_language'
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;
