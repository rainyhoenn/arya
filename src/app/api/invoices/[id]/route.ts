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

    const updatedInvoice = conrodDB.updateInvoiceStatus(invoiceId, status);

    if (!updatedInvoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
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
    const success = conrodDB.deleteInvoice(invoiceId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}