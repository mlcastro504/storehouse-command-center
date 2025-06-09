import { connectToDatabase } from '@/lib/mongodb';
import { BrowserStorage } from '@/lib/browserStorage';
import {
  Product, 
  Category, 
  Warehouse, 
  Location, 
  StockLevel, 
  StockMovement, 
  CycleCount,
  InventoryStats
} from '@/types/inventory';

export class InventoryService {
  static async getProducts(): Promise<Product[]> {
    try {
      const db = await connectToDatabase();
      const products = await db.collection('products').find({}).toArray() as Product[];
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const db = await connectToDatabase();
      const product = await db.collection('products').findOne({ id }) as Product | null;
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  static async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const product: Product = {
        ...productData,
        id: `prod_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'current_user_id' // TODO: Get from auth context
      } as Product;
      
      const db = await connectToDatabase();
      await db.collection('products').insertOne(product);
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('products').updateOne({ id }, { $set: { ...updates, updated_at: new Date() } });
      const updatedProduct = await db.collection('products').findOne({ id }) as Product | null;
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('products').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const db = await connectToDatabase();
      const categories = await db.collection('categories').find({}).toArray() as Category[];
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const db = await connectToDatabase();
      const category = await db.collection('categories').findOne({ id }) as Category | null;
      return category;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  static async createCategory(categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const category: Category = {
        ...categoryData,
        id: `cat_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'current_user_id' // TODO: Get from auth context
      } as Category;
      
      const db = await connectToDatabase();
      await db.collection('categories').insertOne(category);
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('categories').updateOne({ id }, { $set: { ...updates, updated_at: new Date() } });
      const updatedCategory = await db.collection('categories').findOne({ id }) as Category | null;
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('categories').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  static async getWarehouses(): Promise<Warehouse[]> {
    try {
      const db = await connectToDatabase();
      const warehouses = await db.collection('warehouses').find({}).toArray() as Warehouse[];
      return warehouses;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return [];
    }
  }

  static async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const db = await connectToDatabase();
      const warehouse = await db.collection('warehouses').findOne({ id }) as Warehouse | null;
      return warehouse;
    } catch (error) {
      console.error('Error fetching warehouse by ID:', error);
      return null;
    }
  }

  static async createWarehouse(warehouseData: Partial<Warehouse>): Promise<Warehouse | null> {
    try {
      const warehouse: Warehouse = {
        ...warehouseData,
        id: `wh_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'current_user_id' // TODO: Get from auth context
      } as Warehouse;
      
      const db = await connectToDatabase();
      await db.collection('warehouses').insertOne(warehouse);
      return warehouse;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      return null;
    }
  }

  static async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('warehouses').updateOne({ id }, { $set: { ...updates, updated_at: new Date() } });
      const updatedWarehouse = await db.collection('warehouses').findOne({ id }) as Warehouse | null;
      return updatedWarehouse;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      return null;
    }
  }

  static async deleteWarehouse(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('warehouses').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      return false;
    }
  }

  static async getLocations(warehouseId?: string): Promise<Location[]> {
    try {
      const db = await connectToDatabase();
      const filter = warehouseId ? { warehouse_id: warehouseId } : {};
      const locations = await db.collection('locations').find(filter).toArray() as Location[];
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getLocationById(id: string): Promise<Location | null> {
    try {
      const db = await connectToDatabase();
      const location = await db.collection('locations').findOne({ id }) as Location | null;
      return location;
    } catch (error) {
      console.error('Error fetching location by ID:', error);
      return null;
    }
  }

  static async createLocation(locationData: Partial<Location>): Promise<Location | null> {
    try {
      const location: Location = {
        ...locationData,
        id: `loc_${Date.now()}`,
        confirmation_code: `CODE${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        occupancy_status: 'available',
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'current_user_id' // TODO: Get from auth context
      } as Location;
      
      const db = await connectToDatabase();
      await db.collection('locations').insertOne(location);
      return location;
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  }

  static async updateLocation(id: string, updates: Partial<Location>): Promise<Location | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('locations').updateOne({ id }, { $set: { ...updates, updated_at: new Date() } });
      const updatedLocation = await db.collection('locations').findOne({ id }) as Location | null;
      return updatedLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  static async deleteLocation(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('locations').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  static async getStockLevels(productId?: string, locationId?: string): Promise<StockLevel[]> {
    try {
      const db = await connectToDatabase();
      const filter: any = {};
      if (productId) filter.product_id = productId;
      if (locationId) filter.location_id = locationId;
      const stockLevels = await db.collection('stock_levels').find(filter).toArray() as StockLevel[];
      return stockLevels;
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      return [];
    }
  }

  static async getStockLevelById(id: string): Promise<StockLevel | null> {
    try {
      const db = await connectToDatabase();
      const stockLevel = await db.collection('stock_levels').findOne({ id }) as StockLevel | null;
      return stockLevel;
    } catch (error) {
      console.error('Error fetching stock level by ID:', error);
      return null;
    }
  }

  static async createStockLevel(stockLevel: StockLevel): Promise<StockLevel | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('stock_levels').insertOne(stockLevel);
      return stockLevel;
    } catch (error) {
      console.error('Error creating stock level:', error);
      return null;
    }
  }

  static async updateStockLevel(productId: string, locationId: string, updates: Partial<StockLevel>): Promise<StockLevel | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('stock_levels').updateOne(
        { product_id: productId, location_id: locationId }, 
        { $set: { ...updates, last_updated: new Date() } }
      );
      const updatedStockLevel = await db.collection('stock_levels').findOne({ 
        product_id: productId, 
        location_id: locationId 
      }) as StockLevel | null;
      return updatedStockLevel;
    } catch (error) {
      console.error('Error updating stock level:', error);
      return null;
    }
  }

  static async deleteStockLevel(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('stock_levels').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting stock level:', error);
      return false;
    }
  }

  static async getStockMovements(productId?: string): Promise<StockMovement[]> {
    try {
      const db = await connectToDatabase();
      const filter = productId ? { product_id: productId } : {};
      const stockMovements = await db.collection('stock_movements').find(filter).toArray() as StockMovement[];
      return stockMovements;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return [];
    }
  }

  static async getStockMovementById(id: string): Promise<StockMovement | null> {
    try {
      const db = await connectToDatabase();
      const stockMovement = await db.collection('stock_movements').findOne({ id }) as StockMovement | null;
      return stockMovement;
    } catch (error) {
      console.error('Error fetching stock movement by ID:', error);
      return null;
    }
  }

  static async createStockMovement(stockMovement: StockMovement): Promise<StockMovement | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('stock_movements').insertOne(stockMovement);
      return stockMovement;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      return null;
    }
  }

  static async updateStockMovement(id: string, updates: Partial<StockMovement>): Promise<StockMovement | null> {
    try {
      const db = await connectToDatabase();
      await db.collection('stock_movements').updateOne({ id }, { $set: updates });
      const updatedStockMovement = await db.collection('stock_movements').findOne({ id }) as StockMovement | null;
      return updatedStockMovement;
    } catch (error) {
      console.error('Error updating stock movement:', error);
      return null;
    }
  }

  static async deleteStockMovement(id: string): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const result = await db.collection('stock_movements').deleteOne({ id });
      return true;
    } catch (error) {
      console.error('Error deleting stock movement:', error);
      return false;
    }
  }

  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const db = await connectToDatabase();
      const suppliers = await db.collection('suppliers').find({}).toArray() as Supplier[];
      return suppliers;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  static async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const supplier: Supplier = {
        ...supplierData,
        id: `sup_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'current_user_id' // TODO: Get from auth context
      } as Supplier;
      
      const db = await connectToDatabase();
      await db.collection('suppliers').insertOne(supplier);
      return supplier;
    } catch (error) {
      console.error('Error creating supplier:', error);
      return null;
    }
  }

  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test basic browser storage functionality
      await BrowserStorage.find('products', {});
      return { success: true };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getInventoryStats(): Promise<InventoryStats> {
    try {
      // Since BrowserStorage doesn't have countDocuments, we'll count the arrays
      const products = await BrowserStorage.find('products', {});
      const locations = await BrowserStorage.find('locations', {});
      const stockLevels = await BrowserStorage.find('stock_levels', {});

      return {
        totalProducts: products.length,
        totalLocations: locations.length,
        totalStockLevels: stockLevels.length,
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalProducts: 0,
        totalLocations: 0,
        totalStockLevels: 0,
      };
    }
  }
}
