
import { BrowserStorage } from './browserStorage';

const db = {
  collection: (name: string) => BrowserStorage.collection(name),
};

function isMockCollection(obj: any): obj is { deleteMany: Function, insertMany: Function, find: Function, findOne: Function, deleteOne: Function, insertOne: Function } {
  return typeof obj?.deleteMany === 'function';
}

export class MockDataGenerator {
  static async hasExistingData(): Promise<boolean> {
    try {
      const products = await db.collection('products').find({}).toArray();
      return products.length > 0;
    } catch (error) {
      console.error('Error checking existing data:', error);
      return false;
    }
  }

  static async clearAllData(): Promise<boolean> {
    try {
      const collections = [
        'users', 'products', 'categories', 'warehouses', 'locations', 'stock_levels', 'suppliers',
        'pallets', 'putaway_tasks', 'putaway_rules', 'operator_performance', 'stock_movements',
        'ecommerce_connections', 'ecommerce_products', 'ecommerce_orders', 'picking_tasks',
        'picking_lines', 'workflows', 'accounts', 'contacts', 'journal_entries', 'invoices'
      ];
      
      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        await collection.deleteMany({});
      }
      
      console.log('All mock data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all mock data:', error);
      return false;
    }
  }

  static async generateAllMockData(): Promise<boolean> {
    try {
      const now = new Date();
      const yesterday = new Date(Date.now() - 864e5);
      const twoDaysAgo = new Date(Date.now() - 1728e5);

      // --- USERS ---
      const usersCol = db.collection('users');
      await usersCol.insertMany([
        { _id: 'user_admin', id: 'user_admin', email: 'admin@warehouseos.com', firstName: 'Admin', lastName: 'WOS', role: { name: 'admin' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_leader', id: 'user_leader', email: 'teamleader@warehouseos.com', firstName: 'Team', lastName: 'Leader', role: { name: 'leader' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_putaway', id: 'user_putaway', email: 'putaway@warehouseos.com', firstName: 'Putaway', lastName: 'Operator', role: { name: 'operator' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_picker', id: 'user_picker', email: 'picker@warehouseos.com', firstName: 'Picker', lastName: 'Joe', role: { name: 'operator' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_accountant', id: 'user_accountant', email: 'accountant@warehouseos.com', firstName: 'Accountant', lastName: 'Jane', role: { name: 'accountant' }, isActive: true, createdAt: now.toISOString() },
      ]);
      const mainUserId = 'user_admin';

      // --- WAREHOUSE ---
      const warehousesCol = db.collection('warehouses');
      await warehousesCol.insertMany([
        { 
          _id: 'wh_main', id: 'wh_main', name: 'Main Distribution Center', code: 'WDC-01',
          address: '123 Warehouse Way', city: 'Logistics City', state: 'CA', postal_code: '90210', country: 'USA',
          is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId
        },
      ]);

      // --- SUPPLIERS ---
      const suppliersCol = db.collection('suppliers');
      await suppliersCol.insertMany([
        { _id: 'supplier_1', id: 'supplier_1', name: 'Global Tech Supplies', code: 'GTS', contact_person: 'John Doe', email: 'sales@gts.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'supplier_2', id: 'supplier_2', name: 'Premium Food Distributors', code: 'PFD', contact_person: 'Jane Smith', email: 'orders@pfd.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'supplier_3', id: 'supplier_3', name: 'BuildRight Materials', code: 'BRM', contact_person: 'Bob Builder', email: 'contact@buildright.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
      ]);

      // --- CATEGORIES ---
      const categoriesCol = db.collection('categories');
      await categoriesCol.insertMany([
        { _id: 'cat_electronics', id: 'cat_electronics', name: 'Electronics', code: 'ELEC', description: 'Consumer electronics', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_food', id: 'cat_food', name: 'Food & Groceries', code: 'FOOD', description: 'Perishable and non-perishable food items', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_building', id: 'cat_building', name: 'Building Materials', code: 'BLD', description: 'Construction and hardware supplies', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_apparel', id: 'cat_apparel', name: 'Apparel', code: 'APP', description: 'Clothing and accessories', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
      ]);

      // --- LOCATIONS ---
      const locationsCol = db.collection('locations');
      const locations = [
        // System locations
        { _id: 'loc_rec_01', id: 'loc_rec_01', code: 'REC-01', name: 'Receiving Dock 1', warehouse_id: 'wh_main', type: 'receiving', occupancy_status: 'available', is_active: true, confirmation_code: 'REC01', current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_pack_01', id: 'loc_pack_01', code: 'PACK-01', name: 'Packing Station 1', warehouse_id: 'wh_main', type: 'packing', occupancy_status: 'available', is_active: true, confirmation_code: 'PACK01', current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        // Standard Shelves
        { _id: 'loc_a1_r1_s1', id: 'loc_a1_r1_s1', code: 'A1-R1-S1', name: 'Aisle 1, Rack 1, Shelf 1', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: 'CONF-A1R1S1', occupancy_status: 'available', is_active: true, capacity: 10, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_a1_r1_s2', id: 'loc_a1_r1_s2', code: 'A1-R1-S2', name: 'Aisle 1, Rack 1, Shelf 2', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: 'CONF-A1R1S2', occupancy_status: 'occupied', is_active: true, capacity: 10, current_occupancy: 1, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_b2_r1_s1', id: 'loc_b2_r1_s1', code: 'B2-R1-S1', name: 'Aisle B, Rack 2, Shelf 1', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: 'CONF-B2R1S1', occupancy_status: 'available', is_active: true, capacity: 10, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        // Specialized Locations
        { _id: 'loc_ground_01', id: 'loc_ground_01', code: 'GROUND-01', name: 'Ground Floor Area 1', warehouse_id: 'wh_main', type: 'ground_level', confirmation_code: 'CONF-GROUND01', occupancy_status: 'available', is_active: true, capacity: 2, current_occupancy: 0, restrictions: { max_weight: 1000 }, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_ground_02', id: 'loc_ground_02', code: 'GROUND-02', name: 'Ground Floor Area 2', warehouse_id: 'wh_main', type: 'ground_level', confirmation_code: 'CONF-GROUND02', occupancy_status: 'available', is_active: true, capacity: 2, current_occupancy: 0, restrictions: { max_weight: 1200 }, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_cold_a1', id: 'loc_cold_a1', code: 'COLD-A1', name: 'Cold Zone A1', warehouse_id: 'wh_main', type: 'cold_zone', confirmation_code: 'CONF-COLDA1', occupancy_status: 'available', is_active: true, capacity: 50, current_occupancy: 0, restrictions: { temperature_controlled: true }, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_dry_b1', id: 'loc_dry_b1', code: 'DRY-B1', name: 'Dry Zone B1', warehouse_id: 'wh_main', type: 'dry_zone', confirmation_code: 'CONF-DRYB1', occupancy_status: 'available', is_active: true, capacity: 100, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
      ];
      await locationsCol.insertMany(locations);

      // --- PRODUCTS ---
      const productsCol = db.collection('products');
      const products = [
        { _id: 'prod_laptop', id: 'prod_laptop', sku: 'ELEC-LP-001', name: '15" Pro Laptop', description: 'High-end laptop for professionals', category_id: 'cat_electronics', unit_of_measure: 'unit', weight: 2.5, min_stock_level: 10, max_stock_level: 100, reorder_point: 20, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: [] },
        { _id: 'prod_pizza', id: 'prod_pizza', sku: 'FOOD-PZ-001', name: 'Frozen Pepperoni Pizza', description: 'Family size frozen pizza', category_id: 'cat_food', unit_of_measure: 'unit', weight: 0.8, min_stock_level: 50, max_stock_level: 300, reorder_point: 100, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: ['cold_storage'], storage_restrictions: { temperature_controlled: true } },
        { _id: 'prod_beams', id: 'prod_beams', sku: 'BLD-BM-001', name: 'Steel I-Beams (Pack of 10)', description: 'For heavy construction', category_id: 'cat_building', unit_of_measure: 'pack', weight: 800, min_stock_level: 5, max_stock_level: 20, reorder_point: 8, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: ['heavy_lift_needed'], storage_restrictions: { requires_ground_level: true, max_weight_per_location: 1000 } },
        { _id: 'prod_tshirt', id: 'prod_tshirt', sku: 'APP-TS-001', name: 'Cotton T-Shirt (Black)', description: '100% cotton t-shirt', category_id: 'cat_apparel', unit_of_measure: 'unit', weight: 0.2, min_stock_level: 200, max_stock_level: 1000, reorder_point: 300, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: [] },
        { _id: 'prod_apples', id: 'prod_apples', sku: 'FOOD-AP-001', name: 'Fresh Apples (Case)', description: 'Case of 40 fresh apples', category_id: 'cat_food', unit_of_measure: 'case', weight: 10, min_stock_level: 20, max_stock_level: 100, reorder_point: 30, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), special_requirements: ['perishable'] },
      ];
      await productsCol.insertMany(products);
      
      // --- STOCK LEVELS for existing stored items ---
      const stockLevelsCol = db.collection('stock_levels');
      await stockLevelsCol.insertOne({
        _id: 'sl_laptop_1', id: 'sl_laptop_1', product_id: 'prod_laptop', location_id: 'loc_a1_r1_s2',
        quantity_available: 20, quantity_reserved: 0, quantity_on_order: 0,
        last_updated: yesterday.toISOString(), user_id: mainUserId
      });
      
      // --- PUTAWAY RULES ---
      const putAwayRulesCol = db.collection('putaway_rules');
      await putAwayRulesCol.insertMany([
        { _id: 'rule_heavy', id: 'rule_heavy', rule_name: 'Heavy Items to Ground', priority: 1, is_active: true, conditions: [{ field: 'weight', operator: 'greater_than', value: 500 }], location_preference: 'ground_level', created_by: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'rule_cold', id: 'rule_cold', rule_name: 'Cold Items to Cold Zone', priority: 5, is_active: true, conditions: [{ field: 'special_requirement', operator: 'equals', value: 'cold_storage' }], location_preference: 'cold_zone', created_by: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'rule_food', id: 'rule_food', rule_name: 'Food to Dry Zone', priority: 10, is_active: true, conditions: [{ field: 'product_category', operator: 'equals', value: 'cat_food' }], location_preference: 'dry_zone', created_by: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
      ]);

      // --- PALLETS (more for testing) ---
      const palletsCol = db.collection('pallets');
      const pallets = [
        // Waiting for Put Away (for testing the queue)
        { _id: 'pallet_1', id: 'pallet_1', pallet_number: 'PLT-001', product_id: 'prod_laptop', quantity: 50, status: 'waiting_putaway', received_at: now.toISOString(), weight: 125, product_category: 'cat_electronics', created_by: mainUserId },
        { _id: 'pallet_2', id: 'pallet_2', pallet_number: 'PLT-002', product_id: 'prod_pizza', quantity: 200, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 160, special_requirements: ['cold_storage'], product_category: 'cat_food', created_by: mainUserId },
        { _id: 'pallet_3', id: 'pallet_3', pallet_number: 'PLT-003', product_id: 'prod_beams', quantity: 1, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 800, special_requirements: ['heavy_lift_needed'], product_category: 'cat_building', created_by: mainUserId },
        { _id: 'pallet_4', id: 'pallet_4', pallet_number: 'PLT-004', product_id: 'prod_apples', quantity: 30, status: 'waiting_putaway', received_at: now.toISOString(), weight: 300, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), product_category: 'cat_food', created_by: mainUserId },
        // In Process (linked to an active task)
        { _id: 'pallet_5', id: 'pallet_5', pallet_number: 'PLT-005', product_id: 'prod_tshirt', quantity: 500, status: 'in_process', received_at: twoDaysAgo.toISOString(), assigned_to: 'user_putaway', assigned_at: yesterday.toISOString(), weight: 100, product_category: 'cat_apparel', created_by: mainUserId },
        // Stored (already in a location with a stock level)
        { _id: 'pallet_6', id: 'pallet_6', pallet_number: 'PLT-006', product_id: 'prod_laptop', quantity: 20, status: 'stored', received_at: twoDaysAgo.toISOString(), location_id: 'loc_a1_r1_s2', completed_at: yesterday.toISOString(), weight: 50, product_category: 'cat_electronics', created_by: mainUserId },
      ];
      await palletsCol.insertMany(pallets);

      // --- PUTAWAY TASKS ---
      const putAwayTasksCol = db.collection('putaway_tasks');
      const putawayTasks = [
        // Active task for the "in_process" pallet
        {
          _id: 'task_1', id: 'task_1', task_number: 'PA-001', pallet_id: 'pallet_5', operator_id: 'user_putaway',
          suggested_location_id: 'loc_dry_b1', status: 'in_progress', priority: 'medium', started_at: yesterday.toISOString(),
          quantity_to_putaway: 500, created_date: yesterday.toISOString(),
        },
        // Completed task for the "stored" pallet
        {
          _id: 'task_2', id: 'task_2', task_number: 'PA-002', pallet_id: 'pallet_6', operator_id: 'user_putaway',
          suggested_location_id: 'loc_a1_r1_s1', actual_location_id: 'loc_a1_r1_s2', status: 'completed',
          priority: 'medium', started_at: twoDaysAgo.toISOString(), completed_at: yesterday.toISOString(),
          duration_minutes: 15, quantity_to_putaway: 20, created_date: twoDaysAgo.toISOString(),
        },
      ];
      await putAwayTasksCol.insertMany(putawayTasks);
      
      // --- STOCK MOVEMENTS ---
      const stockMovementsCol = db.collection('stock_movements');
      await stockMovementsCol.insertOne({
          _id: 'sm_putaway_1', id: 'sm_putaway_1', product_id: 'prod_laptop', from_location_id: 'loc_rec_01',
          to_location_id: 'loc_a1_r1_s2', quantity: 20, movement_type: 'putaway', reference_type: 'putaway_task',
          reference_id: 'task_2', reason: 'Initial storage', performed_by: 'user_putaway',
          timestamp: yesterday.toISOString(), status: 'completed', user_id: mainUserId, pallet_id: 'pallet_6'
      });
      
      console.log('Comprehensive mock data generated successfully.');
      return true;
    } catch (error) {
      console.error('Error generating mock data:', error);
      return false;
    }
  }
}
