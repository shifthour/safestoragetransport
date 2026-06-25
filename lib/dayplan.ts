// Server-side day plan for one vendor: a realistic, time-windowed itinerary with REAL road travel
// (OSRM, cached) + work estimates. Earliest customer-window trips run first; retrievals from a
// warehouse load together then deliver; pickups visit + pack. A stop that lands after its window
// end is flagged late. Computed in loadSchedule so the client just renders it.

import { durationMatrix } from "./routing";

const START_MIN = 9 * 60;   // 9:00 AM
const PICKUP_WORK = 240;    // pickup = packing + loading ~4h
const RETR_DELIVER = 60;    // retrieval = deliver/unload ~1h
const WH_UNLOAD = 30;       // unload pickups at the warehouse
const FLAT_TRAVEL = 30;     // fallback when a point has no coordinates

type Pt = { lat: number; lng: number } | null;

export interface PlanStep { kind: string; label: string; travel: number; work: number; arrive: number; depart: number; slot?: string | null; lift?: string | null; late?: boolean }
export interface VendorPlan { steps: PlanStep[]; end: number; byOrder: Record<string, { arrive: number; depart: number; late: boolean }> }

/* eslint-disable @typescript-eslint/no-explicit-any */
function ptOf(o: any): Pt { return o?.lat && o?.lng ? { lat: Number(o.lat), lng: Number(o.lng) } : null; }
function whOf(o: any): Pt { return o?.warehouse_lat && o?.warehouse_lng ? { lat: Number(o.warehouse_lat), lng: Number(o.warehouse_lng) } : null; }

function slotRange(slot: string | null | undefined): { start: number; end: number } | null {
  if (!slot) return null;
  const s = String(slot).toLowerCase();
  const re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/g; const ts: number[] = []; let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    let h = +m[1]; const mi = m[2] ? +m[2] : 0; const ap = m[3];
    if (ap === "pm" && h !== 12) h += 12; if (ap === "am" && h === 12) h = 0;
    ts.push(h * 60 + mi);
  }
  if (ts.length) return { start: ts[0], end: ts[ts.length - 1] || ts[0] };
  // fuzzy textual windows (from customer notes, e.g. "morning slot")
  if (/\bmorning\b/.test(s)) return { start: 9 * 60, end: 12 * 60 };
  if (/\bnoon\b/.test(s)) return { start: 12 * 60, end: 13 * 60 };
  if (/\bafter\s?noon\b/.test(s)) return { start: 13 * 60, end: 16 * 60 };
  if (/\bevening\b/.test(s)) return { start: 16 * 60, end: 19 * 60 };
  if (/\bnight\b/.test(s)) return { start: 18 * 60, end: 21 * 60 };
  return null;
}
// The customer's EFFECTIVE window: an explicit note request (required_time) outranks the booked
// slot. This is what the day plan sequences and flags lateness against — customer preference first.
const effWindow = (o: any) => slotRange(o.required_time) ?? slotRange(o.time_slot);
const effStart = (o: any) => effWindow(o)?.start ?? Infinity;

export async function buildVendorPlan(v: any): Promise<VendorPlan> {
  // collect every point (depot + warehouses + stops) for one OSRM matrix request
  const pts: { lat: number; lng: number }[] = [];
  const idx = new Map<string, number>();
  const add = (p: Pt) => { if (!p) return; const k = `${p.lat},${p.lng}`; if (!idx.has(k)) { idx.set(k, pts.length); pts.push(p); } };
  const depot: Pt = v.depotLat && v.depotLng ? { lat: Number(v.depotLat), lng: Number(v.depotLng) } : null;
  add(depot);
  v.orders.forEach((o: any) => { add(ptOf(o)); add(whOf(o)); });
  const matrix = pts.length >= 2 ? await durationMatrix(pts) : [];
  const travel = (a: Pt, b: Pt): number => {
    if (!a || !b) return FLAT_TRAVEL;
    const ia = idx.get(`${a.lat},${a.lng}`), ib = idx.get(`${b.lat},${b.lng}`);
    const d = ia != null && ib != null ? matrix[ia]?.[ib] : null;
    return d == null ? FLAT_TRAVEL : d;
  };

  const steps: PlanStep[] = [];
  const byOrder: VendorPlan["byOrder"] = {};
  let clock = START_MIN;
  let prev: Pt = depot;

  const push = (kind: string, label: string, t: number, work: number, o?: any) => {
    const arrive = clock + t; clock = arrive + work;
    const r = o ? effWindow(o) : null;
    const late = r ? arrive > r.end : false;
    steps.push({ kind, label, travel: t, work, arrive, depart: clock, slot: o ? (o.required_time || o.time_slot) : undefined, lift: o?.lift, late });
    if (o) byOrder[o.customer_unique_id] = { arrive, depart: clock, late };
  };

  // CUSTOMER PREFERENCE FIRST: sequence every stop by its effective requested window (note request
  // beats booked slot beats "no preference"). On a tie, a retrieval goes before a pickup (its goods
  // were collected the night before and a drop-off is quick vs ~4h packing). Vendor/stop order is
  // irrelevant — only what the customer asked for and travel matter.
  const seq = [...v.orders].sort((a: any, b: any) =>
    effStart(a) - effStart(b) ||
    (a.order_type === "pickup" ? 1 : 0) - (b.order_type === "pickup" ? 1 : 0) ||
    (a.stop_seq || 0) - (b.stop_seq || 0));
  const retrCount = v.orders.filter((o: any) => o.order_type !== "pickup").length;
  const pickCount = v.orders.filter((o: any) => o.order_type === "pickup").length;
  const whPt = whOf(v.orders.find((o: any) => whOf(o)) ?? {});
  const whName = v.orders[0]?.warehouse_name ? ` (${String(v.orders[0].warehouse_name).split("·")[0].trim()})` : "";

  if (retrCount) {
    // evening-before collection — not on the morning clock (goods already in the vehicle at start)
    steps.push({ kind: "wh-eve", label: `Collect ${retrCount} retrieval load${retrCount > 1 ? "s" : ""} from warehouse${whName} — evening before`, travel: 0, work: 0, arrive: START_MIN, depart: START_MIN });
  }
  steps.push({ kind: "start", label: `Start from ${v.startingPoint || "depot"}${retrCount ? " (retrievals already loaded)" : ""}`, travel: 0, work: 0, arrive: clock, depart: clock });
  for (const o of seq) {
    if (o.order_type === "pickup") push("pickup", `Pick up & pack at ${o.locality || "site"} — ${o.customer_name}`, travel(prev, ptOf(o)), PICKUP_WORK, o);
    else push("deliver", `Deliver to ${o.locality || "site"} — ${o.customer_name}`, travel(prev, ptOf(o)), RETR_DELIVER, o);
    prev = ptOf(o);
  }
  // drop pickup goods at the warehouse at the end of the day
  if (pickCount) { push("wh", `Drop pickups at warehouse${whName}`, travel(prev, whPt), WH_UNLOAD); prev = whPt; }
  return { steps, end: clock, byOrder };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
