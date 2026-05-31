"use client";

import React, { useActionState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { AuthFormState, loginLicense, setupLicense } from "./actions";

export function AuthForm({
  licenseId,
  mode,
}: {
  licenseId: string;
  mode: "login" | "setup";
}) {
  const action = mode === "login" ? loginLicense.bind(null, licenseId) : setupLicense.bind(null, licenseId);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, {});
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = React.useState(false);

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-cyan-300">{mode === "login" ? "Welcome back" : "Activate license"}</p>
          <h1 className="truncate text-xl font-semibold text-white">{licenseId}</h1>
        </div>
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-400">
        {mode === "login"
          ? "Enter the password for this license to continue."
          : "Create the first password for this license. It will be securely hashed before storage."}
      </p>

      <label htmlFor="password" className="mt-6 block text-sm font-medium text-slate-300">
        Password
      </label>
      <div className="relative mt-2 flex items-center rounded-lg border border-white/10 bg-[#0d1117] px-3 focus-within:border-cyan-300">
      <div className="mt-2 flex items-center rounded-lg  bg-[#0d1117] px-3w-10/12">
        <LockKeyhole className="h-5 w-5 text-slate-500" />
        <input
          id="password"
          name="password"
          type={isPasswordVisible ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600"
          placeholder="Enter password"
          required
        />
      </div>
      {isPasswordVisible ? (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(false)}
          className="absolute right-3 top-[calc(50%+0.5rem)] -translate-y-1/2 text-sm text-slate-400 hover:text-slate-200"
        >
          Hide
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(true)}
          className="absolute right-3 top-[calc(50%+0.5rem)] -translate-y-1/2 text-sm text-slate-400 hover:text-slate-200"
        >
          Show
        </button>
      )}

      </div>

      {mode === "setup" ? (
        <>
          <label htmlFor="confirmPassword" className="mt-5 block text-sm font-medium text-slate-300">
            Confirm Password
          </label>
          <div className="relative mt-2 flex items-center rounded-lg border border-white/10 bg-[#0d1117] px-3 focus-within:border-cyan-300">
           <div className="mt-2 flex items-center rounded-lg  bg-[#0d1117] px-3 ">
          <LockKeyhole className="h-5 w-5 text-slate-500" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={isConfirmPasswordVisible ? "text" : "password"}
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600"
            placeholder="Confirm Password"
            required
          />
        </div>
        {isConfirmPasswordVisible ? (
          <button
            type="button"
            onClick={() => setIsConfirmPasswordVisible(false)}
            className="absolute right-3 top-[calc(50%+0.5rem)] -translate-y-1/2 text-sm text-slate-400 hover:text-slate-200"
          >
            Hide
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmPasswordVisible(true)}
            className="absolute right-3 top-[calc(50%+0.5rem)] -translate-y-1/2 text-sm text-slate-400 hover:text-slate-200"
          >
            Show
          </button>
        )}
        </div>
        </>
      ) : null}

      {state.error ? <p className="mt-4 text-sm text-rose-300">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Checking..." : mode === "login" ? "Unlock Dashboard" : "Create Password"}
      </button>
    </form>
  );
}
