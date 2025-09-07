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

    const conrod = conrodDB.getConrodById(id);
    if (!conrod) {
      return NextResponse.json(
        { success: false, error: "Conrod not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: conrod });
  } catch (error) {
    console.error("Error fetching conrod:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conrod" },
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
    const updatedConrod = conrodDB.updateConrod(id, body);

    if (!updatedConrod) {
      return NextResponse.json(
        { success: false, error: "Conrod not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedConrod });
  } catch (error) {
    console.error("Error updating conrod:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update conrod" },
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

    const deleted = conrodDB.deleteConrod(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Conrod not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Conrod deleted" });
  } catch (error) {
    console.error("Error deleting conrod:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete conrod" },
      { status: 500 }
    );
  }
}