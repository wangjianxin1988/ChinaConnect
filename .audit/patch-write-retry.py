import re
p = "scripts/fix-translations-kana.mjs"
src = open(p, encoding="utf-8").read()
old = '''    text = text.slice(0, start) + seg + text.slice(end);
    fs.writeFileSync(path, text, "utf8");
    console.log(`[${lang}] applied ${fixed} value replacements`);'''
new = '''    text = text.slice(0, start) + seg + text.slice(end);
    const tmp = `${path}.tmp`;
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      try {
        fs.writeFileSync(tmp, text, "utf8");
        fs.renameSync(tmp, path);
        break;
      } catch (error) {
        if (attempt === 6) throw error;
        console.warn(`  write retry ${attempt}: ${error?.code || error}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    console.log(`[${lang}] applied ${fixed} value replacements`);'''
assert old in src, "write block not found"
src = src.replace(old, new)
open(p, "w", encoding="utf-8", newline="\n").write(src)
print("patched write retry")
