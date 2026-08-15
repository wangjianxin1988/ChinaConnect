import fs from "node:fs";
const SIMP = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
console.log("set size:", SIMP.length);
for (const ch of ["书","马","华","东","丽","亚","宾","馆","饭","龙","门","风","见","车","长","广","银","钱","电","飞","买","卖","这","个","什","么","处","营","汇","滨","鹅","帮","话","虾","饺","驴","陕","顶","鹏","兰","兴","刘","尔"]) {
  console.log(ch, SIMP.includes(ch) ? "Y" : "-");
}
