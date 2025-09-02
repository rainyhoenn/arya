import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET() {
  try {
    const items = conrodDB.getAllPreProductionItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching pre-production items:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pre-production items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      name,
      type,
      size,
      variant,
      quantity,
      dateUpdated,
    } = body;

    if (
      !name ||
      !type ||
      quantity === undefined ||
      !dateUpdated
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newItem = conrodDB.createPreProductionItem({
      name,
      type,
      size,
      variant,
      quantity: parseInt(quantity),
      dateUpdated,
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating pre-production item:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to create pre-production item" },
      { status: 500 }
    );
  }
}