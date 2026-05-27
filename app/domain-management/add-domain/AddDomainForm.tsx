"use client";

import { useActionState } from "react";
import { Globe2, Plus } from "lucide-react";
import { ActionState, addDomain } from "../actions";

export type DomainRecord = {
  id: number;
  domain: string;
  domainDns: string;
  subdomain: string;
  path: string;
  createdAt: string;
};

export function AddDomainForm({ records }: { records: DomainRecord[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addDomain, {});

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="grid gap-5">
          <Input name="domain" label="Domain" placeholder="example.com" />
          <Input name="domainDns" label="Domain DNS" placeholder="cloudflare, route53, custom DNS" />
          <Input name="subdomain" label="Subdomain to use for the link" placeholder="login" />
          <Input name="path" label="Path to use for the link" placeholder="/secure" />
        </div>
        {state.error ? <p className="mt-4 text-sm text-rose-300">{state.error}</p> : null}
        {state.success ? <p className="mt-4 text-sm text-emerald-400">{state.success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {pending ? "Adding..." : "Add Domain"}
        </button>
      </form>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-semibold text-[var(--text)]">Domain records</h2>
          <span className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)]">{records.length} total</span>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {records.map((record) => {
            const link = `https://${record.subdomain}.${record.domain}${record.path}`;
            return (
              <div key={record.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-cyan-400" />
                    <p className="truncate text-sm font-semibold text-[var(--text)]">{link}</p>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    DNS: {record.domainDns} / Domain: {record.domain} / {record.createdAt}
                  </p>
                </div>
                <span className="h-fit rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                  DM-{String(record.id).padStart(3, "0")}
                </span>
              </div>
            );
          })}
          {records.length === 0 ? <p className="p-5 text-sm text-[var(--muted)]">No domains added yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

function Input({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="block text-sm font-medium text-[var(--text)]">
      {label}
      <input name={name} className="form-input" placeholder={placeholder} />
    </label>
  );
}
