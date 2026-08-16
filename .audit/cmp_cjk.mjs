const base='http://127.0.0.1:4322';
const CJK=/[\u3400-\u9fff]+/g;
async function frags(p){const t=await (await fetch(base+p)).text();return new Set(t.match(CJK)||[]);}
const [ko,ja]=await Promise.all([frags('/ko/city/qingdao/'),frags('/ja/city/qingdao/')]);
const res=[...ko].filter(f=>!ja.has(f));
console.log('ko-only CJK fragments:',res.length);
const sorted=[...res].sort((a,b)=>b.length-a.length);
console.log(sorted.slice(0,80).join(' | '));
