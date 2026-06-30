// Single source of truth for the deployment sub-path. The app is served under
// /safestorage-transport on the cPanel host, but every internal link/fetch is
// written as if the app were at the domain root — withBase() prefixes them at
// runtime so the same code works at root or under the sub-path.
export const BASE_PATH = "/safestorage-transport";

/** Prefix an absolute in-app path with BASE_PATH (idempotent; leaves external/relative URLs alone). */
export function withBase(path: string): string {
  if (!path || path[0] !== "/" || path[1] === "/") return path; // external or protocol-relative
  if (path === BASE_PATH || path.startsWith(BASE_PATH + "/")) return path; // already prefixed
  return BASE_PATH + path;
}
