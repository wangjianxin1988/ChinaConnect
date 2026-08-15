const fs = require("fs");
const p = ".audit/simplified-set.json";
const set = JSON.parse(fs.readFileSync(p, "utf8"));
const remove = ["学", "麺", "点", "灯", "警", "麦", "携", "誉", "与"];
const newSet = set.filter((c) => !remove.includes(c));
fs.writeFileSync(p, JSON.stringify(newSet));
console.log("removed:", set.length - newSet.length, "| new size:", newSet.length);
