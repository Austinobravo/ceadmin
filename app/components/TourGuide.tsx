"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, X } from "lucide-react";

type Step = {
  title: string;
  body: string;
};

const tourVersion = "2026-05-dashboard-link-management";

const steps: Step[] = [
  {
    title: "Overview",
    body: "Start with license status, expiry countdown, and current database totals.",
  },
  {
    title: "Management links",
    body: "Proxy, domain, and link settings now save through authenticated server actions.",
  },
  {
    title: "Long tables",
    body: "Dense rows are shortened for scanning. Use row actions and detail dialogs for full payloads.",
  },
];

export function TourGuide() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.localStorage.getItem(`tour:${tourVersion}`) !== "done") {
      setOpen(true);
    }
  }, []);

  const step = useMemo(() => steps[index], [index]);

  function closeTour() {
    window.localStorage.setItem(`tour:${tourVersion}`, "done");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-400/20"
        aria-label="Open tour"
        title="Open tour"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-cyan-400">
                  Step {index + 1} of {steps.length}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{step.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeTour}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)]"
                aria-label="Close tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
                disabled={index === 0}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] disabled:opacity-40"
              >
                Back
              </button>
              {index === steps.length - 1 ? (
                <button
                  type="button"
                  onClick={closeTour}
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Finish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((current) => current + 1)}
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
