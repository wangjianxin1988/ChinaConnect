import io
p='scripts/translate-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()

old_lines = '''    const lines = remaining.map((s, i) => `k${i} = "${escapeTs(s)}"`).join("\\n");
    const prompt = `You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.
Translate the following strings into ${TARGETS[lang]} for foreign visitors.
Content: visa rules, transport, payment, dining, etiquette, emergency, business and travel guide content.
RULES:
- Output ONLY a single flat JSON object with EXACTLY ${remaining.length} keys (k0 ... k${remaining.length - 1}).
- No markdown, no commentary, no extra keys.
- Translate EVERY value into ${TARGETS[lang]}. Do NOT keep English or Chinese text unless it is a brand name, number, price, time, unit, phone number, URL or proper noun.
- Do NOT leave any Chinese characters in the output. Proper nouns should be transliterated into ${TARGETS[lang]} or kept as standard English/pinyin.
- For Chinese proper nouns and dish names, give a ${TARGETS[lang]} gloss in parentheses where helpful.

${lines}`;'''

new_lines = '''    const prompt = buildPrompt(remaining);'''

assert old_lines in s, 'lines block not found'
s = s.replace(old_lines, new_lines)

# insert buildPrompt helper before translateBatch
anchor = 'async function translateBatch(batch) {'
helper = '''function buildPrompt(keys) {
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
}

'''
assert anchor in s, 'anchor not found'
s = s.replace(anchor, helper + anchor, 1)

old_fb = '''  if (remaining.length > 0) {
    // Single-key fallback (bounded): smaller responses succeed more often.
    for (const s of remaining) {
      try {
        const [one] = await translateBatch([s]);
        if (one !== undefined) accepted.push(one);
        else accepted.push(undefined);
      } catch {
        accepted.push(undefined);
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    console.warn(`  fallback: ${remaining.length} keys single-key`);
  }'''

new_fb = '''  if (remaining.length > 0) {
    // Single-key fallback: ONE direct attempt per key (no recursion).
    for (const s of remaining) {
      let val;
      try {
        const content = await callChat(buildPrompt([s]));
        const result = extractJson(content);
        const raw = result?.k0;
        if (goodValue(raw, s)) val = raw;
      } catch { /* keep identity for manual review */ }
      accepted.push(val);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    console.warn(`  fallback: ${remaining.length} keys single-key`);
  }'''

assert old_fb in s, 'fallback block not found'
s = s.replace(old_fb, new_fb)

io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched translate-guide-strings.mjs OK')
