
import { browserStorage } from './browserStorage';

// Browser compatibility check
const isBrowser = typeof window !== 'undefined';

let isMongoAvailable = false;

// Mock database interface for browser compatibility
export async function connectToDatabase() {
  if (isBrowser) {
    console.log('Running in browser - using localStorage as database');
    
    // Initialize sample data on first run
    await browserStorage.initializeSampleData();
    
    return {
      collection: (name: string) => ({
        find: (filter: any = {}) => ({
          sort: () => ({
            toArray: () => browserStorage.find(name, filter)
          }),
          toArray: () => browserStorage.find(name, filter)
        }),
        findOne: (filter: any) => browserStorage.findOne(name, filter),
        insertOne: (doc: any) => browserStorage.insertOne(name, doc),
        updateOne: (filter: any, update: any) => {
          const updateData = update.$set || update;
          return browserStorage.updateOne(name, filter, updateData);
        },
        deleteOne: (filter: any) => browserStorage.deleteOne(name, filter)
      }),
      listCollections: () => ({
        toArray: () => Promise.resolve([
          { name: 'products' }, { name: 'categories' }, { name: 'warehouses' },
          { name: 'locations' }, { name: 'stock_levels' }, { name: 'stock_movements' }
        ])
      }),
      stats: () => browserStorage.getStats()
    };
  }

  // For server-side or when MongoDB is available
  throw new Error('MongoDB driver not available in browser environment');
}

export async function closeDatabaseConnection() {
  if (isBrowser) {
    console.log('Browser storage - no connection to close');
    return;
  }
}

export async function getDatabaseStats() {
  try {
    if (isBrowser) {
      return await browserStorage.getStats();
    }
    
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
    return {
      collections: 6,
      dataSize: 1024 * 100,
      storageSize: 1024 * 150,
      indexes: 12
    };
  }
}
