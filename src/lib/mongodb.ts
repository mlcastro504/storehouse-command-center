
import { getDbMode, setDbMode } from './db/dbMode';
import * as mock from './mockMongoDB';
import * as prod from './db/prod';

// --- Re-export mode setters ---
export { setDbMode, getDbMode };

// --- Forwarders: use mock or prod implementation based on the current mode ---
export const connectToDatabase = (...args: Parameters<typeof mock.connectToDatabase>) =>
  getDbMode() === "mock" ? mock.connectToDatabase(...args) : prod.prod_connectToDatabase(...args);

export const closeDatabaseConnection = (...args: Parameters<typeof mock.closeDatabaseConnection>) =>
  getDbMode() === "mock" ? mock.closeDatabaseConnection(...args) : prod.prod_closeDatabaseConnection(...args);

export const getDatabaseStats = (...args: Parameters<typeof mock.getDatabaseStats>) =>
  getDbMode() === "mock" ? mock.getDatabaseStats(...args) : prod.prod_getDatabaseStats(...args);

export const testConnection = (...args: Parameters<typeof mock.testConnection>) =>
  getDbMode() === "mock" ? mock.testConnection(...args) : prod.prod_testConnection(...args);

