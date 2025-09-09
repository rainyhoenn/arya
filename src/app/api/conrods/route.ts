import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET() {
  try {
    const conrods = conrodDB.getAllConrods();
    return NextResponse.json({ success: true, data: conrods });
  } catch (error) {
    console.error("Error fetching conrods:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conrods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      serialNumber,
      conrodName,
      conrodVariant,
      conrodSize,
      smallEndDiameter,
      bigEndDiameter,
      centerDistance,
      pinName,
      pinSize,
      ballBearingName,
      ballBearingVariant,
      ballBearingSize,
    } = body;

    if (
      !serialNumber ||
      !conrodName ||
      !conrodVariant ||
      !conrodSize ||
      !pinName ||
      !pinSize ||
      !ballBearingName ||
      !ballBearingVariant ||
      !ballBearingSize
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newConrod = conrodDB.createConrod({
      serialNumber,
      conrodName,
      conrodVariant,
      conrodSize,
      smallEndDiameter: smallEndDiameter ? parseFloat(smallEndDiameter) : undefined,
      bigEndDiameter: bigEndDiameter ? parseFloat(bigEndDiameter) : undefined,
      centerDistance: centerDistance ? parseFloat(centerDistance) : undefined,
      pinName,
      pinSize,
      ballBearingName,
      ballBearingVariant,
      ballBearingSize,
    });

    return NextResponse.json({ success: true, data: newConrod }, { status: 201 });
  } catch (error) {
    console.error("Error creating conrod:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { success: false, error: "Serial number already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create conrod" },
      { status: 500 }
    );
  }
}