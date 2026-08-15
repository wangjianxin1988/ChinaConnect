import fs from "node:fs";

// ---------- 1. Append expo + source-label ja overrides ----------
const p1 = "src/data/guide/ja-overrides.ts";
let s1 = fs.readFileSync(p1, "utf8");
const OVERRIDES = {
  // expo cities
  "Guangzhou": "広州",
  "Shanghai": "上海",
  "Beijing": "北京",
  "Yiwu": "義烏",
  // expo venues
  "Canton Fair Complex": "広州交易会展館（琶洲展館）",
  "Canton Fair Complex / PWTC Expo": "広州交易会展館 / PWTCエキスポ",
  "National Exhibition and Convention Center (Hongqiao)": "国家会展中心（虹橋）",
  "National Exhibition and Convention Center": "国家会展中心",
  "China International Exhibition Center": "中国国際展覧中心（静安）",
  "Shanghai New International Expo Centre": "上海新国際博覧中心",
  "Canton Tower / Baiyun International Convention Center": "広州塔 / 白雲国際会議センター",
  "China National Convention Center": "中国国家会議センター",
  "Yiwu International Expo Center": "義烏国際博覧センター",
  // expo frequencies
  "Twice yearly (Spring & Autumn)": "年2回（春・秋）",
  "Yearly (March)": "年1回（3月）",
  "Yearly (September)": "年1回（9月）",
  "Every two years (April)": "隔年開催（4月）",
  "Twice yearly (March & August)": "年2回（3月・8月）",
  "Yearly (April & October)": "年1回（4月・10月）",
  "Every two years (November)": "隔年開催（11月）",
  "Yearly (October)": "年1回（10月）",
  // expo names (nameCn)
  "广交会 (中国进出口商品交易会)": "広州交易会（中国輸出入商品交易会）",
  "中国家博会（广州）": "中国国際家具博覧会（広州）",
  "中国家博会（上海）": "中国国際家具博覧会（上海）",
  "国际电子电路（上海）展览会": "国際電子回路（上海）展覧会",
  "中国国际汽车展": "中国国際自動車展",
  "中国国际纺织面料及辅料博览会": "中国国際繊維素材・副資材博覧会",
  "中国国际医疗器械博览会": "中国国際医療機器博覧会",
  "中国国际工程机械、建材机械及矿山机械展": "中国国際建設機械・建材機械・鉱山機械展",
  "广州国际投资年会": "広州国際投資年会",
  "中国国际服务贸易交易会": "中国国際サービス貿易交易会",
  "上海国际汽车工业展览会": "上海国際自動車工業展覧会",
  "中国义乌国际小商品采购节": "中国義烏国際雑貨調達フェア",
  // expo descriptions (descriptionCn)
  "中国规模最大、成交效果最好的综合性国际贸易盛会，每年在广州举办两届。": "中国最大規模で成約実績もトップクラスの総合国際貿易見本市。毎年広州で春・秋の2回開催。",
  "全球最大家具展览会——广州展区。展示民用家具、办公家具及户外家具。": "世界最大級の家具見本市——広州会場。家庭用家具、オフィス家具、屋外用家具を展示。",
  "全球最大家具展览会——上海展区。聚焦设计、制造和家居创新。": "世界最大級の家具見本市——上海会場。デザイン、製造、住まいのイノベーションに注目。",
  "全球最具影响力的PCB及电子电路展览会之一，覆盖从设计到制造的整个电子电路产业链。": "世界で最も影響力のあるPCB・電子回路展示会の一つ。設計から製造まで電子回路産業チェーン全体を網羅。",
  "全球顶级汽车展会之一，每两年在北京举办一次。": "世界トップクラスの自動車展示会の一つ。隔年で北京で開催。",
  "亚洲最大规模的纺织面料及辅料博览会。": "アジア最大規模の繊維素材・副資材博覧会。",
  "亚太地区最大的国际医疗器械博览会。": "アジア太平洋地域最大の国際医療機器博覧会。",
  "中国及亚洲工程机械行业最重要的专业博览会。": "中国・アジアの建設機械業界で最も重要な専門展示会。",
  "年度投资盛会，吸引全球企业家和投资者发掘广东商业机遇。": "毎年開催の投資イベント。世界中の起業家・投資家が広東のビジネスチャンスを発掘。",
  "中国服务贸易领域的龙头展会，涵盖数字贸易、金融、旅游、教育等服务领域。": "中国サービス貿易分野の代表的な展示会。デジタル貿易、金融、観光、教育などのサービス分野を網羅。",
  "全球十大汽车展会之一，重点展示新能源汽车和智能驾驶。": "世界トップ10に入る自動車展示会。新エネルギー車とスマート運転に注力。",
  "全球最大的日用小商品采购中心，每年10月举办专属采购节。": "世界最大の日用品調達センター。毎年10月に専用の調達フェアを開催。",
  // expo categories (labelCn)
  "全部": "すべて",
  "综合": "総合",
  "家具": "家具",
  "电子": "電子",
  "汽车": "自動車",
  "纺织服装": "繊維・アパレル",
  "医疗": "医療",
  "工业": "工業",
  "贸易投资": "貿易・投資",
  // months (labelCn)
  "一月": "1月", "二月": "2月", "三月": "3月", "四月": "4月", "五月": "5月", "六月": "6月",
  "七月": "7月", "八月": "8月", "九月": "9月", "十月": "10月", "十一月": "11月", "十二月": "12月",
  // source labels
  "Canton Fair official site (representative)": "広州交易会公式サイト（代表）",
  "State Council - Market Regulation (AMR)": "国務院 - 市場監督管理総局（AMR）",
  "China Briefing business culture guides": "China Briefing ビジネス文化ガイド",
  "China Visa Application Service Center": "中国ビザ申請サービスセンター",
  "Translators Association of China (TAC)": "中国翻訳者協会（TAC）",
};
let added = 0;
const entries = Object.entries(OVERRIDES);
const reEnd = /\n\};[\s]*$/;
if (!reEnd.test(s1)) { console.error("unexpected file tail"); process.exit(1); }
let block = "";
for (const [k, v] of entries) block += `  ${JSON.stringify(k)}: ${JSON.stringify(v)},\n`;
s1 = s1.replace(/\n\};[\s]*$/, "\n" + block + "};");
fs.writeFileSync(p1 + ".tmp", s1);
fs.renameSync(p1 + ".tmp", p1);
console.log("ja-overrides added:", entries.length);

// ---------- 2. LastVerifiedStamp: lang prop ----------
const p2 = "src/components/Guide/LastVerifiedStamp.tsx";
let s2 = fs.readFileSync(p2, "utf8");
const oldSig = 'export const LastVerifiedStamp: React.FC<Props> = ({ dataKey, label }) => {';
const newSig = 'export const LastVerifiedStamp: React.FC<Props> = ({ dataKey, label, lang = "en" }) => {';
if (s2.includes(oldSig)) { s2 = s2.split(oldSig).join(newSig); console.log("LastVerifiedStamp sig updated"); }
else console.error("NOT FOUND: LastVerifiedStamp sig");
const oldVerify = '      <span>\n        {label ?? "Last verified"}: {meta.lastVerified}\n      </span>';
const newVerify = '      <span>\n        {label ?? (lang === "ja" ? "最終確認日" : "Last verified")}: {meta.lastVerified}\n      </span>';
if (s2.includes(oldVerify)) { s2 = s2.split(oldVerify).join(newVerify); console.log("LastVerifiedStamp label ja"); }
else console.error("NOT FOUND: LastVerifiedStamp label");
const oldSrc = "        {meta.sourceLabel}";
const newSrc = "        {jaText(meta.sourceLabel, lang)}";
if (s2.includes(oldSrc)) { s2 = s2.split(oldSrc).join(newSrc); console.log("LastVerifiedStamp source jaText"); }
else console.error("NOT FOUND: LastVerifiedStamp sourceLabel");
const oldProps = `interface Props {
  /** Data file key, e.g. "expo-calendar" */
  dataKey: keyof typeof BUSINESS_DATA_META;
  /** Optional override label */
  label?: string;
}`;
const newProps = `interface Props {
  /** Data file key, e.g. "expo-calendar" */
  dataKey: keyof typeof BUSINESS_DATA_META;
  /** Optional override label */
  label?: string;
  /** Language code */
  lang?: string;
}`;
if (s2.includes(oldProps)) { s2 = s2.split(oldProps).join(newProps); console.log("LastVerifiedStamp props updated"); }
else console.error("NOT FOUND: LastVerifiedStamp props");
fs.writeFileSync(p2 + ".tmp", s2);
fs.renameSync(p2 + ".tmp", p2);

// ---------- 3. Pass lang to LastVerifiedStamp in 5 clients ----------
const clients = [
  "src/components/Guide/CompanyRegistrationClient.tsx",
  "src/components/Guide/ExpoCalendarClient.tsx",
  "src/components/Guide/EtiquetteClient.tsx",
  "src/components/Guide/InvitationLetterClient.tsx",
  "src/components/Guide/TranslationServiceClient.tsx",
];
for (const c of clients) {
  let s = fs.readFileSync(c, "utf8");
  const re = /<LastVerifiedStamp dataKey="([^"]+)"(\s*\/>)/;
  const m = s.match(re);
  if (m) {
    s = s.replace(re, `<LastVerifiedStamp dataKey="${m[1]}" lang={lang}$2`);
    fs.writeFileSync(c + ".tmp", s);
    fs.renameSync(c + ".tmp", c);
    console.log("lang prop added:", c);
  } else {
    console.error("NOT FOUND stamp in:", c);
  }
}

// ---------- 4. Expo category buttons ja main label ----------
const p3 = "src/components/Guide/ExpoCalendarClient.tsx";
let s3 = fs.readFileSync(p3, "utf8");
const oldCat = "                {cat.label}\n                <span className=\"ml-1 opacity-70 text-xs\">{jaText(cat.labelCn, lang)}</span>";
const newCat = "                {lang === \"ja\" ? jaText(cat.labelCn, lang) : cat.label}\n                {lang !== \"ja\" && <span className=\"ml-1 opacity-70 text-xs\">{jaText(cat.labelCn, lang)}</span>}";
if (s3.includes(oldCat)) { s3 = s3.split(oldCat).join(newCat); console.log("expo category buttons ja"); }
else console.error("NOT FOUND: expo category buttons");
// Canton Fair spotlight dates
const oldSpring = '<span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">\n                Spring: April 15 – May 5, 2026\n              </span>\n              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">\n                Autumn: October 15 – November 4, 2026\n              </span>';
const newSpring = lang === undefined ? oldSpring : oldSpring; // placeholder
// simpler: replace the two date spans
const oldS1 = "Spring: April 15 – May 5, 2026";
const oldS2 = "Autumn: October 15 – November 4, 2026";
const newS1 = "{lang === \"ja\" ? \"春：2026年4月15日〜5月5日\" : \"Spring: April 15 – May 5, 2026\"}";
const newS2 = "{lang === \"ja\" ? \"秋：2026年10月15日〜11月4日\" : \"Autumn: October 15 – November 4, 2026\"}";
if (s3.includes(oldS1)) { s3 = s3.split(oldS1).join(newS1); console.log("spring date ja"); } else console.error("NOT FOUND: spring date");
if (s3.includes(oldS2)) { s3 = s3.split(oldS2).join(newS2); console.log("autumn date ja"); } else console.error("NOT FOUND: autumn date");
fs.writeFileSync(p3 + ".tmp", s3);
fs.renameSync(p3 + ".tmp", p3);
