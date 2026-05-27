import { AddDomainForm } from "./AddDomainForm";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { domains } from "@/lib/schema/main.schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AddDomainPage() {
  const session = await requireSession();
  const records = await db
    .select()
    .from(domains)
    .where(eq(domains.licenseId, session.licenseId))
    .orderBy(desc(domains.createdAt));

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Domain Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Add new domain</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Add domain routing data locally and see each validated record immediately.
          </p>
        </div>
        <AddDomainForm records={records} />
      </div>
    </div>
  );
}
