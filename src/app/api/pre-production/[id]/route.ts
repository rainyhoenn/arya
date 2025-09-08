import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const item = conrodDB.getPreProductionItemById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching pre-production item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pre-production item" },
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get the original item for logging
    const originalItem = conrodDB.getPreProductionItemById(id);
    if (!originalItem) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

    // Update the dateUpdated field to current date
    body.dateUpdated = new Date().toISOString().split('T')[0];
    
    const updatedItem = conrodDB.updatePreProductionItem(id, body);

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

    // Log the activity
    const changes = [];
    if (body.name && body.name !== originalItem.name) changes.push(`Name: ${originalItem.name} → ${body.name}`);
    if (body.type && body.type !== originalItem.type) changes.push(`Type: ${originalItem.type} → ${body.type}`);
    if (body.quantity && body.quantity !== originalItem.quantity) changes.push(`Quantity: ${originalItem.quantity} → ${body.quantity}`);
    if (body.size && body.size !== originalItem.size) changes.push(`Size: ${originalItem.size || 'N/A'} → ${body.size}`);
    if (body.variant && body.variant !== originalItem.variant) changes.push(`Variant: ${originalItem.variant || 'N/A'} → ${body.variant}`);

    conrodDB.createActivityLog({
      action: 'UPDATE',
      module: 'pre-production',
      entityId: id,
      entityName: updatedItem.name,
      description: `Updated pre-production item: ${updatedItem.name}`,
      details: changes.length > 0 ? changes.join(', ') : 'Minor updates'
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating pre-production item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pre-production item" },
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
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Get the item before deleting for logging
    const itemToDelete = conrodDB.getPreProductionItemById(id);
    if (!itemToDelete) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

    const deleted = conrodDB.deletePreProductionItem(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete pre-production item" },
        { status: 500 }
      );
    }

    // Log the activity
    conrodDB.createActivityLog({
      action: 'DELETE',
      module: 'pre-production',
      entityId: id,
      entityName: itemToDelete.name,
      description: `Deleted pre-production item: ${itemToDelete.name}`,
      details: `Type: ${itemToDelete.type}, Quantity: ${itemToDelete.quantity}`
    });

    return NextResponse.json({ success: true, message: "Pre-production item deleted" });
  } catch (error) {
    console.error("Error deleting pre-production item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pre-production item" },
      { status: 500 }
    );
  }
}