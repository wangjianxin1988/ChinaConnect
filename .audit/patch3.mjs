import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 100))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/pages/[lang]/food/index.astro", [
  ['        <span>🍜</span> Essential Food Apps\n      </h2>',
   '        <span>🍜</span> <span data-i18n="foodPage.essentialFoodApps">Essential Food Apps</span>\n      </h2>'],
  ['      <EmbeddedAppRecommendation\n        client:visible\n        categories={["food"]}\n        essentialOnly={true}\n      />',
   '      <EmbeddedAppRecommendation\n        client:visible\n        lang={lang}\n        categories={["food"]}\n        essentialOnly={true}\n      />'],
  ['          <span>💡</span> Pro Tips for Food Apps\n        </h3>',
   '          <span>💡</span> <span data-i18n="foodPage.proTipsFoodApps">Pro Tips for Food Apps</span>\n        </h3>'],
  ['          <li>• <strong>Meituan</strong> has English menu translation for many restaurants</li>',
   '          <li>• <strong>Meituan</strong> <span data-i18n="foodPage.tipMeituan">has English menu translation for many restaurants</span></li>'],
  ['          <li>• <strong>Dianping</strong> is great for finding local favorites with English reviews</li>',
   '          <li>• <strong>Dianping</strong> <span data-i18n="foodPage.tipDianping">is great for finding local favorites with English reviews</span></li>'],
  ['          <li>• <strong>Ele.me</strong> offers the widest delivery coverage but may default to Chinese</li>',
   '          <li>• <strong>Ele.me</strong> <span data-i18n="foodPage.tipEleme">offers the widest delivery coverage but may default to Chinese</span></li>'],
  ['          <li>• Link your foreign card to Alipay/WeChat Pay before ordering</li>',
   '          <li>• <span data-i18n="foodPage.tipLinkCard">Link your foreign card to Alipay/WeChat Pay before ordering</span></li>'],
]);
