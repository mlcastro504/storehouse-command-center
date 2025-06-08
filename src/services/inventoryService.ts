
import { connectToDatabase } from "@/lib/mongodb";
import type { Product, Category, Location, Warehouse, StockLevel, StockMovement, CycleCount, Supplier, ProductSupplier } from "@/types/inventory";

// Función auxiliar para obtener el user_id (simulado por ahora)
const getCurrentUserId = () => {
  return "user_123";
};

// Función auxiliar para convertir ObjectId a string
const convertToString = (doc: any) => {
  if (doc && doc._id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  return doc;
};

export class InventoryService {
  // Test de conexión
  static async testConnection() {
    try {
      console.log('Testing database connection...');
      const db = await connectToDatabase();
      
      // Test básico de lectura
      const collections = await db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
      
      // Test de escritura con una colección temporal
      const testResult = await db.collection('connection_test').insertOne({ 
        test: true, 
        timestamp: new Date() 
      });
      console.log('Write test successful:', testResult);
      
      // Limpiar el test
      await db.collection('connection_test').deleteOne({ id: testResult.insertedId });
      console.log('Connection test completed successfully');
      
      return { success: true, message: 'Database connection is working properly' };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Products
  static async getProducts() {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const products = await db.collection('products')
      .find({ user_id: userId, is_active: true })
      .sort({ name: 1 })
      .toArray();

    // Hacer lookup para las categorías
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const category = await db.collection('categories')
          .findOne({ id: product.category_id });
        
        return {
          ...convertToString(product),
          category: category ? convertToString(category) : null
        };
      })
    );

    return productsWithCategories;
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newProduct = {
      ...product,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('products').insertOne(newProduct);
    
    // Return the inserted document with the generated id
    return {
      ...newProduct,
      id: result.insertedId.toString()
    };
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    const db = await connectToDatabase();
    
    const updatedProduct = {
      ...updates,
      updated_at: new Date()
    };
    
    delete updatedProduct._id;
    delete updatedProduct.id;

    const result = await db.collection('products').updateOne(
      { id: id },
      { $set: updatedProduct }
    );

    const product = await db.collection('products').findOne({ id: id });
    return convertToString(product);
  }

  static async deleteProduct(id: string) {
    const db = await connectToDatabase();
    
    await db.collection('products').updateOne(
      { id: id },
      { $set: { is_active: false, updated_at: new Date() } }
    );
  }

  // Categories
  static async getCategories() {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const categories = await db.collection('categories')
      .find({ user_id: userId, is_active: true })
      .sort({ name: 1 })
      .toArray();

    return categories.map(category => convertToString(category));
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newCategory = {
      ...category,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('categories').insertOne(newCategory);
    
    // Return the inserted document with the generated id
    return {
      ...newCategory,
      id: result.insertedId.toString()
    };
  }

  // Warehouses
  static async getWarehouses() {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const warehouses = await db.collection('warehouses')
      .find({ user_id: userId, is_active: true })
      .sort({ name: 1 })
      .toArray();

    return warehouses.map(warehouse => convertToString(warehouse));
  }

  static async createWarehouse(warehouse: Omit<Warehouse, 'id' | 'created_at' | 'updated_at' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newWarehouse = {
      ...warehouse,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('warehouses').insertOne(newWarehouse);
    
    // Return the inserted document with the generated id
    return {
      ...newWarehouse,
      id: result.insertedId.toString()
    };
  }

  // Locations
  static async getLocations(warehouseId?: string) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const filter: any = { user_id: userId, is_active: true };
    if (warehouseId) {
      filter.warehouse_id = warehouseId;
    }

    const locations = await db.collection('locations')
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    // Hacer lookup para los warehouses
    const locationsWithWarehouses = await Promise.all(
      locations.map(async (location) => {
        const warehouse = await db.collection('warehouses')
          .findOne({ id: location.warehouse_id });
        
        return {
          ...convertToString(location),
          warehouse: warehouse ? convertToString(warehouse) : null
        };
      })
    );

    return locationsWithWarehouses;
  }

  static async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newLocation = {
      ...location,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('locations').insertOne(newLocation);
    
    // Return the inserted document with the generated id
    return {
      ...newLocation,
      id: result.insertedId.toString()
    };
  }

  // Stock Levels
  static async getStockLevels(productId?: string, locationId?: string) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const filter: any = { user_id: userId };
    if (productId) filter.product_id = productId;
    if (locationId) filter.location_id = locationId;

    const stockLevels = await db.collection('stock_levels')
      .find(filter)
      .toArray();

    // Hacer lookup para productos y ubicaciones
    const stockLevelsWithRefs = await Promise.all(
      stockLevels.map(async (stockLevel) => {
        const product = await db.collection('products')
          .findOne({ id: stockLevel.product_id });
        const location = await db.collection('locations')
          .findOne({ id: stockLevel.location_id });
        
        return {
          ...convertToString(stockLevel),
          product: product ? convertToString(product) : null,
          location: location ? convertToString(location) : null
        };
      })
    );

    return stockLevelsWithRefs;
  }

  static async updateStockLevel(productId: string, locationId: string, updates: Partial<StockLevel>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const stockLevel = {
      product_id: productId,
      location_id: locationId,
      user_id: userId,
      last_updated: new Date(),
      ...updates
    };

    delete stockLevel._id;
    delete stockLevel.id;

    // Try to update existing, if not found, create new
    const existing = await db.collection('stock_levels')
      .findOne({ product_id: productId, location_id: locationId, user_id: userId });

    if (existing) {
      await db.collection('stock_levels').updateOne(
        { product_id: productId, location_id: locationId, user_id: userId },
        { $set: stockLevel }
      );
    } else {
      await db.collection('stock_levels').insertOne(stockLevel);
    }

    const updatedStockLevel = await db.collection('stock_levels')
      .findOne({ product_id: productId, location_id: locationId, user_id: userId });
    
    return convertToString(updatedStockLevel);
  }

  // Stock Movements
  static async getStockMovements(productId?: string) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const filter: any = { user_id: userId };
    if (productId) filter.product_id = productId;

    const movements = await db.collection('stock_movements')
      .find(filter)
      .sort({ timestamp: -1 })
      .toArray();

    // Hacer lookup para productos y ubicaciones
    const movementsWithRefs = await Promise.all(
      movements.map(async (movement) => {
        const product = await db.collection('products')
          .findOne({ id: movement.product_id });
        const fromLocation = movement.from_location_id ? 
          await db.collection('locations').findOne({ id: movement.from_location_id }) : null;
        const toLocation = await db.collection('locations')
          .findOne({ id: movement.to_location_id });
        
        return {
          ...convertToString(movement),
          product: product ? convertToString(product) : null,
          from_location: fromLocation ? convertToString(fromLocation) : null,
          to_location: toLocation ? convertToString(toLocation) : null
        };
      })
    );

    return movementsWithRefs;
  }

  static async createStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp' | 'performed_by' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newMovement = {
      ...movement,
      performed_by: userId,
      user_id: userId,
      timestamp: new Date()
    };

    const result = await db.collection('stock_movements').insertOne(newMovement);
    
    // Return the inserted document with the generated id
    return {
      ...newMovement,
      id: result.insertedId.toString()
    };
  }

  // Suppliers
  static async getSuppliers() {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();
    
    const suppliers = await db.collection('suppliers')
      .find({ user_id: userId, is_active: true })
      .sort({ name: 1 })
      .toArray();

    return suppliers.map(supplier => convertToString(supplier));
  }

  static async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'user_id' | '_id'>) {
    const db = await connectToDatabase();
    const userId = getCurrentUserId();

    const newSupplier = {
      ...supplier,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('suppliers').insertOne(newSupplier);
    
    // Return the inserted document with the generated id
    return {
      ...newSupplier,
      id: result.insertedId.toString()
    };
  }
}
