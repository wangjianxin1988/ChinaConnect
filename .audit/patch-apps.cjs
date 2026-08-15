const fs = require("fs");
const p = "src/components/apps/AppRecommendationsSection.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
s = s.replace(
  "  lang = \"en\",\n}: AppRecommendationsSectionProps) {",
  '  lang = "en",\n}: AppRecommendationsSectionProps) {\n  const JA_CAT: Record<string, string> = { payment: "決済", transport: "移動", social: "SNS", travel: "旅行", food: "グルメ", utilities: "ツール", language: "語学", maps: "地図", connectivity: "通信" };'
);
s = s.replace(
  "<span>{catInfo.labelZh}</span>",
  "<span>{lang === \"ja\" ? (JA_CAT[category] || catInfo.label) : catInfo.labelZh}</span>"
);
fs.writeFileSync(p, s);
console.log("changed:", orig !== s);
