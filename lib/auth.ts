import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { db } from "@/lib/db";
import { adminSessions, licenses } from "@/lib/schema/main.schema";

const SESSION_COOKIE = "ce_session";
const LAST_LICENSE_COOKIE = "ce_last_license";
const SESSION_DAYS = 7;

export type AuthSession = {
  licenseId: string;
  expiresAt: string;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${key}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [, salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(key, "hex");
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
}

export function normalizeLicenseId(licenseId: string) {
  return licenseId.trim().replace(/^\/+/, "");
}

export async function getLicenseForAuth(licenseId: string) {
  const normalized = normalizeLicenseId(licenseId);
  const [license] = await db.select().from(licenses).where(eq(licenses.licenseId, normalized)).limit(1);
  return license ?? null;
}

export async function ensureLicense(licenseId: string) {
  const normalized = normalizeLicenseId(licenseId);
  const existing = await getLicenseForAuth(normalized);
  if (existing) return existing;

  const expiresAt = addDays(new Date(), 30).toISOString();
  await db.insert(licenses).values({
    licenseId: normalized,
    passwordHash: null,
    expiresAt,
  });

  const [created] = await db.select().from(licenses).where(eq(licenses.licenseId, normalized)).limit(1);
  return created;
}

export async function createSession(licenseId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = addDays(new Date(), SESSION_DAYS);

  await db.insert(adminSessions).values({
    sessionTokenHash: tokenHash,
    licenseId,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  cookieStore.set(LAST_LICENSE_COOKIE, licenseId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: addDays(new Date(), 365),
  });
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.sessionTokenHash, hashToken(token)))
    .limit(1);

  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    if (session) {
      await db.delete(adminSessions).where(eq(adminSessions.sessionTokenHash, session.sessionTokenHash));
    }
    return null;
  }

  await db
    .update(adminSessions)
    .set({ lastSeenAt: new Date().toISOString() })
    .where(eq(adminSessions.sessionTokenHash, session.sessionTokenHash));

  return { licenseId: session.licenseId, expiresAt: session.expiresAt };
});

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    const cookieStore = await cookies();
    const lastLicense = cookieStore.get(LAST_LICENSE_COOKIE)?.value;
    redirect(lastLicense ? `/${lastLicense}` : "/");
  }
  return session;
}

export async function getLastLicenseId() {
  const cookieStore = await cookies();
  return cookieStore.get(LAST_LICENSE_COOKIE)?.value ?? null;
}

export async function requireRouteSession() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.sessionTokenHash, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
