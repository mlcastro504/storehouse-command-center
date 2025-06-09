
// Mock collection for browser storage
class MockCollection {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  find(filter: any = {}) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const filteredData = this.filterData(data, filter);
    
    return {
      sort: (sortOptions: any = {}) => ({
        toArray: () => Promise.resolve(this.sortData(filteredData, sortOptions))
      }),
      toArray: () => Promise.resolve(filteredData)
    };
  }

  async findOne(filter: any) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const result = this.filterData(data, filter);
    return result.length > 0 ? result[0] : null;
  }

  async insertOne(doc: any) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const newDoc = { ...doc, _id: Date.now().toString() };
    data.push(newDoc);
    BrowserStorage.set(this.collectionName, data);
    return { insertedId: newDoc._id };
  }

  async updateOne(filter: any, update: any) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const index = data.findIndex((item: any) => this.matchesFilter(item, filter));
    
    if (index !== -1) {
      if (update.$set) {
        data[index] = { ...data[index], ...update.$set };
      }
      if (update.$inc) {
        Object.keys(update.$inc).forEach(key => {
          data[index][key] = (data[index][key] || 0) + update.$inc[key];
        });
      }
      BrowserStorage.set(this.collectionName, data);
      return { modifiedCount: 1 };
    }
    return { modifiedCount: 0 };
  }

  async updateMany(filter: any, update: any) {
    const data = BrowserStorage.get(this.collectionName) || [];
    let modifiedCount = 0;
    
    data.forEach((item: any, index: number) => {
      if (this.matchesFilter(item, filter)) {
        if (update.$set) {
          data[index] = { ...data[index], ...update.$set };
        }
        if (update.$inc) {
          Object.keys(update.$inc).forEach(key => {
            data[index][key] = (data[index][key] || 0) + update.$inc[key];
          });
        }
        modifiedCount++;
      }
    });
    
    if (modifiedCount > 0) {
      BrowserStorage.set(this.collectionName, data);
    }
    return { modifiedCount };
  }

  async deleteOne(filter: any) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const index = data.findIndex((item: any) => this.matchesFilter(item, filter));
    
    if (index !== -1) {
      data.splice(index, 1);
      BrowserStorage.set(this.collectionName, data);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async replaceOne(filter: any, replacement: any, options: any = {}) {
    const data = BrowserStorage.get(this.collectionName) || [];
    const index = data.findIndex((item: any) => this.matchesFilter(item, filter));
    
    if (index !== -1) {
      data[index] = { ...replacement, _id: data[index]._id };
      BrowserStorage.set(this.collectionName, data);
      return { modifiedCount: 1 };
    } else if (options.upsert) {
      const newDoc = { ...replacement, _id: Date.now().toString() };
      data.push(newDoc);
      BrowserStorage.set(this.collectionName, data);
      return { upsertedId: newDoc._id, modifiedCount: 0 };
    }
    return { modifiedCount: 0 };
  }

  private matchesFilter(item: any, filter: any): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    
    return Object.keys(filter).every(key => {
      if (key === '$in') return false; // Skip complex operators for now
      if (typeof filter[key] === 'object' && filter[key].$in) {
        return filter[key].$in.includes(item[key]);
      }
      return item[key] === filter[key];
    });
  }

  private filterData(data: any[], filter: any): any[] {
    if (!filter || Object.keys(filter).length === 0) return data;
    
    return data.filter(item => this.matchesFilter(item, filter));
  }

  private sortData(data: any[], sortOptions: any): any[] {
    if (!sortOptions || Object.keys(sortOptions).length === 0) return data;
    
    return [...data].sort((a, b) => {
      for (const key in sortOptions) {
        const direction = sortOptions[key];
        if (direction === 1) {
          if (a[key] < b[key]) return -1;
          if (a[key] > b[key]) return 1;
        } else {
          if (a[key] > b[key]) return -1;
          if (a[key] < b[key]) return 1;
        }
      }
      return 0;
    });
  }
}

export class BrowserStorage {
  static get(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }

  static set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting to storage:', error);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  static collection(name: string) {
    return new MockCollection(name);
  }
}
