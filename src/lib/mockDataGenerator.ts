
import { BrowserStorage } from './browserStorage';

export class MockDataGenerator {
  
  static clearAllData(): number {
    const collections = [
      // Core entities
      'roles', 'users', 'products', 'suppliers', 'categories', 'warehouses', 'locations', 
      'pallets', 'stock_levels',
      
      // Operational tasks
      'putaway_tasks', 'picking_tasks', 'stock_move_tasks', 
      
      // Customer and business
      'customers', 'ecommerce_orders', 'ecommerce_connections',
      
      // Communication and devices
      'chat_channels', 'chat_messages', 'scan_devices', 'scan_sessions',
      
      // Accounting
      'accounts', 'contacts', 'invoices', 'journal_entries', 'payments',
      
      // Shipping and loading
      'loading_docks', 'shipments', 'loading_appointments',
      
      // Additional systems
      'stock_movements', 'sync_logs', 'audit_logs'
    ];
    
    let clearedCount = 0;
    collections.forEach(collection => {
      const existing = BrowserStorage.get(collection);
      if (existing && Array.isArray(existing) && existing.length > 0) {
        BrowserStorage.remove(collection);
        clearedCount++;
      }
    });
    
    return clearedCount;
  }

  static async generateAllMockData() {
    // Clear existing data first
    this.clearAllData();
    
    // Generate data in the correct order to maintain relationships
    const roles = this.generateRoles();
    const users = this.generateUsers(roles);
    const categories = this.generateCategories();
    const suppliers = this.generateSuppliers();
    const warehouses = this.generateWarehouses();
    const locations = this.generateLocations(warehouses);
    const products = this.generateProducts(categories, suppliers);
    const accounts = this.generateAccounts();
    const contacts = this.generateContacts();
    const invoices = this.generateInvoices(contacts, accounts);
    const journal_entries = this.generateJournalEntries(accounts);
    const payments = this.generatePayments(invoices, accounts);
    const customers = this.generateCustomers();
    const ecommerce_connections = this.generateEcommerceConnections();
    const ecommerce_orders = this.generateEcommerceOrders(ecommerce_connections, customers, products);
    const pallets = this.generatePallets(products, locations);
    const stock_levels = this.generateStockLevels(products, locations);
    const putaway_tasks = this.generatePutAwayTasks(pallets, locations, users);
    const picking_tasks = this.generatePickingTasks(ecommerce_orders, products, locations, users);
    const stock_move_tasks = this.generateStockMoveTasks(products, locations, users);
    const stock_movements = this.generateStockMovements(products, locations, users);
    const chat_channels = this.generateChatChannels(users);
    const chat_messages = this.generateChatMessages(chat_channels, users);
    const scan_devices = this.generateScanDevices();
    const scan_sessions = this.generateScanSessions(scan_devices, users);
    const loading_docks = this.generateLoadingDocks(warehouses);
    const shipments = this.generateShipments(ecommerce_orders, loading_docks);
    const loading_appointments = this.generateLoadingAppointments(loading_docks, shipments);
    const sync_logs = this.generateSyncLogs();
    const audit_logs = this.generateAuditLogs(users);

    return {
      roles,
      users,
      categories,
      suppliers,
      warehouses,
      locations,
      products,
      accounts,
      contacts,
      invoices,
      journal_entries,
      payments,
      customers,
      ecommerce_connections,
      ecommerce_orders,
      pallets,
      stock_levels,
      putaway_tasks,
      picking_tasks,
      stock_move_tasks,
      stock_movements,
      chat_channels,
      chat_messages,
      scan_devices,
      scan_sessions,
      loading_docks,
      shipments,
      loading_appointments,
      sync_logs,
      audit_logs
    };
  }

  static generateRoles() {
    const roles = [
      {
        id: '1',
        name: 'administrator',
        displayName: 'Administrator',
        description: 'Full system access and management',
        permissions: ['all'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'team_leader',
        displayName: 'Team Leader',
        description: 'Team management and operations oversight',
        permissions: ['operations', 'reports', 'team_management'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'putaway_operator',
        displayName: 'Put Away Operator',
        description: 'Receiving and storage operations',
        permissions: ['putaway', 'inventory_view'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'picker',
        displayName: 'Picker',
        description: 'Order fulfillment and picking',
        permissions: ['picking', 'inventory_view'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'accountant',
        displayName: 'Accountant',
        description: 'Financial management and accounting',
        permissions: ['accounting', 'reports', 'financial'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('roles', roles);
    return roles;
  }

  static generateUsers(roles: any[]) {
    const users = [
      {
        id: '1',
        email: 'admin@warehouseos.com',
        firstName: 'Admin',
        lastName: 'User',
        role: roles[0],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        email: 'teamleader@warehouseos.com',
        firstName: 'Team',
        lastName: 'Leader',
        role: roles[1],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        email: 'putaway@warehouseos.com',
        firstName: 'Put Away',
        lastName: 'Operator',
        role: roles[2],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        email: 'picker@warehouseos.com',
        firstName: 'Picker',
        lastName: 'User',
        role: roles[3],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        email: 'accountant@warehouseos.com',
        firstName: 'Account',
        lastName: 'Manager',
        role: roles[4],
        isActive: true,
        lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('users', users);
    return users;
  }

  static generateCategories() {
    const categories = [
      {
        id: '1',
        name: 'Electronics',
        description: 'Electronic devices and components',
        parent_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Clothing',
        description: 'Apparel and accessories',
        parent_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Books',
        description: 'Books and publications',
        parent_id: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('categories', categories);
    return categories;
  }

  static generateSuppliers() {
    const suppliers = [
      {
        id: '1',
        code: 'SUP001',
        name: 'TechCorp Electronics',
        contact_person: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94105',
        country: 'USA',
        tax_id: 'TC123456789',
        payment_terms: 'Net 30',
        lead_time_days: 14,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        code: 'SUP002',
        name: 'Fashion Forward Inc',
        contact_person: 'Sarah Johnson',
        email: 'sarah@fashionforward.com',
        phone: '+1-555-0456',
        address: '456 Fashion Ave',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        tax_id: 'FF987654321',
        payment_terms: 'Net 30',
        lead_time_days: 21,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        code: 'SUP003',
        name: 'BookWorld Publishers',
        contact_person: 'Michael Brown',
        email: 'michael@bookworld.com',
        phone: '+1-555-0789',
        address: '789 Book Lane',
        city: 'Chicago',
        state: 'IL',
        postal_code: '60601',
        country: 'USA',
        tax_id: 'BW456789123',
        payment_terms: 'Net 45',
        lead_time_days: 10,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('suppliers', suppliers);
    return suppliers;
  }

  static generateWarehouses() {
    const warehouses = [
      {
        id: '1',
        code: 'WH001',
        name: 'Main Warehouse',
        address: '100 Industrial Blvd',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90210',
        country: 'USA',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        code: 'WH002',
        name: 'Secondary Storage',
        address: '200 Storage Way',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90211',
        country: 'USA',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('warehouses', warehouses);
    return warehouses;
  }

  static generateLocations(warehouses: any[]) {
    const locations = [];
    
    // Generate locations for each warehouse
    warehouses.forEach((warehouse, warehouseIndex) => {
      // Generate aisles A-F
      for (let aisle = 0; aisle < 6; aisle++) {
        const aisleLetter = String.fromCharCode(65 + aisle); // A, B, C, D, E, F
        
        // Generate 3 racks per aisle
        for (let rack = 1; rack <= 3; rack++) {
          // Generate 2 shelves per rack
          for (let shelf = 1; shelf <= 2; shelf++) {
            locations.push({
              id: `${warehouse.id}-${aisleLetter}${rack}${shelf}`,
              warehouse_id: warehouse.id,
              aisle: aisleLetter,
              rack: rack.toString(),
              shelf: shelf.toString(),
              location_code: `${aisleLetter}${rack}${shelf}`,
              location_type: 'storage',
              is_available: true,
              max_weight: 1000,
              max_volume: 2.5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      }
    });

    BrowserStorage.set('locations', locations);
    return locations;
  }

  static generateProducts(categories: any[], suppliers: any[]) {
    const products = [
      {
        id: '1',
        sku: 'ELEC-001',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        unit_price: 99.99,
        cost_price: 60.00,
        weight: 0.3,
        dimensions: '20x15x8',
        barcode: '1234567890123',
        is_active: true,
        reorder_point: 10,
        max_stock: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        sku: 'ELEC-002',
        name: 'Smartphone Case',
        description: 'Protective case for smartphones',
        category_id: categories[0].id,
        supplier_id: suppliers[0].id,
        unit_price: 24.99,
        cost_price: 12.00,
        weight: 0.1,
        dimensions: '15x8x2',
        barcode: '2345678901234',
        is_active: true,
        reorder_point: 20,
        max_stock: 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        sku: 'CLOTH-001',
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt in various sizes',
        category_id: categories[1].id,
        supplier_id: suppliers[1].id,
        unit_price: 19.99,
        cost_price: 8.00,
        weight: 0.2,
        dimensions: '30x25x2',
        barcode: '3456789012345',
        is_active: true,
        reorder_point: 30,
        max_stock: 300,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        sku: 'CLOTH-002',
        name: 'Denim Jeans',
        description: 'Classic denim jeans in multiple sizes',
        category_id: categories[1].id,
        supplier_id: suppliers[1].id,
        unit_price: 49.99,
        cost_price: 25.00,
        weight: 0.6,
        dimensions: '35x30x5',
        barcode: '4567890123456',
        is_active: true,
        reorder_point: 15,
        max_stock: 150,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        sku: 'BOOK-001',
        name: 'Programming Guide',
        description: 'Comprehensive programming guide for beginners',
        category_id: categories[2].id,
        supplier_id: suppliers[2].id,
        unit_price: 39.99,
        cost_price: 20.00,
        weight: 0.8,
        dimensions: '25x20x3',
        barcode: '5678901234567',
        is_active: true,
        reorder_point: 5,
        max_stock: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('products', products);
    return products;
  }

  static generateAccounts() {
    const accounts = [
      {
        id: '1',
        code: '1000',
        name: 'Cash',
        account_type: 'asset',
        parent_id: null,
        is_active: true,
        balance: 50000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        code: '1200',
        name: 'Accounts Receivable',
        account_type: 'asset',
        parent_id: null,
        is_active: true,
        balance: 25840.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        code: '1300',
        name: 'Inventory',
        account_type: 'asset',
        parent_id: null,
        is_active: true,
        balance: 75000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        code: '2000',
        name: 'Accounts Payable',
        account_type: 'liability',
        parent_id: null,
        is_active: true,
        balance: 18530.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        code: '3000',
        name: 'Owner Equity',
        account_type: 'equity',
        parent_id: null,
        is_active: true,
        balance: 100000.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '6',
        code: '4000',
        name: 'Sales Revenue',
        account_type: 'revenue',
        parent_id: null,
        is_active: true,
        balance: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '7',
        code: '5000',
        name: 'Cost of Goods Sold',
        account_type: 'expense',
        parent_id: null,
        is_active: true,
        balance: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('accounts', accounts);
    return accounts;
  }

  static generateContacts() {
    const contacts = [
      {
        id: '1',
        name: 'ACME Corporation',
        type: 'customer',
        email: 'billing@acme.com',
        phone: '+1-555-1111',
        address: '123 Business St',
        city: 'Business City',
        state: 'BC',
        postal_code: '12345',
        country: 'USA',
        tax_id: 'ACME123456',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Global Retail Inc',
        type: 'customer',
        email: 'orders@globalretail.com',
        phone: '+1-555-2222',
        address: '456 Commerce Ave',
        city: 'Trade City',
        state: 'TC',
        postal_code: '67890',
        country: 'USA',
        tax_id: 'GRI789012',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'TechCorp Electronics',
        type: 'supplier',
        email: 'billing@techcorp.com',
        phone: '+1-555-0123',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94105',
        country: 'USA',
        tax_id: 'TC123456789',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('contacts', contacts);
    return contacts;
  }

  static generateInvoices(contacts: any[], accounts: any[]) {
    const invoices = [
      {
        id: '1',
        invoice_number: 'INV-2024-001',
        contact_id: contacts[0].id,
        invoice_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 1200.00,
        tax_amount: 96.00,
        total_amount: 1296.00,
        status: 'sent',
        currency: 'USD',
        line_items: [
          {
            id: '1',
            description: 'Wireless Bluetooth Headphones',
            quantity: 10,
            unit_price: 99.99,
            total: 999.90
          },
          {
            id: '2',
            description: 'Smartphone Case',
            quantity: 8,
            unit_price: 24.99,
            total: 199.92
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        invoice_number: 'INV-2024-002',
        contact_id: contacts[1].id,
        invoice_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: 800.00,
        tax_amount: 64.00,
        total_amount: 864.00,
        status: 'paid',
        currency: 'USD',
        line_items: [
          {
            id: '1',
            description: 'Cotton T-Shirt',
            quantity: 40,
            unit_price: 19.99,
            total: 799.60
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('invoices', invoices);
    return invoices;
  }

  static generateJournalEntries(accounts: any[]) {
    const journal_entries = [
      {
        id: '1',
        entry_number: 'JE-2024-001',
        date: new Date().toISOString(),
        description: 'Cash sale transaction',
        reference: 'SALE-001',
        total_debit: 1296.00,
        total_credit: 1296.00,
        line_items: [
          {
            id: '1',
            account_id: accounts[0].id, // Cash
            debit: 1296.00,
            credit: 0,
            description: 'Cash received from sale'
          },
          {
            id: '2',
            account_id: accounts[5].id, // Sales Revenue
            debit: 0,
            credit: 1200.00,
            description: 'Sales revenue'
          },
          {
            id: '3',
            account_id: accounts[3].id, // Tax Payable
            debit: 0,
            credit: 96.00,
            description: 'Sales tax collected'
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('journal_entries', journal_entries);
    return journal_entries;
  }

  static generatePayments(invoices: any[], accounts: any[]) {
    const payments = [
      {
        id: '1',
        payment_number: 'PAY-2024-001',
        invoice_id: invoices[1].id,
        amount: 864.00,
        payment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: 'bank_transfer',
        reference: 'TXN-123456',
        notes: 'Payment received via bank transfer',
        account_id: accounts[0].id, // Cash account
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('payments', payments);
    return payments;
  }

  static generateCustomers() {
    const customers = [
      {
        id: '1',
        code: 'CUST001',
        name: 'ACME Corporation',
        email: 'orders@acme.com',
        phone: '+1-555-1111',
        address: '123 Business St',
        city: 'Business City',
        state: 'BC',
        postal_code: '12345',
        country: 'USA',
        tax_id: 'ACME123456',
        credit_limit: 10000.00,
        payment_terms: 'Net 30',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        code: 'CUST002',
        name: 'Global Retail Inc',
        email: 'purchasing@globalretail.com',
        phone: '+1-555-2222',
        address: '456 Commerce Ave',
        city: 'Trade City',
        state: 'TC',
        postal_code: '67890',
        country: 'USA',
        tax_id: 'GRI789012',
        credit_limit: 15000.00,
        payment_terms: 'Net 15',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('customers', customers);
    return customers;
  }

  static generateEcommerceConnections() {
    const connections = [
      {
        id: '1',
        platform_id: '1',
        store_name: 'Main Store - Shopify',
        store_url: 'https://mainstore.myshopify.com',
        sync_enabled: true,
        last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        settings: {
          auto_sync: true,
          sync_interval: 15,
          import_orders: true,
          export_inventory: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        platform_id: '2',
        store_name: 'Amazon Store',
        store_url: 'https://amazon.com/seller/profile',
        sync_enabled: true,
        last_sync_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        settings: {
          auto_sync: true,
          sync_interval: 30,
          import_orders: true,
          export_inventory: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('ecommerce_connections', connections);
    return connections;
  }

  static generateEcommerceOrders(connections: any[], customers: any[], products: any[]) {
    const orders = [
      {
        id: '1',
        connection_id: connections[0].id,
        external_order_id: 'SHOP-001',
        order_number: 'ORD-2024-001',
        customer_email: customers[0].email,
        customer_name: customers[0].name,
        financial_status: 'paid',
        fulfillment_status: 'pending',
        total_amount: 149.98,
        currency: 'USD',
        order_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          address1: '123 Business St',
          city: 'Business City',
          state: 'BC',
          postal_code: '12345',
          country: 'USA'
        },
        line_items: [
          {
            id: '1',
            product_id: products[0].id,
            sku: products[0].sku,
            title: products[0].name,
            quantity: 1,
            price: 99.99
          },
          {
            id: '2',
            product_id: products[1].id,
            sku: products[1].sku,
            title: products[1].name,
            quantity: 2,
            price: 24.99
          }
        ],
        sync_status: 'synced',
        warehouse_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        connection_id: connections[1].id,
        external_order_id: 'AMZ-002',
        order_number: 'ORD-2024-002',
        customer_email: customers[1].email,
        customer_name: customers[1].name,
        financial_status: 'paid',
        fulfillment_status: 'pending',
        total_amount: 69.97,
        currency: 'USD',
        order_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        shipping_address: {
          address1: '456 Commerce Ave',
          city: 'Trade City',
          state: 'TC',
          postal_code: '67890',
          country: 'USA'
        },
        line_items: [
          {
            id: '1',
            product_id: products[2].id,
            sku: products[2].sku,
            title: products[2].name,
            quantity: 2,
            price: 19.99
          },
          {
            id: '2',
            product_id: products[4].id,
            sku: products[4].sku,
            title: products[4].name,
            quantity: 1,
            price: 39.99
          }
        ],
        sync_status: 'synced',
        warehouse_status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('ecommerce_orders', orders);
    return orders;
  }

  static generatePallets(products: any[], locations: any[]) {
    const pallets = [
      {
        id: '1',
        pallet_number: 'PLT-001',
        status: 'pending',
        product_id: products[0].id,
        quantity: 50,
        received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        location_id: null,
        putaway_task_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        pallet_number: 'PLT-002',
        status: 'in_progress',
        product_id: products[1].id,
        quantity: 100,
        received_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        location_id: null,
        putaway_task_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        pallet_number: 'PLT-003',
        status: 'stored',
        product_id: products[2].id,
        quantity: 200,
        received_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        location_id: locations[0].id,
        putaway_task_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('pallets', pallets);
    return pallets;
  }

  static generateStockLevels(products: any[], locations: any[]) {
    const stock_levels = [];
    
    // Generate stock levels for each product in various locations
    products.forEach((product, index) => {
      // Each product will have stock in 2-4 different locations
      const numLocations = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numLocations; i++) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        stock_levels.push({
          id: `${product.id}-${location.id}`,
          product_id: product.id,
          location_id: location.id,
          quantity_on_hand: Math.floor(Math.random() * 100) + 10,
          quantity_available: Math.floor(Math.random() * 80) + 5,
          quantity_allocated: Math.floor(Math.random() * 20),
          reorder_point: product.reorder_point || 10,
          max_quantity: product.max_stock || 100,
          last_counted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    BrowserStorage.set('stock_levels', stock_levels);
    return stock_levels;
  }

  static generatePutAwayTasks(pallets: any[], locations: any[], users: any[]) {
    const tasks = [
      {
        id: '1',
        pallet_id: pallets[1].id,
        assigned_to: users[2].id,
        suggested_location_id: locations[5].id,
        actual_location_id: null,
        status: 'in_progress',
        priority: 'normal',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        pallet_id: pallets[0].id,
        assigned_to: null,
        suggested_location_id: locations[8].id,
        actual_location_id: null,
        status: 'pending',
        priority: 'high',
        started_at: null,
        completed_at: null,
        notes: 'Fragile items - handle with care',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('putaway_tasks', tasks);
    return tasks;
  }

  static generatePickingTasks(orders: any[], products: any[], locations: any[], users: any[]) {
    const tasks = [];
    
    orders.forEach((order, index) => {
      order.line_items.forEach((item: any, itemIndex: number) => {
        tasks.push({
          id: `${order.id}-${itemIndex + 1}`,
          order_id: order.id,
          product_id: item.product_id,
          quantity_requested: item.quantity,
          quantity_picked: 0,
          location_id: locations[Math.floor(Math.random() * locations.length)].id,
          assigned_to: index === 0 ? users[3].id : null,
          status: index === 0 ? 'in_progress' : 'pending',
          priority: order.fulfillment_status === 'pending' ? 'high' : 'normal',
          started_at: index === 0 ? new Date(Date.now() - 45 * 60 * 1000).toISOString() : null,
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
    });

    BrowserStorage.set('picking_tasks', tasks);
    return tasks;
  }

  static generateStockMoveTasks(products: any[], locations: any[], users: any[]) {
    const tasks = [
      {
        id: '1',
        task_type: 'replenishment',
        product_id: products[0].id,
        from_location_id: locations[0].id,
        to_location_id: locations[15].id,
        quantity: 25,
        assigned_to: users[2].id,
        status: 'in_progress',
        priority: 'normal',
        reason: 'Replenish picking location',
        started_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        task_type: 'consolidation',
        product_id: products[1].id,
        from_location_id: locations[3].id,
        to_location_id: locations[7].id,
        quantity: 15,
        assigned_to: null,
        status: 'pending',
        priority: 'low',
        reason: 'Consolidate scattered inventory',
        started_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('stock_move_tasks', tasks);
    return tasks;
  }

  static generateStockMovements(products: any[], locations: any[], users: any[]) {
    const movements = [];
    
    // Generate some historical movements
    for (let i = 0; i < 15; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const fromLocation = locations[Math.floor(Math.random() * locations.length)];
      const toLocation = locations[Math.floor(Math.random() * locations.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      
      movements.push({
        id: `${i + 1}`,
        product_id: product.id,
        from_location_id: fromLocation.id,
        to_location_id: toLocation.id,
        quantity: Math.floor(Math.random() * 50) + 1,
        movement_type: ['receipt', 'shipment', 'transfer', 'adjustment'][Math.floor(Math.random() * 4)],
        reference: `MOV-${String(i + 1).padStart(3, '0')}`,
        notes: `Movement ${i + 1}`,
        performed_by: user.id,
        performed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    BrowserStorage.set('stock_movements', movements);
    return movements;
  }

  static generateChatChannels(users: any[]) {
    const channels = [
      {
        id: '1',
        name: 'General',
        description: 'General warehouse discussion',
        type: 'public',
        created_by: users[0].id,
        is_active: true,
        member_count: users.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Operations',
        description: 'Operations team coordination',
        type: 'public',
        created_by: users[1].id,
        is_active: true,
        member_count: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Urgent Issues',
        description: 'For urgent operational issues',
        type: 'public',
        created_by: users[1].id,
        is_active: true,
        member_count: users.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Management',
        description: 'Management discussions',
        type: 'private',
        created_by: users[0].id,
        is_active: true,
        member_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('chat_channels', channels);
    return channels;
  }

  static generateChatMessages(channels: any[], users: any[]) {
    const messages = [
      {
        id: '1',
        channel_id: channels[0].id,
        user_id: users[1].id,
        content: '¡Buenos días equipo! Recordatorio: tenemos inventario físico programado para la próxima semana.',
        message_type: 'text',
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        channel_id: channels[1].id,
        user_id: users[2].id,
        content: 'Palet PLT-002 completado en ubicación A15. Próximo: PLT-001.',
        message_type: 'text',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        channel_id: channels[1].id,
        user_id: users[3].id,
        content: 'Picking en progreso para pedido ORD-2024-001. ETA: 30 minutos.',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        channel_id: channels[2].id,
        user_id: users[1].id,
        content: 'URGENTE: Verificar stock de ELEC-001 en ubicación A11. Posible discrepancia.',
        message_type: 'text',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        channel_id: channels[0].id,
        user_id: users[4].id,
        content: 'Facturas del día procesadas. Total: $2,160. Pendientes por cobrar: $25,840.',
        message_type: 'text',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    BrowserStorage.set('chat_messages', messages);
    return messages;
  }

  static generateScanDevices() {
    const devices = [
      {
        id: '1',
        device_name: 'Scanner-01',
        device_type: 'handheld',
        serial_number: 'SC001234',
        mac_address: '00:11:22:33:44:55',
        is_active: true,
        battery_level: 85,
        last_seen_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        assigned_to: null,
        location: 'Warehouse Floor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        device_name: 'Scanner-02',
        device_type: 'handheld',
        serial_number: 'SC001235',
        mac_address: '00:11:22:33:44:56',
        is_active: true,
        battery_level: 92,
        last_seen_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        assigned_to: null,
        location: 'Receiving Area',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        device_name: 'Scanner-03',
        device_type: 'fixed',
        serial_number: 'SC001236',
        mac_address: '00:11:22:33:44:57',
        is_active: true,
        battery_level: null,
        last_seen_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        assigned_to: null,
        location: 'Shipping Dock',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('scan_devices', devices);
    return devices;
  }

  static generateScanSessions(devices: any[], users: any[]) {
    const sessions = [
      {
        id: '1',
        device_id: devices[0].id,
        user_id: users[2].id,
        session_type: 'putaway',
        status: 'active',
        started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        ended_at: null,
        scans_count: 15,
        valid_scans: 14,
        invalid_scans: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        device_id: devices[1].id,
        user_id: users[3].id,
        session_type: 'picking',
        status: 'active',
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        ended_at: null,
        scans_count: 8,
        valid_scans: 8,
        invalid_scans: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        device_id: devices[0].id,
        user_id: users[2].id,
        session_type: 'inventory',
        status: 'completed',
        started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        scans_count: 45,
        valid_scans: 43,
        invalid_scans: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('scan_sessions', sessions);
    return sessions;
  }

  static generateLoadingDocks(warehouses: any[]) {
    const docks = [
      {
        id: '1',
        warehouse_id: warehouses[0].id,
        dock_number: 'D001',
        dock_type: 'shipping',
        status: 'occupied',
        max_weight: 40000,
        is_active: true,
        equipment: ['forklift', 'dock_leveler'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        warehouse_id: warehouses[0].id,
        dock_number: 'D002',
        dock_type: 'receiving',
        status: 'available',
        max_weight: 40000,
        is_active: true,
        equipment: ['forklift', 'dock_leveler', 'scale'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        warehouse_id: warehouses[1].id,
        dock_number: 'D003',
        dock_type: 'shipping',
        status: 'available',
        max_weight: 35000,
        is_active: true,
        equipment: ['forklift'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('loading_docks', docks);
    return docks;
  }

  static generateShipments(orders: any[], docks: any[]) {
    const shipments = [
      {
        id: '1',
        shipment_number: 'SHIP-2024-001',
        order_id: orders[0].id,
        dock_id: docks[0].id,
        carrier: 'FedEx',
        tracking_number: 'FX123456789',
        status: 'preparing',
        scheduled_pickup: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        actual_pickup: null,
        weight: 2.5,
        dimensions: '30x25x15',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        shipment_number: 'SHIP-2024-002',
        order_id: orders[1].id,
        dock_id: null,
        carrier: 'UPS',
        tracking_number: 'UP987654321',
        status: 'pending',
        scheduled_pickup: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        actual_pickup: null,
        weight: 1.8,
        dimensions: '25x20x10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('shipments', shipments);
    return shipments;
  }

  static generateLoadingAppointments(docks: any[], shipments: any[]) {
    const appointments = [
      {
        id: '1',
        dock_id: docks[0].id,
        shipment_id: shipments[0].id,
        appointment_type: 'pickup',
        scheduled_start: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        scheduled_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        actual_start: null,
        actual_end: null,
        status: 'scheduled',
        driver_name: 'John Driver',
        truck_license: 'TRK-123',
        notes: 'Standard pickup appointment',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('loading_appointments', appointments);
    return appointments;
  }

  static generateSyncLogs() {
    const logs = [
      {
        id: '1',
        sync_type: 'ecommerce_orders',
        status: 'completed',
        records_processed: 15,
        records_success: 14,
        records_failed: 1,
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        duration_seconds: 300,
        error_message: null,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        sync_type: 'inventory_levels',
        status: 'completed',
        records_processed: 50,
        records_success: 50,
        records_failed: 0,
        started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
        duration_seconds: 120,
        error_message: null,
        created_at: new Date().toISOString()
      }
    ];

    BrowserStorage.set('sync_logs', logs);
    return logs;
  }

  static generateAuditLogs(users: any[]) {
    const logs = [
      {
        id: '1',
        user_id: users[0].id,
        action: 'user_login',
        resource_type: 'authentication',
        resource_id: users[0].id,
        changes: null,
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        user_id: users[2].id,
        action: 'task_completed',
        resource_type: 'putaway_task',
        resource_id: '1',
        changes: { status: { from: 'in_progress', to: 'completed' } },
        ip_address: '192.168.1.101',
        user_agent: 'Scanner App v1.0',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        user_id: users[4].id,
        action: 'invoice_created',
        resource_type: 'invoice',
        resource_id: '1',
        changes: { amount: 1296.00, status: 'sent' },
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0...',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    BrowserStorage.set('audit_logs', logs);
    return logs;
  }
}
