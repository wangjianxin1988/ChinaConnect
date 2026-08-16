import fs from "node:fs";
const keys = ["wǒ guòmǐn jiānguǒ","wǒ guòmǐn jīdàn","wǒ bù chī ròu, dàn, nǎi","bù yào là","shǎo yóu","wēi là","qǐng gěi wǒ shūcài","mǐfàn","bù yào wèijīng","qǐng dài wǒ qù..."];
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
for (const lang of ["ja","ko","zh-CN","fr","de"]) {
  const f = "src/data/guide/overrides-"+lang+".ts";
  if (!fs.existsSync(f)) continue;
  const map = new Map();
  for (const m of fs.readFileSync(f,"utf8").matchAll(re)) map.set(m[1], m[2]);
  console.log("====", lang);
  for (const k of keys) console.log("  ", k, "=>", JSON.stringify(map.get(k)));
}
