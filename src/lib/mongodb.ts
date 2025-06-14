
// Import the mock MongoDB service instead of the real one for browser compatibility
export {
  connectToDatabase,
  closeDatabaseConnection,
  getDatabaseStats,
  testConnection
} from './mockMongoDB';
