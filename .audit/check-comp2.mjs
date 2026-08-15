import fs from "node:fs";
const cs = fs.readFileSync("src/i18n/components-strings.ts", "utf8");
const keys = [...cs.matchAll(/(?:^  |},  )([a-zA-Z0-9_]+): \{/gm)].map((m) => m[1]);
const vals = {};
for (const k of keys) {
  const re = new RegExp("(?:^  |},  )" + k + ": \\{[\\s\\S]*?ja: \"((?:[^\"\\\\]|\\\\.)*)\"", "m");
  const m = re.exec(cs);
  const re2 = new RegExp("(?:^  |},  )" + k + ": \\{[\\s\\S]*?en: \"((?:[^\"\\\\]|\\\\.)*)\"", "m");
  const m2 = re2.exec(cs);
  vals[k] = { ja: m ? m[1] : undefined, en: m2 ? m2[1] : undefined };
}
const check = ["app_michelin_guide","apps_transport_rec","avg_per_person","badge_blackpearl","badge_local","badge_michelin","call_button","food_explore_all","map_nav","signature_dishes","sos_warning_main","transport_bike_label","transport_bus_label","transport_bus_route","transport_metro_label","transport_taxi_label","view_all_hotels"];
let missingJa = 0;
for (const k of check) {
  const v = vals[k];
  if (!v) { console.log(k, "NOT FOUND"); missingJa++; continue; }
  if (v.ja === undefined) { console.log(k, "JA MISSING"); missingJa++; }
  else if (v.ja === v.en) console.log(k, "ja==en:", JSON.stringify(v.ja));
  else console.log(k, "ja:", JSON.stringify(v.ja).slice(0, 60));
}
console.log("missingJa:", missingJa);
