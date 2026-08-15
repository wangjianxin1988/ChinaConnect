const r = await fetch("http://localhost:4321/blog/");
const t = await r.text();
console.log("status:", r.status, "bytes:", t.length, "title:", (t.match(/<title>([^<]*)<\/title>/) || [])[1]);
