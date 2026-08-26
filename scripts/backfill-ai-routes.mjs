/**
 * Backfill ai_routes.route_data.days for rows saved before the day-parser
 * fix (they only have raw_plan). Re-parses raw_plan with the shared parser
 * and PATCHes days + route_data. Read-only unless --apply is passed.
 */
import { parseDailyPlansFromContent } from "../src/lib/ai/parse-days.ts";

const URL = process.env.SUPABASE_URL || "https://xyvuqbpwrhkukjgzveyc.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");

const res = await fetch(`${URL}/rest/v1/ai_routes?select=id,title,days,route_data&route_data->>raw_plan=not.is.null&order=created_at.desc&limit=1000`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (!res.ok) {
  console.error("query failed", res.status, await res.text());
  process.exit(1);
}
const rows = await res.json();

let needBackfill = 0;
let parsed = 0;
const updates = [];
for (const row of rows) {
  const rd = row.route_data || {};
  const daysArr = Array.isArray(rd.days) ? rd.days : [];
  if (daysArr.length > 0) continue;
  needBackfill++;
  const raw = typeof rd.raw_plan === "string" ? rd.raw_plan : "";
  const days = raw ? parseDailyPlansFromContent(raw) : [];
  if (days.length > 0) {
    parsed++;
    updates.push({ id: row.id, title: row.title, days: days.length, routeDays: days });
  }
}

console.log(`rows without days: ${needBackfill}, parseable: ${parsed}`);
if (!APPLY) {
  console.log("dry-run (pass --apply to write)");
  for (const u of updates.slice(0, 8)) {
    console.log(`  would update ${u.id} -> ${u.days} days (${u.title?.slice(0, 30) || ""})`);
  }
  process.exit(0);
}

let ok = 0;
let fail = 0;
for (const u of updates) {
  const r = await fetch(`${URL}/rest/v1/ai_routes?id=eq.${u.id}`, {
    method: "PATCH",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      days: u.days,
      route_data: { ...u.routeDays.length ? { ...(await currentRouteData(u.id)), days: u.routeDays } : {} },
    }),
  });
  if (r.ok) ok++;
  else {
    fail++;
    console.error("PATCH failed", u.id, r.status, await r.text());
  }
}
console.log(`applied: ${ok} ok, ${fail} failed`);

async function currentRouteData(id) {
  const r = await fetch(`${URL}/rest/v1/ai_routes?select=route_data&id=eq.${id}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const j = await r.json();
  return (j[0] && j[0].route_data) || {};
}
