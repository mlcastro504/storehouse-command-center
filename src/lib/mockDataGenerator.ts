import { BrowserStorage } from '@/lib/browserStorage';

export class MockDataGenerator {
  static async hasExistingData(): Promise<boolean> {
    try {
      const products = await BrowserStorage.find('products', {});
      return products && products.length > 0;
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
        await BrowserStorage.deleteMany(collectionName, {});
      }
      
      console.log('All mock data cleared from BrowserStorage successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all mock data:', error);
      return false;
    }
  }

  static async generateAllMockData(): Promise<boolean> {
    try {
      console.log("PUTAWAY_DEBUG_PLAN: >>> Starting generateAllMockData into BrowserStorage...");
      const now = new Date();
      const yesterday = new Date(Date.now() - 864e5);
      const twoDaysAgo = new Date(Date.now() - 1728e5);

      // --- 1. CORE DATA SETUP ---

      // --- USERS ---
      const users = [
        { _id: 'user_admin', id: 'user_admin', email: 'admin@warehouseos.com', firstName: 'Admin', lastName: 'WOS', role: { name: 'admin', displayName: 'Administrator' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_leader', id: 'user_leader', email: 'teamleader@warehouseos.com', firstName: 'Team', lastName: 'Leader', role: { name: 'leader', displayName: 'Team Leader' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_putaway', id: 'user_putaway', email: 'putaway@warehouseos.com', firstName: 'Putaway', lastName: 'Operator', role: { name: 'operator', displayName: 'Put Away Operator' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_picker', id: 'user_picker', email: 'picker@warehouseos.com', firstName: 'Picker', lastName: 'Joe', role: { name: 'operator', displayName: 'Picker' }, isActive: true, createdAt: now.toISOString() },
        { _id: 'user_accountant', id: 'user_accountant', email: 'accountant@warehouseos.com', firstName: 'Accountant', lastName: 'Jane', role: { name: 'accountant', displayName: 'Accountant' }, isActive: true, createdAt: now.toISOString() },
      ];
      await BrowserStorage.insertMany('users', users);
      const mainUserId = 'user_admin';
      const putawayUserId = 'user_putaway';
      const pickerUserId = 'user_picker';

      // --- WAREHOUSE ---
      await BrowserStorage.insertOne('warehouses',{ 
        _id: 'wh_main', id: 'wh_main', name: 'Main Distribution Center', code: 'WDC-01',
        address: '123 Warehouse Way', city: 'Logistics City', state: 'CA', postal_code: '90210', country: 'USA',
        is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId
      });

      // --- SUPPLIERS ---
      const suppliers = [
        { _id: 'supplier_1', id: 'supplier_1', name: 'Global Tech Supplies', code: 'GTS', contact_person: 'John Doe', email: 'sales@gts.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'supplier_2', id: 'supplier_2', name: 'Premium Food Distributors', code: 'PFD', contact_person: 'Jane Smith', email: 'orders@pfd.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'supplier_3', id: 'supplier_3', name: 'BuildRight Materials', code: 'BRM', contact_person: 'Bob Builder', email: 'contact@buildright.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'supplier_4', id: 'supplier_4', name: 'Fashion Forward Inc.', code: 'FFI', contact_person: 'Anna Wintour', email: 'orders@ffi.com', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
      ];
      await BrowserStorage.insertMany('suppliers', suppliers);

      // --- CATEGORIES ---
      await BrowserStorage.insertMany('categories', [
        { _id: 'cat_electronics', id: 'cat_electronics', name: 'Electronics', code: 'ELEC', description: 'Consumer electronics', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_food', id: 'cat_food', name: 'Food & Groceries', code: 'FOOD', description: 'Perishable and non-perishable food items', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_building', id: 'cat_building', name: 'Building Materials', code: 'BLD', description: 'Construction and hardware supplies', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
        { _id: 'cat_apparel', id: 'cat_apparel', name: 'Apparel', code: 'APP', description: 'Clothing and accessories', is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId },
      ]);

      // --- PRODUCTS (with prices for accounting) ---
      const products = [
        { _id: 'prod_laptop', id: 'prod_laptop', sku: 'ELEC-LP-001', name: '15" Pro Laptop', description: 'High-end laptop for professionals', category_id: 'cat_electronics', unit_of_measure: 'unit', weight: 2.5, cost_price: 900, sale_price: 1500, min_stock_level: 10, max_stock_level: 100, reorder_point: 20, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: [] },
        { _id: 'prod_tshirt', id: 'prod_tshirt', sku: 'APP-TS-001', name: 'Cotton T-Shirt (Black)', description: '100% cotton t-shirt', category_id: 'cat_apparel', unit_of_measure: 'unit', weight: 0.2, cost_price: 5, sale_price: 19.99, min_stock_level: 200, max_stock_level: 1000, reorder_point: 300, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: [] },
        { _id: 'prod_pizza', id: 'prod_pizza', sku: 'FOOD-PZ-001', name: 'Frozen Pepperoni Pizza', description: 'Family size frozen pizza', category_id: 'cat_food', unit_of_measure: 'unit', weight: 0.8, cost_price: 4, sale_price: 8.99, min_stock_level: 50, max_stock_level: 300, reorder_point: 100, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: ['cold_storage'], storage_restrictions: { temperature_controlled: true } },
        { _id: 'prod_beams', id: 'prod_beams', sku: 'BLD-BM-001', name: 'Steel I-Beams (Pack of 10)', description: 'For heavy construction', category_id: 'cat_building', unit_of_measure: 'pack', weight: 800, cost_price: 600, sale_price: 1000, min_stock_level: 5, max_stock_level: 20, reorder_point: 8, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, special_requirements: ['heavy_lift_needed'], storage_restrictions: { requires_ground_level: true, max_weight_per_location: 1000 } },
        { _id: 'prod_apples', id: 'prod_apples', sku: 'FOOD-AP-001', name: 'Fresh Apples (Case)', description: 'Case of 40 fresh apples', category_id: 'cat_food', unit_of_measure: 'case', weight: 10, cost_price: 15, sale_price: 25, min_stock_level: 20, max_stock_level: 100, reorder_point: 30, is_active: true, created_at: now.toISOString(), updated_at: now.toISOString(), user_id: mainUserId, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), special_requirements: ['perishable'] },
      ];
      await BrowserStorage.insertMany('products', products);

      // --- LOCATIONS (starting empty) ---
      const locations = [
        { _id: 'loc_rec_01', id: 'loc_rec_01', code: 'REC-01', name: 'Receiving Dock 1', warehouse_id: 'wh_main', type: 'receiving', occupancy_status: 'available', is_active: true, confirmation_code: '1R1', current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_pack_01', id: 'loc_pack_01', code: 'PACK-01', name: 'Packing Station 1', warehouse_id: 'wh_main', type: 'packing', occupancy_status: 'available', is_active: true, confirmation_code: '2P2', current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_a1_r1_s1', id: 'loc_a1_r1_s1', code: 'A1-R1-S1', name: 'Aisle 1, Rack 1, Shelf 1', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: '3A1', occupancy_status: 'available', is_active: true, capacity: 10, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_b2_r1_s1', id: 'loc_b2_r1_s1', code: 'B2-R1-S1', name: 'Aisle B, Rack 2, Shelf 1', warehouse_id: 'wh_main', type: 'shelf', confirmation_code: '4B2', occupancy_status: 'available', is_active: true, capacity: 10, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_ground_01', id: 'loc_ground_01', code: 'GROUND-01', name: 'Ground Floor Area 1', warehouse_id: 'wh_main', type: 'ground_level', confirmation_code: '5G1', occupancy_status: 'available', is_active: true, capacity: 2, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'loc_cold_a1', id: 'loc_cold_a1', code: 'COLD-A1', name: 'Cold Zone A1', warehouse_id: 'wh_main', type: 'cold_zone', confirmation_code: '6C1', occupancy_status: 'available', is_active: true, capacity: 50, current_occupancy: 0, user_id: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
      ];
      await BrowserStorage.insertMany('locations', locations);
      
      // --- PUTAWAY RULES ---
      await BrowserStorage.insertMany('putaway_rules',[
        { _id: 'rule_heavy', id: 'rule_heavy', rule_name: 'Heavy Items to Ground', priority: 1, is_active: true, conditions: [{ field: 'weight', operator: 'greater_than', value: 500 }], location_preference: 'ground_level', created_by: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
        { _id: 'rule_cold', id: 'rule_cold', rule_name: 'Cold Items to Cold Zone', priority: 5, is_active: true, conditions: [{ field: 'special_requirement', operator: 'equals', value: 'cold_storage' }], location_preference: 'cold_zone', created_by: mainUserId, created_at: now.toISOString(), updated_at: now.toISOString() },
      ]);
      
      // --- ACCOUNTING SETUP ---
      await BrowserStorage.insertMany('accounts', [
        { _id: 'acct_ap', id: 'acct_ap', name: 'Accounts Payable', type: 'Liability', is_active: true },
        { _id: 'acct_inventory', id: 'acct_inventory', name: 'Inventory', type: 'Asset', is_active: true },
        { _id: 'acct_sales', id: 'acct_sales', name: 'Sales Revenue', type: 'Revenue', is_active: true },
        { _id: 'acct_cogs', id: 'acct_cogs', name: 'Cost of Goods Sold', type: 'Expense', is_active: true },
        { _id: 'acct_cash', id: 'acct_cash', name: 'Cash', type: 'Asset', is_active: true },
      ]);
      await BrowserStorage.insertMany('contacts', [
        { _id: 'contact_gts', id: 'contact_gts', name: 'Global Tech Supplies', type: 'supplier', external_id: 'supplier_1' },
        { _id: 'contact_ffi', id: 'contact_ffi', name: 'Fashion Forward Inc.', type: 'supplier', external_id: 'supplier_4' },
        { _id: 'contact_customer1', id: 'contact_customer1', name: 'John Smith', type: 'customer', email: 'john.smith@example.com' },
      ]);
      
      // --- ECOMMERCE SETUP ---
      await BrowserStorage.insertOne('ecommerce_connections', {
        _id: 'conn_shopify', id: 'conn_shopify', store_name: 'WOS Main Store', platform: { name: 'shopify', display_name: 'Shopify' }, is_active: true, sync_enabled: true, last_sync_at: yesterday.toISOString()
      });
      
      // --- 2. THE GREAT CHAIN OF COMMERCE ---
      // A series of interconnected events to populate the system with realistic data.

      const pallets: any[] = [];
      const putawayTasks: any[] = [];
      const stockLevels: any[] = [];
      const stockMovements: any[] = [];
      const invoices: any[] = [];
      const journalEntries: any[] = [];
      const pickingTasks: any[] = [];
      const ecommerceOrders: any[] = [];

      // --- CHAIN EVENT 1: Receive and Store 20 Laptops from GTS ---
      const laptopCost = products.find(p => p.id === 'prod_laptop')?.cost_price ?? 900;
      const laptopPalletId = 'plt_laptops_stored';

      // a) Pallet is now "stored"
      pallets.push({
        _id: laptopPalletId, id: laptopPalletId, pallet_number: 'PLT-STO-001', product_id: 'prod_laptop', quantity: 20, 
        status: 'stored', received_at: twoDaysAgo.toISOString(), location_id: 'loc_a1_r1_s1', completed_at: yesterday.toISOString(),
        weight: 2.5 * 20, product_category: 'cat_electronics', created_by: mainUserId,
      });

      // b) Completed Putaway Task
      putawayTasks.push({
        _id: 'task_laptops', id: 'task_laptops', task_number: 'PA-STO-001', pallet_id: laptopPalletId, operator_id: putawayUserId,
        suggested_location_id: 'loc_a1_r1_s1', actual_location_id: 'loc_a1_r1_s1', status: 'completed',
        priority: 'medium', started_at: twoDaysAgo.toISOString(), completed_at: yesterday.toISOString(),
        duration_minutes: 15, quantity_to_putaway: 20, created_date: twoDaysAgo.toISOString(),
      });

      // c) Stock Level created
      stockLevels.push({
        _id: 'sl_laptops', id: 'sl_laptops', product_id: 'prod_laptop', location_id: 'loc_a1_r1_s1',
        quantity_available: 20, quantity_reserved: 0, quantity_on_order: 0,
        last_updated: yesterday.toISOString(), user_id: mainUserId
      });
      // Update location occupancy
      const locA1R1S1 = locations.find(l => l.id === 'loc_a1_r1_s1');
      if (locA1R1S1) {
        locA1R1S1.occupancy_status = 'occupied';
        locA1R1S1.current_occupancy = 1;
      }

      // d) Stock Movement logged
      stockMovements.push({
        _id: 'sm_laptops', id: 'sm_laptops', product_id: 'prod_laptop', from_location_id: 'loc_rec_01',
        to_location_id: 'loc_a1_r1_s1', quantity: 20, movement_type: 'putaway', reference_id: 'task_laptops',
        reason: 'Initial storage', performed_by: putawayUserId, timestamp: yesterday.toISOString(), status: 'completed', user_id: mainUserId
      });
      
      // e) Accounting: Supplier Invoice and Journal Entry for the purchase
      const laptopInvoiceId = 'inv_gts_001';
      const laptopInvoiceTotal = 20 * laptopCost;
      invoices.push({
        _id: laptopInvoiceId, id: laptopInvoiceId, invoice_number: 'GTS-2025-001', contact_id: 'contact_gts', type: 'payable',
        status: 'unpaid', issue_date: twoDaysAgo.toISOString(), due_date: new Date(Date.now() + 30 * 864e5).toISOString(),
        total_amount: laptopInvoiceTotal,
        lines: [{ product_id: 'prod_laptop', description: '15" Pro Laptop', quantity: 20, unit_price: laptopCost, amount: laptopInvoiceTotal }]
      });
      journalEntries.push({
        _id: 'je_laptops', id: 'je_laptops', entry_date: twoDaysAgo.toISOString(), description: 'Purchase of 20 Laptops from GTS',
        lines: [
          { account_id: 'acct_inventory', type: 'debit', amount: laptopInvoiceTotal },
          { account_id: 'acct_ap', type: 'credit', amount: laptopInvoiceTotal }
        ],
        reference_type: 'invoice', reference_id: laptopInvoiceId
      });

      // --- CHAIN EVENT 2: An E-commerce Order for 2 Laptops ---
      const laptopSalePrice = products.find(p => p.id === 'prod_laptop')?.sale_price ?? 1500;
      const orderId = 'order_1001';
      const orderTotal = 2 * laptopSalePrice;

      // a) E-commerce Order created
      ecommerceOrders.push({
        _id: orderId, id: orderId, ecommerce_connection_id: 'conn_shopify', order_number: '1001',
        order_date: now.toISOString(), customer_name: 'John Smith', customer_email: 'john.smith@example.com',
        total_amount: orderTotal, financial_status: 'paid', warehouse_status: 'processing',
        lines: [{ product_sku: 'ELEC-LP-001', quantity: 2, price: laptopSalePrice }]
      });

      // b) Picking Task created
      pickingTasks.push({
        _id: 'pick_laptops_1', id: 'pick_laptops_1', task_number: 'PK-001', reference_id: orderId, reference_type: 'ecommerce_order',
        status: 'pending', operator_id: pickerUserId, created_at: now.toISOString(),
        lines: [{ product_id: 'prod_laptop', location_id: 'loc_a1_r1_s1', quantity_to_pick: 2 }]
      });

      // c) Stock Level updated (reserved)
      const slLaptops = stockLevels.find(sl => sl.product_id === 'prod_laptop');
      if (slLaptops) {
        slLaptops.quantity_available = 18;
        slLaptops.quantity_reserved = 2;
      }
      
      // d) Accounting: Sales Invoice and Journal Entry
      const salesInvoiceId = 'inv_sales_1001';
      invoices.push({
        _id: salesInvoiceId, id: salesInvoiceId, invoice_number: 'INV-1001', contact_id: 'contact_customer1', type: 'receivable',
        status: 'paid', issue_date: now.toISOString(), due_date: now.toISOString(),
        total_amount: orderTotal,
        lines: [{ product_id: 'prod_laptop', description: '15" Pro Laptop', quantity: 2, unit_price: laptopSalePrice, amount: orderTotal }]
      });
      journalEntries.push(
        {
          _id: 'je_sales_1', id: 'je_sales_1', entry_date: now.toISOString(), description: 'Sale for order #1001',
          lines: [
            { account_id: 'acct_cash', type: 'debit', amount: orderTotal },
            { account_id: 'acct_sales', type: 'credit', amount: orderTotal }
          ],
          reference_type: 'invoice', reference_id: salesInvoiceId
        },
        {
          _id: 'je_cogs_1', id: 'je_cogs_1', entry_date: now.toISOString(), description: 'COGS for order #1001',
          lines: [
            { account_id: 'acct_cogs', type: 'debit', amount: 2 * laptopCost },
            { account_id: 'acct_inventory', type: 'credit', amount: 2 * laptopCost }
          ],
          reference_type: 'ecommerce_order', reference_id: orderId
        }
      );

      // --- 3. PALLETS WAITING FOR PUTAWAY (for live testing) ---
      pallets.push(
        { _id: 'pallet_waiting_1', id: 'pallet_waiting_1', pallet_number: 'PLT-WAIT-001', product_id: 'prod_pizza', quantity: 200, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 160, special_requirements: ['cold_storage'], product_category: 'cat_food', created_by: mainUserId },
        { _id: 'pallet_waiting_2', id: 'pallet_waiting_2', pallet_number: 'PLT-WAIT-002', product_id: 'prod_beams', quantity: 1, status: 'waiting_putaway', received_at: yesterday.toISOString(), weight: 800, special_requirements: ['heavy_lift_needed'], product_category: 'cat_building', created_by: mainUserId },
        { _id: 'pallet_waiting_3', id: 'pallet_waiting_3', pallet_number: 'PLT-WAIT-003', product_id: 'prod_apples', quantity: 30, status: 'waiting_putaway', received_at: now.toISOString(), weight: 300, expiry_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), product_category: 'cat_food', created_by: mainUserId }
      );

      // --- 4. INSERT ALL DATA ---
      await BrowserStorage.insertMany('pallets', pallets);
      await BrowserStorage.insertMany('putaway_tasks', putawayTasks);
      await BrowserStorage.insertMany('stock_levels', stockLevels);
      await BrowserStorage.insertMany('stock_movements', stockMovements);
      await BrowserStorage.insertMany('invoices', invoices);
      await BrowserStorage.insertMany('journal_entries', journalEntries);
      await BrowserStorage.insertMany('picking_tasks', pickingTasks);
      await BrowserStorage.insertMany('ecommerce_orders', ecommerceOrders);

      // Update locations that have been modified
      for (const loc of locations) {
        if(loc.current_occupancy > 0) {
            await BrowserStorage.updateOne('locations', { _id: loc._id }, { $set: loc });
        }
      }

      console.log('PUTAWAY_DEBUG_PLAN: <<< Finished generateAllMockData successfully into BrowserStorage.');
      return true;
    } catch (error) {
      console.error('Error generating mock data:', error);
      return false;
    }
  }
}
