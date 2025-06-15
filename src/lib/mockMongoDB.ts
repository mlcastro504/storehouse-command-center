// Mock MongoDB service for browser environment
export interface MockCollection {
  find(filter?: any): MockCursor;
  findOne(filter: any): Promise<any>;
  insertOne(document: any): Promise<{ insertedId: string }>;
  insertMany(documents: any[]): Promise<{ insertedIds: string[] }>;
  updateOne(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }>;
  deleteOne(filter: any): Promise<{ deletedCount: number }>;
  deleteMany(filter: any): Promise<{ deletedCount: number }>;
  aggregate(pipeline: any[]): Promise<any[]>;
  listIndexes(): Promise<any[]>;
}

export interface MockCursor {
  sort(sort: any): MockCursor;
  limit(count: number): MockCursor;
  toArray(): Promise<any[]>;
}

class MockMongoCursor implements MockCursor {
  constructor(private data: any[], private filter: any = {}, private limitCount?: number) {}

  sort(sortOptions: any): MockCursor {
    const sortedData = [...this.data].sort((a, b) => {
      for (const [key, direction] of Object.entries(sortOptions)) {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return direction === 1 ? -1 : 1;
        if (aVal > bVal) return direction === 1 ? 1 : -1;
      }
      return 0;
    });
    return new MockMongoCursor(sortedData, this.filter, this.limitCount);
  }

  limit(count: number): MockCursor {
    return new MockMongoCursor(this.data, this.filter, count);
  }

  async toArray(): Promise<any[]> {
    let result = this.data;
    if (this.limitCount) {
      result = result.slice(0, this.limitCount);
    }
    return result;
  }
}

class MockMongoCollection implements MockCollection {
  constructor(private collectionName: string) {}

  private getStorageKey(): string {
    return `mockdb_${this.collectionName}`;
  }

  private getData(): any[] {
    const stored = localStorage.getItem(this.getStorageKey());
    return stored ? JSON.parse(stored) : [];
  }

  private setData(data: any[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  }

  private matchesFilter(item: any, filter: any): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    
    for (const [key, value] of Object.entries(filter)) {
      if (key === '$or') {
        const orConditions = value as any[];
        return orConditions.some(condition => this.matchesFilter(item, condition));
      }

      const itemValue = item[key];

      if (key === '_id') {
        // Handle both string and object with toString() for _id queries
        const filterId = value?.toString();
        const itemId = itemValue?.toString();
        if (itemId !== filterId) return false;
      } else if (itemValue !== value) {
        return false;
      }
    }
    return true;
  }

  find(filter: any = {}): MockCursor {
    const data = this.getData();
    const filteredData = data.filter(item => this.matchesFilter(item, filter));
    return new MockMongoCursor(filteredData, filter);
  }

  async findOne(filter: any): Promise<any> {
    const data = this.getData();
    return data.find(item => this.matchesFilter(item, filter)) || null;
  }

  async insertOne(document: any): Promise<{ insertedId: string }> {
    const data = this.getData();
    // Respect existing _id or generate a new one
    const id = document._id || new Date().getTime().toString();
    const newDoc = { ...document };
    const finalId = id.toString();
    // Store _id as an object with toString for consistency
    newDoc._id = { toString: () => finalId };
    data.push(newDoc);
    this.setData(data);
    return { insertedId: finalId };
  }

  async insertMany(documents: any[]): Promise<{ insertedIds: string[] }> {
    const data = this.getData();
    const insertedIds: string[] = [];
    
    for (const document of documents) {
      // Respect existing _id or generate a new one
      const id = document._id || (new Date().getTime().toString() + Math.random().toString(36).substr(2, 9));
      const newDoc = { ...document };
      const finalId = id.toString();
      // Store _id as an object with toString for consistency
      newDoc._id = { toString: () => finalId };
      data.push(newDoc);
      insertedIds.push(finalId);
    }
    
    this.setData(data);
    return { insertedIds };
  }

  async updateOne(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }> {
    const data = this.getData();
    const index = data.findIndex(item => this.matchesFilter(item, filter));
    
    if (index === -1) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    if (update.$set) {
      data[index] = { ...data[index], ...update.$set };
    } else {
      data[index] = { ...data[index], ...update };
    }
    
    this.setData(data);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const data = this.getData();
    const index = data.findIndex(item => this.matchesFilter(item, filter));
    
    if (index === -1) {
      return { deletedCount: 0 };
    }

    data.splice(index, 1);
    this.setData(data);
    return { deletedCount: 1 };
  }

  async deleteMany(filter: any): Promise<{ deletedCount: number }> {
    const data = this.getData();
    const initialLength = data.length;
    const filteredData = data.filter(item => !this.matchesFilter(item, filter));
    
    this.setData(filteredData);
    return { deletedCount: initialLength - filteredData.length };
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    const data = this.getData();
    let result = [...data];
    
    for (const stage of pipeline) {
      if (stage.$match) {
        result = result.filter(item => this.matchesFilter(item, stage.$match));
      }
      if (stage.$sort) {
        result.sort((a, b) => {
          for (const [key, direction] of Object.entries(stage.$sort)) {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal) return direction === 1 ? -1 : 1;
            if (aVal > bVal) return direction === 1 ? 1 : -1;
          }
          return 0;
        });
      }
      if (stage.$limit) {
        result = result.slice(0, stage.$limit);
      }
      if (stage.$group) {
        result = [{ _id: null, total: result.length, data: result }];
      }
    }
    
    return result;
  }

  async listIndexes(): Promise<any[]> {
    return [
      { key: { _id: 1 }, name: '_id_' },
      { key: { id: 1 }, name: 'id_1' }
    ];
  }
}

class MockMongoDatabase {
  collection(name: string): MockCollection {
    return new MockMongoCollection(name);
  }

  async stats() {
    return {
      collections: 10,
      dataSize: 1024000,
      storageSize: 2048000,
      indexes: 15
    };
  }

  admin() {
    return {
      ping: async () => ({ ok: 1 })
    };
  }

  async listCollections() {
    const collections = ['products', 'categories', 'warehouses', 'locations', 'stock_levels', 'users', 'suppliers'];
    return collections.map(name => ({ name, type: 'collection' }));
  }
}

let mockConnectionState = {
  connected: false,
  uri: "",
  database: "",
};

export async function connectToDatabase(uri?: string, database?: string) {
  console.log('Attempting mock MongoDB connection', uri, database);
  // URI required and must start with mongodb:// or mongodb+srv://
  if (!uri || !(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    mockConnectionState = { connected: false, uri: "", database: "" };
    throw new Error("Invalid MongoDB URI");
  }
  // Simulate "create" by setting the values
  mockConnectionState = { connected: true, uri, database: database || "" };
  return new MockMongoDatabase();
}

export function getMockConnectionState() {
  return { ...mockConnectionState };
}

export async function closeDatabaseConnection() {
  console.log('Mock MongoDB connection closed');
  mockConnectionState = { connected: false, uri: "", database: "" };
}

export async function getDatabaseStats() {
  if (!mockConnectionState.connected) {
    throw new Error('Not connected to MongoDB');
  }
  return {
    collections: 10,
    dataSize: 1024000,
    storageSize: 2048000,
    indexes: 15
  };
}

export async function testConnection(uri?: string, database?: string) {
  // Simulate real test
  if (!uri || !(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    return { success: false, message: "Invalid MongoDB URI" };
  }
  if (!mockConnectionState.connected ||
      mockConnectionState.uri !== uri ||
      (database && mockConnectionState.database !== database)) {
    return { success: false, message: "No active connection for this URI/database" };
  }
  return { success: true, message: 'Mock connection successful' };
}
