"use client";

import { useActionState, useState, useTransition } from "react";
import { Globe2, Plus, Trash2 } from "lucide-react";
import { ActionState, addDomain, deleteDomain } from "../actions";

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
  const [deleteTarget, setDeleteTarget] = useState<DomainRecord | null>(null);
  const [deleteState, setDeleteState] = useState<ActionState>({});
  const [isDeleting, startDeleteTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteDomain(deleteTarget.id);
      setDeleteState(result);
      if (!result.error) setDeleteTarget(null);
    });
  }

  return (
    <>
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
        <p className="text-amber-500 text-sm py-4">Full link becomes https://subdomain.domain.com/path . Use your current link as guide.</p>
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
        {deleteState.error ? <p className="px-5 pt-4 text-sm text-rose-300">{deleteState.error}</p> : null}
        {deleteState.success ? <p className="px-5 pt-4 text-sm text-emerald-400">{deleteState.success}</p> : null}
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
                <div className="flex items-center gap-2">
                  <span className="h-fit rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                    DM-{String(record.id).padStart(3, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(record)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/20 text-rose-300 transition hover:bg-rose-400/10"
                    aria-label={`Delete ${record.domain}`}
                    title="Delete domain"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {records.length === 0 ? <p className="p-5 text-sm text-[var(--muted)]">No domains added yet.</p> : null}
        </div>
      </section>
    </div>
    {deleteTarget ? (
      <ConfirmDeleteModal
        title="Delete domain?"
        description={`This will remove ${deleteTarget.subdomain}.${deleteTarget.domain}${deleteTarget.path} from this license.`}
        pending={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    ) : null}
    </>
  );
}

function ConfirmDeleteModal({
  title,
  description,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-[var(--text)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)]">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="block text-sm font-medium text-[var(--text)]">
      {label}
      <input name={name} className="form-input" placeholder={placeholder} required/>
    </label>
  );
}
