import fs from "node:fs";
const path = "src/components/food/RestaurantDetail.tsx";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const pairs = [
  ['<span className="text-sm">/person</span>', '<span className="text-sm">{t("/person", "/人", "／人")}</span>'],
  ['{restaurant.avg_meal_duration} min', '{restaurant.avg_meal_duration} {t("min", "分钟", "分")}'],
  ['<p className="font-medium">by {restaurant.blogger_name}</p>', '<p className="font-medium">{lang === "ja" ? `${restaurant.blogger_name} によるおすすめ` : `by ${restaurant.blogger_name}`}</p>'],
  ['<span className="text-sm text-gray-500">Your Rating:</span>', '<span className="text-sm text-gray-500">{t("Your Rating:", "你的评分：", "あなたの評価：")}</span>'],
  ['placeholder="Share your dining experience..."', 'placeholder={t("Share your dining experience...", "分享你的用餐体验...", "食事の体験を共有しましょう...")}'],
  ['{isLoading ? "Submitting..." : "Submit Review"}', '{isLoading ? t("Submitting...", "提交中...", "送信中...") : t("Submit Review", "提交评论", "レビューを投稿")}'],
  ['{review.profiles?.display_name || "Anonymous"}', '{review.profiles?.display_name || t("Anonymous", "匿名", "匿名")}'],
];
let fail = false;
for (const [a, b] of pairs) {
  if (!s.includes(a)) { console.error("MISSING:", a.slice(0, 90)); fail = true; continue; }
  s = s.split(a).join(b);
}
const showMoreRe = /Show \{remainingReviews\} more reviews/;
if (!showMoreRe.test(s)) { console.error("MISSING show more line"); fail = true; }
else {
  s = s.replace(showMoreRe, '{t(`Show ${remainingReviews} more reviews`, `还有 ${remainingReviews} 条评论`, `他 ${remainingReviews} 件のレビューを見る`)}');
}
if (fail) process.exit(1);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
console.log("patched", path);
