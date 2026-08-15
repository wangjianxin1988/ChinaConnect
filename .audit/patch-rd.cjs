const fs = require("fs");
const p = "src/components/food/RestaurantDetail.tsx";
let s = fs.readFileSync(p, "utf8");
const orig = s;
// props interface
s = s.replace(
  "interface RestaurantDetailProps {\n  restaurant: Restaurant;\n}",
  "interface RestaurantDetailProps {\n  restaurant: Restaurant;\n  lang?: string;\n}"
);
// component signature
s = s.replace(
  "export function RestaurantDetail({ restaurant }: RestaurantDetailProps) {",
  'export function RestaurantDetail({ restaurant, lang = "en" }: RestaurantDetailProps) {'
);
// add helper after component start
s = s.replace(
  "export function RestaurantDetail({ restaurant, lang = \"en\" }: RestaurantDetailProps) {\n  const [isFavorited, setIsFavorited] = useState(false);",
  "export function RestaurantDetail({ restaurant, lang = \"en\" }: RestaurantDetailProps) {\n  const t = (en: string, zh: string, ja: string) => (lang === \"ja\" ? ja : lang === \"zh-CN\" || lang === \"zh-TW\" ? zh : en);\n  const [isFavorited, setIsFavorited] = useState(false);"
);
// labels
const reps = [
  ['<p className="text-sm text-gray-500">Cuisine / 菜系</p>', '<p className="text-sm text-gray-500">{t("Cuisine", "菜系", "料理")}</p>'],
  ['<p className="text-sm text-gray-500">Avg Duration / 平均时长</p>', '<p className="text-sm text-gray-500">{t("Avg Duration", "平均时长", "平均滞在時間")}</p>'],
  ['<p className="text-sm text-gray-500">Address / 地址</p>', '<p className="text-sm text-gray-500">{t("Address", "地址", "住所")}</p>'],
  ['<p className="text-sm text-gray-500">Phone / 电话</p>', '<p className="text-sm text-gray-500">{t("Phone", "电话", "電話")}</p>'],
  ['<p className="text-sm text-gray-500">Booking / 预约</p>', '<p className="text-sm text-gray-500">{t("Booking", "预约", "予約")}</p>'],
  ['{restaurant.booking_required ? "Required 必须" : "Not required 非必须"}', '{restaurant.booking_required ? t("Required", "必须", "要") : t("Not required", "非必须", "不要")}'],
  ['<p className="text-sm text-gray-500">Blogger Recommended / 博主推荐</p>', '<p className="text-sm text-gray-500">{t("Blogger Recommended", "博主推荐", "ブロガーおすすめ")}</p>'],
  ['<h2 className="text-xl font-bold">Reviews / 评论</h2>', '<h2 className="text-xl font-bold">{t("Reviews", "评论", "レビュー")}</h2>'],
  ['<span className="text-gray-500">{reviews.length} reviews</span>', '<span className="text-gray-500">{reviews.length} {t("reviews", "条评论", "件")}</span>'],
];
let n = 0;
for (const [a, b] of reps) { if (s.includes(a)) { s = s.replace(a, b); n++; } else console.log("NOT FOUND: " + a.slice(0, 60)); }
fs.writeFileSync(p, s);
console.log("changed:", orig !== s, "| replacements:", n + "/" + reps.length);
