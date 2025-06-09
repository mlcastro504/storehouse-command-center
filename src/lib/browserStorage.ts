import { ObjectId } from 'mongodb';

// Browser compatibility check
const isBrowser = typeof window !== 'undefined';

let isMongoAvailable = false;

// Mock database interface for browser compatibility
export class BrowserStorage {
  static async find(collectionName: string, filter: any = {}): Promise<any[]> {
    return new Promise((resolve) => {
      const storedData = localStorage.getItem(`browserStorage_${collectionName}`);
      let data = storedData ? JSON.parse(storedData) : [];

      // Apply filter
      if (filter && Object.keys(filter).length > 0) {
        data = data.filter(item => {
          for (const key in filter) {
            if (filter.hasOwnProperty(key)) {
              const filterValue = filter[key];

              // Handle nested properties
              if (key.includes('.')) {
                const keys = key.split('.');
                let nestedValue = item;
                for (const nestedKey of keys) {
                  if (nestedValue && nestedValue.hasOwnProperty(nestedKey)) {
                    nestedValue = nestedValue[nestedKey];
                  } else {
                    return false; // Property doesn't exist
                  }
                }
                if (nestedValue !== filterValue) {
                  return false;
                }
              }
              // Handle $in operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$in')) {
                if (!filterValue['$in'].includes(item[key])) {
                  return false;
                }
              }
              // Handle $nin operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$nin')) {
                if (filterValue['$nin'].includes(item[key])) {
                  return false;
                }
              }
              // Handle $lt operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$lt')) {
                if (!(item[key] < filterValue['$lt'])) {
                  return false;
                }
              }
              // Handle $gt operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$gt')) {
                if (!(item[key] > filterValue['$gt'])) {
                  return false;
                }
              }
              // Handle $lte operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$lte')) {
                if (!(item[key] <= filterValue['$lte'])) {
                  return false;
                }
              }
              // Handle $gte operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$gte')) {
                if (!(item[key] >= filterValue['$gte'])) {
                  return false;
                }
              }
              // Handle $ne operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$ne')) {
                if (item[key] === filterValue['$ne']) {
                  return false;
                }
              }
              // Handle $regex operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$regex')) {
                const regex = new RegExp(filterValue['$regex'], filterValue['$options']);
                if (!regex.test(item[key])) {
                  return false;
                }
              }
              // Handle $exists operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$exists')) {
                const exists = item.hasOwnProperty(key);
                if (exists !== filterValue['$exists']) {
                  return false;
                }
              }
              // Handle $and operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$and')) {
                if (!filterValue['$and'].every((condition: any) => {
                  for (const conditionKey in condition) {
                    if (condition.hasOwnProperty(conditionKey)) {
                      return item[conditionKey] === condition[conditionKey];
                    }
                  }
                  return true;
                })) {
                  return false;
                }
              }
              // Handle $or operator
              else if (filterValue && typeof filterValue === 'object' && filterValue.hasOwnProperty('$or')) {
                if (!filterValue['$or'].some((condition: any) => {
                  for (const conditionKey in condition) {
                    if (condition.hasOwnProperty(conditionKey)) {
                      return item[conditionKey] === condition[conditionKey];
                    }
                  }
                  return true;
                })) {
                  return false;
                }
              }
              else if (item[key] !== filterValue) {
                return false;
              }
            }
          }
          return true;
        });
      }

      resolve(data);
    });
  }

  static async findOne(collectionName: string, filter: any): Promise<any | null> {
    return new Promise((resolve) => {
      const storedData = localStorage.getItem(`browserStorage_${collectionName}`);
      if (!storedData) {
        resolve(null);
        return;
      }

      const data = JSON.parse(storedData);
      const result = data.find((item: any) => {
        for (const key in filter) {
          if (filter.hasOwnProperty(key)) {
            if (item[key] !== filter[key]) {
              return false;
            }
          }
        }
        return true;
      });

      resolve(result || null);
    });
  }

  static async insertOne(collectionName: string, document: any): Promise<any> {
    return new Promise((resolve) => {
      const storedData = localStorage.getItem(`browserStorage_${collectionName}`);
      const data = storedData ? JSON.parse(storedData) : [];

      // Assign a unique ID if it doesn't exist
      if (!document.id) {
        document.id = `${collectionName}_${Date.now()}`;
      }
      if (!document._id) {
        document._id = document.id;
      }

      data.push(document);
      localStorage.setItem(`browserStorage_${collectionName}`, JSON.stringify(data));
      resolve(document);
    });
  }

  static async updateOne(collectionName: string, filter: any, update: any): Promise<any> {
    return new Promise((resolve) => {
      const storedData = localStorage.getItem(`browserStorage_${collectionName}`);
      if (!storedData) {
        resolve(null);
        return;
      }

      let data = JSON.parse(storedData);
      let updatedItem = null;

      data = data.map((item: any) => {
        let match = true;
        for (const key in filter) {
          if (filter.hasOwnProperty(key) && item[key] !== filter[key]) {
            match = false;
            break;
          }
        }

        if (match) {
          updatedItem = { ...item, ...update };
          return updatedItem;
        }
        return item;
      });

      localStorage.setItem(`browserStorage_${collectionName}`, JSON.stringify(data));
      resolve(updatedItem);
    });
  }

  static async deleteOne(collectionName: string, filter: any): Promise<boolean> {
    return new Promise((resolve) => {
      const storedData = localStorage.getItem(`browserStorage_${collectionName}`);
      if (!storedData) {
        resolve(false);
        return;
      }

      let data = JSON.parse(storedData);
      let deleted = false;

      data = data.filter((item: any) => {
        let match = true;
        for (const key in filter) {
          if (filter.hasOwnProperty(key) && item[key] !== filter[key]) {
            match = false;
            break;
          }
        }

        if (match) {
          deleted = true;
          return false; // Exclude from the new array (delete)
        }
        return true;
      });

      localStorage.setItem(`browserStorage_${collectionName}`, JSON.stringify(data));
      resolve(deleted);
    });
  }

  static async getStats(): Promise<any> {
    return new Promise((resolve) => {
      const stats = {
        collections: 0,
        dataSize: 0,
        storageSize: 0,
        indexes: 0
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('browserStorage_')) {
          stats.collections++;
          const data = localStorage.getItem(key);
          if (data) {
            stats.dataSize += data.length;
            stats.storageSize += data.length;
          }
        }
      }

      resolve(stats);
    });
  }

  static async listCollections(): Promise<any[]> {
    return new Promise((resolve) => {
      const collections = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('browserStorage_')) {
          collections.push({ name: key.replace('browserStorage_', '') });
        }
      }
      resolve(collections);
    });
  }

  static async initializeSampleData() {
    const sampleProducts = [
      {
        _id: 'product_1',
        id: 'product_1',
        sku: 'PRD-001',
        name: 'Laptop Dell Inspiron',
        description: 'Laptop para oficina',
        category_id: 'cat_1',
        unit_of_measure: 'unidad',
        min_stock_level: 10,
        max_stock_level: 100,
        reorder_point: 20,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1',
        weight: 2.5,
        dimensions: { length: 35, width: 25, height: 3 },
        special_requirements: ['Frágil', 'Electrónico']
      },
      {
        _id: 'product_2',
        id: 'product_2',
        sku: 'PRD-002',
        name: 'Monitor Samsung 24"',
        description: 'Monitor LED 24 pulgadas',
        category_id: 'cat_1',
        unit_of_measure: 'unidad',
        min_stock_level: 5,
        max_stock_level: 50,
        reorder_point: 10,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1',
        weight: 4.2,
        dimensions: { length: 55, width: 35, height: 8 },
        special_requirements: ['Frágil']
      }
    ];

    const sampleCategories = [
      {
        _id: 'cat_1',
        id: 'cat_1',
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos',
        code: 'ELEC',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1'
      }
    ];

    const sampleWarehouses = [
      {
        _id: 'warehouse_1',
        id: 'warehouse_1',
        code: 'WH-01',
        name: 'Almacén Principal',
        address: 'Av. Industrial 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postal_code: '01000',
        country: 'México',
        is_active: true,
        total_capacity: 10000,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1'
      }
    ];

    const sampleLocations = [
      {
        _id: 'location_1',
        id: 'location_1',
        code: 'A-01-01',
        name: 'Pasillo A - Rack 01 - Nivel 01',
        type: 'bin',
        warehouse_id: 'warehouse_1',
        capacity: 50,
        current_occupancy: 0,
        is_active: true,
        confirmation_code: 'A011',
        occupancy_status: 'available',
        coordinates: { x: 1, y: 1, z: 1 },
        restrictions: { max_weight: 1000 },
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1'
      },
      {
        _id: 'location_2',
        id: 'location_2',
        code: 'A-01-02',
        name: 'Pasillo A - Rack 01 - Nivel 02',
        type: 'bin',
        warehouse_id: 'warehouse_1',
        capacity: 50,
        current_occupancy: 0,
        is_active: true,
        confirmation_code: 'A012',
        occupancy_status: 'available',
        coordinates: { x: 1, y: 1, z: 2 },
        restrictions: { max_weight: 800 },
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1'
      },
      {
        _id: 'location_3',
        id: 'location_3',
        code: 'B-01-01',
        name: 'Pasillo B - Rack 01 - Nivel 01',
        type: 'bin',
        warehouse_id: 'warehouse_1',
        capacity: 30,
        current_occupancy: 0,
        is_active: true,
        confirmation_code: 'B011',
        occupancy_status: 'available',
        coordinates: { x: 2, y: 1, z: 1 },
        restrictions: { max_weight: 1200, ground_level_only: true },
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'user_1'
      }
    ];

    // Datos para el módulo Put Away
    const samplePallets = [
      {
        _id: 'pallet_1',
        id: 'pallet_1',
        pallet_number: 'PLT-2024-001',
        product_id: 'product_1',
        quantity: 25,
        status: 'waiting_putaway',
        received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        weight: 62.5,
        dimensions: { length: 120, width: 80, height: 40 },
        special_requirements: ['Frágil', 'Electrónico'],
        created_by: 'user_1',
        batch_number: 'BATCH-001',
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 año adelante
      },
      {
        _id: 'pallet_2',
        id: 'pallet_2',
        pallet_number: 'PLT-2024-002',
        product_id: 'product_2',
        quantity: 15,
        status: 'waiting_putaway',
        received_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
        weight: 63,
        dimensions: { length: 120, width: 80, height: 45 },
        special_requirements: ['Frágil'],
        created_by: 'user_1',
        batch_number: 'BATCH-002'
      },
      {
        _id: 'pallet_3',
        id: 'pallet_3',
        pallet_number: 'PLT-2024-003',
        product_id: 'product_1',
        quantity: 30,
        status: 'waiting_putaway',
        received_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
        weight: 75,
        dimensions: { length: 120, width: 80, height: 50 },
        special_requirements: ['Frágil', 'Electrónico'],
        created_by: 'user_1',
        batch_number: 'BATCH-003'
      }
    ];

    const samplePutAwayRules = [
      {
        _id: 'rule_1',
        id: 'rule_1',
        rule_name: 'Productos Electrónicos',
        description: 'Productos electrónicos van a ubicaciones con protección especial',
        product_category: 'Electrónicos',
        conditions: [
          { field: 'special_requirements', operator: 'contains', value: 'Electrónico' }
        ],
        location_preference: 'upper_shelf',
        priority: 1,
        is_active: true,
        created_by: 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        _id: 'rule_2',
        id: 'rule_2',
        rule_name: 'Productos Pesados',
        description: 'Productos pesados van a nivel del suelo',
        conditions: [
          { field: 'weight', operator: 'greater_than', value: 50 }
        ],
        location_preference: 'ground_level',
        priority: 2,
        is_active: true,
        created_by: 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const sampleStockLevels = [
      {
        _id: 'stock_1',
        id: 'stock_1',
        product_id: 'product_1',
        location_id: 'location_1',
        quantity_available: 20,
        quantity_reserved: 5,
        quantity_on_order: 10,
        last_updated: new Date(),
        user_id: 'user_1'
      },
      {
        _id: 'stock_2',
        id: 'stock_2',
        product_id: 'product_2',
        location_id: 'location_2',
        quantity_available: 15,
        quantity_reserved: 2,
        quantity_on_order: 0,
        last_updated: new Date(),
        user_id: 'user_1'
      }
    ];

    const sampleStockMovements = [
      {
        _id: 'movement_1',
        id: 'movement_1',
        product_id: 'product_1',
        to_location_id: 'location_1',
        quantity: 10,
        movement_type: 'inbound',
        reason: 'Recepcion de compra',
        performed_by: 'user_1',
        timestamp: new Date(),
        user_id: 'user_1'
      },
      {
        _id: 'movement_2',
        id: 'movement_2',
        product_id: 'product_2',
        to_location_id: 'location_2',
        quantity: 5,
        movement_type: 'inbound',
        reason: 'Recepcion de compra',
        performed_by: 'user_1',
        timestamp: new Date(),
        user_id: 'user_1'
      }
    ];

    const sampleData = {
      products: sampleProducts,
      categories: sampleCategories,
      warehouses: sampleWarehouses,
      locations: sampleLocations,
      pallets: samplePallets,
      putaway_rules: samplePutAwayRules,
      putaway_tasks: [],
      operator_performance: [],
      stock_levels: sampleStockLevels,
      stock_movements: sampleStockMovements
    };

    // Initialize collections with sample data
    for (const [collection, data] of Object.entries(sampleData)) {
      const existing = localStorage.getItem(`browserStorage_${collection}`);
      if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem(`browserStorage_${collection}`, JSON.stringify(data));
      }
    }

    console.log('Sample data initialized for Put Away module');
  }
}

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
          { name: 'locations' }, { name: 'stock_levels' }, { name: 'stock_movements' },
          { name: 'pallets' }, { name: 'putaway_rules' }, { name: 'putaway_tasks' },
          { name: 'operator_performance' }
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
