import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoiceId = parseInt(params.id);
    const invoice = conrodDB.getInvoiceById(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Get invoice items
    const items = conrodDB.getInvoiceItems(invoiceId);

    return NextResponse.json({ 
      success: true, 
      data: { ...invoice, items } 
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoiceId = parseInt(params.id);
    const body = await request.json();

    // For now, only allow updating status
    const { status } = body;

    if (!status || !['draft', 'paid', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid status is required (draft, paid, cancelled)" },
        { status: 400 }
      );
    }

    // Get the original invoice for logging
    const originalInvoice = conrodDB.getInvoiceById(invoiceId);
    if (!originalInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const updatedInvoice = conrodDB.updateInvoiceStatus(invoiceId, status);

    if (!updatedInvoice) {
      return NextResponse.json(
        { success: false, error: "Failed to update invoice" },
        { status: 500 }
      );
    }

    // Log the status change
    if (originalInvoice.status !== status) {
      conrodDB.createActivityLog({
        action: 'UPDATE',
        module: 'billing',
        entityId: invoiceId,
        entityName: updatedInvoice.invoiceNo,
        description: `Invoice ${updatedInvoice.invoiceNo} status updated`,
        details: `Status changed from '${originalInvoice.status}' to '${status}'`
      });
    }

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const invoiceId = parseInt(params.id);
    // Get the invoice before deleting for logging
    const invoiceToDelete = conrodDB.getInvoiceById(invoiceId);
    if (!invoiceToDelete) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    const success = conrodDB.deleteInvoice(invoiceId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete invoice" },
        { status: 500 }
      );
    }

    // Log the deletion
    conrodDB.createActivityLog({
      action: 'DELETE',
      module: 'billing',
      entityId: invoiceId,
      entityName: invoiceToDelete.invoiceNo,
      description: `Deleted invoice ${invoiceToDelete.invoiceNo}`,
      details: `Total Amount: ₹${invoiceToDelete.totalAmount.toFixed(2)}, Status: ${invoiceToDelete.status}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}