// Real road travel times via OSRM (free public server) with an in-memory cache + haversine
// fallback. One `table` request per vendor returns all pairwise durations. Successful results are
// cached for the process lifetime (coords don't change); failures are cached briefly so we don't
// hammer OSRM but still retry. Falls back to straight-line ÷ 18 km/h if OSRM is unavailable.

type Pt = { lat: number; lng: number };

const cache = new Map<string, { m: (number | null)[][]; ok: boolean; ts: number }>();
const FAIL_TTL = 120_000; // 2 min before retrying OSRM after a failure
const OSRM_TIMEOUT = 3000;

function haversineMin(a: Pt, b: Pt): number {
  const R = 6371, toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.max(10, Math.round(((2 * R * Math.asin(Math.sqrt(x))) / 18) * 60));
}

// Returns an N×N matrix of driving minutes between the given points (matrix[i][j]).
export async function durationMatrix(points: Pt[]): Promise<(number | null)[][]> {
  if (points.length < 2) return [[0]];
  const key = points.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join(";");
  const c = cache.get(key);
  if (c && (c.ok || Date.now() - c.ts < FAIL_TTL)) return c.m;

  const fallback = () => points.map((a) => points.map((b) => haversineMin(a, b)));
  try {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?annotations=duration`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), OSRM_TIMEOUT);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    const j: any = await r.json(); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (j?.code === "Ok" && Array.isArray(j.durations)) {
      const mins = j.durations.map((row: number[]) => row.map((s) => (s == null ? null : Math.max(5, Math.round(s / 60)))));
      cache.set(key, { m: mins, ok: true, ts: Date.now() });
      return mins;
    }
  } catch {
    /* fall through to haversine */
  }
  const fb = fallback();
  cache.set(key, { m: fb, ok: false, ts: Date.now() });
  return fb;
}
