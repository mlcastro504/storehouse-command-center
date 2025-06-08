
import { browserStorage } from '@/lib/browserStorage';

// Browser-compatible inventory service
export const InventoryService = {
  // Test connection (browser storage)
  async testConnection() {
    try {
      await browserStorage.getStats();
      return { success: true, message: 'Browser storage connected successfully' };
    } catch (error) {
      console.error('Browser storage error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Products CRUD
  async getProducts() {
    try {
      return await browserStorage.find('products');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async createProduct(product: any) {
    try {
      return await browserStorage.insertOne('products', product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: any) {
    try {
      const result = await browserStorage.updateOne('products', { id }, product);
      return result !== null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      return await browserStorage.deleteOne('products', { id });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Categories CRUD
  async getCategories() {
    try {
      return await browserStorage.find('categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(category: any) {
    try {
      return await browserStorage.insertOne('categories', category);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: any) {
    try {
      const result = await browserStorage.updateOne('categories', { id }, category);
      return result !== null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      return await browserStorage.deleteOne('categories', { id });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Warehouses CRUD
  async getWarehouses() {
    try {
      return await browserStorage.find('warehouses');
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  },

  async createWarehouse(warehouse: any) {
    try {
      return await browserStorage.insertOne('warehouses', warehouse);
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  },

  async updateWarehouse(id: string, warehouse: any) {
    try {
      const result = await browserStorage.updateOne('warehouses', { id }, warehouse);
      return result !== null;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  },

  async deleteWarehouse(id: string) {
    try {
      return await browserStorage.deleteOne('warehouses', { id });
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  },

  // Locations CRUD
  async getLocations(warehouseId?: string) {
    try {
      const filter = warehouseId ? { warehouse_id: warehouseId } : {};
      return await browserStorage.find('locations', filter);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  async createLocation(location: any) {
    try {
      return await browserStorage.insertOne('locations', location);
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  async updateLocation(id: string, location: any) {
    try {
      const result = await browserStorage.updateOne('locations', { id }, location);
      return result !== null;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  async deleteLocation(id: string) {
    try {
      return await browserStorage.deleteOne('locations', { id });
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  },

  // Stock levels
  async getStockLevels(productId?: string, locationId?: string) {
    try {
      const filter: any = {};
      if (productId) filter.product_id = productId;
      if (locationId) filter.location_id = locationId;
      return await browserStorage.find('stock_levels', filter);
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      throw error;
    }
  },

  async updateStockLevel(productId: string, locationId: string, updates: any) {
    try {
      const result = await browserStorage.updateOne('stock_levels', 
        { product_id: productId, location_id: locationId }, 
        updates
      );
      return result !== null;
    } catch (error) {
      console.error('Error updating stock level:', error);
      throw error;
    }
  },

  // Stock movements
  async getStockMovements(productId?: string) {
    try {
      const filter = productId ? { product_id: productId } : {};
      return await browserStorage.find('stock_movements', filter);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  async createStockMovement(movement: any) {
    try {
      return await browserStorage.insertOne('stock_movements', movement);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  },

  // Suppliers
  async getSuppliers() {
    try {
      return await browserStorage.find('suppliers');
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  async createSupplier(supplier: any) {
    try {
      return await browserStorage.insertOne('suppliers', supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  }
};
