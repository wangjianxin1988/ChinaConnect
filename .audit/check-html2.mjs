const r = await fetch("http://localhost:4321/ja/city/beijing/");
const t = await r.text();
console.log("LAST 800:", t.slice(-800));
console.log("----FIRST script tags----");
const m = [...t.matchAll(/<script[^>]*>/g)];
console.log("total script tags:", m.length);
m.slice(0, 6).forEach((x, i) => console.log(i, x[0]));
console.log("last scripts:");
m.slice(-6).forEach((x, i) => console.log(i, x[0]));
