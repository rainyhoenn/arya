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
    
    // Update the dateUpdated field to current date
    body.dateUpdated = new Date().toISOString().split('T')[0];
    
    const updatedItem = conrodDB.updatePreProductionItem(id, body);

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

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

    const deleted = conrodDB.deletePreProductionItem(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Pre-production item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Pre-production item deleted" });
  } catch (error) {
    console.error("Error deleting pre-production item:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pre-production item" },
      { status: 500 }
    );
  }
}