
import { connectToDatabase } from './mongodb';

export async function hasExistingData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    const products = await db.collection('products').find({}).limit(1).toArray();
    return products.length > 0;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}

export async function clearAllData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    const collections = ['users', 'products', 'categories', 'warehouses', 'locations', 'stock_levels', 'suppliers'];
    
    for (const collectionName of collections) {
      await db.collection(collectionName).deleteMany({});
    }
    
    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

export async function generateMockData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();

    // Mock Users
    const users = [
      { id: 'user1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: { name: 'admin', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user2', email: 'manager@example.com', firstName: 'Manager', lastName: 'User', role: { name: 'manager', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user3', email: 'employee@example.com', firstName: 'Employee', lastName: 'User', role: { name: 'employee', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() }
    ];
    await db.collection('users').insertMany(users);

    // Mock Suppliers
    const suppliers = [
      { id: 'supplier1', name: 'Acme Corp', contact_email: 'contact@acme.com', is_active: true },
      { id: 'supplier2', name: 'Beta Industries', contact_email: 'contact@beta.com', is_active: true }
    ];
    await db.collection('suppliers').insertMany(suppliers);

    // Mock Categories
    const categories = [
      { id: 'category1', name: 'Electronics', description: 'Electronic gadgets' },
      { id: 'category2', name: 'Clothing', description: 'Apparel and accessories' }
    ];
    await db.collection('categories').insertMany(categories);

    // Mock Warehouses
    const warehouses = [
      { id: 'warehouse1', name: 'Main Warehouse', location: '123 Main St' },
      { id: 'warehouse2', name: 'Secondary Warehouse', location: '456 Elm St' }
    ];
    await db.collection('warehouses').insertMany(warehouses);

    // Mock Locations
    const locations = [
      { id: 'location1', code: 'A1', name: 'Aisle 1', warehouse_id: 'warehouse1', type: 'aisle' },
      { id: 'location2', code: 'B2', name: 'Shelf 2', warehouse_id: 'warehouse1', type: 'shelf' }
    ];
    await db.collection('locations').insertMany(locations);

    // Mock Products
    const products = [
      { id: 'product1', sku: 'EL001', name: 'Laptop', description: 'High-performance laptop', category_id: 'category1', supplier_id: 'supplier1', cost_price: 1200, sale_price: 1500 },
      { id: 'product2', sku: 'CL001', name: 'T-shirt', description: 'Cotton T-shirt', category_id: 'category2', supplier_id: 'supplier2', cost_price: 15, sale_price: 25 }
    ];
    await db.collection('products').insertMany(products);

    // Mock Stock Levels
    const stockLevels = [
      { id: 'stock1', product_id: 'product1', location_id: 'location1', quantity: 10 },
      { id: 'stock2', product_id: 'product2', location_id: 'location2', quantity: 100 }
    ];
    await db.collection('stock_levels').insertMany(stockLevels);

    console.log('Mock data generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating mock data:', error);
    return false;
  }
}

export class MockDataGenerator {
  static async hasExistingData(): Promise<boolean> {
    return await hasExistingData();
  }

  static async clearAllData(): Promise<boolean> {
    return await clearAllData();
  }

  static async generateAllMockData(): Promise<boolean> {
    return await generateMockData();
  }
}
