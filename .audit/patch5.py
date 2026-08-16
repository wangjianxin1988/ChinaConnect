import io
p='scripts/translate-apps-emergency.mjs'
s=io.open(p,encoding='utf-8').read()
old='''function buildPrompt(entries) {
  const lines = entries.map(([key, text], i) => `k${i} = "${escapeTs(text)}"`).join("\\n");
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate these ${entries.length} English strings into ${TARGETS[lang]} for foreign visitors.
Content: mobile app descriptions, app category labels, and emergency contact names/descriptions in China.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${entries.length} keys (k0 ... k${entries.length - 1}).
- No markdown, no commentary, no extra keys. Translate EVERY value into ${TARGETS[lang]}.
- Keep brand names (WeChat, Alipay, etc.), phone numbers and URLs unchanged.

${lines}`;
}'''
new='''function buildPrompt(entries) {
  const body = "{\\n" + entries.map(([, text], i) => `  "k${i}": "${escapeTs(text)}"`).join(",\\n") + "\\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate these ${entries.length} English strings into ${TARGETS[lang]} for foreign visitors.
Content: mobile app descriptions, app category labels, and emergency contact names/descriptions in China.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${entries.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input. Do NOT leave Chinese characters.
- Keep brand names (WeChat, Alipay, etc.), phone numbers and URLs unchanged.`;
}'''
assert old in s, 'not found'
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched apps OK')
