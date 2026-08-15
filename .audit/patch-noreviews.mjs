import fs from "node:fs";
const path = "src/components/food/RestaurantDetail.tsx";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const old = "<p>No reviews yet. Be the first to share your experience!</p>";
const neu = '<p>{t("No reviews yet. Be the first to share your experience!", "还没有评价，快来分享你的体验吧！", "まだレビューがありません。最初のレビューを投稿しましょう！")}</p>';
if (!s.includes(old)) { console.error("MISSING target"); process.exit(1); }
s = s.replace(old, neu);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
console.log("patched", path);
