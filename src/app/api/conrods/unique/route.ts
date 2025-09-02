import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['pin', 'ballBearing', 'conrod'].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing type parameter. Must be 'pin', 'ballBearing', or 'conrod'" },
        { status: 400 }
      );
    }

    let uniqueValues: string[] = [];

    switch (type) {
      case 'pin':
        // Get unique pin names
        const pins = conrodDB.getAllConrods();
        uniqueValues = [...new Set(pins.map(conrod => conrod.pinName))].filter(Boolean);
        break;
      
      case 'ballBearing':
        // Get unique ball bearing names
        const ballBearings = conrodDB.getAllConrods();
        uniqueValues = [...new Set(ballBearings.map(conrod => conrod.ballBearingName))].filter(Boolean);
        break;
      
      case 'conrod':
        // Get unique conrod names
        const conrods = conrodDB.getAllConrods();
        uniqueValues = [...new Set(conrods.map(conrod => conrod.conrodName))].filter(Boolean);
        break;
    }

    return NextResponse.json({ 
      success: true, 
      data: uniqueValues.sort() // Sort alphabetically
    });
  } catch (error) {
    console.error("Error fetching unique values:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch unique values" },
      { status: 500 }
    );
  }
}