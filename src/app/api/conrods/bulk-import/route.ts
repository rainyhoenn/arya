import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conrods } = body;

    if (!conrods || !Array.isArray(conrods)) {
      return NextResponse.json(
        { success: false, error: "Invalid conrods data" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const [index, conrod] of conrods.entries()) {
      try {
        // Skip the temporary ID and let database generate real ID
        const { id, ...conrodData } = conrod;
        
        const newConrod = conrodDB.createConrod({
          serialNumber: conrodData.serialNumber,
          conrodName: conrodData.conrodName,
          conrodVariant: conrodData.conrodVariant || '',
          conrodSize: conrodData.conrodSize || '',
          smallEndDiameter: conrodData.smallEndDiameter || 0,
          bigEndDiameter: conrodData.bigEndDiameter || 0,
          centerDistance: conrodData.centerDistance || 0,
          pinName: conrodData.pinName || '',
          pinSize: conrodData.pinSize || '',
          ballBearingName: conrodData.ballBearingName || '',
          ballBearingVariant: conrodData.ballBearingVariant || '',
          ballBearingSize: conrodData.ballBearingSize || '',
          amount: conrodData.amount || 0,
        });

        results.push(newConrod);
      } catch (error) {
        console.error(`Error importing conrod at index ${index}:`, error);
        errors.push({
          index,
          serialNumber: conrod.serialNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Failed to import ${errors.length} out of ${conrods.length} conrods`,
        details: errors,
        imported: results.length
      }, { status: 207 }); // 207 Multi-Status for partial success
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.length} conrods`,
      data: results
    });

  } catch (error) {
    console.error("Error in bulk import:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process bulk import" },
      { status: 500 }
    );
  }
}