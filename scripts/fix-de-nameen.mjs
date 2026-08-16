// de nameEn localizer: translate English descriptive words in nameEn to German.
// Usage: node scripts/fix-de-nameen.mjs [--dry-run] [--limit=N]
import fs from "node:fs";
import path from "node:path";
import { getTranslateProvider } from "./lib/translate-provider.mjs";

const { apiKey: KEY, baseUrl: HOST, model: MODEL } = getTranslateProvider();
const BATCH_SIZE = 8;
const RETRY_ATTEMPTS = 3;
const BASE = "src/data/cities-i18n/de";
const SRC = "src/data/cities";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];

const CJK_RE = /[\u3400-\u9fff]/;
const KANA_RE = /[\u3040-\u30ff]/;
// English words that indicate a nameEn needs Germanization.
const EN_WORDS = new Set((
  "Lake Mountain Mountains Temple Palace Palaces Street Bridge Tower Garden Gardens Island Islands Beach Old Town New City Centre Center Resort Resort Hotel Hotels Museum Museums Park Village Gate Wall Cave Gorge Ravine Peak View National Nature Scenic Area Great Grand Royal Imperial Summer Winter Spring Autumn Bamboo Stone Yellow White Black Red Green Blue Little Big Marble Folk Ethnic Minority Glass Sea River Riverfront Harbor Bay Strait Fortress Citadel Pavilion Hall Monastery Nunnery Cloister Memorial Monument Exhibition Conference Expo Marina Port Wharf Dock Lighthouse Observatory Planetarium Stadium Opera Gallery Library Zoo Aquarium Botanical Riverside Downtown Night Market Observation Deck Cable Car Ferry International Convention Convention Center Convention Center Cultural Heritage Site World Heritage Sites Scenic Spots World Heritage Cultural Heritage Cultural Center Cultural Centre Cultural Square Science Museum Art Museum History Museum Railway Station Train Station Airport Bus Station Long-distance Water Town Water Village Ancient City Ancient Town Walled City Historic District Historical District Heritage Street Food Street Pedestrian Street Shopping Street Market Square Central Square Main Street High Street Old Street Ancient Street East Street West Street South Street North Street Temple Fair Flower Show Lantern Festival Dragon Boat Race Waterfall Valley Canyon Gorge Cliff Ridge Summit Slope Hillside Lakeside Seashore Seaside Coast Coastal Pier Seaport Airport Terminal Garden Villa Pavilion Viewpoint Observation Tower Sightseeing Cruise Boat Tour Night Tour Day Tour Camping Site Campsite Resort Hotel Boutique Hotel Business Hotel Grand Hotel Palace Hotel Luxury Hotel Budget Hotel Youth Hostel Guesthouse Inn Courtyard Residence Mansion Compound Courtyard House Siheyuan Hutong Lane Alley Courtyard Garden Restaurant Dining Room Food Court Hot Pot Hotpot Barbecue BBQ Steamboat Dim Sum Dumplings Noodles Ramen Rice Congee Porridge Snacks Dessert Bakery Teahouse Tea House Café Cafe Coffee Roast Duck Peking Duck Smoked Ham Smoked Fish Grilled Skewers Fried Rice Stir-fried Braised Steamed Boiled Roasted Grilled Sautéed Deep-fried Pan-fried Sweet Sour Spicy Salty Savory Crispy Tender Juicy Fragrant Aromatic Famous Renowned Historic Historical Ancient Traditional Authentic Local Regional Specialty Delicacy Cuisine Kitchen Farm-to-table Chef Chef's Table Michelin Star Michelin Black Pearl Fine Dining International Halal Vegetarian Vegan Organic Fresh Seasonal Handmade Homemade Artisan Craft Craft Beer Coffee Roastery Pastry Cake Pie Bread Noodle Soup Stew Clay Pot Casserole Hot and Sour Mapo Tofu Kung Pao Twice-cooked Fish Head Squirrel Fish Sweet and Sour Yangzhou Fried Rice Egg Fried Rice Wonton Spring Rolls Baozi Mantou Scallion Pancake Jianbing Roujiamo Liangpi Cold Noodles Dan Dan Noodles Biang Biang Noodles Noodles Beef Noodles Crossing-the-Bridge Noodles Rice Noodles Mixian Rice Noodles Rice Noodles Pho Shaxian Snacks Night Market Food Street Street Food Skewer BBQ Grill Charcoal Oven Clay Oven Wood-fired Firewood Steamed Bun Glutinous Rice Sticky Rice Rice Cake Mochi Tangyuan Yuanxiao Zongzi Mooncake Egg Tart Milk Tea Bubble Tea Boba Tea Smoothie Juice Beer Wine Baijiu Maotai Liquor Spirit Cocktail").toLowerCase().split(/\s+/));

function walk(o, pathStr = "") {
  const out = {};
  if (Array.isArray(o)) o.forEach((v, i) => Object.assign(out, walk(v, `${pathStr}[${i}]`)));
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) Object.assign(out, walk(v, pathStr ? `${pathStr}.${k}` : k));
  else if (typeof o === "string") out[pathStr] = o;
  return out;
}
function setPath(obj, pathStr, value) {
  const tokens = [];
  for (const part of pathStr.split(".")) {
    const m = /^([^[]*)((?:\[\d+\])*)$/.exec(part);
    if (m[1]) tokens.push(m[1]);
    for (const b of m[2].matchAll(/\[(\d+)\]/g)) tokens.push(Number(b[1]));
  }
  let cur = obj;
  for (let i = 0; i < tokens.length; i++) {
    if (i === tokens.length - 1) { cur[tokens[i]] = value; return; }
    cur = cur[tokens[i]];
  }
}
function norm(v) { return String(v).toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f\u0400-\u04ff\u0600-\u06ff\u3400-\u9fff]/g, ""); }
function hasEnglishWord(v) {
  const tokens = v.split(/[\s\-/]+/);
  return tokens.some((t) => {
    const w = t.toLowerCase().replace(/[^a-z]/g, "");
    return w.length >= 3 && EN_WORDS.has(w);
  });
}

async function callChat(prompt) {
  const body = { model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.1, max_tokens: 4000 };
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Connection: "close" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const payload = await res.json();
  return payload.choices?.[0]?.message?.content;
}
function extractJson(content) {
  const cleaned = String(content || "").trim().replace(/^```[a-zA-Z]*\n?/i, "").replace(/\n?```\s*$/g, "");
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON object");
  let depth = 0, inStr = false, esc = false, end = -1;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end !== -1) { try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {} }
  throw new Error("No closing JSON object");
}
function escapeJson(s) { return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n"); }
function buildPrompt(values) {
  const body = "{\n" + values.map((s, i) => `  "k${i}": "${escapeJson(s)}"`).join(",\n") + "\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a GERMAN-language China travel guide.
Translate the following English names of attractions, restaurants and hotels into natural GERMAN.
Rules:
- Keep romanized names (pinyin) and proper nouns unchanged (e.g. Beihai, gshan, Quanjude, Nanluoguxiang).
- Translate English descriptive words into German: Park->Park, Lake->See, Mountain->Berg, Temple->Tempel, Palace->Palast, Old Town->Altstadt, Great Wall->Große Mauer, Summer Palace->Sommerpalast, Temple of Heaven->Himmelstempel, Roast Duck->Bratente, Hot Pot->Feuertopf, Museum->Museum, Bridge->Brücke, Street->Straße, Garden->Garten, Island->Insel, Beach->Strand, Forest->Wald, Valley->Tal, Waterfall->Wasserfall, Tower->Turm, Square->Platz, Pavilion->Pavillon, Hall->Halle, Village->Dorf, Resort->Resort, Center->Zentrum, Hotel->Hotel, Restaurant->Restaurant, Noodles->Nudeln, Tea House->Teestube, etc.
- Keep brand names (Universal, JW Marriott, Hilton, etc.) unchanged.
- Use common German names for world-famous sites (e.g. Forbidden City -> Verbotene Stadt, Temple of Heaven -> Himmelstempel, Great Wall -> Große Mauer, Summer Palace -> Sommerpalast, Terracotta Army -> Terrakotta-Armee).
- Output ONLY a JSON object of the same shape with keys k0..k${values.length - 1}.
- No markdown, no commentary, no English words that can be avoided.
Input JSON:
${body}`;
}
function validOutput(raw, source) {
  if (typeof raw !== "string" || raw.trim().length === 0) return false;
  if (raw === source) return false;
  if (CJK_RE.test(raw) || KANA_RE.test(raw)) return false;
  return true;
}
async function translateBatch(batch) {
  const resultMap = new Map();
  const remaining = [...batch];
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS && remaining.length > 0; attempt++) {
    try {
      const content = await callChat(buildPrompt(remaining));
      const result = extractJson(content);
      const next = [];
      let accepted = 0;
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (validOutput(raw, s)) { resultMap.set(s, raw); accepted++; }
        else next.push(s);
      });
      remaining.splice(0, remaining.length, ...next);
    } catch (e) { console.warn(`  retry ${attempt}: ${e?.message?.slice(0, 80)}`); }
    await new Promise((r) => setTimeout(r, 700 * attempt));
  }
  return resultMap;
}

// collect
const allTarget = {};
for (const fn of fs.readdirSync(BASE).filter((f) => f.endsWith(".json"))) allTarget[fn] = JSON.parse(fs.readFileSync(path.join(BASE, fn), "utf8"));
const actionable = [];
for (const fn of Object.keys(allTarget)) {
  const slug = fn.replace(/\.json$/, "");
  const en = JSON.parse(fs.readFileSync(path.join(SRC, `${slug}.json`), "utf8"));
  const enFields = walk(en);
  for (const [p, v] of Object.entries(walk(allTarget[fn]))) {
    if (!(p.endsWith(".nameEn") || p === "nameEn")) continue;
    if (p.includes("emergencyContacts")) continue;
    if (p.startsWith("hotels")) continue;  // hotels keep nameEn unchanged (all langs)
    if (p === "nameEn") continue;           // city name stays romanized
    const ev = enFields[p];
    if (typeof ev !== "string" || typeof v !== "string") continue;
    if (norm(v) !== norm(ev)) continue; // already localized
    if (!hasEnglishWord(v)) continue;   // pure pinyin/brand -> keep
    actionable.push({ file: fn, path: p, value: v });
  }
}
const unique = [...new Set(actionable.map((a) => a.value))];
console.log(`[de] nameEn actionable: ${actionable.length} unique: ${unique.length}`);
if (dryRun) { console.log("sample:", unique.slice(0, 25)); process.exit(0); }
const slice = limitArg ? unique.slice(0, Number(limitArg)) : unique;
const map = new Map();
for (let i = 0; i < slice.length; i += BATCH_SIZE) {
  const chunk = slice.slice(i, i + BATCH_SIZE);
  const chunkMap = await translateBatch(chunk);
  for (const [k, v] of chunkMap) map.set(k, v);
  console.log(`  [${new Date().toISOString().slice(11, 19)}] chunk ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(slice.length / BATCH_SIZE)} done ${chunkMap.size}/${chunk.length}`);
}
let fixed = 0, missing = 0;
for (const a of actionable) {
  const nv = map.get(a.value);
  if (!nv) { missing++; continue; }
  setPath(allTarget[a.file], a.path, nv);
  fixed++;
}
for (const [fn, data] of Object.entries(allTarget)) {
  fs.writeFileSync(path.join(BASE, fn), JSON.stringify(data, null, 2) + "\n", "utf8");
}
console.log(`[de] applied ${fixed} nameEn (untranslated: ${missing})`);
