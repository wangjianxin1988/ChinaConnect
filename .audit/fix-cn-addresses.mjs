import fs from "node:fs";
const fixes = [
  ["chongqing.json", "emergencyContacts", 2, "address", "渝中区友誼路1号"],
  ["fuzhou.json", "emergencyContacts", 3, "address", "晋安区東大路68号"],
  ["harbin.json", "hotels", 0, "address", "道里区友誼路555号"],
  ["shanghai.json", "emergencyContacts", 4, "address", "浦東新区世紀大道8号西塘商場"],
  ["shanghai.json", "emergencyContacts", 10, "address", "浦東新区世紀大道8号西塘商場20階"],
  ["shanghai.json", "emergencyContacts", 13, "address", "静安区ウルムチ中路12号"],
  ["xiamen.json", "hotels", 9, "address", "思明区鷺江路1-6号"],
];
for (const [f, section, idx, key, value] of fixes) {
  const p = "src/data/cities-i18n/ja/" + f;
  const data = JSON.parse(fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n"));
  const before = data[section][idx][key];
  data[section][idx][key] = value;
  const tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
  console.log(f, section + "[" + idx + "]." + key, "=>", JSON.stringify(before), "->", JSON.stringify(value));
}
