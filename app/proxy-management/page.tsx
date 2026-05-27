import Link from "next/link";
import { Network, Plus, SlidersHorizontal } from "lucide-react";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProxyManagementPage() {
  await requireSession();
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-300">Proxy Management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Routing controls</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Configure proxy behavior and stage proxy entries locally before API integration.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/proxy-management/settings"
            className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.05]"
          >
            <SlidersHorizontal className="h-7 w-7 text-cyan-300" />
            <h2 className="mt-5 text-lg font-semibold text-white">Proxy Settings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Set usage mode and rotation method.</p>
          </Link>
          <Link
            href="/proxy-management/add-proxy"
            className="rounded-lg border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.05]"
          >
            <Plus className="h-7 w-7 text-cyan-300" />
            <h2 className="mt-5 text-lg font-semibold text-white">Add Proxy</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Validate and preview proxy records in real time.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
