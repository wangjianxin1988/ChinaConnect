import fs from "node:fs";
const data = JSON.parse(fs.readFileSync(".audit/ja-city-english.json", "utf8"));
const wanted = ["line", "route", "rental", "bike", "taxi", "toCityCenter", "locations", "type", "title", "category", "popularity", "population", "price", "ticketPrice", "from", "country"];
const shown = {};
for (const [file, hits] of Object.entries(data)) {
  for (const h of hits) {
    const last = h.path.split(".").pop().replace(/\[\d+\]/g, "");
    if (wanted.includes(last) && (shown[last] || 0) < 4) {
      console.log(file, "|", h.path, "=>", JSON.stringify(h.value).slice(0, 90));
      shown[last] = (shown[last] || 0) + 1;
    }
  }
}
