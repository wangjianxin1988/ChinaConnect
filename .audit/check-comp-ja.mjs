import fs from "node:fs";
// parse COMP_STRINGS from components-strings.ts
const cs = fs.readFileSync("src/i18n/components-strings.ts", "utf8");
const compKeys = [...cs.matchAll(/^  ([a-zA-Z0-9_]+): \{/gm)].map((m) => m[1]);
const csJa = {};
for (const k of compKeys) {
  const re = new RegExp("^  " + k + ": \\{[\\s\\S]*?ja: \"((?:[^\"\\\\]|\\\\.)*)\"", "m");
  const m = re.exec(cs);
  csJa[k] = m ? m[1] : undefined;
}
const missing = ["app_dianping","app_meituan","app_michelin_guide","app_xiaohongshu","apps_food_map","apps_transport_rec","attractions_label","attractions_loading","attractions_of","attractions_showing","avg_per_person","badge_blackpearl","badge_essential","badge_local","badge_michelin","call_button","cat_cultural","cat_historical","cat_modern","cat_natural","cat_other","food_explore_all","food_filter_layers","food_map_cta","get_directions","hl_affordable","hl_black_pearl","hl_count_unit","hl_local_favorite","hl_local_recommend","hl_michelin","hl_section_desc","hl_section_title","hl_street_food","hl_view_all_count","hotel_call","hotel_per_night","hotel_recommended","hotelsHeading","hotels_across_label","hotels_categories_label","hotels_count_unit","map_directions","map_nav","pay_apps_recommended","platform_app_store","platform_download","platform_google_play","pri_high","pri_low","pri_medium","qd_ambulance","qd_call","qd_fire","qd_intl","qd_police","qd_traffic","restaurants_count","restaurants_full_list","show_on_map","signature_dishes","sos_hotline_desc","sos_hotline_hint","sos_warning_main","tier_all","tier_label","tier_none","tier_short_a","tier_short_b","tier_short_c","tier_short_d","tier_short_s","transport_air","transport_bike_label","transport_bus_label","transport_bus_route","transport_metro_label","transport_taxi_label","transport_train","unit_contacts","unit_tips","view_all","view_all_hotels"];
const stillMissing = missing.filter((k) => !(k in csJa));
console.log("comp keys present:", Object.keys(csJa).length);
console.log("still missing in COMP_STRINGS:", stillMissing.length);
stillMissing.forEach((k) => console.log("  ", k));
const enVal = (k) => { const re = new RegExp("^  " + k + ": \\{[\\s\\S]*?en: \"((?:[^\"\\\\]|\\\\.)*)\"", "m"); const m = re.exec(cs); return m ? m[1] : undefined; };
// check ones where ja == en (untranslated)
const sameAsEn = missing.filter((k) => csJa[k] !== undefined && csJa[k] === enVal(k));
console.log("ja same as en (untranslated):", sameAsEn.length);
sameAsEn.forEach((k) => console.log("  ", k, "=", csJa[k]));
