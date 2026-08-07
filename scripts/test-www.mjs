const r = await fetch("https://www.chinaengage.org/", { redirect: "follow" }).catch((e) => ({
  error: e.message,
  status: 0,
}));
if (r.error) {
  console.log("Error:", r.error);
} else {
  console.log("Status:", r.status);
  console.log("Final URL:", r.url);
  const t = await r.text();
  console.log("Body len:", t.length);
}
