// Server-side session access for Server Components / Route Handlers (uses next/headers cookies).
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession, SessionUser } from "./auth";

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySession(token);
}
