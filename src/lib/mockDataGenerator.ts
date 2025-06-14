import { connectToDatabase } from './mongodb';

export class MockDataGenerator {
  static async clearAllData() {
    try {
      const db = await connectToDatabase();
      console.log('Clearing all MongoDB collections...');
      
      // List of all collections to clear
      const collections = [
        'users', 'products', 'categories', 'warehouses', 'locations', 
        'stock_levels', 'stock_movements', 'pallets', 'ecommerce_orders',
        'putaway_tasks', 'picking_tasks', 'stock_move_tasks',
        'accounts', 'transactions', 'journal_entries', 'journal_entry_lines',
        'invoices', 'contacts', 'payments'
      ];

      for (const collectionName of collections) {
        try {
          await db.collection(collectionName).deleteMany({});
          console.log(`Cleared collection: ${collectionName}`);
        } catch (error) {
          console.warn(`Could not clear collection ${collectionName}:`, error);
        }
      }

      console.log('All MongoDB collections cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing MongoDB data:', error);
      return false;
    }
  }

  static async generateAllMockData() {
    try {
      console.log('Starting MongoDB mock data generation...');
      
      // Clear existing data first
      await this.clearAllData();

      const db = await connectToDatabase();

      // Generate base data
      const users = await this.generateUsers(db);
      const categories = await this.generateCategories(db);
      const warehouses = await this.generateWarehouses(db);
      const locations = await this.generateLocations(db, warehouses);
      const products = await this.generateProducts(db, categories);
      
      // Generate operational data
      const stockLevels = await this.generateStockLevels(db, products, locations);
      const pallets = await this.generatePallets(db, products);
      const ecommerceOrders = await this.generateEcommerceOrders(db, products);
      
      // Generate task data
      await this.generatePutAwayTasks(db, pallets, locations, users);
      await this.generatePickingTasks(db, ecommerceOrders, products, locations, users);
      await this.generateStockMoveTasks(db, products, locations, users);
      
      // Generate accounting data
      const contacts = await this.generateContacts(db);
      const accounts = await this.generateAccounts(db);
      await this.generateTransactions(db, accounts);
      await this.generateInvoices(db, contacts);
      
      console.log('MongoDB mock data generation completed successfully');
      return true;
    } catch (error) {
      console.error('Error generating MongoDB mock data:', error);
      throw error;
    }
  }

  static async generateUsers(db: any) {
    const users = [
      {
        id: 'user-1',
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos.rodriguez@warehouse.com',
        role: { id: 'admin', name: 'admin', displayName: 'Administrador' },
        isActive: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        firstName: 'Maria',
        lastName: 'Lopez',
        email: 'maria.lopez@warehouse.com',
        role: { id: 'operator', name: 'operator', displayName: 'Operador' },
        isActive: true,
        lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-3',
        firstName: 'Juan',
        lastName: 'Martinez',
        email: 'juan.martinez@warehouse.com',
        role: { id: 'supervisor', name: 'supervisor', displayName: 'Supervisor' },
        isActive: true,
        lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];

    await db.collection('users').insertMany(users);
    console.log('Generated users in MongoDB');
    return users;
  }

  static async generateCategories(db: any) {
    const categories = [
      { id: 'cat-1', name: 'Electrónicos', description: 'Productos electrónicos', is_active: true },
      { id: 'cat-2', name: 'Ropa', description: 'Prendas de vestir', is_active: true },
      { id: 'cat-3', name: 'Hogar', description: 'Artículos para el hogar', is_active: true },
      { id: 'cat-4', name: 'Deportes', description: 'Artículos deportivos', is_active: true }
    ];

    await db.collection('categories').insertMany(categories);
    console.log('Generated categories in MongoDB');
    return categories;
  }

  static async generateWarehouses(db: any) {
    const warehouses = [
      {
        id: 'wh-1',
        name: 'Almacén Central Madrid',
        code: 'MAD-01',
        address: 'Calle Industrial 123, Madrid',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'wh-2',
        name: 'Almacén Barcelona',
        code: 'BCN-01',
        address: 'Polígono Industrial, Barcelona',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('warehouses').insertMany(warehouses);
    console.log('Generated warehouses in MongoDB');
    return warehouses;
  }

  static async generateLocations(db: any, warehouses: any[]) {
    const locations = [];
    let locationId = 1;

    for (const warehouse of warehouses) {
      // Generate locations for each warehouse
      for (let aisle = 1; aisle <= 3; aisle++) {
        for (let rack = 1; rack <= 5; rack++) {
          for (let level = 1; level <= 4; level++) {
            locations.push({
              id: `loc-${locationId}`,
              warehouse_id: warehouse.id,
              location_code: `${warehouse.code}-A${aisle}R${rack}L${level}`,
              aisle: aisle.toString(),
              rack: rack.toString(),
              level: level.toString(),
              location_type: 'picking',
              is_active: true,
              max_weight: 1000,
              max_volume: 2.5,
              created_at: new Date().toISOString()
            });
            locationId++;
          }
        }
      }
    }

    await db.collection('locations').insertMany(locations);
    console.log('Generated locations in MongoDB');
    return locations;
  }

  static async generateProducts(db: any, categories: any[]) {
    const products = [
      {
        id: 'prod-1',
        name: 'Smartphone Samsung Galaxy',
        sku: 'ELEC-SAMSUNG-001',
        category_id: 'cat-1',
        description: 'Smartphone de última generación',
        cost_price: 400.00,
        sale_price: 699.99,
        weight: 0.2,
        dimensions: '15x7x0.8 cm',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-2',
        name: 'Camiseta Nike',
        sku: 'ROPA-NIKE-001',
        category_id: 'cat-2',
        description: 'Camiseta deportiva de algodón',
        cost_price: 15.00,
        sale_price: 29.99,
        weight: 0.3,
        dimensions: '30x40x2 cm',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-3',
        name: 'Aspiradora Dyson',
        sku: 'HOGAR-DYSON-001',
        category_id: 'cat-3',
        description: 'Aspiradora sin bolsa de alta potencia',
        cost_price: 200.00,
        sale_price: 399.99,
        weight: 3.5,
        dimensions: '50x30x25 cm',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'prod-4',
        name: 'Balón de Fútbol Adidas',
        sku: 'DEPORTE-ADIDAS-001',
        category_id: 'cat-4',
        description: 'Balón oficial de fútbol',
        cost_price: 20.00,
        sale_price: 39.99,
        weight: 0.4,
        dimensions: '22x22x22 cm',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('products').insertMany(products);
    console.log('Generated products in MongoDB');
    return products;
  }

  static async generateStockLevels(db: any, products: any[], locations: any[]) {
    const stockLevels = [];
    
    for (const product of products) {
      // Generate stock for random locations
      const randomLocations = locations.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 1);
      
      for (const location of randomLocations) {
        stockLevels.push({
          id: `stock-${product.id}-${location.id}`,
          product_id: product.id,
          location_id: location.id,
          quantity_on_hand: Math.floor(Math.random() * 100) + 10,
          quantity_available: Math.floor(Math.random() * 80) + 5,
          quantity_reserved: Math.floor(Math.random() * 20),
          reorder_point: 10,
          max_quantity: 200,
          last_counted_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    }

    await db.collection('stock_levels').insertMany(stockLevels);
    console.log('Generated stock levels in MongoDB');
    return stockLevels;
  }

  static async generatePallets(db: any, products: any[]) {
    const pallets = [];
    
    for (let i = 1; i <= 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      pallets.push({
        id: `pallet-${i}`,
        pallet_number: `PAL-${i.toString().padStart(6, '0')}`,
        product_id: product.id,
        quantity: Math.floor(Math.random() * 50) + 10,
        received_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.3 ? 'pending_putaway' : 'stored',
        created_at: new Date().toISOString()
      });
    }

    await db.collection('pallets').insertMany(pallets);
    console.log('Generated pallets in MongoDB');
    return pallets;
  }

  static async generateEcommerceOrders(db: any, products: any[]) {
    const orders = [];
    
    for (let i = 1; i <= 15; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const orderDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      orders.push({
        id: `order-${i}`,
        order_number: `ORD-${i.toString().padStart(6, '0')}`,
        customer_name: `Cliente ${i}`,
        customer_email: `cliente${i}@example.com`,
        order_date: orderDate.toISOString(),
        total_amount: product.sale_price * quantity,
        warehouse_status: ['pending', 'processing', 'picked', 'shipped'][Math.floor(Math.random() * 4)],
        financial_status: Math.random() > 0.2 ? 'paid' : 'pending',
        items: [
          {
            product_id: product.id,
            quantity: quantity,
            unit_price: product.sale_price
          }
        ],
        created_at: orderDate.toISOString()
      });
    }

    await db.collection('ecommerce_orders').insertMany(orders);
    console.log('Generated ecommerce orders in MongoDB');
    return orders;
  }

  static async generatePutAwayTasks(db: any, pallets: any[], locations: any[], users: any[]) {
    const tasks = [];
    const pendingPallets = pallets.filter(p => p.status === 'pending_putaway');
    
    for (const pallet of pendingPallets) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const user = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null;
      
      tasks.push({
        id: `putaway-${pallet.id}`,
        pallet_id: pallet.id,
        suggested_location_id: location.id,
        assigned_to: user?.id || null,
        status: user ? (Math.random() > 0.5 ? 'in_progress' : 'pending') : 'pending',
        priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
        created_at: new Date().toISOString(),
        started_at: user ? new Date().toISOString() : null
      });
    }

    if (tasks.length > 0) {
      await db.collection('putaway_tasks').insertMany(tasks);
    }
    console.log('Generated putaway tasks in MongoDB');
    return tasks;
  }

  static async generatePickingTasks(db: any, orders: any[], products: any[], locations: any[], users: any[]) {
    const tasks = [];
    const pendingOrders = orders.filter(o => o.warehouse_status === 'pending' || o.warehouse_status === 'processing');
    
    for (const order of pendingOrders) {
      for (const item of order.items) {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const user = Math.random() > 0.6 ? users[Math.floor(Math.random() * users.length)] : null;
        
        tasks.push({
          id: `picking-${order.id}-${item.product_id}`,
          order_id: order.id,
          product_id: item.product_id,
          location_id: location.id,
          quantity_requested: item.quantity,
          quantity_picked: user && Math.random() > 0.5 ? item.quantity : 0,
          assigned_to: user?.id || null,
          status: user ? (Math.random() > 0.5 ? 'in_progress' : 'pending') : 'pending',
          priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
          created_at: new Date().toISOString(),
          started_at: user ? new Date().toISOString() : null
        });
      }
    }

    if (tasks.length > 0) {
      await db.collection('picking_tasks').insertMany(tasks);
    }
    console.log('Generated picking tasks in MongoDB');
    return tasks;
  }

  static async generateStockMoveTasks(db: any, products: any[], locations: any[], users: any[]) {
    const tasks = [];
    
    for (let i = 1; i <= 8; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const fromLocation = locations[Math.floor(Math.random() * locations.length)];
      const toLocation = locations[Math.floor(Math.random() * locations.length)];
      const user = Math.random() > 0.7 ? users[Math.floor(Math.random() * users.length)] : null;
      
      if (fromLocation.id !== toLocation.id) {
        tasks.push({
          id: `stockmove-${i}`,
          product_id: product.id,
          from_location_id: fromLocation.id,
          to_location_id: toLocation.id,
          quantity: Math.floor(Math.random() * 20) + 1,
          task_type: Math.random() > 0.5 ? 'replenishment' : 'consolidation',
          assigned_to: user?.id || null,
          status: user ? (Math.random() > 0.5 ? 'in_progress' : 'pending') : 'pending',
          priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)],
          created_at: new Date().toISOString(),
          started_at: user ? new Date().toISOString() : null
        });
      }
    }

    if (tasks.length > 0) {
      await db.collection('stock_move_tasks').insertMany(tasks);
    }
    console.log('Generated stock move tasks in MongoDB');
    return tasks;
  }

  static async generateContacts(db: any) {
    const contacts = [
      {
        id: 'contact-1',
        name: 'Distribuidora Martínez S.L.',
        contact_type: 'supplier',
        email: 'contacto@distribuidoramartinez.com',
        phone: '+34 91 123 4567',
        tax_id: 'B12345678',
        address: 'Calle Proveedores 123, Madrid',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'contact-2',
        name: 'TechShop Barcelona',
        contact_type: 'customer',
        email: 'ventas@techshopbcn.com',
        phone: '+34 93 987 6543',
        tax_id: 'A87654321',
        address: 'Paseo de Gracia 456, Barcelona',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'contact-3',
        name: 'Almacenes López',
        contact_type: 'both',
        email: 'info@almaceneslopez.com',
        phone: '+34 95 555 0123',
        tax_id: 'C11223344',
        address: 'Polígono Industrial Sur, Sevilla',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('contacts').insertMany(contacts);
    console.log('Generated contacts in MongoDB');
    return contacts;
  }

  static async generateAccounts(db: any) {
    const accounts = [
      // Activos
      { id: 'acc-1', code: '100', name: 'Caja', account_type: 'asset', description: 'Efectivo en caja', is_active: true },
      { id: 'acc-2', code: '102', name: 'Bancos', account_type: 'asset', description: 'Cuentas corrientes bancarias', is_active: true },
      { id: 'acc-3', code: '110', name: 'Clientes', account_type: 'asset', description: 'Cuentas por cobrar a clientes', is_active: true },
      { id: 'acc-4', code: '120', name: 'Inventarios', account_type: 'asset', description: 'Mercancías en stock', is_active: true },
      
      // Pasivos
      { id: 'acc-5', code: '200', name: 'Proveedores', account_type: 'liability', description: 'Cuentas por pagar a proveedores', is_active: true },
      { id: 'acc-6', code: '210', name: 'IVA por Pagar', account_type: 'liability', description: 'Impuesto sobre el valor añadido', is_active: true },
      
      // Patrimonio
      { id: 'acc-7', code: '300', name: 'Capital', account_type: 'equity', description: 'Capital social', is_active: true },
      
      // Ingresos
      { id: 'acc-8', code: '400', name: 'Ventas', account_type: 'revenue', description: 'Ingresos por ventas', is_active: true },
      
      // Gastos
      { id: 'acc-9', code: '500', name: 'Costo de Ventas', account_type: 'expense', description: 'Costo de mercancías vendidas', is_active: true },
      { id: 'acc-10', code: '510', name: 'Gastos Operativos', account_type: 'expense', description: 'Gastos de operación', is_active: true }
    ];

    await db.collection('accounts').insertMany(accounts);
    console.log('Generated accounts in MongoDB');
    return accounts;
  }

  static async generateTransactions(db: any, accounts: any[]) {
    const transactions = [];
    const journalEntries = [];
    const journalEntryLines = [];

    for (let i = 1; i <= 10; i++) {
      const transactionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const amount = Math.floor(Math.random() * 5000) + 100;

      const transaction = {
        id: `trans-${i}`,
        transaction_number: `T-${i.toString().padStart(6, '0')}`,
        description: `Transacción de ejemplo ${i}`,
        transaction_date: transactionDate.toISOString().split('T')[0],
        reference: `REF-${i}`,
        total_amount: amount,
        status: Math.random() > 0.2 ? 'posted' : 'draft',
        created_at: transactionDate.toISOString(),
        updated_at: transactionDate.toISOString()
      };

      const journalEntry = {
        id: `journal-${i}`,
        entry_number: `JE-${i.toString().padStart(6, '0')}`,
        transaction_id: transaction.id,
        description: transaction.description,
        entry_date: transaction.transaction_date,
        reference: transaction.reference,
        total_amount: amount,
        status: transaction.status,
        created_at: transactionDate.toISOString(),
        updated_at: transactionDate.toISOString()
      };

      // Create debit and credit entries
      const debitAccount = accounts[Math.floor(Math.random() * accounts.length)];
      const creditAccount = accounts[Math.floor(Math.random() * accounts.length)];

      journalEntryLines.push({
        id: `line-${i}-1`,
        journal_entry_id: journalEntry.id,
        account_id: debitAccount.id,
        description: `Débito - ${transaction.description}`,
        debit_amount: amount,
        credit_amount: 0,
        line_number: 1,
        created_at: transactionDate.toISOString()
      });

      journalEntryLines.push({
        id: `line-${i}-2`,
        journal_entry_id: journalEntry.id,
        account_id: creditAccount.id,
        description: `Crédito - ${transaction.description}`,
        debit_amount: 0,
        credit_amount: amount,
        line_number: 2,
        created_at: transactionDate.toISOString()
      });

      transactions.push(transaction);
      journalEntries.push(journalEntry);
    }

    await db.collection('transactions').insertMany(transactions);
    await db.collection('journal_entries').insertMany(journalEntries);
    await db.collection('journal_entry_lines').insertMany(journalEntryLines);
    
    console.log('Generated transactions and journal entries in MongoDB');
    return { transactions, journalEntries, journalEntryLines };
  }

  static async generateInvoices(db: any, contacts: any[]) {
    const invoices = [];
    
    for (let i = 1; i <= 12; i++) {
      const contact = contacts[Math.floor(Math.random() * contacts.length)];
      const invoiceDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
      const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const subtotal = Math.floor(Math.random() * 3000) + 200;
      const taxAmount = subtotal * 0.21; // 21% IVA
      const totalAmount = subtotal + taxAmount;
      const paidAmount = Math.random() > 0.3 ? totalAmount : Math.random() * totalAmount;

      invoices.push({
        id: `invoice-${i}`,
        invoice_number: `${contact.contact_type === 'supplier' ? 'C' : 'V'}-${i.toString().padStart(6, '0')}`,
        contact_id: contact.id,
        invoice_type: contact.contact_type === 'supplier' ? 'purchase' : 'sale',
        invoice_date: invoiceDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        status: paidAmount >= totalAmount ? 'paid' : (new Date() > dueDate ? 'overdue' : 'sent'),
        notes: `Factura de ejemplo ${i}`,
        created_at: invoiceDate.toISOString(),
        updated_at: invoiceDate.toISOString()
      });
    }

    await db.collection('invoices').insertMany(invoices);
    console.log('Generated invoices in MongoDB');
    return invoices;
  }
}
