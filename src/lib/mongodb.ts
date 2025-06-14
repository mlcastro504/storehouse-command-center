
import { MongoClient, Db } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = 'mongodb://mlcastro:Futuro2025,@192.168.2.34:27017/?authSource=admin';
const DATABASE_NAME = 'warehouseos';

let client: MongoClient | null = null;
let database: Db | null = null;

// Connection function for real MongoDB
export async function connectToDatabase() {
  try {
    if (!client) {
      console.log('Connecting to MongoDB at:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('Successfully connected to MongoDB');
    }

    if (!database) {
      database = client.db(DATABASE_NAME);
    }

    return database;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Database connection failed');
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    database = null;
    console.log('MongoDB connection closed');
  }
}

export async function getDatabaseStats() {
  try {
    const db = await connectToDatabase();
    const stats = await db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      collections: 0,
      dataSize: 0,
      storageSize: 0,
      indexes: 0
    };
  }
}

// Test connection function
export async function testConnection() {
  try {
    const db = await connectToDatabase();
    await db.admin().ping();
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
