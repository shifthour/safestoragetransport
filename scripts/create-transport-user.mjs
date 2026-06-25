// Create (or update) a Transport-module login.
//   node scripts/create-transport-user.mjs <email> <password> "<Full Name>" [role]
// Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env.local. Passwords are scrypt-hashed with
// the SAME scheme as lib/auth.ts so the app can verify them.
import { createClient } from "@supabase/supabase-js";
import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

// load .env.local (simple parser; doesn't override already-set env)
try {
  const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local — rely on real env */ }

const [email, password, name, role = "admin"] = process.argv.slice(2);
if (!email || !password || !name) {
  console.error('Usage: node scripts/create-transport-user.mjs <email> <password> "<Full Name>" [role]');
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local).");
  process.exit(1);
}

const hashPassword = (pw) => {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "safestorage" },
  auth: { persistSession: false },
});

const { data, error } = await db
  .from("transport_users")
  .upsert({ email, name, role, active: true, password_hash: hashPassword(password) }, { onConflict: "email" })
  .select("id, email, name, role, active")
  .single();

if (error) { console.error("Failed:", error.message); process.exit(1); }
console.log("✅ Transport user ready:", data);
