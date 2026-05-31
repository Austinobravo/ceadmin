"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
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

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="Close logout dialog"
                onClick={() => setOpen(false)}
              />
              <div className="relative w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <LogOut className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[var(--text)]">Log out of CE Admin?</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Your session will end on this device. You can sign in again from your license route.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => logout())}
                    className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
                  >
                    {pending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
