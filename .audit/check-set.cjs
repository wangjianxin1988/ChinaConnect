const fs = require("fs");
const set = JSON.parse(fs.readFileSync(".audit/simplified-set.json", "utf8"));
const test = ["学","麺","点","灯","警","麦","携","誉","与","伝","図","気","沢","広","県","関","時","間","東","車","鉄","当","国","数","万","発","転","価","応","検","頭","場","開","閉","門","間","長","売","読","写","実","際","現","産","業","品","質","量","規","模","録","記","述","専","門","医","院","店","宿","泊","機","関","構","築","網","絡"];
const inSet = test.filter((c) => set.includes(c));
console.log("in set:", inSet.join(" "));
console.log("set size:", set.length);
