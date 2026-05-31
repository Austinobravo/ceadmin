"use client";

import { useEffect, useMemo, useState } from "react";
import { HelpCircle, X } from "lucide-react";

type Step = {
  title: string;
  body: string;
};

const tourVersion = "2026-05-31-support-pagination-data-tour";

const steps: Step[] = [
  {
    title: "What CE Admin Does",
    body: "CE Admin helps you manage a license-scoped dashboard for captured log data, proxy routing, domain records, link behavior, notification settings, and security activity.",
  },
  {
    title: "Where Data Is Saved",
    body: "Dashboard settings and records are saved in the database through authenticated server actions. Proxies and domains are configured to route through your dashboard server, which can be self-hosted or run on our managed infrastructure.",
  },
  {
    title: "Overview Table",
    body: "The overview table is paginated for long log datasets. Use search to filter, the eye button for full details, download for log JSON, and delete only after confirming.",
  },
  {
    title: "Management Areas",
    body: "Use Proxy Management, Domain Management, and Link Management to control routing, landing pages, Telegram notifications, captcha, and single-link behavior.",
  },
  {
    title: "Support",
    body: "The Support section lists contact channels for license access, configuration help, and operational questions. Never share your password in support messages.",
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
