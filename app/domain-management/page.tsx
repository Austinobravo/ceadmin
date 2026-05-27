import Link from "next/link";
import { Globe2, Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DomainManagementPage() {
  await requireSession();
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Domain Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Domain routing</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Create local domain link records and preview them before wiring them to an API.
          </p>
        </div>
        <Link
          href="/domain-management/add-domain"
          className="block rounded-lg border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.05]"
        >
          <Plus className="h-7 w-7 text-cyan-300" />
          <h2 className="mt-5 text-lg font-semibold text-white">Add New Domain</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Validate domain, DNS, subdomain, and path values with a real-time list.
          </p>
        </Link>
      </div>
    </div>
  );
}
