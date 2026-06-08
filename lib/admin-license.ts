import { notFound } from "next/navigation";

export function validateAdminLicense(licenseId: string) {
  const key = process.env.ADMIN_LICENSE_KEY;

  if (!key) {
    notFound();
  }

  const expected = `admin${key.replace(/-/g, "")}`;

  if (licenseId !== expected) {
    notFound();
  }

  return expected;
}