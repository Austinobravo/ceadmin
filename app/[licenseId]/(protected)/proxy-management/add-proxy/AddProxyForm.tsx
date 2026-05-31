"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Server, Trash2 } from "lucide-react";
import { addProxy, ActionState, deleteProxy } from "../actions";

export type ProxyRecord = {
  id: number;
  proxyType: string;
  username: string;
  password: string;
  ipAddress: string;
  port: number;
  createdAt: string;
};

export function AddProxyForm({ records }: { records: ProxyRecord[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addProxy, {});
  const [deleteTarget, setDeleteTarget] = useState<ProxyRecord | null>(null);
  const [deleteState, setDeleteState] = useState<ActionState>({});
  const [isDeleting, startDeleteTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteProxy(deleteTarget.id);
      setDeleteState(result);
      if (!result.error) setDeleteTarget(null);
    });
  }

  return (
    <>
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="grid gap-5">
          <label className="block text-sm font-medium text-[var(--text)]">
            Proxy Type
            <select name="proxyType" defaultValue="https" className="form-input" required>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks4">SOCKS4</option>
              <option value="socks5">SOCKS5</option>
            </select>
          </label>
          <Input name="username" label="Username" placeholder="proxy_user" />
          <Input name="password" label="Password" placeholder="Proxy password" type="password" />
          <Input name="ipAddress" label="IP Address" placeholder="192.0.2.10" />
          <Input name="port" label="Port" placeholder="8080" type="number" />
        </div>
        {state.error ? <p className="mt-4 text-sm text-rose-300">{state.error}</p> : null}
        {state.success ? <p className="mt-4 text-sm text-emerald-400">{state.success}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {pending ? "Adding..." : "Add Proxy"}
        </button>
      </form>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 className="font-semibold text-[var(--text)]">Added proxies</h2>
          <span className="rounded-md bg-[var(--surface)] px-2 py-1 text-xs text-[var(--muted)]">{records.length} total</span>
        </div>
        {deleteState.error ? <p className="px-5 pt-4 text-sm text-rose-300">{deleteState.error}</p> : null}
        {deleteState.success ? <p className="px-5 pt-4 text-sm text-emerald-400">{deleteState.success}</p> : null}
        <div className="divide-y divide-[var(--border)]">
          {records.map((record) => (
            <div key={record.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-cyan-400" />
                  <p className="font-mono text-sm text-[var(--text)]">
                    {record.ipAddress}:{record.port}
                  </p>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {record.proxyType.toUpperCase()} / {record.username} / {record.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-fit rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)]">
                  PX-{String(record.id).padStart(3, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(record)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/20 text-rose-300 transition hover:bg-rose-400/10"
                  aria-label={`Delete proxy ${record.ipAddress}`}
                  title="Delete proxy"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {records.length === 0 ? <p className="p-5 text-sm text-[var(--muted)]">No proxies added yet.</p> : null}
        </div>
      </section>
    </div>
    {deleteTarget ? (
      <ConfirmDeleteModal
        title="Delete proxy?"
        description={`This will remove ${deleteTarget.ipAddress}:${deleteTarget.port} from this license.`}
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

function Input({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-[var(--text)]">
      {label}
      <input name={name} type={type} className="form-input" placeholder={placeholder} required/>
    </label>
  );
}
