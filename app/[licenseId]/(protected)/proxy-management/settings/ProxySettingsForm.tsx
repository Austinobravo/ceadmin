"use client";

import { useActionState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { ActionState, saveProxySettings } from "../actions";

export function ProxySettingsForm({
  initialData,
}: {
  initialData: { useProxy: string; rotationMethod: string };
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProxySettings, {});

  return (
    <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-[var(--text)]">
          Use Proxy
          <select name="useProxy" defaultValue={initialData.useProxy} className="form-input">
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <label className="text-sm font-medium text-[var(--text)]">
          Rotation Method
          <select name="rotationMethod" defaultValue={initialData.rotationMethod} className="form-input">
            {/* <option value="sticky">Sticky Session</option>
            <option value="per-request">Per Request</option>
            <option value="interval">Timed Interval</option> */}
            <option value="sequential">Sequential</option> 
            <option value="random">Random</option> 
          </select>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          {state.error ? <span className="text-rose-300">{state.error}</span> : null}
          {state.success ? <span className="text-emerald-400">{state.success}</span> : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {state.success ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
