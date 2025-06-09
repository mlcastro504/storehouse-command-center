
import { BrowserStorage } from './browserStorage';

// Browser compatibility check
const isBrowser = typeof window !== 'undefined';

let isMongoAvailable = false;

// Mock database interface for browser compatibility
export async function connectToDatabase() {
  if (isBrowser) {
    console.log('Running in browser - using localStorage as database');
    
    // Initialize sample data on first run
    await BrowserStorage.initializeSampleData();
    
    return {
      collection: (name: string) => ({
        find: (filter: any = {}) => ({
          sort: () => ({
            toArray: () => BrowserStorage.find(name, filter)
          }),
          toArray: () => BrowserStorage.find(name, filter)
        }),
        findOne: (filter: any) => BrowserStorage.findOne(name, filter),
        insertOne: (doc: any) => BrowserStorage.insertOne(name, doc),
        updateOne: (filter: any, update: any) => {
          const updateData = update.$set || update;
          return BrowserStorage.updateOne(name, filter, updateData);
        },
        deleteOne: (filter: any) => BrowserStorage.deleteOne(name, filter)
      }),
      listCollections: () => ({
        toArray: () => Promise.resolve([
          { name: 'products' }, { name: 'categories' }, { name: 'warehouses' },
          { name: 'locations' }, { name: 'stock_levels' }, { name: 'stock_movements' }
        ])
      }),
      stats: () => BrowserStorage.getStats()
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
