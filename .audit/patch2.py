import io
p='scripts/translate-apps-emergency.mjs'
s=io.open(p,encoding='utf-8').read()

old_lines = '''async function translateBatch(batch) {
  const lines = batch.map(([key, text], i) => `k${i} = "${escapeTs(text)}"`).join("\\n");
  const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate these ${batch.length} English strings into ${TARGETS[lang]} for foreign visitors.
Content: mobile app descriptions, app category labels, and emergency contact names/descriptions in China.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${batch.length} keys (k0 ... k${batch.length - 1}).
- No markdown, no commentary, no extra keys. Translate EVERY value into ${TARGETS[lang]}.
- Keep brand names (WeChat, Alipay, etc.), phone numbers and URLs unchanged.

${lines}`;'''

new_lines = '''function buildPrompt(entries) {
  const lines = entries.map(([key, text], i) => `k${i} = "${escapeTs(text)}"`).join("\\n");
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate these ${entries.length} English strings into ${TARGETS[lang]} for foreign visitors.
Content: mobile app descriptions, app category labels, and emergency contact names/descriptions in China.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${entries.length} keys (k0 ... k${entries.length - 1}).
- No markdown, no commentary, no extra keys. Translate EVERY value into ${TARGETS[lang]}.
- Keep brand names (WeChat, Alipay, etc.), phone numbers and URLs unchanged.

${lines}`;
}

async function translateBatch(batch) {
  const prompt = buildPrompt(batch);'''

assert old_lines in s, 'apps lines block not found'
s = s.replace(old_lines, new_lines)

old_fb = '''  const out = [];
  for (let i = 0; i < batch.length; i += 1) {
    const one = batch[i];
    try {
      const [r] = await translateBatch([one]);
      out.push(r);
    } catch {
      out.push(one);
    }
  }
  return out;
}'''

new_fb = '''  const out = [];
  for (const one of batch) {
    // Single-key fallback: ONE direct attempt (no recursion), accept or keep identity.
    try {
      const content = await callChat(buildPrompt([one]));
      const result = extractJson(content);
      const raw = result?.k0;
      if (typeof raw === "string" && acceptTranslation(raw, lang, one[1])) out.push(raw);
      else out.push(one[1]);
    } catch {
      out.push(one[1]);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return out;
}'''

assert old_fb in s, 'apps fallback block not found'
s = s.replace(old_fb, new_fb)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched translate-apps-emergency.mjs OK')
