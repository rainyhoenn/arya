import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET() {
  try {
    const invoices = conrodDB.getAllInvoices();
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { invoiceNo, customerId, products, transport } = body;

    if (!invoiceNo || !customerId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invoice number, customer, and products are required" },
        { status: 400 }
      );
    }

    // Get current conrod assembly inventory
    const conrodAssemblies = conrodDB.getAllPreProductionItems().filter(item => item.type === "conrod");
    
    // Check inventory availability for all products before proceeding
    for (const product of products) {
      const assembly = conrodAssemblies.find(item => 
        item.id === product.productId && item.type === "conrod"
      );

      if (!assembly) {
        return NextResponse.json(
          { success: false, error: `Product ${product.productName} not found in inventory` },
          { status: 400 }
        );
      }

      if (assembly.quantity < product.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient inventory for ${product.productName}. Available: ${assembly.quantity}, Requested: ${product.quantity}` },
          { status: 400 }
        );
      }
    }

    // Calculate total amount
    const totalAmount = products.reduce((total: number, product: any) => {
      return total + (product.quantity * product.amountPerUnit);
    }, 0);

    // Prepare invoice items
    const invoiceItems = products.map((product: any) => ({
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity,
      amountPerUnit: product.amountPerUnit,
      totalAmount: product.quantity * product.amountPerUnit
    }));

    // Get customer information for logging
    const customer = conrodDB.getCustomerById(parseInt(customerId));
    const customerName = customer ? customer.name : `Customer ID ${customerId}`;

    // Create the invoice
    const newInvoice = conrodDB.createInvoice(
      {
        invoiceNo,
        customerId: parseInt(customerId),
        totalAmount,
        status: 'draft',
        transport
      },
      invoiceItems
    );

    // Log invoice creation
    conrodDB.createActivityLog({
      action: 'CREATE',
      module: 'billing',
      entityId: newInvoice.id,
      entityName: invoiceNo,
      description: `Created invoice ${invoiceNo} for ${customerName}`,
      details: `Total Amount: ₹${totalAmount.toFixed(2)}, Products: ${products.length} items`
    });

    // Deduct inventory from conrod assemblies
    const inventoryDeductions = [];
    for (const product of products) {
      const assembly = conrodAssemblies.find(item => 
        item.id === product.productId && item.type === "conrod"
      );

      if (assembly) {
        const updatedAssembly = conrodDB.updatePreProductionItem(assembly.id, {
          quantity: assembly.quantity - product.quantity,
          dateUpdated: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
        });

        if (updatedAssembly) {
          inventoryDeductions.push({
            productId: product.productId,
            productName: product.productName,
            quantityDeducted: product.quantity,
            remainingQuantity: updatedAssembly.quantity
          });

          // Log inventory deduction for billing
          conrodDB.createActivityLog({
            action: 'DEDUCT',
            module: 'billing',
            entityId: product.productId,
            entityName: product.productName,
            description: `Inventory deducted for invoice ${invoiceNo}`,
            details: `Product: ${product.productName}, Deducted: ${product.quantity}, Remaining: ${updatedAssembly.quantity}, Unit Price: ₹${product.amountPerUnit}`
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: newInvoice,
      inventoryDeductions
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    
    // Handle unique constraint violation for invoice number
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { success: false, error: "Invoice number already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}