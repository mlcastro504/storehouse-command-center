
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category, Location, Warehouse, StockLevel, StockMovement, CycleCount, Supplier, ProductSupplier } from "@/types/inventory";

export class InventoryService {
  // Products
  static async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Categories
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Warehouses
  static async getWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createWarehouse(warehouse: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('warehouses')
      .insert({
        ...warehouse,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Locations
  static async getLocations(warehouseId?: string) {
    let query = supabase
      .from('locations')
      .select(`
        *,
        warehouse:warehouses(*)
      `)
      .eq('is_active', true);

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data;
  }

  static async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('locations')
      .insert({
        ...location,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Stock Levels
  static async getStockLevels(productId?: string, locationId?: string) {
    let query = supabase
      .from('stock_levels')
      .select(`
        *,
        product:products(*),
        location:locations(*)
      `);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async updateStockLevel(productId: string, locationId: string, updates: Partial<StockLevel>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('stock_levels')
      .upsert({
        product_id: productId,
        location_id: locationId,
        user_id: user.id,
        ...updates
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Stock Movements
  static async getStockMovements(productId?: string) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(*),
        from_location:locations!stock_movements_from_location_id_fkey(*),
        to_location:locations!stock_movements_to_location_id_fkey(*)
      `);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async createStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('stock_movements')
      .insert({
        ...movement,
        performed_by: user.id,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Suppliers
  static async getSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }

  static async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        ...supplier,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
