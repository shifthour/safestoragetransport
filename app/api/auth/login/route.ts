// POST /api/auth/login  { email, password } → verify against safestorage.transport_users, set the
// session cookie. Public (the proxy lets /api/auth/* through).
import { NextRequest, NextResponse } from "next/server";
import { db, hasDb } from "@/lib/db";
import { COOKIE_NAME, SESSION_MAX_AGE, signSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!hasDb) return NextResponse.json({ ok: false, error: "auth not configured" }, { status: 500 });
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });

  const { data: user } = await db()
    .from("transport_users")
    .select("id, email, name, role, password_hash, active")
    .ilike("email", String(email).trim())
    .maybeSingle();

  // Same response whether the user is missing or the password is wrong (don't leak which).
  if (!user || !user.active || !verifyPassword(String(password), user.password_hash)) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  const session = { id: user.id, email: user.email, name: user.name, role: user.role };
  const res = NextResponse.json({ ok: true, user: session });
  res.cookies.set(COOKIE_NAME, signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // best-effort last-login stamp
  await db().from("transport_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
  return res;
}
