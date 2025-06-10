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

  async listIndexes() {
    // Mock indexes for browser storage - return sample indexes that would exist in MongoDB
    const defaultIndexes = [
      {
        name: '_id_',
        key: { _id: 1 },
        size: 1024
      }
    ];

    // Add collection-specific mock indexes based on collection name
    const collectionIndexes: Record<string, any[]> = {
      'products': [
        { name: 'user_id_1', key: { user_id: 1 }, size: 2048 },
        { name: 'sku_1', key: { sku: 1 }, size: 1536 },
        { name: 'barcode_1', key: { barcode: 1 }, size: 1536 }
      ],
      'stock_levels': [
        { name: 'user_id_1', key: { user_id: 1 }, size: 2048 },
        { name: 'product_location_compound', key: { product_id: 1, location_id: 1 }, size: 3072 }
      ],
      'picking_tasks': [
        { name: 'user_id_1', key: { user_id: 1 }, size: 2048 },
        { name: 'status_1', key: { status: 1 }, size: 1536 }
      ]
    };

    const specificIndexes = collectionIndexes[this.collectionName] || [];
    return {
      toArray: () => Promise.resolve([...defaultIndexes, ...specificIndexes])
    };
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

  // Additional static methods for direct access
  static async find(collectionName: string, filter: any = {}) {
    const collection = new MockCollection(collectionName);
    const result = await collection.find(filter).toArray();
    return result;
  }

  static async findOne(collectionName: string, filter: any) {
    const collection = new MockCollection(collectionName);
    return await collection.findOne(filter);
  }

  static async insertOne(collectionName: string, doc: any) {
    const collection = new MockCollection(collectionName);
    return await collection.insertOne(doc);
  }

  static async updateOne(collectionName: string, filter: any, update: any) {
    const collection = new MockCollection(collectionName);
    return await collection.updateOne(filter, update);
  }

  static async deleteOne(collectionName: string, filter: any) {
    const collection = new MockCollection(collectionName);
    return await collection.deleteOne(filter);
  }

  static async initializeSampleData() {
    // Initialize sample data if none exists
    if (!this.get('products')) {
      this.set('products', []);
    }
    if (!this.get('categories')) {
      this.set('categories', []);
    }
    if (!this.get('warehouses')) {
      this.set('warehouses', []);
    }
    if (!this.get('locations')) {
      this.set('locations', []);
    }
    if (!this.get('stock_levels')) {
      this.set('stock_levels', []);
    }
    if (!this.get('stock_movements')) {
      this.set('stock_movements', []);
    }
    if (!this.get('suppliers')) {
      this.set('suppliers', []);
    }
    
    // Initialize accounting collections
    if (!this.get('accounts')) {
      const sampleAccounts = [
        {
          _id: '1',
          code: '1100',
          name: 'Caja',
          account_type: 'asset',
          account_nature: 'debit',
          is_active: true,
          level: 2,
          description: 'Dinero en efectivo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '2',
          code: '1200',
          name: 'Bancos',
          account_type: 'asset',
          account_nature: 'debit',
          is_active: true,
          level: 2,
          description: 'Cuentas bancarias',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '3',
          code: '1300',
          name: 'Cuentas por Cobrar',
          account_type: 'asset',
          account_nature: 'debit',
          is_active: true,
          level: 2,
          description: 'Deudas de clientes',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '4',
          code: '2100',
          name: 'Cuentas por Pagar',
          account_type: 'liability',
          account_nature: 'credit',
          is_active: true,
          level: 2,
          description: 'Deudas con proveedores',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '5',
          code: '3100',
          name: 'Capital Social',
          account_type: 'equity',
          account_nature: 'credit',
          is_active: true,
          level: 2,
          description: 'Capital aportado por socios',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '6',
          code: '4100',
          name: 'Ingresos por Ventas',
          account_type: 'revenue',
          account_nature: 'credit',
          is_active: true,
          level: 2,
          description: 'Ingresos por venta de productos',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '7',
          code: '5100',
          name: 'Costo de Ventas',
          account_type: 'expense',
          account_nature: 'debit',
          is_active: true,
          level: 2,
          description: 'Costo de productos vendidos',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        },
        {
          _id: '8',
          code: '5200',
          name: 'Gastos Operativos',
          account_type: 'expense',
          account_nature: 'debit',
          is_active: true,
          level: 2,
          description: 'Gastos de operación',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'system'
        }
      ];
      this.set('accounts', sampleAccounts);
    }
    
    if (!this.get('journal_entries')) {
      this.set('journal_entries', []);
    }
    
    if (!this.get('journal_entry_lines')) {
      this.set('journal_entry_lines', []);
    }
    
    if (!this.get('contacts')) {
      const sampleContacts = [
        {
          _id: '1',
          contact_number: 'CLI001',
          name: 'Empresa ABC S.L.',
          email: 'ventas@empresaabc.com',
          phone: '+34 912 345 678',
          contact_type: 'customer',
          payment_terms: '30 días',
          currency: 'EUR',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          _id: '2',
          contact_number: 'PRV001',
          name: 'Proveedor XYZ S.A.',
          email: 'compras@proveedorxyz.com',
          phone: '+34 913 456 789',
          contact_type: 'supplier',
          payment_terms: '60 días',
          currency: 'EUR',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.set('contacts', sampleContacts);
    }
    
    if (!this.get('invoices')) {
      this.set('invoices', []);
    }
    
    if (!this.get('invoice_lines')) {
      this.set('invoice_lines', []);
    }
    
    if (!this.get('payments')) {
      this.set('payments', []);
    }
    
    if (!this.get('payment_invoices')) {
      this.set('payment_invoices', []);
    }
    
    if (!this.get('tax_types')) {
      const sampleTaxTypes = [
        {
          _id: '1',
          name: 'IVA General',
          code: 'IVA21',
          rate: 21,
          tax_type: 'sales',
          account_id: '9', // Cuenta de IVA
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'IVA Reducido',
          code: 'IVA10',
          rate: 10,
          tax_type: 'sales',
          account_id: '9',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.set('tax_types', sampleTaxTypes);
    }
    
    if (!this.get('accounting_periods')) {
      const currentYear = new Date().getFullYear();
      const samplePeriods = [
        {
          _id: '1',
          period_name: `Período ${currentYear}`,
          start_date: `${currentYear}-01-01`,
          end_date: `${currentYear}-12-31`,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.set('accounting_periods', samplePeriods);
    }
  }

  static async getStats() {
    const collections = [
      'products', 'categories', 'warehouses', 'locations', 'stock_levels', 'stock_movements', 'suppliers',
      'accounts', 'journal_entries', 'journal_entry_lines', 'contacts', 'invoices', 'invoice_lines',
      'payments', 'payment_invoices', 'tax_types', 'accounting_periods'
    ];
    let totalSize = 0;
    
    collections.forEach(collection => {
      const data = this.get(collection) || [];
      totalSize += JSON.stringify(data).length;
    });

    return {
      collections: collections.length,
      dataSize: totalSize,
      storageSize: totalSize * 1.2, // Approximate overhead
      indexes: collections.length * 2 // Mock index count
    };
  }
}
