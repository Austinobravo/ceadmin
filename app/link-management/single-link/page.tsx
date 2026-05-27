import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { singleLinkSettings } from "@/lib/schema/main.schema";
import { OptionForm } from "../SettingsForms";

export const dynamic = "force-dynamic";

export default async function SingleLinkPage() {
  const session = await requireSession();
  const [row] = await db.select().from(singleLinkSettings).where(eq(singleLinkSettings.licenseId, session.licenseId)).limit(1);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Link Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Use as Single Link</h1>
        </div>
        <OptionForm type="single-link" initial={row?.option ?? "disabled"} />
      </div>
    </div>
  );
}
