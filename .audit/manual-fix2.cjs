const fs = require("fs");
const fixes = {
  "src/data/cities-i18n/ja/chengdu.json": [
    ['「签签」（チェンチェン）は串を指し、「数签签」（シューチェンチェン）は食事の最後に串を数えることを意味し、「鸳鸯锅」（ユアンヤングオ）は半分が辛い/半分がマイルドな鍋',
     '「チェンチェン」は串を指し、「シューチェンチェン」は食事の最後に串を数えることを意味し、「ユアンヤングオ」（麻辣と白湯の半々の鍋）は半分が辛い/半分がマイルドな鍋'],
  ],
  "src/data/cities-i18n/ja/dali.json": [
    ['「你好」（こんにちは）や「谢谢」（ありがとう）', '「ニーハオ」（こんにちは）や「シエシエ」（ありがとう）'],
  ],
  "src/data/cities-i18n/ja/fuzhou.json": [
    ['魚団子（魚丸）、肉団子（肉燕）、牡蠣のオムレツ（蚵仔煎）、米粉（捞化）、鍋の縁のペースト（锅边糊）',
     '魚団子（ユーワン）、肉団子（ロウヤン）、牡蠣のオムレツ（オアツァンジエン）、米麺（ラオホア）、鍋の縁のペースト（グオビエンフー）'],
  ],
  "src/data/cities-i18n/ja/guangzhou.json": [
    ['広東語（广东话/粤语）は9つのトーンを持つ現地語で、北京語とは大きく異なります。訪問者が「nei hou」（你好）や「m goi」（ありがとう）などの基本的なフレーズを試みると、地元の人々は感謝します。',
     '広東語（カントン語）は9つの声調を持つ現地語で、北京語とは大きく異なります。訪問者が「ネイホウ」（こんにちは）や「ンゴイ」（ありがとう）などの基本的なフレーズを試みると、地元の人々は感謝します。'],
  ],
  "src/data/cities-i18n/ja/kunming.json": [
    ['伝統的な汽鍋鶏（汽锅鸡）を伝統的な土鍋と雲南の薬草で調理する専門レストラン',
     '伝統的な汽鍋鶏（チーグオジー）を伝統的な土鍋と雲南の薬草で調理する専門レストラン'],
  ],
};
for (const [f, reps] of Object.entries(fixes)) {
  let s = fs.readFileSync(f, "utf8");
  const orig = s;
  for (const [a, b] of reps) {
    if (!s.includes(a)) { console.log("NOT FOUND in " + f + ":\n  " + a.slice(0, 80)); continue; }
    s = s.split(a).join(b);
  }
  if (s !== orig) fs.writeFileSync(f, s);
}
console.log("done content fixes");
