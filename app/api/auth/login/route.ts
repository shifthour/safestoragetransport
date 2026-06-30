// POST /api/auth/login  { email, password } → authenticate against the existing SafeStorage
// backend (transport_controller_Dev0/admin_login) and set the session cookie. Public (the proxy
// lets /api/auth/* through). No Supabase — the legacy backend is the source of truth for logins.
import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_MAX_AGE, signSession, SessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const API_BASE = process.env.SAFESTORAGE_API_BASE || "https://safestorage.in/back";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
  }

  // Verify the credentials with the existing SafeStorage admin login endpoint.
  let data: any = null;
  try {
    const body = new URLSearchParams({ email: String(email).trim(), password: String(password) });
    const r = await fetch(`${API_BASE}/transport_controller_Dev0/admin_login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    data = await r.json().catch(() => null);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not reach the login service — please try again." }, { status: 502 });
  }

  // The endpoint returns { status: true|false, message, ...user fields } — only a truthy status passes.
  const ok = data && (data.status === true || data.status === "true" || data.success === true);
  if (!ok) {
    return NextResponse.json({ ok: false, error: data?.message || "Invalid email or password" }, { status: 401 });
  }

  // Build the session from whatever user fields the backend returned (with safe fallbacks).
  const u = data.user || data.data || data;
  const session: SessionUser = {
    id: String(u.id ?? u.user_id ?? u.admin_id ?? email),
    email: String(u.email ?? email),
    name: String(u.name ?? u.admin_name ?? u.username ?? String(email).split("@")[0]),
    role: String(u.role ?? u.user_role ?? "admin"),
  };

  const res = NextResponse.json({ ok: true, user: session });
  res.cookies.set(COOKIE_NAME, signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
