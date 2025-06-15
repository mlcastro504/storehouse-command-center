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

      // ----------- Core Data: Users, Warehouses, Suppliers, Categories ------------
      const usersCol = db.collection('users');
      const users = [
        { _id: 'user_admin', id: 'user_admin', email: 'admin@warehouseos.com', firstName: 'Admin', lastName: 'WOS', role: { name: 'admin' }, isActive: true },
        { _id: 'user_leader', id: 'user_leader', email: 'teamleader@warehouseos.com', firstName: 'Team', lastName: 'Leader', role: { name: 'leader' }, isActive: true },
        { _id: 'user_putaway', id: 'user_putaway', email: 'putaway@warehouseos.com', firstName: 'Putaway', lastName: 'Operator', role: { name: 'operator' }, isActive: true },
        { _id: 'user_picker', id: 'user_picker', email: 'picker@warehouseos.com', firstName: 'Picker', lastName: 'Joe', role: { name: 'operator' }, isActive: true },
        { _id: 'user_accountant', id: 'user_accountant', email: 'accountant@warehouseos.com', firstName: 'Accountant', lastName: 'Jane', role: { name: 'accountant' }, isActive: true },
      ];
      await usersCol.insertMany(users);

      const suppliersCol = db.collection('suppliers');
      await suppliersCol.insertMany([
        { _id: 'supplier_1', id: 'supplier_1', name: 'Global Tech Supplies', contact_email: 'sales@gts.com', is_active: true },
        { _id: 'supplier_2', id: 'supplier_2', name: 'Premium Food Distributors', contact_email: 'orders@pfd.com', is_active: true },
        { _id: 'supplier_3', id: 'supplier_3', name: 'BuildRight Materials', contact_email: 'contact@buildright.com', is_active: true },
      ]);

      const categoriesCol = db.collection('categories');
      await categoriesCol.insertMany([
        { _id: 'cat_electronics', id: 'cat_electronics', name: 'Electronics', description: 'Consumer electronics' },
        { _id: 'cat_food', id: 'cat_food', name: 'Food & Groceries', description: 'Perishable and non-perishable food items' },
        { _id: 'cat_building', id: 'cat_building', name: 'Building Materials', description: 'Construction and hardware supplies' },
        { _id: 'cat_apparel', id: 'cat_apparel', name: 'Apparel', description: 'Clothing and accessories' },
      ]);

      const warehousesCol = db.collection('warehouses');
      await warehousesCol.insertMany([
        { _id: 'wh_main', id: 'wh_main', name: 'Main Distribution Center', location: '123 Warehouse Way' },
      ]);

      // ----------- Locations -----------
      const locationsCol = db.collection('locations');
      const locations = [
        { _id: 'loc_rec_01', id: 'loc_rec_01', code: 'REC-01', name: 'Receiving Dock 1', warehouse_id: 'wh_main', type: 'receiving', occupancy_status: 'available', is_active: true },
        { _id: 'loc_pack_01', id: 'loc_pack_01', code: 'PACK-01', name: 'Packing Station 1', warehouse_id: 'wh_main', type: 'packing', occupancy_status: 'available', is_active: true },
        { _id: 'loc_a1_r1_s1', id: 'loc_a1_r1_s1', code: 'A1-R1-S1', name: 'Aisle 1, Rack 1, Shelf 1', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: 'CONF-A1R1S1', occupancy_status: 'available', is_active: true },
        { _id: 'loc_a1_r1_s2', id: 'loc_a1_r1_s2', code: 'A1-R1-S2', name: 'Aisle 1, Rack 1, Shelf 2', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: 'CONF-A1R1S2', occupancy_status: 'occupied', is_active: true },
        { _id: 'loc_ground_01', id: 'loc_ground_01', code: 'GROUND-01', name: 'Ground Floor Area 1', warehouse_id: 'wh_main', type: 'ground_level', confirmation_code: 'CONF-GROUND01', occupancy_status: 'available', is_active: true, restrictions: { max_weight: 1000 } },
        { _id: 'loc_cold_a1', id: 'loc_cold_a1', code: 'COLD-A1', name: 'Cold Zone A1', warehouse_id: 'wh_main', type: 'cold_zone', confirmation_code: 'CONF-COLDA1', occupancy_status: 'available', is_active: true, restrictions: { temperature: '0C-4C' } },
        { _id: 'loc_dry_b1', id: 'loc_dry_b1', code: 'DRY-B1', name: 'Dry Zone B1', warehouse_id: 'wh_main', type: 'dry_zone', confirmation_code: 'CONF-DRYB1', occupancy_status: 'available', is_active: true },
      ];
      await locationsCol.insertMany(locations);

      // ----------- Products -----------
      const productsCol = db.collection('products');
      const products = [
        { _id: 'prod_laptop', id: 'prod_laptop', sku: 'ELEC-LP-001', name: '15" Pro Laptop', category_id: 'cat_electronics', supplier_id: 'supplier_1', weight: 2.5, special_requirements: [] },
        { _id: 'prod_pizza', id: 'prod_pizza', sku: 'FOOD-PZ-001', name: 'Frozen Pepperoni Pizza', category_id: 'cat_food', supplier_id: 'supplier_2', weight: 0.8, special_requirements: ['cold_storage'] },
        { _id: 'prod_beams', id: 'prod_beams', sku: 'BLD-BM-001', name: 'Steel I-Beams (Pack of 10)', category_id: 'cat_building', supplier_id: 'supplier_3', weight: 800, special_requirements: ['heavy_lift_needed'] },
        { _id: 'prod_tshirt', id: 'prod_tshirt', sku: 'APP-TS-001', name: 'Cotton T-Shirt (Black)', category_id: 'cat_apparel', supplier_id: 'supplier_1', weight: 0.2, special_requirements: [] },
        { _id: 'prod_apples', id: 'prod_apples', sku: 'FOOD-AP-001', name: 'Fresh Apples (Case)', category_id: 'cat_food', supplier_id: 'supplier_2', weight: 10, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() }, // Expires in 14 days
      ];
      await productsCol.insertMany(products);
      
      // ------------ PutAway Module Data --------------
      const putAwayRulesCol = db.collection('putaway_rules');
      await putAwayRulesCol.insertMany([
        { _id: 'rule_heavy', id: 'rule_heavy', rule_name: 'Heavy Items to Ground', priority: 1, is_active: true, conditions: [{ field: 'weight', operator: 'greater_than', value: 500 }], location_preference: 'ground_level' },
        { _id: 'rule_cold', id: 'rule_cold', rule_name: 'Cold Items to Cold Zone', priority: 5, is_active: true, conditions: [{ field: 'special_requirement', operator: 'equals', value: 'cold_storage' }], location_preference: 'cold_zone' },
        { _id: 'rule_food', id: 'rule_food', rule_name: 'Food to Dry Zone', priority: 10, is_active: true, conditions: [{ field: 'product_category', operator: 'equals', value: 'cat_food' }], location_preference: 'dry_zone' },
      ]);

      const palletsCol = db.collection('pallets');
      const pallets = [
        // Waiting for Put Away
        { _id: 'pallet_1', id: 'pallet_1', pallet_number: 'PLT-001', product_id: 'prod_laptop', quantity: 50, status: 'waiting_putaway', received_at: now.toISOString(), weight: 125, product_category: 'cat_electronics' },
        { _id: 'pallet_2', id: 'pallet_2', pallet_number: 'PLT-002', product_id: 'prod_pizza', quantity: 200, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 160, special_requirements: ['cold_storage'], product_category: 'cat_food' },
        { _id: 'pallet_3', id: 'pallet_3', pallet_number: 'PLT-003', product_id: 'prod_beams', quantity: 1, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 800, special_requirements: ['heavy_lift_needed'], product_category: 'cat_building' },
        { _id: 'pallet_4', id: 'pallet_4', pallet_number: 'PLT-004', product_id: 'prod_apples', quantity: 30, status: 'waiting_putaway', received_at: now.toISOString(), weight: 300, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), product_category: 'cat_food' },
        // In Process
        { _id: 'pallet_5', id: 'pallet_5', pallet_number: 'PLT-005', product_id: 'prod_tshirt', quantity: 500, status: 'in_process', received_at: twoDaysAgo.toISOString(), assigned_to: 'user_putaway', assigned_at: yesterday.toISOString(), weight: 100, product_category: 'cat_apparel' },
        // Stored
        { _id: 'pallet_6', id: 'pallet_6', pallet_number: 'PLT-006', product_id: 'prod_laptop', quantity: 20, status: 'stored', received_at: twoDaysAgo.toISOString(), location_id: 'loc_a1_r1_s2', completed_at: yesterday.toISOString(), weight: 50, product_category: 'cat_electronics' },
      ];
      await palletsCol.insertMany(pallets);

      const putAwayTasksCol = db.collection('putaway_tasks');
      const putawayTasks = [
        {
          _id: 'task_1',
          id: 'task_1',
          task_number: 'PA-001',
          pallet_id: 'pallet_5',
          operator_id: 'user_putaway',
          suggested_location_id: 'loc_dry_b1',
          status: 'in_progress',
          priority: 'medium',
          started_at: yesterday.toISOString(),
          quantity_to_putaway: 500,
          created_date: yesterday.toISOString(),
        },
        {
          _id: 'task_2',
          id: 'task_2',
          task_number: 'PA-002',
          pallet_id: 'pallet_6',
          operator_id: 'user_putaway',
          suggested_location_id: 'loc_a1_r1_s1',
          actual_location_id: 'loc_a1_r1_s2',
          status: 'completed',
          priority: 'medium',
          started_at: twoDaysAgo.toISOString(),
          completed_at: yesterday.toISOString(),
          duration_minutes: 15,
          quantity_to_putaway: 20,
          created_date: twoDaysAgo.toISOString(),
        },
      ];
      await putAwayTasksCol.insertMany(putawayTasks);
      
      console.log('Comprehensive mock data generated successfully.');
      return true;
    } catch (error) {
      console.error('Error generating mock data:', error);
      return false;
    }
  }
}
