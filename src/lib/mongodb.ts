
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://mlcastro:Futuro2025,@cluster0.k7hby3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'warehouseos';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase() {
  if (db) {
    console.log('Using existing MongoDB connection');
    return db;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log('MongoDB connection successful - ping test passed');
    
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Connection URI (masked):', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    console.log('Closing MongoDB connection...');
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}
