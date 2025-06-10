
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
          sort: (sortOptions?: any) => ({
            skip: (skipCount: number) => ({
              limit: (limitCount: number) => ({
                toArray: () => BrowserStorage.find(name, filter)
              }),
              toArray: () => BrowserStorage.find(name, filter)
            }),
            limit: (limitCount: number) => ({
              toArray: () => BrowserStorage.find(name, filter)
            }),
            toArray: () => BrowserStorage.find(name, filter)
          }),
          skip: (skipCount: number) => ({
            limit: (limitCount: number) => ({
              toArray: () => BrowserStorage.find(name, filter)
            }),
            toArray: () => BrowserStorage.find(name, filter)
          }),
          limit: (limitCount: number) => ({
            toArray: () => BrowserStorage.find(name, filter)
          }),
          toArray: () => BrowserStorage.find(name, filter)
        }),
        findOne: (filter: any) => BrowserStorage.findOne(name, filter),
        insertOne: (doc: any) => BrowserStorage.insertOne(name, doc),
        insertMany: (docs: any[]) => {
          // Simulate insertMany by calling insertOne for each document
          const results = docs.map(doc => BrowserStorage.insertOne(name, doc));
          return Promise.resolve({ insertedIds: results.map((_, i) => i.toString()) });
        },
        updateOne: (filter: any, update: any, options?: any) => {
          const updateData = update.$set || update;
          return BrowserStorage.updateOne(name, filter, updateData);
        },
        deleteOne: (filter: any) => BrowserStorage.deleteOne(name, filter),
        aggregate: (pipeline: any[]) => ({
          toArray: () => {
            // Simple aggregation simulation for browser storage
            console.log('Mock aggregate called with pipeline:', pipeline);
            return BrowserStorage.find(name, {});
          }
        })
      }),
      listCollections: () => ({
        toArray: () => Promise.resolve([
          { name: 'products' }, { name: 'categories' }, { name: 'warehouses' },
          { name: 'locations' }, { name: 'stock_levels' }, { name: 'stock_movements' },
          { name: 'accounts' }, { name: 'transactions' }, { name: 'invoices' }, { name: 'contacts' },
          { name: 'chat_channels' }, { name: 'chat_messages' }, { name: 'chat_notifications' },
          { name: 'user_chat_status' }, { name: 'quick_responses' }
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
      return await BrowserStorage.getStats();
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
