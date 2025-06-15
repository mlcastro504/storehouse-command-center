import { connectToDatabase } from '@/lib/mongodb';
import {
  Product, 
  Category, 
  Warehouse, 
  Location, 
  StockLevel, 
  StockMovement, 
  CycleCount,
  InventoryStats,
  Supplier
} from '@/types/inventory';

// Helper to connect to the database consistently
const getDb = () => connectToDatabase('mongodb://localhost/mockdb', 'mockdb');

// Helper to map MongoDB documents (_id -> id)
const mapDoc = <T extends {id: string}>(doc: any): T | null => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest } as T;
};

const mapDocs = <T extends {id: string}>(docs: any[]): T[] => {
  return docs.map(doc => mapDoc<T>(doc)!).filter(Boolean);
};

export class InventoryService {
  static async getProducts(): Promise<Product[]> {
    try {
      const db = await getDb();
      const products = await db.collection('products').find({}).toArray();
      return mapDocs<Product>(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const db = await getDb();
      const product = await db.collection('products').findOne({ id });
      return mapDoc<Product>(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  static async createProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const db = await getDb();
      const id = `prod_${Date.now()}`;
      const newProductDoc = {
        ...productData,
        id,
        _id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current_user_id' // TODO: Get from auth context
      };
      
      await db.collection('products').insertOne(newProductDoc);
      return mapDoc<Product>(newProductDoc);
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const db = await getDb();
      await db.collection('products').updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
      const updatedProduct = await this.getProductById(id);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('products').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const db = await getDb();
      const categories = await db.collection('categories').find({}).toArray();
      return mapDocs<Category>(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const db = await getDb();
      const category = await db.collection('categories').findOne({ id });
      return mapDoc<Category>(category);
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  }

  static async createCategory(categoryData: Partial<Category>): Promise<Category | null> {
    try {
      const db = await getDb();
      const id = `cat_${Date.now()}`;
      const newCategoryDoc = {
        ...categoryData,
        id,
        _id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current_user_id' // TODO: Get from auth context
      };
      
      await db.collection('categories').insertOne(newCategoryDoc);
      return mapDoc<Category>(newCategoryDoc);
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const db = await getDb();
      await db.collection('categories').updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
      const updatedCategory = await this.getCategoryById(id);
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('categories').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  static async getWarehouses(): Promise<Warehouse[]> {
    try {
      const db = await getDb();
      const warehouses = await db.collection('warehouses').find({}).toArray();
      return mapDocs<Warehouse>(warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return [];
    }
  }

  static async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const db = await getDb();
      const warehouse = await db.collection('warehouses').findOne({ id });
      return mapDoc<Warehouse>(warehouse);
    } catch (error) {
      console.error('Error fetching warehouse by ID:', error);
      return null;
    }
  }

  static async createWarehouse(warehouseData: Partial<Warehouse>): Promise<Warehouse | null> {
    try {
      const db = await getDb();
      const id = `wh_${Date.now()}`;
      const newWarehouseDoc = {
        ...warehouseData,
        id,
        _id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current_user_id' // TODO: Get from auth context
      };
      
      await db.collection('warehouses').insertOne(newWarehouseDoc);
      return mapDoc<Warehouse>(newWarehouseDoc);
    } catch (error) {
      console.error('Error creating warehouse:', error);
      return null;
    }
  }

  static async updateWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse | null> {
    try {
      const db = await getDb();
      await db.collection('warehouses').updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
      const updatedWarehouse = await this.getWarehouseById(id);
      return updatedWarehouse;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      return null;
    }
  }

  static async deleteWarehouse(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('warehouses').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      return false;
    }
  }

  static async getLocations(warehouseId?: string): Promise<Location[]> {
    try {
      const db = await getDb();
      const filter = warehouseId ? { warehouse_id: warehouseId } : {};
      const locations = await db.collection('locations').find(filter).toArray();
      return mapDocs<Location>(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getLocationById(id: string): Promise<Location | null> {
    try {
      const db = await getDb();
      const location = await db.collection('locations').findOne({ id });
      return mapDoc<Location>(location);
    } catch (error) {
      console.error('Error fetching location by ID:', error);
      return null;
    }
  }

  static async createLocation(locationData: Partial<Location>): Promise<Location | null> {
    try {
      const db = await getDb();
      const id = `loc_${Date.now()}`;
      const newLocationDoc = {
        ...locationData,
        id,
        _id: id,
        confirmation_code: `CODE${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        occupancy_status: 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'current_user_id' // TODO: Get from auth context
      };
      
      await db.collection('locations').insertOne(newLocationDoc);
      return mapDoc<Location>(newLocationDoc);
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  }

  static async updateLocation(id: string, updates: Partial<Location>): Promise<Location | null> {
    try {
      const db = await getDb();
      await db.collection('locations').updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
      const updatedLocation = await this.getLocationById(id);
      return updatedLocation;
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }

  static async deleteLocation(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('locations').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  static async getStockLevels(productId?: string, locationId?: string): Promise<StockLevel[]> {
    try {
      const db = await getDb();
      const filter: any = {};
      if (productId) filter.product_id = productId;
      if (locationId) filter.location_id = locationId;
      const stockLevels = await db.collection('stock_levels').find(filter).toArray();
      return mapDocs<StockLevel>(stockLevels);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      return [];
    }
  }

  static async getStockLevelById(id: string): Promise<StockLevel | null> {
    try {
      const db = await getDb();
      const stockLevel = await db.collection('stock_levels').findOne({ id });
      return mapDoc<StockLevel>(stockLevel);
    } catch (error) {
      console.error('Error fetching stock level by ID:', error);
      return null;
    }
  }

  static async createStockLevel(stockLevelData: Partial<StockLevel>): Promise<StockLevel | null> {
    try {
      const db = await getDb();
      const id = `sl_${Date.now()}`;
      const newStockLevelDoc = {
        ...stockLevelData,
        id,
        _id: id,
        last_updated: new Date().toISOString()
      };
      await db.collection('stock_levels').insertOne(newStockLevelDoc);
      return mapDoc<StockLevel>(newStockLevelDoc);
    } catch (error) {
      console.error('Error creating stock level:', error);
      return null;
    }
  }

  static async updateStockLevel(productId: string, locationId: string, updates: Partial<StockLevel>): Promise<StockLevel | null> {
    try {
      const db = await getDb();
      const filter = { product_id: productId, location_id: locationId };
      await db.collection('stock_levels').updateOne(
        filter, 
        { $set: { ...updates, last_updated: new Date().toISOString() } }
      );
      const updatedStockLevelDoc = await db.collection('stock_levels').findOne(filter);
      return mapDoc<StockLevel>(updatedStockLevelDoc);
    } catch (error) {
      console.error('Error updating stock level:', error);
      return null;
    }
  }

  static async deleteStockLevel(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('stock_levels').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting stock level:', error);
      return false;
    }
  }

  static async getStockMovements(productId?: string): Promise<StockMovement[]> {
    try {
      const db = await getDb();
      const filter = productId ? { product_id: productId } : {};
      const stockMovements = await db.collection('stock_movements').find(filter).toArray();
      return mapDocs<StockMovement>(stockMovements);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      return [];
    }
  }

  static async getStockMovementById(id: string): Promise<StockMovement | null> {
    try {
      const db = await getDb();
      const stockMovement = await db.collection('stock_movements').findOne({ id });
      return mapDoc<StockMovement>(stockMovement);
    } catch (error) {
      console.error('Error fetching stock movement by ID:', error);
      return null;
    }
  }

  static async createStockMovement(stockMovementData: Partial<StockMovement>): Promise<StockMovement | null> {
    try {
      const db = await getDb();
      const id = `sm_${Date.now()}`;
      const newStockMovementDoc = {
        ...stockMovementData,
        id,
        _id: id,
        timestamp: new Date().toISOString()
      };
      await db.collection('stock_movements').insertOne(newStockMovementDoc);
      return mapDoc<StockMovement>(newStockMovementDoc);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      return null;
    }
  }

  static async updateStockMovement(id: string, updates: Partial<StockMovement>): Promise<StockMovement | null> {
    try {
      const db = await getDb();
      await db.collection('stock_movements').updateOne({ id }, { $set: updates });
      const updatedStockMovement = await this.getStockMovementById(id);
      return updatedStockMovement;
    } catch (error) {
      console.error('Error updating stock movement:', error);
      return null;
    }
  }

  static async deleteStockMovement(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('stock_movements').deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting stock movement:', error);
      return false;
    }
  }

  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const db = await getDb();
      const suppliers = await db.collection('suppliers').find({}).toArray();
      return mapDocs<Supplier>(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  static async createSupplier(supplierData: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const db = await getDb();
      const id = `sup_${Date.now()}`;
      const newSupplierDoc = {
        ...supplierData,
        id,
        _id: id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await db.collection('suppliers').insertOne(newSupplierDoc);
      return mapDoc<Supplier>(newSupplierDoc);
    } catch (error) {
      console.error('Error creating supplier:', error);
      return null;
    }
  }

  static async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const db = await getDb();
      await db.collection('suppliers').updateOne({ id: id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
      const supplier = await db.collection('suppliers').findOne({ id: id });
      return mapDoc<Supplier>(supplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      return null;
    }
  }

  static async deleteSupplier(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.collection('suppliers').deleteOne({ id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return false;
    }
  }

  static async getInventoryStats(): Promise<InventoryStats> {
    try {
      const db = await getDb();
      const products = await db.collection('products').find({}).toArray();
      const locations = await db.collection('locations').find({}).toArray();
      const stockLevels = await db.collection('stock_levels').find({}).toArray();

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
