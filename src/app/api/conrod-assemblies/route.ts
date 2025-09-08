import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET() {
  try {
    const items = conrodDB.getAllPreProductionItems();
    // Filter for conrod assemblies (type "conrod")
    const conrodAssemblies = items.filter(item => item.type === "conrod");
    return NextResponse.json({ success: true, data: conrodAssemblies });
  } catch (error) {
    console.error("Error fetching conrod assemblies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conrod assemblies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      conrodType,
      variant,
      size,
      quantity,
      dateUpdated,
    } = body;

    if (
      !conrodType ||
      !variant ||
      !size ||
      quantity === undefined ||
      !dateUpdated
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const requestedQuantity = parseInt(quantity);

    // Get the recipe to find required components
    const allConrods = conrodDB.getAllConrods();
    const recipe = allConrods.find(conrod => 
      conrod.conrodName === conrodType &&
      conrod.conrodVariant === variant &&
      conrod.conrodSize === size
    );

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: "Recipe not found for this conrod configuration" },
        { status: 404 }
      );
    }

    // Get current pre-production inventory
    const preProductionItems = conrodDB.getAllPreProductionItems();
    
    // Find required pin in inventory
    const requiredPin = preProductionItems.find(item => 
      item.type === "pin" && 
      item.name === recipe.pinName && 
      item.size === recipe.pinSize
    );

    // Find required ball bearing in inventory  
    const requiredBallBearing = preProductionItems.find(item => 
      item.type === "ballBearing" && 
      item.name === recipe.ballBearingName && 
      item.variant === recipe.ballBearingVariant &&
      item.size === recipe.ballBearingSize
    );

    // Check inventory availability
    if (!requiredPin) {
      return NextResponse.json(
        { success: false, error: `Required pin (${recipe.pinName}, Size: ${recipe.pinSize}) not found in pre-production inventory` },
        { status: 400 }
      );
    }

    if (!requiredBallBearing) {
      return NextResponse.json(
        { success: false, error: `Required ball bearing (${recipe.ballBearingName}, ${recipe.ballBearingVariant}, Size: ${recipe.ballBearingSize}) not found in pre-production inventory` },
        { status: 400 }
      );
    }

    if (requiredPin.quantity < requestedQuantity) {
      return NextResponse.json(
        { success: false, error: `Insufficient pin inventory. Required: ${requestedQuantity}, Available: ${requiredPin.quantity}` },
        { status: 400 }
      );
    }

    if (requiredBallBearing.quantity < requestedQuantity) {
      return NextResponse.json(
        { success: false, error: `Insufficient ball bearing inventory. Required: ${requestedQuantity}, Available: ${requiredBallBearing.quantity}` },
        { status: 400 }
      );
    }

    // Deduct components from inventory (1:1 ratio)
    const updatedPin = conrodDB.updatePreProductionItem(requiredPin.id, {
      quantity: requiredPin.quantity - requestedQuantity,
      dateUpdated
    });

    const updatedBallBearing = conrodDB.updatePreProductionItem(requiredBallBearing.id, {
      quantity: requiredBallBearing.quantity - requestedQuantity,
      dateUpdated
    });

    if (!updatedPin || !updatedBallBearing) {
      return NextResponse.json(
        { success: false, error: "Failed to update inventory" },
        { status: 500 }
      );
    }

    // Create the assembly record
    const newAssembly = conrodDB.createPreProductionItem({
      name: conrodType,
      type: "conrod",
      size,
      variant,
      quantity: requestedQuantity,
      dateUpdated,
    });

    // Log the assembly creation activity
    conrodDB.createActivityLog({
      action: 'CREATE',
      module: 'conrod-assembly',
      entityId: newAssembly.id,
      entityName: conrodType,
      description: `Created conrod assembly: ${conrodType}`,
      details: `Variant: ${variant}, Size: ${size}, Quantity: ${requestedQuantity}. Components used: ${requestedQuantity}x ${recipe.pinName} (${recipe.pinSize}), ${requestedQuantity}x ${recipe.ballBearingName} (${recipe.ballBearingVariant}, ${recipe.ballBearingSize})`
    });

    // Log inventory deduction activities
    conrodDB.createActivityLog({
      action: 'DEDUCT',
      module: 'conrod-assembly',
      entityId: requiredPin.id,
      entityName: recipe.pinName,
      description: `Deducted components for conrod assembly: ${conrodType}`,
      details: `Pin: ${recipe.pinName} (${recipe.pinSize}) - Deducted: ${requestedQuantity}, Remaining: ${updatedPin.quantity}`
    });

    conrodDB.createActivityLog({
      action: 'DEDUCT',
      module: 'conrod-assembly',
      entityId: requiredBallBearing.id,
      entityName: recipe.ballBearingName,
      description: `Deducted components for conrod assembly: ${conrodType}`,
      details: `Ball Bearing: ${recipe.ballBearingName} (${recipe.ballBearingVariant}, ${recipe.ballBearingSize}) - Deducted: ${requestedQuantity}, Remaining: ${updatedBallBearing.quantity}`
    });

    return NextResponse.json({ 
      success: true, 
      data: newAssembly,
      inventoryDeducted: {
        pin: { name: recipe.pinName, size: recipe.pinSize, quantity: requestedQuantity },
        ballBearing: { name: recipe.ballBearingName, variant: recipe.ballBearingVariant, size: recipe.ballBearingSize, quantity: requestedQuantity }
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating conrod assembly:", error);
    
    return NextResponse.json(
      { success: false, error: "Failed to create conrod assembly" },
      { status: 500 }
    );
  }
}