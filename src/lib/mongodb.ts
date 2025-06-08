
import { MongoClient, Db } from 'mongodb';

const MONGODB_PUBLIC_KEY = 'tnaivpin';
const MONGODB_PRIVATE_KEY = 'a57a85e2-7988-44a3-949c-14b5811b6907';
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
    console.log('Attempting to connect to MongoDB with API credentials...');
    
    // Configurar las opciones de conexión con las credenciales de API
    const options = {
      auth: {
        username: MONGODB_PUBLIC_KEY,
        password: MONGODB_PRIVATE_KEY
      },
      authSource: '$external',
      authMechanism: 'MONGODB-AWS'
    };

    // Intentar primero con las credenciales de API
    try {
      client = new MongoClient(MONGODB_URI, options);
      await client.connect();
      console.log('Connected to MongoDB using API credentials');
    } catch (apiError) {
      console.log('API credentials failed, trying with connection string...');
      // Si falla con API, usar la conexión directa
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log('Connected to MongoDB using connection string');
    }
    
    // Test the connection
    await client.db("admin").command({ ping: 1 });
    console.log('MongoDB connection successful - ping test passed');
    
    db = client.db(DB_NAME);
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
    
    // Verificar que las colecciones necesarias existan
    await ensureCollections(db);
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Connection details:', {
      publicKey: MONGODB_PUBLIC_KEY,
      database: DB_NAME,
      connectionString: MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')
    });
    throw error;
  }
}

async function ensureCollections(db: Db) {
  const collections = [
    'products',
    'categories', 
    'warehouses',
    'locations',
    'stock_levels',
    'stock_movements',
    'suppliers',
    'cycle_counts',
    'cycle_count_lines'
  ];

  for (const collectionName of collections) {
    try {
      const exists = await db.listCollections({ name: collectionName }).hasNext();
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      }
    } catch (error) {
      console.log(`Collection ${collectionName} may already exist or creation failed:`, error.message);
    }
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

// Función para obtener estadísticas de la base de datos
export async function getDatabaseStats() {
  try {
    const database = await connectToDatabase();
    const stats = await database.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}
