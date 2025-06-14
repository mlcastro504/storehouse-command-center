import { connectToDatabase } from './mongodb';

function isMockCollection(obj: any): obj is { deleteMany: Function } {
  return typeof obj?.deleteMany === 'function';
}

export async function hasExistingData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    const products = await db.collection('products').find({}).limit(1).toArray();
    return products.length > 0;
  } catch (error) {
    console.error('Error checking existing data:', error);
    return false;
  }
}

export async function clearAllData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();
    const collections = ['users', 'products', 'categories', 'warehouses', 'locations', 'stock_levels', 'suppliers'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      if (isMockCollection(collection)) {
        await collection.deleteMany({});
      } else if (typeof collection.deleteOne === 'function') {
        // REST API fallback: delete all via repeated deleteOne.
        const docs = await collection.find({}).toArray();
        for (const doc of docs) {
          // Try both _id and id fields for best coverage
          if (doc.id) {
            await collection.deleteOne({ id: doc.id });
          } else if (doc._id?.toString) {
            await collection.deleteOne({ _id: doc._id });
          }
        }
      }
    }
    
    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

export async function generateMockData(): Promise<boolean> {
  try {
    const db = await connectToDatabase();

    // ----------- Mock Users, Suppliers, Categories, Warehouses, Locations, Products, Stock Levels ------------
    // Mock Users
    const users = [
      { id: 'user1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: { name: 'admin', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user2', email: 'manager@example.com', firstName: 'Manager', lastName: 'User', role: { name: 'manager', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user3', email: 'employee@example.com', firstName: 'Employee', lastName: 'User', role: { name: 'employee', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() }
    ];
    const usersCol = db.collection('users');
    if (isMockCollection(usersCol)) {
      await usersCol.deleteMany({});
    } else if (typeof usersCol.deleteOne === 'function') {
      const docs = await usersCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await usersCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await usersCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await usersCol.insertMany ? await usersCol.insertMany(users) : await Promise.all(users.map(u => usersCol.insertOne(u)));

    // Mock Suppliers
    const suppliers = [
      { id: 'supplier1', name: 'Acme Corp', contact_email: 'contact@acme.com', is_active: true },
      { id: 'supplier2', name: 'Beta Industries', contact_email: 'contact@beta.com', is_active: true }
    ];
    const suppliersCol = db.collection('suppliers');
    if (isMockCollection(suppliersCol)) {
      await suppliersCol.deleteMany({});
    } else if (typeof suppliersCol.deleteOne === 'function') {
      const docs = await suppliersCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await suppliersCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await suppliersCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await suppliersCol.insertMany ? await suppliersCol.insertMany(suppliers) : await Promise.all(suppliers.map(u => suppliersCol.insertOne(u)));

    // Mock Categories
    const categories = [
      { id: 'category1', name: 'Electronics', description: 'Electronic gadgets' },
      { id: 'category2', name: 'Clothing', description: 'Apparel and accessories' }
    ];
    const categoriesCol = db.collection('categories');
    if (isMockCollection(categoriesCol)) {
      await categoriesCol.deleteMany({});
    } else if (typeof categoriesCol.deleteOne === 'function') {
      const docs = await categoriesCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await categoriesCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await categoriesCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await categoriesCol.insertMany ? await categoriesCol.insertMany(categories) : await Promise.all(categories.map(u => categoriesCol.insertOne(u)));

    // Mock Warehouses
    const warehouses = [
      { id: 'warehouse1', name: 'Main Warehouse', location: '123 Main St' },
      { id: 'warehouse2', name: 'Secondary Warehouse', location: '456 Elm St' }
    ];
    const warehousesCol = db.collection('warehouses');
    if (isMockCollection(warehousesCol)) {
      await warehousesCol.deleteMany({});
    } else if (typeof warehousesCol.deleteOne === 'function') {
      const docs = await warehousesCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await warehousesCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await warehousesCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await warehousesCol.insertMany ? await warehousesCol.insertMany(warehouses) : await Promise.all(warehouses.map(u => warehousesCol.insertOne(u)));

    // Mock Locations
    const locations = [
      { id: 'location1', code: 'A1', name: 'Aisle 1', warehouse_id: 'warehouse1', type: 'aisle' },
      { id: 'location2', code: 'B2', name: 'Shelf 2', warehouse_id: 'warehouse1', type: 'shelf' }
    ];
    const locationsCol = db.collection('locations');
    if (isMockCollection(locationsCol)) {
      await locationsCol.deleteMany({});
    } else if (typeof locationsCol.deleteOne === 'function') {
      const docs = await locationsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await locationsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await locationsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await locationsCol.insertMany ? await locationsCol.insertMany(locations) : await Promise.all(locations.map(u => locationsCol.insertOne(u)));

    // Mock Products
    const products = [
      { id: 'product1', sku: 'EL001', name: 'Laptop', description: 'High-performance laptop', category_id: 'category1', supplier_id: 'supplier1', cost_price: 1200, sale_price: 1500 },
      { id: 'product2', sku: 'CL001', name: 'T-shirt', description: 'Cotton T-shirt', category_id: 'category2', supplier_id: 'supplier2', cost_price: 15, sale_price: 25 }
    ];
    const productsCol = db.collection('products');
    if (isMockCollection(productsCol)) {
      await productsCol.deleteMany({});
    } else if (typeof productsCol.deleteOne === 'function') {
      const docs = await productsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await productsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await productsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await productsCol.insertMany ? await productsCol.insertMany(products) : await Promise.all(products.map(u => productsCol.insertOne(u)));

    // Mock Stock Levels
    const stockLevels = [
      { id: 'stock1', product_id: 'product1', location_id: 'location1', quantity: 10 },
      { id: 'stock2', product_id: 'product2', location_id: 'location2', quantity: 100 }
    ];
    const stockCol = db.collection('stock_levels');
    if (isMockCollection(stockCol)) {
      await stockCol.deleteMany({});
    } else if (typeof stockCol.deleteOne === 'function') {
      const docs = await stockCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await stockCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await stockCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await stockCol.insertMany ? await stockCol.insertMany(stockLevels) : await Promise.all(stockLevels.map(u => stockCol.insertOne(u)));

    // ------------ Ecommerce Connections/Products/Orders --------------
    // Ecommerce Connections
    const ecommerceConnections = [
      { id: "ecconn1", platform_id: "shopify", store_name: "Shopify Demo", sync_enabled: true, user_id: "user1", is_active: true, created_at: new Date(), updated_at: new Date(), settings: {} },
      { id: "ecconn2", platform_id: "wocommerce", store_name: "Woo Sample", sync_enabled: true, user_id: "user1", is_active: true, created_at: new Date(), updated_at: new Date(), settings: {} },
    ];
    const ecConnectionsCol = db.collection("ecommerce_connections");
    if (isMockCollection(ecConnectionsCol)) {
      await ecConnectionsCol.deleteMany({});
    } else if (typeof ecConnectionsCol.deleteOne === 'function') {
      const docs = await ecConnectionsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await ecConnectionsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await ecConnectionsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await ecConnectionsCol.insertMany ? await ecConnectionsCol.insertMany(ecommerceConnections) : await Promise.all(ecommerceConnections.map(u => ecConnectionsCol.insertOne(u)));

    // Ecommerce Products
    const ecommerceProducts = [
      { id: "ecprod1", connection_id: "ecconn1", external_product_id: "sh-001", sku: "EL001", title: "Shopify Laptop", sync_status: "synced", created_at: new Date(), updated_at: new Date(), images: [], variants: [] },
      { id: "ecprod2", connection_id: "ecconn2", external_product_id: "woo-001", sku: "CL001", title: "Woo T-shirt", sync_status: "synced", created_at: new Date(), updated_at: new Date(), images: [], variants: [] },
    ];
    const ecProductsCol = db.collection("ecommerce_products");
    if (isMockCollection(ecProductsCol)) {
      await ecProductsCol.deleteMany({});
    } else if (typeof ecProductsCol.deleteOne === 'function') {
      const docs = await ecProductsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await ecProductsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await ecProductsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await ecProductsCol.insertMany ? await ecProductsCol.insertMany(ecommerceProducts) : await Promise.all(ecommerceProducts.map(u => ecProductsCol.insertOne(u)));

    // Ecommerce Orders
    const now = new Date();
    const yesterday = new Date(Date.now() - 864e5);
    const twoDaysAgo = new Date(Date.now() - 1728e5);

    const ecommerceOrders = [
      {
        id: "ecorder1",
        connection_id: "ecconn1",
        external_order_id: "order-001",
        order_number: "SHOP-1001",
        total_amount: 1500,
        currency: "USD",
        order_date: now.toISOString(),
        customer_email: "shopper1@email.com",
        customer_name: "Alice Shopify",
        customer_phone: "+1111111111",
        sync_status: "synced",
        warehouse_status: "pending",
        financial_status: "paid",
        fulfillment_status: "unfulfilled",
        shipping_address: { street: "Shopify Ave 1", city: "CityX", state: "StateY", postal_code: "10001", country: "USA" },
        billing_address: { street: "Shopify Ave 1", city: "CityX", state: "StateY", postal_code: "10001", country: "USA" },
        line_items: [
          { product_id: "product1", product_name: "Laptop", sku: "EL001", quantity: 2, unit_price: 1200, total_price: 2400 }
        ],
        last_synced_at: now.toISOString(),
        created_at: now,
        updated_at: now,
      },
      {
        id: "ecorder2",
        connection_id: "ecconn1",
        external_order_id: "order-002",
        order_number: "SHOP-1002",
        total_amount: 75,
        currency: "USD",
        order_date: yesterday.toISOString(),
        customer_email: "bob@email.com",
        customer_name: "Bob Retail",
        customer_phone: "+1222222222",
        sync_status: "synced",
        warehouse_status: "processing",
        financial_status: "paid",
        fulfillment_status: "processing",
        shipping_address: { street: "Market Rd.", city: "Metro", state: "ST", postal_code: "20002", country: "USA" },
        billing_address: { street: "Market Rd.", city: "Metro", state: "ST", postal_code: "20002", country: "USA" },
        line_items: [
          { product_id: "product2", product_name: "T-shirt", sku: "CL001", quantity: 5, unit_price: 15, total_price: 75 }
        ],
        last_synced_at: yesterday.toISOString(),
        created_at: yesterday,
        updated_at: yesterday,
      },
      {
        id: "ecorder3",
        connection_id: "ecconn2",
        external_order_id: "order-woo-101",
        order_number: "WOO-101",
        total_amount: 100,
        currency: "USD",
        order_date: twoDaysAgo.toISOString(),
        customer_email: "woo@email.com",
        customer_name: "Wendy Woo",
        customer_phone: "+1333333333",
        sync_status: "synced",
        warehouse_status: "fulfilled",
        financial_status: "paid",
        fulfillment_status: "fulfilled",
        shipping_address: { street: "Woo Blvd.", city: "Lima", state: "PI", postal_code: "30003", country: "Peru" },
        billing_address: { street: "Woo Blvd.", city: "Lima", state: "PI", postal_code: "30003", country: "Peru" },
        line_items: [
          { product_id: "product2", product_name: "T-shirt", sku: "CL001", quantity: 2, unit_price: 15, total_price: 30 },
          { product_id: "product1", product_name: "Laptop", sku: "EL001", quantity: 1, unit_price: 1200, total_price: 1200 }
        ],
        last_synced_at: twoDaysAgo.toISOString(),
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo,
      },
    ];
    const ecOrdersCol = db.collection("ecommerce_orders");
    if (isMockCollection(ecOrdersCol)) {
      await ecOrdersCol.deleteMany({});
    } else if (typeof ecOrdersCol.deleteOne === 'function') {
      const docs = await ecOrdersCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await ecOrdersCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await ecOrdersCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await ecOrdersCol.insertMany ? await ecOrdersCol.insertMany(ecommerceOrders) : await Promise.all(ecommerceOrders.map(u => ecOrdersCol.insertOne(u)));

    // Picking Tasks
    const pickingTasks = [
      {
        id: "pick1",
        task_number: "PT-EC-1",
        order_id: "ecorder1",
        product_id: "product1",
        quantity_requested: 2,
        quantity_picked: 0,
        source_location_id: "location1",
        destination_location_id: "location2",
        task_type: "sale",
        priority: "urgent",
        status: "pending",
        assigned_to: null,
        assigned_at: null,
        started_at: null,
        completed_at: null,
        estimated_duration_minutes: 10,
        validation_code_required: false,
        notes: "Pedido Shopify #1001",
        created_by: "user1",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        user_id: "user1",
        channel_origin: "shopify",
        is_training_mode: false,
      },
      {
        id: "pick2",
        task_number: "PT-EC-2",
        order_id: "ecorder2",
        product_id: "product2",
        quantity_requested: 5,
        quantity_picked: 0,
        source_location_id: "location2",
        destination_location_id: "location1",
        task_type: "sale",
        priority: "high",
        status: "assigned",
        assigned_to: "user2",
        assigned_at: yesterday.toISOString(),
        started_at: null,
        completed_at: null,
        estimated_duration_minutes: 8,
        validation_code_required: false,
        notes: "Pedido Shopify #1002",
        created_by: "user2",
        created_at: yesterday.toISOString(),
        updated_at: yesterday.toISOString(),
        user_id: "user2",
        channel_origin: "shopify",
        is_training_mode: false,
      },
      {
        id: "pick3",
        task_number: "PT-EC-3",
        order_id: "ecorder3",
        product_id: "product2",
        quantity_requested: 2,
        quantity_picked: 2,
        source_location_id: "location2",
        destination_location_id: "location1",
        task_type: "sale",
        priority: "medium",
        status: "completed",
        assigned_to: "user3",
        assigned_at: twoDaysAgo.toISOString(),
        started_at: twoDaysAgo.toISOString(),
        completed_at: now.toISOString(),
        estimated_duration_minutes: 5,
        validation_code_required: false,
        notes: "Pedido Woo #101",
        created_by: "user3",
        created_at: twoDaysAgo.toISOString(),
        updated_at: now.toISOString(),
        user_id: "user3",
        channel_origin: "wocommerce",
        is_training_mode: false,
      },
    ];
    const pickingTasksCol = db.collection("picking_tasks");
    if (isMockCollection(pickingTasksCol)) {
      await pickingTasksCol.deleteMany({});
    } else if (typeof pickingTasksCol.deleteOne === 'function') {
      const docs = await pickingTasksCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await pickingTasksCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await pickingTasksCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await pickingTasksCol.insertMany ? await pickingTasksCol.insertMany(pickingTasks) : await Promise.all(pickingTasks.map(u => pickingTasksCol.insertOne(u)));

    // Picking Lines
    const pickingLines = [
      {
        id: "pickingline1",
        picking_task_id: "pick1",
        product_id: "product1",
        location_id: "location1",
        quantity_to_pick: 2,
        quantity_picked: 0,
        status: "pending",
        sequence_number: 1,
        scanned_barcode: "EL001",
        picked_by: null,
        picked_at: null,
        notes: "",
        validation_errors: [],
        user_id: "user1"
      },
      {
        id: "pickingline2",
        picking_task_id: "pick2",
        product_id: "product2",
        location_id: "location2",
        quantity_to_pick: 5,
        quantity_picked: 0,
        status: "pending",
        sequence_number: 1,
        scanned_barcode: "CL001",
        picked_by: null,
        picked_at: null,
        notes: "",
        validation_errors: [],
        user_id: "user2"
      },
      {
        id: "pickingline3",
        picking_task_id: "pick3",
        product_id: "product2",
        location_id: "location2",
        quantity_to_pick: 2,
        quantity_picked: 2,
        status: "picked",
        sequence_number: 1,
        scanned_barcode: "CL001",
        picked_by: "user3",
        picked_at: now.toISOString(),
        notes: "",
        validation_errors: [],
        user_id: "user3"
      }
    ];
    const pickingLinesCol = db.collection('picking_lines');
    if (isMockCollection(pickingLinesCol)) {
      await pickingLinesCol.deleteMany({});
    } else if (typeof pickingLinesCol.deleteOne === 'function') {
      const docs = await pickingLinesCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await pickingLinesCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await pickingLinesCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await pickingLinesCol.insertMany ? await pickingLinesCol.insertMany(pickingLines) : await Promise.all(pickingLines.map(u => pickingLinesCol.insertOne(u)));

    // Workflows
    const workflows = [
      { id: "flow1", name: "Put Away Standard", active: true, steps: ["Recepción", "Asignar Ubicación", "Almacenar"], created_at: new Date(), updated_at: new Date() }
    ];
    const workflowsCol = db.collection("workflows");
    if (isMockCollection(workflowsCol)) {
      await workflowsCol.deleteMany({});
    } else if (typeof workflowsCol.deleteOne === 'function') {
      const docs = await workflowsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await workflowsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await workflowsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await workflowsCol.insertMany ? await workflowsCol.insertMany(workflows) : await Promise.all(workflows.map(u => workflowsCol.insertOne(u)));

    // Accounting Data
    const accounts = [
      { id: "acc1", code: "1000", name: "Cash", account_type: "asset", account_nature: "debit", is_active: true, level: 1, created_at: new Date(), updated_at: new Date(), created_by: "user1" },
      { id: "acc2", code: "2000", name: "Sales Revenue", account_type: "revenue", account_nature: "credit", is_active: true, level: 1, created_at: new Date(), updated_at: new Date(), created_by: "user1" }
    ];
    const accountsCol = db.collection("accounts");
    if (isMockCollection(accountsCol)) {
      await accountsCol.deleteMany({});
    } else if (typeof accountsCol.deleteOne === 'function') {
      const docs = await accountsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await accountsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await accountsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await accountsCol.insertMany ? await accountsCol.insertMany(accounts) : await Promise.all(accounts.map(u => accountsCol.insertOne(u)));

    const contacts = [
      { id: "contact1", contact_number: "C001", name: "John Customer", email: "john@example.com", contact_type: "customer", payment_terms: "30 days", currency: "USD", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: "contact2", contact_number: "S001", name: "Acme Corp", email: "contact@acme.com", contact_type: "supplier", payment_terms: "15 days", currency: "USD", is_active: true, created_at: new Date(), updated_at: new Date() }
    ];
    const contactsCol = db.collection("contacts");
    if (isMockCollection(contactsCol)) {
      await contactsCol.deleteMany({});
    } else if (typeof contactsCol.deleteOne === 'function') {
      const docs = await contactsCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await contactsCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await contactsCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await contactsCol.insertMany ? await contactsCol.insertMany(contacts) : await Promise.all(contacts.map(u => contactsCol.insertOne(u)));

    const journalEntries = [
      { id: "je1", entry_number: "JE-0001", description: "Sale of goods", entry_date: new Date().toISOString(), total_amount: 1500, status: "posted", period_id: "2024M06", created_by: "user1", created_at: new Date(), updated_at: new Date() }
    ];
    const journalEntriesCol = db.collection("journal_entries");
    if (isMockCollection(journalEntriesCol)) {
      await journalEntriesCol.deleteMany({});
    } else if (typeof journalEntriesCol.deleteOne === 'function') {
      const docs = await journalEntriesCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await journalEntriesCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await journalEntriesCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await journalEntriesCol.insertMany ? await journalEntriesCol.insertMany(journalEntries) : await Promise.all(journalEntries.map(u => journalEntriesCol.insertOne(u)));

    const invoices = [
      { id: "inv1", invoice_number: "INV-001", contact_id: "contact1", invoice_type: "sale", invoice_date: new Date().toISOString(), currency: "USD", exchange_rate: 1, subtotal: 1200, tax_amount: 180, total_amount: 1380, paid_amount: 0, status: "sent", payment_status: "unpaid", created_by: "user1", created_at: new Date(), updated_at: new Date() }
    ];
    const invoicesCol = db.collection("invoices");
    if (isMockCollection(invoicesCol)) {
      await invoicesCol.deleteMany({});
    } else if (typeof invoicesCol.deleteOne === 'function') {
      const docs = await invoicesCol.find({}).toArray();
      for (const doc of docs) {
        if (doc.id) {
          await invoicesCol.deleteOne({ id: doc.id });
        } else if (doc._id?.toString) {
          await invoicesCol.deleteOne({ _id: doc._id });
        }
      }
    }
    await invoicesCol.insertMany ? await invoicesCol.insertMany(invoices) : await Promise.all(invoices.map(u => invoicesCol.insertOne(u)));

    console.log('Mock data generated successfully (Ecommerce & Picking End-to-End enhanced)');
    return true;
  } catch (error) {
    console.error('Error generating mock data:', error);
    return false;
  }
}

export class MockDataGenerator {
  static async hasExistingData(): Promise<boolean> {
    return await hasExistingData();
  }

  static async clearAllData(): Promise<boolean> {
    return await clearAllData();
  }

  static async generateAllMockData(): Promise<boolean> {
    return await generateMockData();
  }
}
