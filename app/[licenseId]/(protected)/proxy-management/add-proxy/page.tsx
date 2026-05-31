import { AddProxyForm } from "./AddProxyForm";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { proxies } from "@/lib/schema/main.schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AddProxyPage() {
  const session = await requireSession();
  const records = await db
    .select()
    .from(proxies)
    .where(eq(proxies.licenseId, session.licenseId))
    .orderBy(desc(proxies.createdAt));

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Proxy Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Add proxy</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Add proxy details locally and see validated entries appear immediately.
          </p>
        </div>
        <AddProxyForm records={records} />
      </div>
    </div>
  );
}
