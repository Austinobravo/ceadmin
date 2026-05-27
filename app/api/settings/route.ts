// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { configDb } from "@/lib/db";
import { settings } from "@/lib/schema/config.schema";
import { eq } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

const KNOWN_KEYS = ["BOT_TOKEN", "CHAT_ID", "H_KEY", "R_KEY", "LANDING_URL"] as const;

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const rows = configDb.select().from(settings).all();

    // Build a typed map, only exposing known keys
    const result: Record<string, string | null> = Object.fromEntries(
      KNOWN_KEYS.map((k) => [k, null])
    );
    for (const row of rows) {
      if (KNOWN_KEYS.includes(row.key as any)) {
        result[row.key] = row.value;
      }
    }

    return NextResponse.json({ success: true, settings: result });
  } catch (error: any) {
    console.error("Settings GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { settings: incoming } = body;

    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings format" },
        { status: 400 }
      );
    }

    // Upsert each key atomically
    configDb.transaction((tx) => {
      for (const [key, value] of Object.entries(incoming)) {
        tx.insert(settings)
          .values({ key, value: String(value) })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value: String(value) },
          })
          .run();
      }
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Settings POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
