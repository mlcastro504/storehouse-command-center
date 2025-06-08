// Browser-compatible storage service that mimics MongoDB operations
export interface StorageDocument {
  id: string;
  [key: string]: any;
}

class BrowserStorage {
  private getCollection<T extends StorageDocument>(collectionName: string): T[] {
    const data = localStorage.getItem(`collection_${collectionName}`);
    return data ? JSON.parse(data) : [];
  }

  private setCollection<T extends StorageDocument>(collectionName: string, data: T[]): void {
    localStorage.setItem(`collection_${collectionName}`, JSON.stringify(data));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async find<T extends StorageDocument>(
    collectionName: string, 
    filter: Partial<T> = {}
  ): Promise<T[]> {
    const collection = this.getCollection<T>(collectionName);
    
    if (Object.keys(filter).length === 0) {
      return collection;
    }

    return collection.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }

  async findOne<T extends StorageDocument>(
    collectionName: string, 
    filter: Partial<T>
  ): Promise<T | null> {
    const results = await this.find<T>(collectionName, filter);
    return results[0] || null;
  }

  async insertOne<T extends Omit<StorageDocument, 'id'>>(
    collectionName: string, 
    document: T
  ): Promise<StorageDocument> {
    const collection = this.getCollection(collectionName);
    const newDoc = {
      ...document,
      id: this.generateId(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    collection.push(newDoc);
    this.setCollection(collectionName, collection);
    
    return newDoc;
  }

  async updateOne<T extends StorageDocument>(
    collectionName: string, 
    filter: Partial<T>, 
    update: Partial<T>
  ): Promise<T | null> {
    const collection = this.getCollection<T>(collectionName);
    const index = collection.findIndex(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });

    if (index === -1) return null;

    collection[index] = {
      ...collection[index],
      ...update,
      updated_at: new Date()
    };

    this.setCollection(collectionName, collection);
    return collection[index];
  }

  async upsert<T extends StorageDocument>(
    collectionName: string,
    filter: Partial<T>,
    document: Partial<T>
  ): Promise<T> {
    const existing = await this.findOne<T>(collectionName, filter);
    
    if (existing) {
      return (await this.updateOne(collectionName, filter, document)) as T;
    } else {
      return (await this.insertOne(collectionName, { ...filter, ...document })) as T;
    }
  }

  async deleteOne<T extends StorageDocument>(
    collectionName: string, 
    filter: Partial<T>
  ): Promise<boolean> {
    const collection = this.getCollection<T>(collectionName);
    const index = collection.findIndex(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });

    if (index === -1) return false;

    collection.splice(index, 1);
    this.setCollection(collectionName, collection);
    return true;
  }

  async count(collectionName: string, filter: any = {}): Promise<number> {
    const results = await this.find(collectionName, filter);
    return results.length;
  }

  // Simulate database stats
  async getStats() {
    const collections = [
      'products', 'categories', 'warehouses', 'locations', 
      'stock_levels', 'stock_movements', 'suppliers', 'cycle_counts',
      'putaway_tasks', 'putaway_rules', 'putaway_performance'
    ];
    
    let totalDocs = 0;
    const collectionStats = [];

    for (const collection of collections) {
      const docs = this.getCollection(collection);
      totalDocs += docs.length;
      collectionStats.push({ name: collection, count: docs.length });
    }

    return {
      collections: collections.length,
      dataSize: totalDocs * 1024, // Simulate size
      storageSize: totalDocs * 1536,
      indexes: collections.length * 2,
      documents: totalDocs
    };
  }

  // Initialize with sample data if collections are empty
  async initializeSampleData() {
    const productsCount = await this.count('products');
    
    if (productsCount === 0) {
      console.log('Inicializando datos de ejemplo...');
      
      // Sample categories
      const electronicsCategory = await this.insertOne('categories', {
        name: 'Electrónicos',
        description: 'Productos electrónicos',
        code: 'ELEC',
        is_active: true,
        user_id: 'user_123'
      });

      const clothingCategory = await this.insertOne('categories', {
        name: 'Ropa',
        description: 'Productos de vestimenta',
        code: 'ROPA',
        is_active: true,
        user_id: 'user_123'
      });

      // Sample warehouse
      const mainWarehouse = await this.insertOne('warehouses', {
        name: 'Almacén Principal',
        code: 'WH001',
        address: 'Calle Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postal_code: '01000',
        country: 'México',
        phone: '+52 55 1234 5678',
        email: 'almacen@empresa.com',
        is_active: true,
        user_id: 'user_123'
      });

      // Sample locations
      const locationA1 = await this.insertOne('locations', {
        name: 'Pasillo A - Estante 1',
        code: 'A1-001',
        type: 'shelf',
        warehouse_id: mainWarehouse.id,
        capacity: 100,
        current_occupancy: 0,
        coordinates: { x: 1, y: 1 },
        is_active: true,
        user_id: 'user_123'
      });

      const locationA2 = await this.insertOne('locations', {
        name: 'Pasillo A - Estante 2',
        code: 'A1-002',
        type: 'shelf',
        warehouse_id: mainWarehouse.id,
        capacity: 100,
        current_occupancy: 0,
        coordinates: { x: 1, y: 2 },
        is_active: true,
        user_id: 'user_123'
      });

      // Sample products
      const laptop = await this.insertOne('products', {
        name: 'Laptop Dell Inspiron',
        sku: 'DELL-INS-001',
        description: 'Laptop Dell Inspiron 15 pulgadas',
        category_id: electronicsCategory.id,
        cost_price: 12000,
        sale_price: 15000,
        min_stock_level: 5,
        max_stock_level: 50,
        reorder_point: 10,
        unit_of_measure: 'unidad',
        weight: 2.5,
        dimensions: { length: 35, width: 25, height: 2 },
        is_active: true,
        user_id: 'user_123'
      });

      // Sample stock levels
      await this.insertOne('stock_levels', {
        product_id: laptop.id,
        location_id: locationA1.id,
        quantity_available: 25,
        quantity_reserved: 5,
        quantity_on_order: 10,
        user_id: 'user_123',
        last_updated: new Date()
      });

      console.log('Datos de ejemplo inicializados correctamente');
    }
  }
}

export const browserStorage = new BrowserStorage();
