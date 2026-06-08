"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, ensureLicense, hashPassword, verifyPassword } from "@/lib/auth";
import { licenses } from "@/lib/schema/main.schema";
import { eq } from "drizzle-orm";
import { getClientIp } from "@/lib/get-ip";
import { checkLoginLock, clearLoginAttempts, recordFailedLogin } from "@/lib/rate-limit";

export type AuthFormState = {
  error?: string;
};

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export async function loginLicense(
  licenseId: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {

   const ipAddress = await getClientIp(); 

  //  Browse fingerprint is intentionally omitted to avoid issues with users behind proxies or NAT, and to simplify the implementation. The rate limiting is based on licenseId + IP, which should provide a reasonable balance between security and usability for this admin interface.
  //  const userAgent =
  // (await headers()).get("user-agent") ?? "unknown";

  // const identifier = `${licenseId}:${ip}:${userAgent}`;

  // const identifierHash = crypto
  //   .createHash("sha256")
  //   .update(identifier)
  //   .digest("hex");

  const lockStatus = await checkLoginLock(
    licenseId,
    ipAddress
  );

  if (lockStatus.locked) {
    return {
      error:
        "Too many failed login attempts. Try again later.",
    };
  }
  const password = String(formData.get("password") ?? "");
  const license = await ensureLicense(licenseId);
  

  if (!license.passwordHash) {
    return { error: "This license has no password yet. Create one first." };
  }

  if (!verifyPassword(password, license.passwordHash)) {
    await recordFailedLogin(
      licenseId,
      ipAddress
    );
    return { error: "Invalid password." };
  }

  await clearLoginAttempts(
    licenseId,
    ipAddress
  );

  await createSession(license.licenseId);
  redirect(`/${license.licenseId}/overview`);
}

export async function setupLicense(
  licenseId: string,
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const parsed = passwordSchema.safeParse(password);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a stronger password." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const license = await ensureLicense(licenseId);
  await db
    .update(licenses)
    .set({
      passwordHash: hashPassword(password),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(licenses.licenseId, license.licenseId));

  await createSession(license.licenseId);
  redirect(`/${license.licenseId}/overview`);

}
