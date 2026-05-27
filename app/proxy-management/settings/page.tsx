import { ProxySettingsForm } from "./ProxySettingsForm";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { proxySettings } from "@/lib/schema/main.schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ProxySettingsPage() {
  const session = await requireSession();
  const [settings] = await db
    .select()
    .from(proxySettings)
    .where(eq(proxySettings.licenseId, session.licenseId))
    .limit(1);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Proxy Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Proxy settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Validate proxy usage and rotation preferences without calling an API.
          </p>
        </div>
        <ProxySettingsForm
          initialData={{
            useProxy: settings?.useProxy ?? "enabled",
            rotationMethod: settings?.rotationMethod ?? "sticky",
          }}
        />
      </div>
    </div>
  );
}
