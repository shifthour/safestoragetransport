"use client";

import { useState } from "react";
import { withBase } from "@/lib/base";

const FEATURES = [
  { icon: "M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4", label: "Smart vendor allocation" },
  { icon: "M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", label: "Schedules & day plans" },
  { icon: "M3 3v18h18M7 14l3-3 3 3 5-6", label: "Cost & margin tracking" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j.error || "Sign in failed");
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = withBase(next && next.startsWith("/") ? next : "/");
    } catch {
      setError("Network error — please try again");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/60 md:grid-cols-2">
        {/* ── Left: dark brand panel ─────────────────────────────────────────── */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white md:flex">
          {/* faint grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />
          <div className="relative">
            <div className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase("/safestorage-logo.svg")} alt="SafeStorage" className="h-9 w-auto" />
            </div>
            <div className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Smart Transport · Ops Console
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Your transport ops,<br />all in one place.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Allocate vendors, build day plans, and track cost &amp; margin for SafeStorage pickups and
              retrievals — from a single, focused workspace.
            </p>
          </div>
          <ul className="relative mt-10 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d={f.icon} />
                  </svg>
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: sign-in form ────────────────────────────────────────────── */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          {/* logo on small screens (left panel is hidden) */}
          <div className="mb-8 md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/safestorage-logo.svg")} alt="SafeStorage" className="h-9 w-auto" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sign in</div>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Enter your credentials to access the Transport console.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
                <input
                  type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@safestorage.in"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                </span>
                <input
                  type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600" aria-label={show ? "Hide password" : "Show password"}>
                  {show
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-3.2 4.3M6.6 6.6A18.6 18.6 0 0 0 2 12s3 8 10 8a10.8 10.8 0 0 0 5.4-1.4" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <span className="text-sm font-medium text-slate-400">Contact admin to reset</span>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</div>
            )}

            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {busy ? "Signing in…" : <>Sign in <span aria-hidden>→</span></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">SafeStorage staff only · Contact your admin for access</p>
        </div>
      </div>
    </div>
  );
}
