import re
p = "scripts/translate-guide-strings.mjs"
src = open(p, encoding="utf-8").read()

old = '''async function translateBatch(batch) {
  const remaining = [...batch];
  const accepted = [];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    const prompt = buildPrompt(remaining);
    let content = "";
    try {
      content = await callChat(prompt);
      const result = extractJson(content);
      const newRemaining = [];
      let acceptedNow = 0;
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (goodValue(raw, s)) {
          accepted.push(raw);
          acceptedNow += 1;
        } else {
          newRemaining.push(s);
        }
      });
      if (newRemaining.length < remaining.length) {
        console.warn(`  partial: +${acceptedNow} accepted, ${newRemaining.length} remaining (attempt ${attempt})`);
      }
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      const snip = String(content || "").slice(0, 120).replace(/\\n/g, " ");
      console.warn(`  retry ${attempt}: ${error?.message || error}${snip ? ` | resp: ${snip}` : ""}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
  }
  if (remaining.length > 0) {
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
  }
  return accepted;
}

for (let i = 0; i < needsApi.length; i += BATCH_SIZE) {
  const batch = needsApi.slice(i, i + BATCH_SIZE);
  const startedAt = Date.now();
  const results = await translateBatch(batch);
  batch.forEach((s, idx) => { existing[s] = results[idx] ?? existing[s] ?? s; });
  await writeFile();
  const elapsed = Date.now() - startedAt;
  console.log(`  [${new Date().toISOString().slice(11, 19)}] batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needsApi.length / BATCH_SIZE)} done ${results.length}/${batch.length} in ${elapsed}ms`);
}'''

new = '''async function translateBatch(batch) {
  // Returns a Map<sourceString, translatedValue>. Results are keyed by the
  // source string so partial acceptance can never shift values onto the wrong
  // keys (previous versions returned a positional array and misaligned them).
  const resultMap = new Map();
  const remaining = [...batch];
  let attempt = 0;
  while (attempt < RETRY_ATTEMPTS && remaining.length > 0) {
    attempt += 1;
    const prompt = buildPrompt(remaining);
    let content = "";
    try {
      content = await callChat(prompt);
      const result = extractJson(content);
      const newRemaining = [];
      let acceptedNow = 0;
      remaining.forEach((s, i) => {
        const raw = result[`k${i}`];
        if (goodValue(raw, s)) {
          resultMap.set(s, raw);
          acceptedNow += 1;
        } else {
          newRemaining.push(s);
        }
      });
      if (newRemaining.length < remaining.length) {
        console.warn(`  partial: +${acceptedNow} accepted, ${newRemaining.length} remaining (attempt ${attempt})`);
      }
      remaining.splice(0, remaining.length, ...newRemaining);
    } catch (error) {
      const snip = String(content || "").slice(0, 120).replace(/\\n/g, " ");
      console.warn(`  retry ${attempt}: ${error?.message || error}${snip ? ` | resp: ${snip}` : ""}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
  }
  if (remaining.length > 0) {
    // Single-key fallback: ONE direct attempt per key (no recursion).
    for (const s of remaining) {
      let val;
      try {
        const content = await callChat(buildPrompt([s]));
        const result = extractJson(content);
        const raw = result?.k0;
        if (goodValue(raw, s)) val = raw;
      } catch { /* keep identity for manual review */ }
      if (val !== undefined) resultMap.set(s, val);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    console.warn(`  fallback: ${remaining.length} keys single-key`);
  }
  return resultMap;
}

for (let i = 0; i < needsApi.length; i += BATCH_SIZE) {
  const batch = needsApi.slice(i, i + BATCH_SIZE);
  const startedAt = Date.now();
  const results = await translateBatch(batch);
  batch.forEach((s) => {
    const v = results.get(s);
    if (v !== undefined) existing[s] = v;
  });
  await writeFile();
  const elapsed = Date.now() - startedAt;
  console.log(`  [${new Date().toISOString().slice(11, 19)}] batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needsApi.length / BATCH_SIZE)} done ${results.size}/${batch.length} in ${elapsed}ms`);
}'''

assert old in src, "translateBatch block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched translateBatch mapping bug")
