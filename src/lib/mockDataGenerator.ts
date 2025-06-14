import { connectToDatabase } from './mongodb';

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
      await db.collection(collectionName).deleteMany({});
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

    // Mock Users
    const users = [
      { id: 'user1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: { name: 'admin', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user2', email: 'manager@example.com', firstName: 'Manager', lastName: 'User', role: { name: 'manager', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() },
      { id: 'user3', email: 'employee@example.com', firstName: 'Employee', lastName: 'User', role: { name: 'employee', permissions: [] }, isActive: true, lastLoginAt: new Date(), createdAt: new Date() }
    ];
    await db.collection('users').insertMany(users);

    // Mock Suppliers
    const suppliers = [
      { id: 'supplier1', name: 'Acme Corp', contact_email: 'contact@acme.com', is_active: true },
      { id: 'supplier2', name: 'Beta Industries', contact_email: 'contact@beta.com', is_active: true }
    ];
    await db.collection('suppliers').insertMany(suppliers);

    // Mock Categories
    const categories = [
      { id: 'category1', name: 'Electronics', description: 'Electronic gadgets' },
      { id: 'category2', name: 'Clothing', description: 'Apparel and accessories' }
    ];
    await db.collection('categories').insertMany(categories);

    // Mock Warehouses
    const warehouses = [
      { id: 'warehouse1', name: 'Main Warehouse', location: '123 Main St' },
      { id: 'warehouse2', name: 'Secondary Warehouse', location: '456 Elm St' }
    ];
    await db.collection('warehouses').insertMany(warehouses);

    // Mock Locations
    const locations = [
      { id: 'location1', code: 'A1', name: 'Aisle 1', warehouse_id: 'warehouse1', type: 'aisle' },
      { id: 'location2', code: 'B2', name: 'Shelf 2', warehouse_id: 'warehouse1', type: 'shelf' }
    ];
    await db.collection('locations').insertMany(locations);

    // Mock Products
    const products = [
      { id: 'product1', sku: 'EL001', name: 'Laptop', description: 'High-performance laptop', category_id: 'category1', supplier_id: 'supplier1', cost_price: 1200, sale_price: 1500 },
      { id: 'product2', sku: 'CL001', name: 'T-shirt', description: 'Cotton T-shirt', category_id: 'category2', supplier_id: 'supplier2', cost_price: 15, sale_price: 25 }
    ];
    await db.collection('products').insertMany(products);

    // Mock Stock Levels
    const stockLevels = [
      { id: 'stock1', product_id: 'product1', location_id: 'location1', quantity: 10 },
      { id: 'stock2', product_id: 'product2', location_id: 'location2', quantity: 100 }
    ];
    await db.collection('stock_levels').insertMany(stockLevels);

    // ---- Picking Orders & Workflow ----
    const pickingTasks = [
      {
        id: "pickingtask1",
        task_number: "PT-1001",
        product_id: "product1",
        quantity_requested: 5,
        quantity_picked: 5,
        source_location_id: "location1",
        destination_location_id: "location2",
        task_type: "sale",
        priority: "high",
        status: "completed",
        assigned_to: "user2",
        assigned_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        estimated_duration_minutes: 10,
        validation_code_required: false,
        notes: "Pedido ecommerce #1001",
        created_by: "user1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "user2",
        is_training_mode: false
      },
      {
        id: "pickingtask2",
        task_number: "PT-1002",
        product_id: "product2",
        quantity_requested: 10,
        quantity_picked: 4,
        source_location_id: "location2",
        destination_location_id: "location1",
        task_type: "sale",
        priority: "medium",
        status: "in_progress",
        assigned_to: "user3",
        assigned_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        completed_at: "",
        estimated_duration_minutes: 8,
        validation_code_required: false,
        notes: "Tarea pendiente",
        created_by: "user1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "user3",
        is_training_mode: false
      }
    ];
    await db.collection('picking_tasks').insertMany(pickingTasks);

    const pickingLines = [
      {
        id: "pickingline1",
        picking_task_id: "pickingtask1",
        product_id: "product1",
        location_id: "location1",
        quantity_to_pick: 5,
        quantity_picked: 5,
        status: "picked",
        sequence_number: 1,
        scanned_barcode: "EL001",
        picked_by: "user2",
        picked_at: new Date().toISOString(),
        notes: "",
        validation_errors: [],
        user_id: "user2"
      },
      {
        id: "pickingline2",
        picking_task_id: "pickingtask2",
        product_id: "product2",
        location_id: "location2",
        quantity_to_pick: 10,
        quantity_picked: 4,
        status: "short_picked",
        sequence_number: 1,
        scanned_barcode: "CL001",
        picked_by: "user3",
        picked_at: "",
        notes: "Faltan 6 unidades",
        validation_errors: [],
        user_id: "user3"
      }
    ];
    await db.collection('picking_lines').insertMany(pickingLines);

    // ---- Workflow Example (very simple) ----
    const workflows = [
      { id: "flow1", name: "Put Away Standard", active: true, steps: ["Recepción", "Asignar Ubicación", "Almacenar"], created_at: new Date(), updated_at: new Date() }
    ];
    await db.collection("workflows").insertMany(workflows);

    // ---- Accounting Data ----
    const accounts = [
      { id: "acc1", code: "1000", name: "Cash", account_type: "asset", account_nature: "debit", is_active: true, level: 1, created_at: new Date(), updated_at: new Date(), created_by: "user1" },
      { id: "acc2", code: "2000", name: "Sales Revenue", account_type: "revenue", account_nature: "credit", is_active: true, level: 1, created_at: new Date(), updated_at: new Date(), created_by: "user1" }
    ];
    await db.collection("accounts").insertMany(accounts);

    const contacts = [
      { id: "contact1", contact_number: "C001", name: "John Customer", email: "john@example.com", contact_type: "customer", payment_terms: "30 days", currency: "USD", is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: "contact2", contact_number: "S001", name: "Acme Corp", email: "contact@acme.com", contact_type: "supplier", payment_terms: "15 days", currency: "USD", is_active: true, created_at: new Date(), updated_at: new Date() }
    ];
    await db.collection("contacts").insertMany(contacts);

    const journalEntries = [
      { id: "je1", entry_number: "JE-0001", description: "Sale of goods", entry_date: new Date().toISOString(), total_amount: 1500, status: "posted", period_id: "2024M06", created_by: "user1", created_at: new Date(), updated_at: new Date() }
    ];
    await db.collection("journal_entries").insertMany(journalEntries);

    const invoices = [
      { id: "inv1", invoice_number: "INV-001", contact_id: "contact1", invoice_type: "sale", invoice_date: new Date().toISOString(), currency: "USD", exchange_rate: 1, subtotal: 1200, tax_amount: 180, total_amount: 1380, paid_amount: 0, status: "sent", payment_status: "unpaid", created_by: "user1", created_at: new Date(), updated_at: new Date() }
    ];
    await db.collection("invoices").insertMany(invoices);

    // ---- E-commerce Data ----
    const ecommerceConnections = [
      { id: "ecconn1", platform_id: "shopify", store_name: "Shopify Demo", sync_enabled: true, user_id: "user1", is_active: true, created_at: new Date(), updated_at: new Date(), settings: {} }
    ];
    await db.collection("ecommerce_connections").insertMany(ecommerceConnections);

    const ecommerceProducts = [
      { id: "ecprod1", connection_id: "ecconn1", external_product_id: "sh-001", sku: "EL001", title: "Shopify Laptop", sync_status: "synced", created_at: new Date(), updated_at: new Date(), images: [], variants: [] }
    ];
    await db.collection("ecommerce_products").insertMany(ecommerceProducts);

    const ecommerceOrders = [
      { id: "ecorder1", connection_id: "ecconn1", external_order_id: "order-001", order_number: "SHOP-1001", total_amount: 1500, currency: "USD", order_date: new Date().toISOString(), line_items: [], sync_status: "synced", warehouse_status: "pending", created_at: new Date(), updated_at: new Date() }
    ];
    await db.collection("ecommerce_orders").insertMany(ecommerceOrders);

    console.log('Mock data generated successfully');
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
