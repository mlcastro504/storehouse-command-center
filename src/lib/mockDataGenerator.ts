
import { BrowserStorage } from './browserStorage';

interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role_id: string;
  team_id?: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string;
  phone?: string;
  employee_id: string;
}

interface MockRole {
  id: string;
  name: string;
  display_name: string;
  level: number;
  permissions: Array<{ action: string; resource: string }>;
  module_access: Array<{ module_id: string; can_access: boolean; permissions: string[] }>;
  created_at: string;
}

interface MockProduct {
  id: string;
  user_id: string;
  sku: string;
  name: string;
  description: string;
  barcode: string;
  weight_kg: number;
  dimensions: {
    length_cm: number;
    width_cm: number;
    height_cm: number;
  };
  category_id: string;
  supplier_id: string;
  unit_cost: number;
  sale_price: number;
  reorder_point: number;
  max_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MockSupplier {
  id: string;
  user_id: string;
  code: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  payment_terms: string;
  lead_time_days: number;
  is_active: boolean;
  created_at: string;
}

interface MockWarehouse {
  id: string;
  user_id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
}

interface MockLocation {
  id: string;
  user_id: string;
  warehouse_id: string;
  code: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'shipping' | 'returns' | 'quarantine';
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  confirmation_code: string;
  max_weight_kg?: number;
  is_occupied: boolean;
  is_active: boolean;
  created_at: string;
}

interface MockPallet {
  id: string;
  user_id: string;
  pallet_code: string;
  status: 'received' | 'assigned' | 'in_progress' | 'completed';
  location_id: string;
  received_at: string;
  assigned_to?: string;
  created_at: string;
}

interface MockStockLevel {
  id: string;
  user_id: string;
  product_id: string;
  location_id: string;
  quantity_available: number;
  quantity_reserved: number;
  last_counted_at: string;
  created_at: string;
}

export class MockDataGenerator {
  static async generateAllMockData() {
    console.log('🚀 Generating comprehensive WarehouseOS mock data...');
    
    // Clear existing data
    this.clearAllData();
    
    // Generate core data
    const roles = this.generateRoles();
    const users = this.generateUsers(roles);
    const suppliers = this.generateSuppliers(users[0].id); // Admin user
    const categories = this.generateCategories(users[0].id);
    const warehouses = this.generateWarehouses(users[0].id);
    const locations = this.generateLocations(users[0].id, warehouses);
    const products = this.generateProducts(users[0].id, categories, suppliers);
    const stockLevels = this.generateStockLevels(users[0].id, products, locations);
    const pallets = this.generatePallets(users[0].id, locations, users);
    
    // Generate operational data
    const putAwayTasks = this.generatePutAwayTasks(users[0].id, pallets, users, locations);
    const stockMoveTasks = this.generateStockMoveTasks(users[0].id, products, locations, users);
    const customers = this.generateCustomers(users[0].id);
    const ecommerceOrders = this.generateEcommerceOrders(users[0].id, customers, products);
    const pickingTasks = this.generatePickingTasks(users[0].id, ecommerceOrders, products, locations, users);
    
    // Generate supporting data
    const scanDevices = this.generateScanDevices(users[0].id);
    const scanSessions = this.generateScanSessions(users[0].id, scanDevices, users);
    const chatChannels = this.generateChatChannels(users[0].id, users);
    const chatMessages = this.generateChatMessages(users[0].id, chatChannels, users);
    
    // Generate accounting data
    const accounts = this.generateAccounts(users[0].id);
    const contacts = this.generateContacts(users[0].id);
    const invoices = this.generateInvoices(users[0].id, contacts, ecommerceOrders);
    const journalEntries = this.generateJournalEntries(users[0].id, accounts);
    
    // Generate configuration
    const companyConfig = this.generateCompanyConfig();
    
    // Save all data to localStorage
    BrowserStorage.set('roles', roles);
    BrowserStorage.set('users', users);
    BrowserStorage.set('suppliers', suppliers);
    BrowserStorage.set('categories', categories);
    BrowserStorage.set('warehouses', warehouses);
    BrowserStorage.set('locations', locations);
    BrowserStorage.set('products', products);
    BrowserStorage.set('stock_levels', stockLevels);
    BrowserStorage.set('pallets', pallets);
    BrowserStorage.set('putaway_tasks', putAwayTasks);
    BrowserStorage.set('stock_move_tasks', stockMoveTasks);
    BrowserStorage.set('customers', customers);
    BrowserStorage.set('ecommerce_orders', ecommerceOrders);
    BrowserStorage.set('picking_tasks', pickingTasks);
    BrowserStorage.set('scan_devices', scanDevices);
    BrowserStorage.set('scan_sessions', scanSessions);
    BrowserStorage.set('chat_channels', chatChannels);
    BrowserStorage.set('chat_messages', chatMessages);
    BrowserStorage.set('accounts', accounts);
    BrowserStorage.set('contacts', contacts);
    BrowserStorage.set('invoices', invoices);
    BrowserStorage.set('journal_entries', journalEntries);
    BrowserStorage.set('company_config', companyConfig);
    
    console.log('✅ Mock data generation completed successfully!');
    console.log('📊 Generated data summary:', {
      users: users.length,
      products: products.length,
      pallets: pallets.length,
      locations: locations.length,
      putAwayTasks: putAwayTasks.length,
      pickingTasks: pickingTasks.length,
      stockMoveTasks: stockMoveTasks.length,
      customers: customers.length,
      ecommerceOrders: ecommerceOrders.length
    });
    
    return {
      users,
      products,
      suppliers,
      pallets,
      locations,
      putAwayTasks,
      pickingTasks,
      stockMoveTasks,
      customers,
      ecommerceOrders
    };
  }
  
  private static clearAllData() {
    const collections = [
      'roles', 'users', 'suppliers', 'categories', 'warehouses', 'locations',
      'products', 'stock_levels', 'pallets', 'putaway_tasks', 'stock_move_tasks',
      'customers', 'ecommerce_orders', 'picking_tasks', 'scan_devices',
      'scan_sessions', 'chat_channels', 'chat_messages', 'accounts',
      'contacts', 'invoices', 'journal_entries', 'company_config'
    ];
    
    collections.forEach(collection => {
      BrowserStorage.set(collection, []);
    });
  }
  
  private static generateRoles(): MockRole[] {
    return [
      {
        id: '1',
        name: 'admin',
        display_name: 'Administrador',
        level: 1,
        permissions: [{ action: 'manage', resource: '*' }],
        module_access: [
          { module_id: '*', can_access: true, permissions: ['*'] }
        ],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2',
        name: 'team_leader',
        display_name: 'Team Leader',
        level: 3,
        permissions: [
          { action: 'read', resource: 'dashboard' },
          { action: 'manage', resource: 'inventory' },
          { action: 'assign', resource: 'tasks' },
          { action: 'read', resource: 'reports' }
        ],
        module_access: [
          { module_id: 'dashboard', can_access: true, permissions: ['read'] },
          { module_id: 'inventory', can_access: true, permissions: ['manage'] },
          { module_id: 'putaway', can_access: true, permissions: ['manage'] },
          { module_id: 'picking', can_access: true, permissions: ['manage'] },
          { module_id: 'stockmove', can_access: true, permissions: ['manage'] }
        ],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3',
        name: 'putaway_operator',
        display_name: 'Operador Put Away',
        level: 5,
        permissions: [
          { action: 'read', resource: 'dashboard' },
          { action: 'execute', resource: 'putaway_tasks' }
        ],
        module_access: [
          { module_id: 'dashboard', can_access: true, permissions: ['read'] },
          { module_id: 'putaway', can_access: true, permissions: ['read', 'execute'] },
          { module_id: 'scanner', can_access: true, permissions: ['read', 'execute'] }
        ],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '4',
        name: 'picker',
        display_name: 'Picker',
        level: 6,
        permissions: [
          { action: 'read', resource: 'dashboard' },
          { action: 'execute', resource: 'picking_tasks' }
        ],
        module_access: [
          { module_id: 'dashboard', can_access: true, permissions: ['read'] },
          { module_id: 'picking', can_access: true, permissions: ['read', 'execute'] },
          { module_id: 'scanner', can_access: true, permissions: ['read', 'execute'] }
        ],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '5',
        name: 'accountant',
        display_name: 'Contabilidad',
        level: 4,
        permissions: [
          { action: 'read', resource: 'dashboard' },
          { action: 'manage', resource: 'accounting' },
          { action: 'read', resource: 'reports' }
        ],
        module_access: [
          { module_id: 'dashboard', can_access: true, permissions: ['read'] },
          { module_id: 'accounting', can_access: true, permissions: ['manage'] },
          { module_id: 'customers', can_access: true, permissions: ['read'] }
        ],
        created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateUsers(roles: MockRole[]): MockUser[] {
    return [
      {
        id: '1',
        email: 'admin@warehouseos.com',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        role_id: '1',
        is_active: true,
        created_at: new Date('2024-01-01').toISOString(),
        last_login_at: new Date().toISOString(),
        phone: '+34 612 345 678',
        employee_id: 'EMP001'
      },
      {
        id: '2',
        email: 'teamleader@warehouseos.com',
        firstName: 'Maria',
        lastName: 'Gonzalez',
        role_id: '2',
        team_id: 'team-warehouse',
        is_active: true,
        created_at: new Date('2024-01-15').toISOString(),
        last_login_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        phone: '+34 612 345 679',
        employee_id: 'EMP002'
      },
      {
        id: '3',
        email: 'putaway@warehouseos.com',
        firstName: 'Jose',
        lastName: 'Martinez',
        role_id: '3',
        team_id: 'team-warehouse',
        is_active: true,
        created_at: new Date('2024-02-01').toISOString(),
        last_login_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        phone: '+34 612 345 680',
        employee_id: 'EMP003'
      },
      {
        id: '4',
        email: 'picker@warehouseos.com',
        firstName: 'Ana',
        lastName: 'Lopez',
        role_id: '4',
        team_id: 'team-warehouse',
        is_active: true,
        created_at: new Date('2024-02-01').toISOString(),
        last_login_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        phone: '+34 612 345 681',
        employee_id: 'EMP004'
      },
      {
        id: '5',
        email: 'accountant@warehouseos.com',
        firstName: 'Laura',
        lastName: 'Fernandez',
        role_id: '5',
        team_id: 'team-office',
        is_active: true,
        created_at: new Date('2024-01-20').toISOString(),
        last_login_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        phone: '+34 612 345 682',
        employee_id: 'EMP005'
      }
    ];
  }
  
  private static generateSuppliers(userId: string) {
    return [
      {
        id: '1',
        user_id: userId,
        code: 'SUP001',
        name: 'Electronics Supplier Ltd',
        contact_person: 'John Smith',
        email: 'orders@electronicsup.com',
        phone: '+44 20 7946 0958',
        address: '123 Tech Street',
        city: 'London',
        country: 'United Kingdom',
        payment_terms: '30 days',
        lead_time_days: 7,
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2',
        user_id: userId,
        code: 'SUP002',
        name: 'Home & Garden Supplies',
        contact_person: 'Emma Wilson',
        email: 'procurement@homegardens.com',
        phone: '+44 20 7946 0959',
        address: '456 Garden Avenue',
        city: 'Manchester',
        country: 'United Kingdom',
        payment_terms: '45 days',
        lead_time_days: 10,
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3',
        user_id: userId,
        code: 'SUP003',
        name: 'Office Equipment Co.',
        contact_person: 'Michael Brown',
        email: 'sales@officeequip.co.uk',
        phone: '+44 20 7946 0960',
        address: '789 Business Park',
        city: 'Birmingham',
        country: 'United Kingdom',
        payment_terms: '60 days',
        lead_time_days: 5,
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateCategories(userId: string) {
    return [
      { id: '1', user_id: userId, name: 'Electronics', description: 'Electronic devices and accessories', is_active: true, created_at: new Date('2024-01-01').toISOString() },
      { id: '2', user_id: userId, name: 'Home & Garden', description: 'Home improvement and garden products', is_active: true, created_at: new Date('2024-01-01').toISOString() },
      { id: '3', user_id: userId, name: 'Office Supplies', description: 'Office equipment and supplies', is_active: true, created_at: new Date('2024-01-01').toISOString() },
      { id: '4', user_id: userId, name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear', is_active: true, created_at: new Date('2024-01-01').toISOString() }
    ];
  }
  
  private static generateWarehouses(userId: string): MockWarehouse[] {
    return [
      {
        id: '1',
        user_id: userId,
        code: 'MAIN',
        name: 'Main Warehouse',
        address: '123 Industrial Estate',
        city: 'London',
        country: 'United Kingdom',
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2',
        user_id: userId,
        code: 'OVERFLOW',
        name: 'Overflow Warehouse',
        address: '456 Storage Complex',
        city: 'Manchester',
        country: 'United Kingdom',
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateLocations(userId: string, warehouses: MockWarehouse[]): MockLocation[] {
    const locations: MockLocation[] = [];
    
    // Receiving locations
    locations.push(
      { id: '1', user_id: userId, warehouse_id: '1', code: 'REC-01', name: 'Receiving Dock 1', type: 'receiving', confirmation_code: 'REC01', is_occupied: false, is_active: true, created_at: new Date('2024-01-01').toISOString() },
      { id: '2', user_id: userId, warehouse_id: '1', code: 'REC-02', name: 'Receiving Dock 2', type: 'receiving', confirmation_code: 'REC02', is_occupied: true, is_active: true, created_at: new Date('2024-01-01').toISOString() }
    );
    
    // Storage locations
    for (let aisle = 1; aisle <= 3; aisle++) {
      for (let rack = 1; rack <= 4; rack++) {
        for (let shelf = 1; shelf <= 3; shelf++) {
          const id = `${10 + locations.length}`;
          locations.push({
            id,
            user_id: userId,
            warehouse_id: '1',
            code: `A${aisle}R${rack}S${shelf}`,
            name: `Aisle ${aisle} Rack ${rack} Shelf ${shelf}`,
            type: 'storage',
            aisle: `A${aisle}`,
            rack: `R${rack}`,
            shelf: `S${shelf}`,
            confirmation_code: `A${aisle}R${rack}S${shelf}`,
            max_weight_kg: 1000,
            is_occupied: Math.random() > 0.6,
            is_active: true,
            created_at: new Date('2024-01-01').toISOString()
          });
        }
      }
    }
    
    // Picking locations
    for (let i = 1; i <= 8; i++) {
      const id = `${200 + i}`;
      locations.push({
        id,
        user_id: userId,
        warehouse_id: '1',
        code: `PICK-${i.toString().padStart(2, '0')}`,
        name: `Picking Location ${i}`,
        type: 'picking',
        confirmation_code: `PICK${i.toString().padStart(2, '0')}`,
        is_occupied: Math.random() > 0.4,
        is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      });
    }
    
    // Shipping locations
    locations.push(
      { id: '301', user_id: userId, warehouse_id: '1', code: 'SHIP-01', name: 'Shipping Dock 1', type: 'shipping', confirmation_code: 'SHIP01', is_occupied: false, is_active: true, created_at: new Date('2024-01-01').toISOString() },
      { id: '302', user_id: userId, warehouse_id: '1', code: 'SHIP-02', name: 'Shipping Dock 2', type: 'shipping', confirmation_code: 'SHIP02', is_occupied: true, is_active: true, created_at: new Date('2024-01-01').toISOString() }
    );
    
    return locations;
  }
  
  private static generateProducts(userId: string, categories: any[], suppliers: any[]): MockProduct[] {
    return [
      {
        id: '1', user_id: userId, sku: 'LAPTOP001', name: 'Gaming Laptop Pro 15"', description: 'High-performance gaming laptop with RTX graphics',
        barcode: '1234567890123', weight_kg: 2.5, dimensions: { length_cm: 35, width_cm: 25, height_cm: 3 },
        category_id: '1', supplier_id: '1', unit_cost: 800, sale_price: 1200, reorder_point: 5, max_stock: 50,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, sku: 'PHONE001', name: 'Smartphone Pro Max', description: 'Latest smartphone with advanced camera system',
        barcode: '1234567890124', weight_kg: 0.2, dimensions: { length_cm: 16, width_cm: 8, height_cm: 1 },
        category_id: '1', supplier_id: '1', unit_cost: 600, sale_price: 900, reorder_point: 10, max_stock: 100,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3', user_id: userId, sku: 'TABLET001', name: 'Professional Tablet 12"', description: '12-inch tablet for professional use',
        barcode: '1234567890125', weight_kg: 0.6, dimensions: { length_cm: 28, width_cm: 20, height_cm: 1 },
        category_id: '1', supplier_id: '1', unit_cost: 400, sale_price: 650, reorder_point: 8, max_stock: 75,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '4', user_id: userId, sku: 'CHAIR001', name: 'Ergonomic Office Chair', description: 'Comfortable ergonomic chair for office use',
        barcode: '1234567890126', weight_kg: 15, dimensions: { length_cm: 60, width_cm: 60, height_cm: 110 },
        category_id: '3', supplier_id: '3', unit_cost: 150, sale_price: 300, reorder_point: 3, max_stock: 25,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '5', user_id: userId, sku: 'DESK001', name: 'Standing Desk Adjustable', description: 'Height-adjustable standing desk',
        barcode: '1234567890127', weight_kg: 25, dimensions: { length_cm: 120, width_cm: 60, height_cm: 5 },
        category_id: '3', supplier_id: '3', unit_cost: 200, sale_price: 400, reorder_point: 2, max_stock: 15,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '6', user_id: userId, sku: 'TOOL001', name: 'Cordless Drill Set', description: 'Professional cordless drill with accessories',
        barcode: '1234567890128', weight_kg: 2, dimensions: { length_cm: 30, width_cm: 25, height_cm: 10 },
        category_id: '2', supplier_id: '2', unit_cost: 80, sale_price: 150, reorder_point: 6, max_stock: 40,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '7', user_id: userId, sku: 'GARDEN001', name: 'Garden Hose 25m', description: 'Heavy-duty garden hose 25 meters',
        barcode: '1234567890129', weight_kg: 3, dimensions: { length_cm: 40, width_cm: 40, height_cm: 15 },
        category_id: '2', supplier_id: '2', unit_cost: 25, sale_price: 50, reorder_point: 12, max_stock: 80,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '8', user_id: userId, sku: 'MONITOR001', name: '4K Monitor 27"', description: '27-inch 4K professional monitor',
        barcode: '1234567890130', weight_kg: 6, dimensions: { length_cm: 65, width_cm: 45, height_cm: 8 },
        category_id: '1', supplier_id: '1', unit_cost: 300, sale_price: 500, reorder_point: 4, max_stock: 30,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '9', user_id: userId, sku: 'PRINTER001', name: 'Laser Printer Color', description: 'Color laser printer for office use',
        barcode: '1234567890131', weight_kg: 20, dimensions: { length_cm: 50, width_cm: 40, height_cm: 30 },
        category_id: '3', supplier_id: '3', unit_cost: 250, sale_price: 450, reorder_point: 2, max_stock: 20,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '10', user_id: userId, sku: 'HEADSET001', name: 'Wireless Gaming Headset', description: 'Premium wireless gaming headset with noise cancellation',
        barcode: '1234567890132', weight_kg: 0.4, dimensions: { length_cm: 20, width_cm: 18, height_cm: 10 },
        category_id: '1', supplier_id: '1', unit_cost: 80, sale_price: 150, reorder_point: 15, max_stock: 60,
        is_active: true, created_at: new Date('2024-01-01').toISOString(), updated_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateStockLevels(userId: string, products: MockProduct[], locations: MockLocation[]): MockStockLevel[] {
    const stockLevels: MockStockLevel[] = [];
    const storageLocations = locations.filter(l => l.type === 'storage' && l.is_occupied);
    const pickingLocations = locations.filter(l => l.type === 'picking' && l.is_occupied);
    
    products.forEach(product => {
      // Storage stock
      const storageLocation = storageLocations[Math.floor(Math.random() * storageLocations.length)];
      if (storageLocation) {
        stockLevels.push({
          id: `stock_${product.id}_${storageLocation.id}`,
          user_id: userId,
          product_id: product.id,
          location_id: storageLocation.id,
          quantity_available: Math.floor(Math.random() * 50) + 10,
          quantity_reserved: Math.floor(Math.random() * 5),
          last_counted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date('2024-01-01').toISOString()
        });
      }
      
      // Picking stock (some products)
      if (Math.random() > 0.5) {
        const pickingLocation = pickingLocations[Math.floor(Math.random() * pickingLocations.length)];
        if (pickingLocation) {
          stockLevels.push({
            id: `stock_${product.id}_${pickingLocation.id}`,
            user_id: userId,
            product_id: product.id,
            location_id: pickingLocation.id,
            quantity_available: Math.floor(Math.random() * 20) + 5,
            quantity_reserved: Math.floor(Math.random() * 3),
            last_counted_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date('2024-01-01').toISOString()
          });
        }
      }
    });
    
    return stockLevels;
  }
  
  private static generatePallets(userId: string, locations: MockLocation[], users: MockUser[]): MockPallet[] {
    const receivingLocations = locations.filter(l => l.type === 'receiving');
    const putAwayOperators = users.filter(u => u.role_id === '3');
    
    return [
      {
        id: '1', user_id: userId, pallet_code: 'PLT-2024-001', status: 'received',
        location_id: receivingLocations[0]?.id || '1', received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, pallet_code: 'PLT-2024-002', status: 'received',
        location_id: receivingLocations[1]?.id || '2', received_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3', user_id: userId, pallet_code: 'PLT-2024-003', status: 'assigned',
        location_id: receivingLocations[0]?.id || '1', assigned_to: putAwayOperators[0]?.id,
        received_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4', user_id: userId, pallet_code: 'PLT-2024-004', status: 'in_progress',
        location_id: receivingLocations[1]?.id || '2', assigned_to: putAwayOperators[0]?.id,
        received_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5', user_id: userId, pallet_code: 'PLT-2024-005', status: 'completed',
        location_id: receivingLocations[0]?.id || '1', assigned_to: putAwayOperators[0]?.id,
        received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6', user_id: userId, pallet_code: 'PLT-2024-006', status: 'received',
        location_id: receivingLocations[0]?.id || '1', received_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generatePutAwayTasks(userId: string, pallets: MockPallet[], users: MockUser[], locations: MockLocation[]) {
    const storageLocations = locations.filter(l => l.type === 'storage' && !l.is_occupied);
    const putAwayOperators = users.filter(u => u.role_id === '3');
    
    return [
      {
        id: '1', user_id: userId, task_number: 'PUT-001', pallet_id: '3', product_id: '1',
        from_location_id: '1', to_location_id: storageLocations[0]?.id || '11',
        assigned_to: putAwayOperators[0]?.id, status: 'assigned', priority: 'high',
        quantity: 10, estimated_duration_minutes: 15,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, task_number: 'PUT-002', pallet_id: '4', product_id: '2',
        from_location_id: '2', to_location_id: storageLocations[1]?.id || '12',
        assigned_to: putAwayOperators[0]?.id, status: 'in_progress', priority: 'medium',
        quantity: 20, estimated_duration_minutes: 20,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '3', user_id: userId, task_number: 'PUT-003', pallet_id: '1', product_id: '3',
        from_location_id: '1', to_location_id: storageLocations[2]?.id || '13',
        status: 'pending', priority: 'medium', quantity: 15, estimated_duration_minutes: 12,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4', user_id: userId, task_number: 'PUT-004', pallet_id: '2', product_id: '4',
        from_location_id: '2', to_location_id: storageLocations[3]?.id || '14',
        status: 'pending', priority: 'low', quantity: 5, estimated_duration_minutes: 10,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateStockMoveTasks(userId: string, products: MockProduct[], locations: MockLocation[], users: MockUser[]) {
    const storageLocations = locations.filter(l => l.type === 'storage');
    const pickingLocations = locations.filter(l => l.type === 'picking');
    const teamLeader = users.find(u => u.role_id === '2');
    
    return [
      {
        id: '1', user_id: userId, task_number: 'MOV-001', product_id: products[0].id,
        from_location_id: storageLocations[0]?.id || '11',
        to_location_id: pickingLocations[0]?.id || '201',
        quantity: 15, reason: 'Restock picking area', status: 'pending', priority: 'high',
        created_by: teamLeader?.id, created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, task_number: 'MOV-002', product_id: products[1].id,
        from_location_id: storageLocations[1]?.id || '12',
        to_location_id: pickingLocations[1]?.id || '202',
        quantity: 25, reason: 'Low stock in picking', status: 'pending', priority: 'medium',
        created_by: teamLeader?.id, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateCustomers(userId: string) {
    return [
      {
        id: '1', user_id: userId, customer_number: 'CUST001', name: 'Tech Solutions Ltd',
        email: 'orders@techsolutions.com', phone: '+44 20 7946 0001',
        address: '123 Business Street', city: 'London', postal_code: 'SW1A 1AA', country: 'UK',
        customer_type: 'business', is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, customer_number: 'CUST002', name: 'Home Office Pro',
        email: 'purchasing@homeofficepro.com', phone: '+44 20 7946 0002',
        address: '456 Commerce Road', city: 'Manchester', postal_code: 'M1 1AA', country: 'UK',
        customer_type: 'business', is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3', user_id: userId, customer_number: 'CUST003', name: 'Digital Workspace',
        email: 'admin@digitalworkspace.co.uk', phone: '+44 20 7946 0003',
        address: '789 Innovation Hub', city: 'Birmingham', postal_code: 'B1 1AA', country: 'UK',
        customer_type: 'business', is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '4', user_id: userId, customer_number: 'CUST004', name: 'Garden Paradise Ltd',
        email: 'sales@gardenparadise.com', phone: '+44 20 7946 0004',
        address: '321 Green Street', city: 'Bristol', postal_code: 'BS1 1AA', country: 'UK',
        customer_type: 'business', is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '5', user_id: userId, customer_number: 'CUST005', name: 'Creative Studios Inc',
        email: 'procurement@creativestudios.com', phone: '+44 20 7946 0005',
        address: '654 Design Avenue', city: 'Edinburgh', postal_code: 'EH1 1AA', country: 'UK',
        customer_type: 'business', is_active: true,
        created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateEcommerceOrders(userId: string, customers: any[], products: MockProduct[]) {
    return [
      {
        id: '1', user_id: userId, order_number: 'ORD-2024-001', customer_id: customers[0].id,
        connection_id: 'shopify_main', channel_name: 'Shopify Store', order_status: 'confirmed',
        picking_status: 'pending', total_amount: 1800, currency: 'GBP',
        line_items: [
          { product_id: products[0].id, sku: products[0].sku, quantity: 1, unit_price: 1200 },
          { product_id: products[7].id, sku: products[7].sku, quantity: 1, unit_price: 500 },
          { product_id: products[9].id, sku: products[9].sku, quantity: 1, unit_price: 150 }
        ],
        shipping_address: {
          name: customers[0].name, address: customers[0].address,
          city: customers[0].city, postal_code: customers[0].postal_code, country: customers[0].country
        },
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        order_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, order_number: 'ORD-2024-002', customer_id: customers[1].id,
        connection_id: 'woocommerce_main', channel_name: 'WooCommerce Store', order_status: 'confirmed',
        picking_status: 'in_progress', total_amount: 950, currency: 'GBP',
        line_items: [
          { product_id: products[1].id, sku: products[1].sku, quantity: 1, unit_price: 900 },
          { product_id: products[6].id, sku: products[6].sku, quantity: 1, unit_price: 50 }
        ],
        shipping_address: {
          name: customers[1].name, address: customers[1].address,
          city: customers[1].city, postal_code: customers[1].postal_code, country: customers[1].country
        },
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        order_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3', user_id: userId, order_number: 'ORD-2024-003', customer_id: customers[2].id,
        connection_id: 'shopify_main', channel_name: 'Shopify Store', order_status: 'confirmed',
        picking_status: 'pending', total_amount: 1100, currency: 'GBP',
        line_items: [
          { product_id: products[2].id, sku: products[2].sku, quantity: 1, unit_price: 650 },
          { product_id: products[3].id, sku: products[3].sku, quantity: 1, unit_price: 300 },
          { product_id: products[9].id, sku: products[9].sku, quantity: 1, unit_price: 150 }
        ],
        shipping_address: {
          name: customers[2].name, address: customers[2].address,
          city: customers[2].city, postal_code: customers[2].postal_code, country: customers[2].country
        },
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        order_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generatePickingTasks(userId: string, orders: any[], products: MockProduct[], locations: MockLocation[], users: MockUser[]) {
    const pickingLocations = locations.filter(l => l.type === 'picking');
    const shippingLocations = locations.filter(l => l.type === 'shipping');
    const pickers = users.filter(u => u.role_id === '4');
    
    const tasks = [];
    
    // Tasks for order 1
    tasks.push(
      {
        id: '1', user_id: userId, task_number: 'PICK-001', order_id: orders[0].id,
        product_id: products[0].id, quantity_requested: 1, quantity_picked: 0,
        source_location_id: pickingLocations[0]?.id || '201',
        destination_location_id: shippingLocations[0]?.id || '301',
        status: 'pending', priority: 'high', task_type: 'sale',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, task_number: 'PICK-002', order_id: orders[0].id,
        product_id: products[7].id, quantity_requested: 1, quantity_picked: 0,
        source_location_id: pickingLocations[1]?.id || '202',
        destination_location_id: shippingLocations[0]?.id || '301',
        status: 'pending', priority: 'high', task_type: 'sale',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    );
    
    // Tasks for order 2 (in progress)
    tasks.push(
      {
        id: '3', user_id: userId, task_number: 'PICK-003', order_id: orders[1].id,
        product_id: products[1].id, quantity_requested: 1, quantity_picked: 1,
        source_location_id: pickingLocations[2]?.id || '203',
        destination_location_id: shippingLocations[1]?.id || '302',
        assigned_to: pickers[0]?.id, status: 'completed', priority: 'medium', task_type: 'sale',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4', user_id: userId, task_number: 'PICK-004', order_id: orders[1].id,
        product_id: products[6].id, quantity_requested: 1, quantity_picked: 0,
        source_location_id: pickingLocations[3]?.id || '204',
        destination_location_id: shippingLocations[1]?.id || '302',
        assigned_to: pickers[0]?.id, status: 'in_progress', priority: 'medium', task_type: 'sale',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        assigned_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    );
    
    // Tasks for order 3
    tasks.push(
      {
        id: '5', user_id: userId, task_number: 'PICK-005', order_id: orders[2].id,
        product_id: products[2].id, quantity_requested: 1, quantity_picked: 0,
        source_location_id: pickingLocations[4]?.id || '205',
        destination_location_id: shippingLocations[0]?.id || '301',
        status: 'pending', priority: 'medium', task_type: 'sale',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    );
    
    return tasks;
  }
  
  private static generateScanDevices(userId: string) {
    return [
      {
        id: '1', user_id: userId, device_name: 'Zebra TC27 #001', device_type: 'handheld',
        serial_number: 'ZBR-TC27-001', manufacturer: 'Zebra', model: 'TC27',
        status: 'active', battery_level: 85, last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, device_name: 'Android Tablet #001', device_type: 'tablet',
        serial_number: 'AND-TAB-001', manufacturer: 'Samsung', model: 'Galaxy Tab A8',
        status: 'active', battery_level: 92, last_seen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateScanSessions(userId: string, devices: any[], users: MockUser[]) {
    return [
      {
        id: '1', user_id: userId, session_name: 'Put Away Session', operator_id: users[2].id,
        device_id: devices[0].id, session_type: 'putaway', status: 'active',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        scans_count: 15, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, session_name: 'Picking Session', operator_id: users[3].id,
        device_id: devices[1].id, session_type: 'picking', status: 'active',
        started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        scans_count: 8, created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateChatChannels(userId: string, users: MockUser[]) {
    return [
      {
        id: '1', user_id: userId, name: 'Warehouse Operations', description: 'General warehouse coordination',
        channel_type: 'team', is_private: false, created_by: users[1].id,
        members: [users[0].id, users[1].id, users[2].id, users[3].id],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, name: 'Put Away Team', description: 'Put away coordination',
        channel_type: 'team', is_private: false, created_by: users[1].id,
        members: [users[1].id, users[2].id],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3', user_id: userId, name: 'Picking Team', description: 'Picking coordination',
        channel_type: 'team', is_private: false, created_by: users[1].id,
        members: [users[1].id, users[3].id],
        created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '4', user_id: userId, name: 'Admin Support', description: 'Direct line to administration',
        channel_type: 'support', is_private: true, created_by: users[0].id,
        members: [users[0].id, users[1].id],
        created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateChatMessages(userId: string, channels: any[], users: MockUser[]) {
    return [
      // Warehouse Operations messages
      {
        id: '1', user_id: userId, channel_id: '1', sender_id: users[1].id,
        content: 'Buenos días equipo. Tenemos 6 palets nuevos en recepción para procesar hoy.',
        message_type: 'text', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, channel_id: '1', sender_id: users[2].id,
        content: 'Recibido, ya estoy trabajando en el PLT-2024-003. ¿Cuál es la prioridad para los demás?',
        message_type: 'text', created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3', user_id: userId, channel_id: '1', sender_id: users[3].id,
        content: 'Necesito ayuda con la orden ORD-2024-002, no encuentro el producto en PICK-04',
        message_type: 'text', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4', user_id: userId, channel_id: '1', sender_id: users[1].id,
        content: 'Ana, revisa si necesitas hacer un stock move desde almacén. Te mando la tarea MOV-002.',
        message_type: 'text', created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      
      // Put Away Team messages
      {
        id: '5', user_id: userId, channel_id: '2', sender_id: users[1].id,
        content: 'Jose, por favor prioriza el palet PLT-2024-001, es material urgente.',
        message_type: 'text', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6', user_id: userId, channel_id: '2', sender_id: users[2].id,
        content: 'Perfecto, en cuanto termine el actual me pongo con ese.',
        message_type: 'text', created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString()
      },
      
      // Picking Team messages
      {
        id: '7', user_id: userId, channel_id: '3', sender_id: users[1].id,
        content: 'Ana, tienes 3 órdenes pendientes de Shopify. ¿Necesitas apoyo?',
        message_type: 'text', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '8', user_id: userId, channel_id: '3', sender_id: users[3].id,
        content: 'Voy bien, ya completé una. Solo necesito el restock que mencioné en el canal general.',
        message_type: 'text', created_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
      },
      
      // Admin Support messages
      {
        id: '9', user_id: userId, channel_id: '4', sender_id: users[1].id,
        content: 'Carlos, necesito autorización para contratar un operario temporal, estamos al límite de capacidad.',
        message_type: 'text', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '10', user_id: userId, channel_id: '4', sender_id: users[0].id,
        content: 'Aprobado. Coordina con RRHH para el proceso. También vamos a revisar optimización de rutas la próxima semana.',
        message_type: 'text', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateAccounts(userId: string) {
    return [
      {
        id: '1', user_id: userId, code: '1100', name: 'Caja', account_type: 'asset',
        account_nature: 'debit', parent_id: null, level: 1, balance: 5000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, code: '1200', name: 'Banco Santander', account_type: 'asset',
        account_nature: 'debit', parent_id: null, level: 1, balance: 25000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '3', user_id: userId, code: '1300', name: 'Cuentas por Cobrar', account_type: 'asset',
        account_nature: 'debit', parent_id: null, level: 1, balance: 15000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '4', user_id: userId, code: '2100', name: 'Cuentas por Pagar', account_type: 'liability',
        account_nature: 'credit', parent_id: null, level: 1, balance: 8000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '5', user_id: userId, code: '4100', name: 'Ingresos por Ventas', account_type: 'revenue',
        account_nature: 'credit', parent_id: null, level: 1, balance: 50000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '6', user_id: userId, code: '5100', name: 'Costo de Ventas', account_type: 'expense',
        account_nature: 'debit', parent_id: null, level: 1, balance: 30000,
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateContacts(userId: string) {
    return [
      {
        id: '1', user_id: userId, contact_number: 'CLI001', name: 'Tech Solutions Ltd',
        email: 'billing@techsolutions.com', phone: '+44 20 7946 0001',
        contact_type: 'customer', payment_terms: '30 days', currency: 'GBP',
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      },
      {
        id: '2', user_id: userId, contact_number: 'PRV001', name: 'Electronics Supplier Ltd',
        email: 'accounts@electronicsup.com', phone: '+44 20 7946 0958',
        contact_type: 'supplier', payment_terms: '30 days', currency: 'GBP',
        is_active: true, created_at: new Date('2024-01-01').toISOString()
      }
    ];
  }
  
  private static generateInvoices(userId: string, contacts: any[], orders: any[]) {
    return [
      {
        id: '1', user_id: userId, invoice_number: 'INV-2024-001', contact_id: contacts[0].id,
        order_id: orders[0].id, invoice_type: 'sale', status: 'paid',
        subtotal: 1500, tax_amount: 300, total_amount: 1800, currency: 'GBP',
        invoice_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        paid_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', user_id: userId, invoice_number: 'INV-2024-002', contact_id: contacts[0].id,
        order_id: orders[1].id, invoice_type: 'sale', status: 'pending',
        subtotal: 792, tax_amount: 158, total_amount: 950, currency: 'GBP',
        invoice_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateJournalEntries(userId: string, accounts: any[]) {
    return [
      {
        id: '1', user_id: userId, entry_number: 'JE-2024-001', reference: 'Venta INV-2024-001',
        description: 'Registro de venta de productos tecnológicos', entry_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: 1800, status: 'posted',
        lines: [
          { account_id: accounts[1].id, description: 'Cobro de venta', debit_amount: 1800, credit_amount: 0 },
          { account_id: accounts[4].id, description: 'Ingresos por venta', debit_amount: 0, credit_amount: 1500 },
          { account_id: accounts[5].id, description: 'IVA por cobrar', debit_amount: 0, credit_amount: 300 }
        ],
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  private static generateCompanyConfig() {
    return {
      id: '1',
      company_name: 'WarehouseOS Demo Ltd',
      company_email: 'demo@warehouseos.com',
      company_phone: '+44 20 7946 0999',
      company_address: '100 Demo Street, London, UK',
      company_logo: '/placeholder.svg',
      default_language: 'en',
      supported_languages: ['en', 'es'],
      default_currency: 'GBP',
      default_timezone: 'Europe/London',
      backup_enabled: true,
      backup_frequency: 'daily',
      backup_retention_days: 30,
      email_notifications: true,
      sms_notifications: false,
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
