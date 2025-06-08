
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://mlcastro:Futuro2025,@cluster0.k7hby3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'warehouseos';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
