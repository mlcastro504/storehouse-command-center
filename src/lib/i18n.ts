
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
import locationsEN from '../locales/en/locations.json';
import suppliersEN from '../locales/en/suppliers.json';
import pickingEN from '../locales/en/picking.json';
import stockMovementsEN from '../locales/en/stock-movements.json';
import stockMoveEN from '../locales/en/stock-move.json';
import putawayEN from '../locales/en/putaway.json';
import scannerEN from '../locales/en/scanner.json';
import loadingEN from '../locales/en/loading.json';
import usersEN from '../locales/en/users.json';
import customersEN from '../locales/en/customers.json';
import ecommerceEN from '../locales/en/ecommerce.json';
import chatEN from '../locales/en/chat.json';

import commonES from '../locales/es/common.json';
import authES from '../locales/es/auth.json';
import dashboardES from '../locales/es/dashboard.json';
import settingsES from '../locales/es/settings.json';
import systemES from '../locales/es/system.json';
import inventoryES from '../locales/es/inventory.json';
import accountingES from '../locales/es/accounting.json';
import locationsES from '../locales/es/locations.json';
import suppliersES from '../locales/es/suppliers.json';
import pickingES from '../locales/es/picking.json';
import stockMovementsES from '../locales/es/stock-movements.json';
import stockMoveES from '../locales/es/stock-move.json';
import putawayES from '../locales/es/putaway.json';
import scannerES from '../locales/es/scanner.json';
import loadingES from '../locales/es/loading.json';
import usersES from '../locales/es/users.json';
import customersES from '../locales/es/customers.json';
import ecommerceES from '../locales/es/ecommerce.json';
import chatES from '../locales/es/chat.json';


const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    settings: settingsEN,
    system: systemEN,
    inventory: inventoryEN,
    accounting: accountingEN,
    locations: locationsEN,
    suppliers: suppliersEN,
    picking: pickingEN,
    'stock-movements': stockMovementsEN,
    'stock-move': stockMoveEN,
    putaway: putawayEN,
    scanner: scannerEN,
    loading: loadingEN,
    users: usersEN,
    customers: customersEN,
    ecommerce: ecommerceEN,
    chat: chatEN,
  },
  es: {
    common: commonES,
    auth: authES,
    dashboard: dashboardES,
    settings: settingsES,
    system: systemES,
    inventory: inventoryES,
    accounting: accountingES,
    locations: locationsES,
    suppliers: suppliersES,
    picking: pickingES,
    'stock-movements': stockMovementsES,
    'stock-move': stockMoveES,
    putaway: putawayES,
    scanner: scannerES,
    loading: loadingES,
    users: usersES,
    customers: customersES,
    ecommerce: ecommerceES,
    chat: chatES,
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
