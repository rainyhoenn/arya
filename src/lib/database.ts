import { Database } from "bun:sqlite";

export interface ConrodRecord {
  id: number;
  serialNumber: string;
  conrodName: string;
  conrodVariant: string;
  conrodSize: string;
  smallEndDiameter?: number;
  bigEndDiameter?: number;
  centerDistance?: number;
  pinName: string;
  pinSize: string;
  ballBearingName: string;
  ballBearingVariant: string;
  ballBearingSize: string;
  amount?: number;
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
  phoneNumber?: string;
  gstNo?: string;
  createdAt: string;
}

export interface InvoiceRecord {
  id: number;
  invoiceNo: string;
  customerId: number;
  totalAmount: number;
  status: 'draft' | 'paid' | 'cancelled';
  transport?: string;
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

export interface ActivityLogRecord {
  id: number;
  action: string;
  module: 'pre-production' | 'conrod-assembly' | 'billing';
  entityId?: number;
  entityName?: string;
  description: string;
  details?: string;
  userId?: string;
  createdAt: string;
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
        smallEndDiameter REAL,
        bigEndDiameter REAL,
        centerDistance REAL,
        pinName TEXT NOT NULL,
        pinSize TEXT NOT NULL,
        ballBearingName TEXT NOT NULL,
        ballBearingVariant TEXT NOT NULL,
        ballBearingSize TEXT NOT NULL,
        amount INTEGER DEFAULT 0,
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
        phoneNumber TEXT,
        gstNo TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate customers table to add new columns
    this.migrateCustomersTable();
    
    // Migrate invoices table to add transport column
    this.migrateInvoicesTable();

    // Create invoices table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNo TEXT UNIQUE NOT NULL,
        customerId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        transport TEXT,
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

    // Create activity_logs table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        module TEXT NOT NULL CHECK (module IN ('pre-production', 'conrod-assembly', 'billing')),
        entityId INTEGER,
        entityName TEXT,
        description TEXT NOT NULL,
        details TEXT,
        userId TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

  }

  private migrateCustomersTable() {
    try {
      // Check if phoneNumber and gstNo columns exist
      const columns = this.db.query("PRAGMA table_info(customers)").all() as Array<{name: string}>;
      const columnNames = columns.map(col => col.name);
      
      // Add missing columns
      const columnsToAdd = [
        { name: 'phoneNumber', sql: 'ALTER TABLE customers ADD COLUMN phoneNumber TEXT' },
        { name: 'gstNo', sql: 'ALTER TABLE customers ADD COLUMN gstNo TEXT' }
      ];

      for (const column of columnsToAdd) {
        if (!columnNames.includes(column.name)) {
          this.db.exec(column.sql);
          console.log(`Added column ${column.name} to customers table`);
        }
      }

      // Migrate old phone and email columns to phoneNumber if they exist
      if (columnNames.includes('phone') && !columnNames.includes('phoneNumber')) {
        this.db.exec('UPDATE customers SET phoneNumber = phone WHERE phone IS NOT NULL');
        console.log('Migrated phone data to phoneNumber column');
      }
    } catch (error) {
      console.error("Error during customers table migration:", error);
    }
  }

  private migrateInvoicesTable() {
    try {
      // Check if transport column exists
      const columns = this.db.query("PRAGMA table_info(invoices)").all() as Array<{name: string}>;
      const columnNames = columns.map(col => col.name);
      
      // Add missing transport column
      if (!columnNames.includes('transport')) {
        this.db.exec('ALTER TABLE invoices ADD COLUMN transport TEXT');
        console.log('Added transport column to invoices table');
      }
    } catch (error) {
      console.error("Error during invoices table migration:", error);
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
        { name: 'ballBearingSize', sql: 'ALTER TABLE conrods ADD COLUMN ballBearingSize TEXT' },
        { name: 'amount', sql: 'ALTER TABLE conrods ADD COLUMN amount INTEGER DEFAULT 0' }
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


  getAllConrods(): ConrodRecord[] {
    return this.db.query("SELECT * FROM conrods ORDER BY createdAt DESC").all() as ConrodRecord[];
  }

  createConrod(conrod: Omit<ConrodRecord, "id" | "createdAt">): ConrodRecord {
    const insertStmt = this.db.prepare(`
      INSERT INTO conrods (serialNumber, conrodName, conrodVariant, conrodSize, smallEndDiameter, bigEndDiameter, centerDistance, pinName, pinSize, ballBearingName, ballBearingVariant, ballBearingSize, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      conrod.serialNumber,
      conrod.conrodName,
      conrod.conrodVariant,
      conrod.conrodSize,
      conrod.smallEndDiameter ?? null,
      conrod.bigEndDiameter ?? null,
      conrod.centerDistance ?? null,
      conrod.pinName,
      conrod.pinSize,
      conrod.ballBearingName,
      conrod.ballBearingVariant,
      conrod.ballBearingSize,
      conrod.amount || 0
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
        ballBearingSize = COALESCE(?, ballBearingSize),
        amount = COALESCE(?, amount)
      WHERE id = ?
    `);

    updateStmt.run(
      conrod.serialNumber ?? null,
      conrod.conrodName ?? null,
      conrod.conrodVariant ?? null,
      conrod.conrodSize ?? null,
      conrod.smallEndDiameter ?? null,
      conrod.bigEndDiameter ?? null,
      conrod.centerDistance ?? null,
      conrod.pinName ?? null,
      conrod.pinSize ?? null,
      conrod.ballBearingName ?? null,
      conrod.ballBearingVariant ?? null,
      conrod.ballBearingSize ?? null,
      conrod.amount ?? null,
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
      item.name ?? null,
      item.type ?? null,
      item.size ?? null,
      item.variant ?? null,
      item.quantity ?? null,
      item.dateUpdated ?? null,
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
      INSERT INTO customers (name, address, phoneNumber, gstNo)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      customer.name,
      customer.address,
      customer.phoneNumber || null,
      customer.gstNo || null
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
        phoneNumber = COALESCE(?, phoneNumber),
        gstNo = COALESCE(?, gstNo)
      WHERE id = ?
    `);

    updateStmt.run(
      customer.name ?? null,
      customer.address ?? null,
      customer.phoneNumber ?? null,
      customer.gstNo ?? null,
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
  getAllInvoices(): (InvoiceRecord & { customerName: string, customerGstNo: string, customerPhoneNumber: string, address: string })[] {
    const invoices = this.db.query(`
      SELECT i.*, c.name as customerName, c.gstNo as customerGstNo, c.phoneNumber as customerPhoneNumber, c.address 
      FROM invoices i 
      JOIN customers c ON i.customerId = c.id 
      ORDER BY i.createdAt DESC
    `).all() as (InvoiceRecord & { customerName: string, customerGstNo: string, customerPhoneNumber: string, address: string })[];

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
      INSERT INTO invoices (invoiceNo, customerId, totalAmount, status, transport)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertInvoiceStmt.run(
      invoice.invoiceNo,
      invoice.customerId,
      invoice.totalAmount,
      invoice.status,
      invoice.transport || null
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

  // Activity Log methods
  createActivityLog(log: Omit<ActivityLogRecord, "id" | "createdAt">): ActivityLogRecord {
    const insertStmt = this.db.prepare(`
      INSERT INTO activity_logs (action, module, entityId, entityName, description, details, userId)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      log.action,
      log.module,
      log.entityId || null,
      log.entityName || null,
      log.description,
      log.details || null,
      log.userId || null
    );

    const getStmt = this.db.prepare("SELECT * FROM activity_logs WHERE id = ?");
    return getStmt.get(result.lastInsertRowid) as ActivityLogRecord;
  }

  getAllActivityLogs(): ActivityLogRecord[] {
    return this.db.query("SELECT * FROM activity_logs ORDER BY createdAt DESC").all() as ActivityLogRecord[];
  }

  getActivityLogsByModule(module: ActivityLogRecord['module']): ActivityLogRecord[] {
    const stmt = this.db.prepare("SELECT * FROM activity_logs WHERE module = ? ORDER BY createdAt DESC");
    return stmt.all(module) as ActivityLogRecord[];
  }

  getActivityLogsByEntity(entityId: number): ActivityLogRecord[] {
    const stmt = this.db.prepare("SELECT * FROM activity_logs WHERE entityId = ? ORDER BY createdAt DESC");
    return stmt.all(entityId) as ActivityLogRecord[];
  }

  close() {
    this.db.close();
  }
}

// Export a singleton instance
export const conrodDB = new ConrodDatabase();