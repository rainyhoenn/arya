import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const customerId = parseInt(params.id);
    const customer = conrodDB.getCustomerById(customerId);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer" },
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
    const customerId = parseInt(params.id);
    const body = await request.json();

    // Validate required fields
    const { name, address, phoneNumber, gstNo } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: "Name and address are required" },
        { status: 400 }
      );
    }

    // Get the original customer for logging
    const originalCustomer = conrodDB.getCustomerById(customerId);
    if (!originalCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = conrodDB.updateCustomer(customerId, {
      name,
      address,
      phoneNumber,
      gstNo,
    });

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    // Log the activity
    const changes = [];
    if (name !== originalCustomer.name) changes.push(`Name: ${originalCustomer.name} → ${name}`);
    if (address !== originalCustomer.address) changes.push(`Address: ${originalCustomer.address} → ${address}`);
    if (phoneNumber !== originalCustomer.phoneNumber) changes.push(`Phone: ${originalCustomer.phoneNumber || 'N/A'} → ${phoneNumber || 'N/A'}`);
    if (gstNo !== originalCustomer.gstNo) changes.push(`GST No: ${originalCustomer.gstNo || 'N/A'} → ${gstNo || 'N/A'}`);

    conrodDB.createActivityLog({
      action: 'UPDATE',
      module: 'billing',
      entityId: customerId,
      entityName: updatedCustomer.name,
      description: `Updated customer: ${updatedCustomer.name}`,
      details: changes.length > 0 ? changes.join(', ') : 'Minor updates'
    });

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
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
    const customerId = parseInt(params.id);
    
    // Get the customer before deleting for logging
    const customerToDelete = conrodDB.getCustomerById(customerId);
    if (!customerToDelete) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    const success = conrodDB.deleteCustomer(customerId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete customer" },
        { status: 500 }
      );
    }

    // Log the activity
    conrodDB.createActivityLog({
      action: 'DELETE',
      module: 'billing',
      entityId: customerId,
      entityName: customerToDelete.name,
      description: `Deleted customer: ${customerToDelete.name}`,
      details: `Address: ${customerToDelete.address}${customerToDelete.phoneNumber ? `, Phone: ${customerToDelete.phoneNumber}` : ''}${customerToDelete.gstNo ? `, GST No: ${customerToDelete.gstNo}` : ''}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}