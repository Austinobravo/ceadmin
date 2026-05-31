import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { captchaSettings } from "@/lib/schema/main.schema";
import { OptionForm } from "../SettingsForms";

export const dynamic = "force-dynamic";

export default async function CaptchaPage() {
  const session = await requireSession();
  const [row] = await db.select().from(captchaSettings).where(eq(captchaSettings.licenseId, session.licenseId)).limit(1);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Link Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">Use Captcha</h1>
        </div>
        <OptionForm type="captcha" initial={row?.option ?? "disabled"} />
      </div>
    </div>
  );
}
