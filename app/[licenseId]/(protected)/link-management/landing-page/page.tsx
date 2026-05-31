import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { domains, landingPages } from "@/lib/schema/main.schema";
import { LandingForm } from "../SettingsForms";

export const dynamic = "force-dynamic";

export default async function LandingPagePage() {
  const session = await requireSession();
  const [[row], domainRows] = await Promise.all([
    db.select().from(landingPages).where(eq(landingPages.licenseId, session.licenseId)).limit(1),
    db.select().from(domains).where(eq(domains.licenseId, session.licenseId)),
  ]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Link Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Landing Page</h1>
        </div>
        <LandingForm initial={{ url: row?.service ?? "" }} />
      </div>
    </div>
  );
}
