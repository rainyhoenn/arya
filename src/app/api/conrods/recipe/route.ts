import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conrodName = searchParams.get("conrodName");
    const conrodVariant = searchParams.get("conrodVariant");
    const conrodSize = searchParams.get("conrodSize");

    if (!conrodName || !conrodVariant || !conrodSize) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: conrodName, conrodVariant, conrodSize" },
        { status: 400 }
      );
    }

    // Find the matching conrod recipe in the database
    const allConrods = conrodDB.getAllConrods();
    const matchingConrod = allConrods.find(conrod => 
      conrod.conrodName === conrodName &&
      conrod.conrodVariant === conrodVariant &&
      conrod.conrodSize === conrodSize
    );

    if (!matchingConrod) {
      return NextResponse.json(
        { success: false, error: "No recipe found for the specified conrod configuration" },
        { status: 404 }
      );
    }

    // Return the recipe information
    const recipe = {
      conrodName: matchingConrod.conrodName,
      conrodVariant: matchingConrod.conrodVariant,
      conrodSize: matchingConrod.conrodSize,
      dimensions: {
        smallEndDiameter: matchingConrod.smallEndDiameter,
        bigEndDiameter: matchingConrod.bigEndDiameter,
        centerDistance: matchingConrod.centerDistance,
      },
      requiredComponents: {
        conrod: {
          name: matchingConrod.conrodName,
        },
        pin: {
          name: matchingConrod.pinName,
          size: matchingConrod.pinSize,
        },
        ballBearing: {
          name: matchingConrod.ballBearingName,
          variant: matchingConrod.ballBearingVariant,
          size: matchingConrod.ballBearingSize,
        }
      }
    };

    return NextResponse.json({ success: true, data: recipe });
  } catch (error) {
    console.error("Error fetching conrod recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conrod recipe" },
      { status: 500 }
    );
  }
}