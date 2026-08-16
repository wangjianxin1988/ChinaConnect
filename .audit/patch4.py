import io
for p in ['scripts/translate-guide-strings.mjs','scripts/translate-apps-emergency.mjs']:
    s=io.open(p,encoding='utf-8').read()
    old='''function buildPrompt(keys) {
  const lines = keys.map((s, i) => `k${i} = "${escapeTs(s)}"`).join("\\n");
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]} for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${keys.length} keys (k0 ... k${keys.length - 1}).
- No markdown, no commentary, no extra keys.
- Translate EVERY value into ${TARGETS[lang]}. Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Do NOT leave any Chinese characters in the output. Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.

${lines}`;
}'''
    if p.endswith('apps'):
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
    assert old in s, f'{p}: buildPrompt block not found'
    if p.endswith('apps'):
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
    else:
        new='''function buildPrompt(keys) {
  const body = "{\\n" + keys.map((s, i) => `  "k${i}": "${escapeTs(s)}"`).join(",\\n") + "\\n}";
  return `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]} for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
Input JSON:
${body}
RULES:
- Respond with ONLY a JSON object of the same shape (keys k0..k${keys.length - 1}) where EVERY value is translated into ${TARGETS[lang]}.
- No markdown, no commentary. Do NOT echo the input. Do NOT leave Chinese characters.
- Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.`;
}'''
    s=s.replace(old,new)
    io.open(p,'w',encoding='utf-8',newline='\n').write(s)
    print('patched',p)
