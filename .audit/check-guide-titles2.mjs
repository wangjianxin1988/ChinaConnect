for (const u of ["/ja/guide/visa", "/ja/guide/accommodation", "/ja/guide/business/translation", "/ja/guide/business/expo-calendar"]) {
  const r = await fetch("http://localhost:4321" + u);
  const t = await r.text();
  console.log(u, "=>", (t.match(/<title>([^<]*)<\/title>/) || [])[1], "| status:", r.status);
}
