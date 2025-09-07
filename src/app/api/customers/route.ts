import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET() {
  try {
    const customers = conrodDB.getAllCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, address, phoneNumber, gstNo } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: "Name and address are required" },
        { status: 400 }
      );
    }

    const newCustomer = conrodDB.createCustomer({
      name,
      address,
      phoneNumber,
      gstNo,
    });

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}