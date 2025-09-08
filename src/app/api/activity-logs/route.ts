import { NextRequest, NextResponse } from "next/server";
import { conrodDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module') as 'pre-production' | 'conrod-assembly' | 'billing' | null;
    
    let logs;
    if (module) {
      logs = conrodDB.getActivityLogsByModule(module);
    } else {
      logs = conrodDB.getAllActivityLogs();
    }

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}