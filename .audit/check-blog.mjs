const r = await fetch("http://localhost:4321/ja/blog/");
const t = await r.text();
console.log("status:", r.status, "bytes:", t.length);
const m = t.match(/<title>([^<]*)<\/title>/);
console.log("title:", m && m[1]);
const err = t.match(/Error[^<]{0,200}|error[^<]{0,200}/i);
console.log("err snippet:", err ? err[0].slice(0, 300) : "(none)");
console.log("tail:", t.slice(-300).replace(/\n/g, " "));
