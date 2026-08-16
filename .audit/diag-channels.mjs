const batches = [
"使用携程、Trip.com或Booking.com获取英文界面和更好的支持。",
"预订前核实酒店评分和评价",
"住在地铁站附近方便出行。热门区域：市中心、景点附近。",
"检查与地铁的实际距离，不要只看区域名称",
"不确定时选择灵活预订。免费取消可以减轻压力。",
"不可退款的房价更便宜但不灵活",
"查看近期（6个月内）的评价以获得准确信息。",
"对翻新的酒店要谨慎，评价少的情况下"
];
const prompt = `You are a professional translator. Translate the following Chinese strings into Korean for foreign visitors to China.
RULES: Output ONLY a single flat JSON object with keys k0..k7. No markdown, no commentary.
Translate EVERY value into Korean. Do NOT leave Chinese. Brands can stay (Trip.com, Booking.com).
k0 = "${batches[0]}"
k1 = "${batches[1]}"
k2 = "${batches[2]}"
k3 = "${batches[3]}"
k4 = "${batches[4]}"
k5 = "${batches[5]}"
k6 = "${batches[6]}"
k7 = "${batches[7]}"`;

async function call(label, base, key, model, bodyExtra={}) {
  const url = `${base}/v1/chat/completions`;
  const body = { model, messages:[{role:"user",content:prompt}], temperature:0.2, max_tokens:2000, ...bodyExtra };
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"}, body:JSON.stringify(body), signal:AbortSignal.timeout(90000)});
    const raw = await res.text();
    const ms = Date.now()-t0;
    return { label, status:res.status, ms, raw: raw.slice(0, 3000) };
  } catch(e) { return { label, err:String(e).slice(0,300), ms:Date.now()-t0 }; }
}

const out = [];
out.push(await call("deepseek", "https://api.deepseek.com", process.env.DEEPSEEK_API_KEY, "deepseek-chat"));
out.push(await call("dashscope_plus", "https://dashscope.aliyuncs.com/compatible-mode", process.env.DASHSCOPE_API_KEY, "qwen-plus"));
out.push(await call("dashscope_max", "https://dashscope.aliyuncs.com/compatible-mode", process.env.DASHSCOPE_API_KEY, "qwen-max"));
console.log(JSON.stringify(out, null, 2));
