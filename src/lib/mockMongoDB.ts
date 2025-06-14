
// Mock MongoDB service for browser environment
export interface MockCollection {
  find(filter?: any): MockCursor;
  findOne(filter: any): Promise<any>;
  insertOne(document: any): Promise<{ insertedId: string }>;
  updateOne(filter: any, update: any): Promise<{ matchedCount: number; modifiedCount: number }>;
  deleteOne(filter: any): Promise<{ deletedCount: number }>;
}

export interface MockCursor {
  sort(sort: any): MockCursor;
  toArray(): Promise<any[]>;
}

class MockMongoCursor implements MockCursor {
  constructor(private data: any[], private filter: any = {}) {}

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
    return new MockMongoCursor(sortedData, this.filter);
  }

  async toArray(): Promise<any[]> {
    return this.data;
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
      if (key === '_id' && typeof value === 'object' && value.toString) {
        if (item._id && item._id.toString() !== value.toString()) return false;
      } else if (item[key] !== value) {
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
    const id = new Date().getTime().toString();
    const newDoc = {
      ...document,
      _id: { toString: () => id }
    };
    data.push(newDoc);
    this.setData(data);
    return { insertedId: id };
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
}

export async function connectToDatabase() {
  console.log('Using mock MongoDB connection for browser environment');
  return new MockMongoDatabase();
}

export async function closeDatabaseConnection() {
  console.log('Mock MongoDB connection closed');
}

export async function getDatabaseStats() {
  return {
    collections: 10,
    dataSize: 1024000,
    storageSize: 2048000,
    indexes: 15
  };
}

export async function testConnection() {
  try {
    return { success: true, message: 'Mock connection successful' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
