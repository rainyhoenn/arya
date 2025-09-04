import { Database } from "bun:sqlite";

export interface ConrodRecord {
  id: number;
  serialNumber: string;
  conrodName: string;
  conrodVariant: string;
  conrodSize: string;
  smallEndDiameter: number;
  bigEndDiameter: number;
  centerDistance: number;
  pinName: string;
  pinSize: string;
  ballBearingName: string;
  ballBearingVariant: string;
  ballBearingSize: string;
  createdAt: string;
}

export interface PreProductionRecord {
  id: number;
  name: string;
  type: string;
  size?: string;
  variant?: string;
  quantity: number;
  dateUpdated: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: number;
  name: string;
  address: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface InvoiceRecord {
  id: number;
  invoiceNo: string;
  customerId: number;
  totalAmount: number;
  status: 'draft' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface InvoiceItemRecord {
  id: number;
  invoiceId: number;
  productId: number;
  productName: string;
  quantity: number;
  amountPerUnit: number;
  totalAmount: number;
}

class ConrodDatabase {
  private db: Database;

  constructor() {
    this.db = new Database("conrod.db");
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create conrods table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conrods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        serialNumber TEXT UNIQUE NOT NULL,
        conrodName TEXT NOT NULL,
        conrodVariant TEXT NOT NULL,
        conrodSize TEXT NOT NULL,
        smallEndDiameter REAL NOT NULL,
        bigEndDiameter REAL NOT NULL,
        centerDistance REAL NOT NULL,
        pinName TEXT NOT NULL,
        pinSize TEXT NOT NULL,
        ballBearingName TEXT NOT NULL,
        ballBearingVariant TEXT NOT NULL,
        ballBearingSize TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate existing table to add missing columns if they don't exist
    this.migrateConrodsTable();

    // Create pre_production table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pre_production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size TEXT,
        variant TEXT,
        quantity INTEGER NOT NULL,
        dateUpdated TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create customers table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create invoices table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNo TEXT UNIQUE NOT NULL,
        customerId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      )
    `);

    // Create invoice_items table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        amountPerUnit REAL NOT NULL,
        totalAmount REAL NOT NULL,
        FOREIGN KEY (invoiceId) REFERENCES invoices (id)
      )
    `);

    // Check if we need to seed initial data
    const count = this.db.query("SELECT COUNT(*) as count FROM conrods").get() as { count: number };
    
    if (count.count === 0) {
      this.seedInitialData();
    }

    // Seed customers if empty
    const customerCount = this.db.query("SELECT COUNT(*) as count FROM customers").get() as { count: number };
    if (customerCount.count === 0) {
      this.seedCustomers();
    }
  }

  private migrateConrodsTable() {
    try {
      // Check if variant and size columns exist by getting table info
      const columns = this.db.query("PRAGMA table_info(conrods)").all() as Array<{name: string}>;
      const columnNames = columns.map(col => col.name);
      
      // Add missing columns (without NOT NULL constraint since we can't add that to existing tables)
      const columnsToAdd = [
        { name: 'conrodVariant', sql: 'ALTER TABLE conrods ADD COLUMN conrodVariant TEXT' },
        { name: 'conrodSize', sql: 'ALTER TABLE conrods ADD COLUMN conrodSize TEXT' },
        { name: 'pinSize', sql: 'ALTER TABLE conrods ADD COLUMN pinSize TEXT' },
        { name: 'ballBearingVariant', sql: 'ALTER TABLE conrods ADD COLUMN ballBearingVariant TEXT' },
        { name: 'ballBearingSize', sql: 'ALTER TABLE conrods ADD COLUMN ballBearingSize TEXT' }
      ];

      for (const column of columnsToAdd) {
        if (!columnNames.includes(column.name)) {
          this.db.exec(column.sql);
          console.log(`Added column ${column.name} to conrods table`);
        }
      }
    } catch (error) {
      console.error("Error during table migration:", error);
    }
  }

  private seedInitialData() {
    const initialData = [
      {
        serialNumber: "CR001",
        conrodName: "Honda CB150R Conrod",
        conrodVariant: "Standard",
        conrodSize: "Standard",
        smallEndDiameter: 15.5,
        bigEndDiameter: 42.0,
        centerDistance: 110.5,
        pinName: "PIN-CB150-001",
        pinSize: "Standard",
        ballBearingName: "BB-6201-2RS",
        ballBearingVariant: "Standard",
        ballBearingSize: "Standard",
      },
      {
        serialNumber: "CR002",
        conrodName: "Yamaha YZF-R15 Conrod",
        conrodVariant: "NRB",
        conrodSize: "7",
        smallEndDiameter: 14.8,
        bigEndDiameter: 40.5,
        centerDistance: 108.2,
        pinName: "PIN-YZF-002",
        pinSize: "7",
        ballBearingName: "BB-6200-2RS",
        ballBearingVariant: "NRB",
        ballBearingSize: "7",
      },
      {
        serialNumber: "CR003",
        conrodName: "Bajaj Pulsar 200NS Conrod",
        conrodVariant: "Standard",
        conrodSize: "5",
        smallEndDiameter: 16.0,
        bigEndDiameter: 44.0,
        centerDistance: 115.0,
        pinName: "PIN-P200-003",
        pinSize: "5",
        ballBearingName: "BB-6202-2RS",
        ballBearingVariant: "Standard",
        ballBearingSize: "5",
      },
      {
        serialNumber: "CR004",
        conrodName: "KTM Duke 200 Conrod",
        conrodVariant: "NRB",
        conrodSize: "3",
        smallEndDiameter: 15.2,
        bigEndDiameter: 41.8,
        centerDistance: 112.3,
        pinName: "PIN-KTM-004",
        pinSize: "3",
        ballBearingName: "BB-6201-Z",
        ballBearingVariant: "NRB",
        ballBearingSize: "3",
      },
      {
        serialNumber: "CR005",
        conrodName: "Royal Enfield Classic 350 Conrod",
        conrodVariant: "Standard",
        conrodSize: "6",
        smallEndDiameter: 18.0,
        bigEndDiameter: 48.0,
        centerDistance: 125.5,
        pinName: "PIN-RE350-005",
        pinSize: "6",
        ballBearingName: "BB-6203-2RS",
        ballBearingVariant: "Standard",
        ballBearingSize: "6",
      },
    ];

    const insertStmt = this.db.prepare(`
      INSERT INTO conrods (serialNumber, conrodName, conrodVariant, conrodSize, smallEndDiameter, bigEndDiameter, centerDistance, pinName, pinSize, ballBearingName, ballBearingVariant, ballBearingSize)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const conrod of initialData) {
      insertStmt.run(
        conrod.serialNumber,
        conrod.conrodName,
        conrod.conrodVariant,
        conrod.conrodSize,
        conrod.smallEndDiameter,
        conrod.bigEndDiameter,
        conrod.centerDistance,
        conrod.pinName,
        conrod.pinSize,
        conrod.ballBearingName,
        conrod.ballBearingVariant,
        conrod.ballBearingSize
      );
    }
  }

  private seedCustomers() {
    const initialCustomers = [
      {
        name: "John Smith",
        address: "123 Main St, New York, NY 10001",
        email: "john.smith@email.com",
        phone: "(555) 123-4567"
      },
      {
        name: "Sarah Johnson",
        address: "456 Oak Ave, Los Angeles, CA 90210",
        email: "sarah.johnson@email.com",
        phone: "(555) 987-6543"
      },
      {
        name: "Mike Davis",
        address: "789 Pine Rd, Chicago, IL 60601",
        email: "mike.davis@email.com",
        phone: "(555) 456-7890"
      },
      {
        name: "Emily Wilson",
        address: "321 Elm St, Houston, TX 77001",
        email: "emily.wilson@email.com",
        phone: "(555) 234-5678"
      },
      {
        name: "David Brown",
        address: "654 Maple Dr, Phoenix, AZ 85001",
        email: "david.brown@email.com",
        phone: "(555) 345-6789"
      }
    ];

    const insertStmt = this.db.prepare(`
      INSERT INTO customers (name, address, email, phone)
      VALUES (?, ?, ?, ?)
    `);

    for (const customer of initialCustomers) {
      insertStmt.run(
        customer.name,
        customer.address,
        customer.email,
        customer.phone
      );
    }
  }

  getAllConrods(): ConrodRecord[] {
    return this.db.query("SELECT * FROM conrods ORDER BY createdAt DESC").all() as ConrodRecord[];
  }

  createConrod(conrod: Omit<ConrodRecord, "id" | "createdAt">): ConrodRecord {
    const insertStmt = this.db.prepare(`
      INSERT INTO conrods (serialNumber, conrodName, conrodVariant, conrodSize, smallEndDiameter, bigEndDiameter, centerDistance, pinName, pinSize, ballBearingName, ballBearingVariant, ballBearingSize)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      conrod.serialNumber,
      conrod.conrodName,
      conrod.conrodVariant,
      conrod.conrodSize,
      conrod.smallEndDiameter,
      conrod.bigEndDiameter,
      conrod.centerDistance,
      conrod.pinName,
      conrod.pinSize,
      conrod.ballBearingName,
      conrod.ballBearingVariant,
      conrod.ballBearingSize
    );

    const getStmt = this.db.prepare("SELECT * FROM conrods WHERE id = ?");
    return getStmt.get(result.lastInsertRowid) as ConrodRecord;
  }

  getConrodById(id: number): ConrodRecord | null {
    const stmt = this.db.prepare("SELECT * FROM conrods WHERE id = ?");
    return stmt.get(id) as ConrodRecord | null;
  }

  updateConrod(id: number, conrod: Partial<Omit<ConrodRecord, "id" | "createdAt">>): ConrodRecord | null {
    const updateStmt = this.db.prepare(`
      UPDATE conrods SET 
        serialNumber = COALESCE(?, serialNumber),
        conrodName = COALESCE(?, conrodName),
        conrodVariant = COALESCE(?, conrodVariant),
        conrodSize = COALESCE(?, conrodSize),
        smallEndDiameter = COALESCE(?, smallEndDiameter),
        bigEndDiameter = COALESCE(?, bigEndDiameter),
        centerDistance = COALESCE(?, centerDistance),
        pinName = COALESCE(?, pinName),
        pinSize = COALESCE(?, pinSize),
        ballBearingName = COALESCE(?, ballBearingName),
        ballBearingVariant = COALESCE(?, ballBearingVariant),
        ballBearingSize = COALESCE(?, ballBearingSize)
      WHERE id = ?
    `);

    updateStmt.run(
      conrod.serialNumber,
      conrod.conrodName,
      conrod.conrodVariant,
      conrod.conrodSize,
      conrod.smallEndDiameter,
      conrod.bigEndDiameter,
      conrod.centerDistance,
      conrod.pinName,
      conrod.pinSize,
      conrod.ballBearingName,
      conrod.ballBearingVariant,
      conrod.ballBearingSize,
      id
    );

    return this.getConrodById(id);
  }

  deleteConrod(id: number): boolean {
    const deleteStmt = this.db.prepare("DELETE FROM conrods WHERE id = ?");
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Pre-Production CRUD methods
  getAllPreProductionItems(): PreProductionRecord[] {
    return this.db.query("SELECT * FROM pre_production ORDER BY createdAt DESC").all() as PreProductionRecord[];
  }

  createPreProductionItem(item: Omit<PreProductionRecord, "id" | "createdAt">): PreProductionRecord {
    const insertStmt = this.db.prepare(`
      INSERT INTO pre_production (name, type, size, variant, quantity, dateUpdated)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      item.name,
      item.type,
      item.size || null,
      item.variant || null,
      item.quantity,
      item.dateUpdated
    );

    const getStmt = this.db.prepare("SELECT * FROM pre_production WHERE id = ?");
    return getStmt.get(result.lastInsertRowid) as PreProductionRecord;
  }

  getPreProductionItemById(id: number): PreProductionRecord | null {
    const stmt = this.db.prepare("SELECT * FROM pre_production WHERE id = ?");
    return stmt.get(id) as PreProductionRecord | null;
  }

  updatePreProductionItem(id: number, item: Partial<Omit<PreProductionRecord, "id" | "createdAt">>): PreProductionRecord | null {
    const updateStmt = this.db.prepare(`
      UPDATE pre_production SET 
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        size = COALESCE(?, size),
        variant = COALESCE(?, variant),
        quantity = COALESCE(?, quantity),
        dateUpdated = COALESCE(?, dateUpdated)
      WHERE id = ?
    `);

    updateStmt.run(
      item.name,
      item.type,
      item.size,
      item.variant,
      item.quantity,
      item.dateUpdated,
      id
    );

    return this.getPreProductionItemById(id);
  }

  deletePreProductionItem(id: number): boolean {
    const deleteStmt = this.db.prepare("DELETE FROM pre_production WHERE id = ?");
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Customer CRUD methods
  getAllCustomers(): CustomerRecord[] {
    return this.db.query("SELECT * FROM customers ORDER BY createdAt DESC").all() as CustomerRecord[];
  }

  createCustomer(customer: Omit<CustomerRecord, "id" | "createdAt">): CustomerRecord {
    const insertStmt = this.db.prepare(`
      INSERT INTO customers (name, address, email, phone)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      customer.name,
      customer.address,
      customer.email || null,
      customer.phone || null
    );

    const getStmt = this.db.prepare("SELECT * FROM customers WHERE id = ?");
    return getStmt.get(result.lastInsertRowid) as CustomerRecord;
  }

  getCustomerById(id: number): CustomerRecord | null {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(id) as CustomerRecord | null;
  }

  updateCustomer(id: number, customer: Partial<Omit<CustomerRecord, "id" | "createdAt">>): CustomerRecord | null {
    const updateStmt = this.db.prepare(`
      UPDATE customers SET 
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone)
      WHERE id = ?
    `);

    updateStmt.run(
      customer.name,
      customer.address,
      customer.email,
      customer.phone,
      id
    );

    return this.getCustomerById(id);
  }

  deleteCustomer(id: number): boolean {
    const deleteStmt = this.db.prepare("DELETE FROM customers WHERE id = ?");
    const result = deleteStmt.run(id);
    return result.changes > 0;
  }

  // Invoice CRUD methods
  getAllInvoices(): (InvoiceRecord & { customerName: string })[] {
    const invoices = this.db.query(`
      SELECT i.*, c.name as customerName 
      FROM invoices i 
      JOIN customers c ON i.customerId = c.id 
      ORDER BY i.createdAt DESC
    `).all() as (InvoiceRecord & { customerName: string })[];

    // For each invoice, get its items
    const invoicesWithItems = invoices.map(invoice => {
      const items = this.db.query(`
        SELECT id, productName, quantity
        FROM invoice_items 
        WHERE invoiceId = ?
      `).all(invoice.id) as Array<{ id: number, productName: string, quantity: number }>;
      
      return {
        ...invoice,
        items
      };
    });

    return invoicesWithItems;
  }

  createInvoice(invoice: Omit<InvoiceRecord, "id" | "createdAt">, items: Omit<InvoiceItemRecord, "id" | "invoiceId">[]): InvoiceRecord {
    const insertInvoiceStmt = this.db.prepare(`
      INSERT INTO invoices (invoiceNo, customerId, totalAmount, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertInvoiceStmt.run(
      invoice.invoiceNo,
      invoice.customerId,
      invoice.totalAmount,
      invoice.status
    );

    const invoiceId = result.lastInsertRowid as number;

    // Insert invoice items
    const insertItemStmt = this.db.prepare(`
      INSERT INTO invoice_items (invoiceId, productId, productName, quantity, amountPerUnit, totalAmount)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItemStmt.run(
        invoiceId,
        item.productId,
        item.productName,
        item.quantity,
        item.amountPerUnit,
        item.totalAmount
      );
    }

    const getStmt = this.db.prepare("SELECT * FROM invoices WHERE id = ?");
    return getStmt.get(invoiceId) as InvoiceRecord;
  }

  getInvoiceById(id: number): InvoiceRecord | null {
    const stmt = this.db.prepare("SELECT * FROM invoices WHERE id = ?");
    return stmt.get(id) as InvoiceRecord | null;
  }

  getInvoiceItems(invoiceId: number): InvoiceItemRecord[] {
    const stmt = this.db.prepare("SELECT * FROM invoice_items WHERE invoiceId = ?");
    return stmt.all(invoiceId) as InvoiceItemRecord[];
  }

  updateInvoiceStatus(id: number, status: InvoiceRecord['status']): InvoiceRecord | null {
    const updateStmt = this.db.prepare("UPDATE invoices SET status = ? WHERE id = ?");
    updateStmt.run(status, id);
    return this.getInvoiceById(id);
  }

  deleteInvoice(id: number): boolean {
    // Delete invoice items first (due to foreign key)
    const deleteItemsStmt = this.db.prepare("DELETE FROM invoice_items WHERE invoiceId = ?");
    deleteItemsStmt.run(id);
    
    // Delete invoice
    const deleteInvoiceStmt = this.db.prepare("DELETE FROM invoices WHERE id = ?");
    const result = deleteInvoiceStmt.run(id);
    return result.changes > 0;
  }

  close() {
    this.db.close();
  }
}

// Export a singleton instance
export const conrodDB = new ConrodDatabase();