// app/api/security/route.ts
import { NextResponse } from "next/server";
import { securityDb } from "@/lib/db";
import { tokens, trackingCookies, ipLog } from "@/lib/schema/security.schema";
import { eq, and, desc, lt, sql } from "drizzle-orm";
import { requireRouteSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireRouteSession())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const ipLogs = securityDb
      .select()
      .from(ipLog)
      .orderBy(desc(ipLog.timestamp))
      .limit(50)
      .all();

    const cookieLogs = securityDb
      .select()
      .from(trackingCookies)
      .orderBy(desc(trackingCookies.created_at))
      .limit(50)
      .all();

    const tokenRows = securityDb
      .select()
      .from(tokens)
      .orderBy(desc(tokens.created_at))
      .limit(50)
      .all();

    return NextResponse.json({
      success: true,
      ipLogs,
      trackingCookies: cookieLogs,
      tokens: tokenRows,
    });
  } catch (error: any) {
    console.error("Security GET Error:", error);
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
    const { action, ip, token, cookieValue } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action parameter" },
        { status: 400 }
      );
    }

    // --- logIP ---
    if (action === "logIP") {
      if (!ip)
        return NextResponse.json(
          { success: false, error: "Missing IP" },
          { status: 400 }
        );

      securityDb
        .insert(ipLog)
        .values({ ip, timestamp: Date.now() })
        .onConflictDoUpdate({
          target: ipLog.ip,
          set: { timestamp: Date.now() },
        })
        .run();

      return NextResponse.json({
        success: true,
        message: `IP ${ip} logged successfully`,
      });
    }

    // --- checkIP ---
    if (action === "checkIP") {
      if (!ip)
        return NextResponse.json(
          { success: false, error: "Missing IP" },
          { status: 400 }
        );

      const fiveMinutesAgo = Date.now() - 300_000;

      // Purge stale entries
      securityDb.delete(ipLog).where(lt(ipLog.timestamp, fiveMinutesAgo)).run();

      const row = securityDb
        .select({ ip: ipLog.ip })
        .from(ipLog)
        .where(eq(ipLog.ip, ip))
        .get();

      return NextResponse.json({ success: true, exists: !!row });
    }

    // --- addToken ---
    if (action === "addToken") {
      if (!token)
        return NextResponse.json(
          { success: false, error: "Missing token" },
          { status: 400 }
        );

      securityDb
        .insert(tokens)
        .values({ token })
        .onConflictDoNothing()
        .run();

      return NextResponse.json({
        success: true,
        message: "Token stored successfully",
      });
    }

    // --- checkToken ---
    if (action === "checkToken") {
      if (!token)
        return NextResponse.json(
          { success: false, error: "Missing token" },
          { status: 400 }
        );

      const row = securityDb
        .select({ token: tokens.token })
        .from(tokens)
        .where(eq(tokens.token, token))
        .get();

      return NextResponse.json({ success: true, isValid: !!row });
    }

    // --- addTrackingCookie ---
    if (action === "addTrackingCookie") {
      if (!cookieValue || !ip)
        return NextResponse.json(
          { success: false, error: "Missing cookieValue or IP" },
          { status: 400 }
        );

      securityDb
        .insert(trackingCookies)
        .values({ cookie_value: cookieValue, ip })
        .onConflictDoNothing()
        .run();

      return NextResponse.json({
        success: true,
        message: "Tracking cookie stored successfully",
      });
    }

    // --- checkTrackingCookie ---
    if (action === "checkTrackingCookie") {
      if (!cookieValue || !ip)
        return NextResponse.json(
          { success: false, error: "Missing cookieValue or IP" },
          { status: 400 }
        );

      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;

      const row = securityDb
        .select({ cookie_value: trackingCookies.cookie_value })
        .from(trackingCookies)
        .where(
          and(
            eq(trackingCookies.cookie_value, cookieValue),
            eq(trackingCookies.ip, ip),
            sql`${trackingCookies.created_at} > ${oneHourAgo}`
          )
        )
        .get();

      return NextResponse.json({ success: true, isValid: !!row });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Security POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
