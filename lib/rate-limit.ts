import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminLoginAttempts } from "@/lib/schema/main.schema";

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export async function checkLoginLock(
  licenseId: string,
  ipAddress: string
) {
  const record = await db.query.adminLoginAttempts.findFirst({
    where: and(
      eq(adminLoginAttempts.licenseId, licenseId),
      eq(adminLoginAttempts.ipAddress, ipAddress)
    ),
  });

  if (!record?.lockedUntil) {
    return { locked: false };
  }

  const lockedUntil = new Date(record.lockedUntil);

  if (lockedUntil > new Date()) {
    return {
      locked: true,
      remainingMs:
        lockedUntil.getTime() - Date.now(),
    };
  }

  return { locked: false };
}

export async function recordFailedLogin(
  licenseId: string,
  ipAddress: string
) {
  const existing = await db.query.adminLoginAttempts.findFirst({
    where: and(
      eq(adminLoginAttempts.licenseId, licenseId),
      eq(adminLoginAttempts.ipAddress, ipAddress)
    ),
  });

  if (!existing) {
    await db.insert(adminLoginAttempts).values({
      licenseId,
      ipAddress,
      failedAttempts: 1,
    });

    return;
  }

  const attempts = existing.failedAttempts + 1;

  const updateData: any = {
    failedAttempts: attempts,
    lastAttemptAt: new Date().toISOString(),
  };

  if (attempts >= MAX_ATTEMPTS) {
    updateData.lockedUntil = new Date(
      Date.now() + LOCK_TIME_MINUTES * 60 * 1000
    ).toISOString();
  }

  await db
    .update(adminLoginAttempts)
    .set(updateData)
    .where(eq(adminLoginAttempts.id, existing.id));
}

export async function clearLoginAttempts(
  licenseId: string,
  ipAddress: string
) {
  await db
    .delete(adminLoginAttempts)
    .where(
      and(
        eq(adminLoginAttempts.licenseId, licenseId),
        eq(adminLoginAttempts.ipAddress, ipAddress)
      )
    );
}