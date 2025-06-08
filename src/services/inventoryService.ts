
import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://warehouseos:warehouseos123@cluster0.k7hby3a.mongodb.net/warehouseos?retryWrites=true&w=majority&appName=Cluster0';

let client: MongoClient | null = null;
let db: Db | null = null;

// Helper function to convert MongoDB documents to strings
const convertToString = (doc: any) => {
  if (!doc) return doc;
  return {
    ...doc,
    _id: doc._id?.toString()
  };
};

const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('warehouseos');
  }
  return { client, db };
};

export const InventoryService = {
  // Test connection
  async testConnection() {
    try {
      const { client: mongoClient } = await connectToDatabase();
      await mongoClient.db('admin').admin().ping();
      return { success: true, message: 'Connected to MongoDB successfully' };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Products CRUD
  async getProducts() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const products = await database.collection('products').find({}).toArray();
      return products.map(convertToString);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(product: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('products').insertOne(product);
      return convertToString({ ...product, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('products').updateOne(
        { _id: id },
        { $set: product }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('products').deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Categories CRUD
  async getCategories() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const categories = await database.collection('categories').find({}).toArray();
      return categories.map(convertToString);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(category: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('categories').insertOne(category);
      return convertToString({ ...category, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('categories').updateOne(
        { _id: id },
        { $set: category }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('categories').deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Warehouses CRUD
  async getWarehouses() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const warehouses = await database.collection('warehouses').find({}).toArray();
      return warehouses.map(convertToString);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  },

  async createWarehouse(warehouse: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('warehouses').insertOne(warehouse);
      return convertToString({ ...warehouse, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  },

  async updateWarehouse(id: string, warehouse: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('warehouses').updateOne(
        { _id: id },
        { $set: warehouse }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  },

  async deleteWarehouse(id: string) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('warehouses').deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  },

  // Locations CRUD
  async getLocations() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const locations = await database.collection('locations').find({}).toArray();
      return locations.map(convertToString);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  async createLocation(location: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('locations').insertOne(location);
      return convertToString({ ...location, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  async updateLocation(id: string, location: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('locations').updateOne(
        { _id: id },
        { $set: location }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  async deleteLocation(id: string) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('locations').deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  },

  // Stock levels
  async getStockLevels() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const stockLevels = await database.collection('stock_levels').find({}).toArray();
      return stockLevels.map(convertToString);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      throw error;
    }
  },

  // Stock movements
  async getStockMovements() {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const movements = await database.collection('stock_movements').find({}).toArray();
      return movements.map(convertToString);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  async createStockMovement(movement: any) {
    try {
      const { db: database } = await connectToDatabase();
      if (!database) throw new Error('Database connection failed');
      
      const result = await database.collection('stock_movements').insertOne(movement);
      return convertToString({ ...movement, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  }
};
