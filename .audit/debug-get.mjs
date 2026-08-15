import fs from "node:fs";
const get = (o, p) => { const parts = p.replace(/\[(\d+)\]/g, ".$1").split("."); let v = o; for (const k of parts) { if (v == null) return undefined; v = v[k]; } return v; };
const en = JSON.parse(fs.readFileSync("src/data/cities/beijing.json", "utf8"));
console.log(get(en, "restaurants[3].description"));
console.log(typeof en.restaurants, en.restaurants.length);
