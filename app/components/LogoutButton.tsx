"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)]"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-[var(--text)]">Log out?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Your current dashboard session will end on this device.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(() => logout())}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
