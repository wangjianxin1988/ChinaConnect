import fs from "node:fs";
function patch(file, pairs) {
  let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error("NOT FOUND in " + file + ": " + JSON.stringify(from.slice(0, 90))); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(file, s, "utf8");
  console.log("patched", file);
}
patch("src/pages/[lang]/index.astro", [
  ['        <p class="text-gray-600">data-i18n="index.featuredDestinations"Based on popular destinations</p>{_lookup("index.featuredDestinations")}</div>',
   '        <p class="text-gray-600" data-i18n="index.featuredDestinations">{_lookup("index.featuredDestinations")}</p>\n      </div>'],
]);
patch("src/pages/index.astro", [
  ['        <p class="text-gray-600">data-i18n="index.featuredDestinations"Based on popular destinations</p>',
   '        <p class="text-gray-600" data-i18n="index.featuredDestinations">Based on popular destinations</p>'],
]);
patch("src/pages/city/[slug]/attractions.astro", [
  ['<p class="text-xs text-gray-400 mt-3">data-i18n="cityAttractions.disclaimer"<span data-i18n="cityAttractions.disclaimer" data-i18n-vars=\'{"city": city.nameEn}\'>{_lookup("cityAttractions.disclaimer")}</span></p>',
   '<p class="text-xs text-gray-400 mt-3"><span data-i18n="cityAttractions.disclaimer" data-i18n-vars=\'{"city": city.nameEn}\'>{_lookup("cityAttractions.disclaimer")}</span></p>'],
]);
patch("src/pages/city/[slug]/food.astro", [
  ['<p class="text-xs text-gray-400 mt-3">data-i18n="cityFood.disclaimer"Phone numbers and addresses may change. We recommend verifying via the restaurant\'s official channels or calling ahead.</p>',
   '<p class="text-xs text-gray-400 mt-3" data-i18n="cityFood.disclaimer">Phone numbers and addresses may change. We recommend verifying via the restaurant\'s official channels or calling ahead.</p>'],
]);
