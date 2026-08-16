import fs from "node:fs";
const strings = JSON.parse(fs.readFileSync(".audit/guide-strings.json","utf8")).strings;
const text = fs.readFileSync("src/data/guide/overrides-ko.ts","utf8");
const re = /^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
const un = (s)=>s.replace(/\\"/g,'"').replace(/\\\\/g,'\\').replace(/\\n/g,"\n");
const existing = new Map();
for (const m of text.matchAll(re)) existing.set(un(m[1]), un(m[2]));
const dis = /[\u3400-\u9fff\u3040-\u30ff\u0400-\u04ff\u0600-\u06ff\u0e00-\u0e7f]/;
const needsApi = strings.filter((s)=>{
  const v = existing.get(s);
  if (v === undefined) return true;
  if (v === s) return true; // identity -> needs refill (simplified)
  if (dis.test(v)) return true;
  return false;
});
console.log("needsApi:", needsApi.length);
const first8 = needsApi.slice(0,8);
const esc = (s)=>s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n");
const body = "{\n" + first8.map((s,i)=>`  "k${i}": "${esc(s)}"`).join(",\n") + "\n}";
const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into Korean for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k7) where EVERY value is translated into Korean.
- No markdown, no commentary. Do NOT echo the input. Do NOT leave Chinese characters.
- Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Proper nouns should be transliterated into Korean or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a Korean gloss in parentheses where helpful.`;
console.log("=== KEYS ===");
first8.forEach((s,i)=>console.log(i, JSON.stringify(s.slice(0,90))));
const res = await fetch("https://api.deepseek.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${process.env.DEEPSEEK_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"user",content:prompt}],temperature:0.2,max_tokens:4000}),signal:AbortSignal.timeout(90000)});
const j = await res.json();
console.log("=== RESPONSE ===");
console.log(j.choices?.[0]?.message?.content || JSON.stringify(j).slice(0,500));
