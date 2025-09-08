import { type NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const item = conrodDB.getPreProductionItemById(id);
    if (!item || item.type !== "Conrod") {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching conrod assembly:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conrod assembly" },
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
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get the original item for logging
    const originalItem = conrodDB.getPreProductionItemById(id);
    if (!originalItem || originalItem.type !== "Conrod") {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    // Update the dateUpdated field to current date
    body.dateUpdated = new Date().toISOString().split('T')[0];
    
    const updatedItem = conrodDB.updatePreProductionItem(id, body);

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    // Log the activity
    const changes = [];
    if (body.name && body.name !== originalItem.name) changes.push(`Name: ${originalItem.name} → ${body.name}`);
    if (body.quantity && body.quantity !== originalItem.quantity) changes.push(`Quantity: ${originalItem.quantity} → ${body.quantity}`);
    if (body.size && body.size !== originalItem.size) changes.push(`Size: ${originalItem.size || 'N/A'} → ${body.size}`);
    if (body.variant && body.variant !== originalItem.variant) changes.push(`Variant: ${originalItem.variant || 'N/A'} → ${body.variant}`);

    conrodDB.createActivityLog({
      action: 'UPDATE',
      module: 'conrod-assembly',
      entityId: id,
      entityName: updatedItem.name,
      description: `Updated conrod assembly: ${updatedItem.name}`,
      details: changes.length > 0 ? changes.join(', ') : 'Minor updates'
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating conrod assembly:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conrod assembly" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get the original item for logging
    const originalItem = conrodDB.getPreProductionItemById(id);
    if (!originalItem || originalItem.type !== "Conrod") {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    // Update the dateUpdated field to current date
    body.dateUpdated = new Date().toISOString().split('T')[0];
    
    const updatedItem = conrodDB.updatePreProductionItem(id, body);

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    // Log the activity
    const changes = [];
    if (body.name && body.name !== originalItem.name) changes.push(`Name: ${originalItem.name} → ${body.name}`);
    if (body.quantity && body.quantity !== originalItem.quantity) changes.push(`Quantity: ${originalItem.quantity} → ${body.quantity}`);
    if (body.size && body.size !== originalItem.size) changes.push(`Size: ${originalItem.size || 'N/A'} → ${body.size}`);
    if (body.variant && body.variant !== originalItem.variant) changes.push(`Variant: ${originalItem.variant || 'N/A'} → ${body.variant}`);

    conrodDB.createActivityLog({
      action: 'UPDATE',
      module: 'conrod-assembly',
      entityId: id,
      entityName: updatedItem.name,
      description: `Updated conrod assembly: ${updatedItem.name}`,
      details: changes.length > 0 ? changes.join(', ') : 'Minor updates'
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error updating conrod assembly:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conrod assembly" },
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
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Get the item before deleting for logging
    const itemToDelete = conrodDB.getPreProductionItemById(id);
    if (!itemToDelete || itemToDelete.type !== "Conrod") {
      return NextResponse.json(
        { success: false, error: "Conrod assembly not found" },
        { status: 404 }
      );
    }

    const deleted = conrodDB.deletePreProductionItem(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete conrod assembly" },
        { status: 500 }
      );
    }

    // Log the activity
    conrodDB.createActivityLog({
      action: 'DELETE',
      module: 'conrod-assembly',
      entityId: id,
      entityName: itemToDelete.name,
      description: `Deleted conrod assembly: ${itemToDelete.name}`,
      details: `Variant: ${itemToDelete.variant || 'N/A'}, Size: ${itemToDelete.size || 'N/A'}, Quantity: ${itemToDelete.quantity}`
    });

    return NextResponse.json({ success: true, message: "Conrod assembly deleted" });
  } catch (error) {
    console.error("Error deleting conrod assembly:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conrod assembly" },
      { status: 500 }
    );
  }
}