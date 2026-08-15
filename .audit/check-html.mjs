const r = await fetch("http://localhost:4321/ja/city/beijing/");
const t = await r.text();
console.log("bytes:", t.length);
for (const marker of ["Unified runtime", "__CC_RUNTIME__", "applyTranslationsTo", "PWA Service Worker", "initLanguageUI"]) {
  console.log(marker, "=>", t.includes(marker));
}
