import fs from "node:fs";
const f = "src/i18n/components-strings.ts";
let t = fs.readFileSync(f, "utf8");
const before = (t.match(/ko: '[^']*'/g) || []).filter((x) => x.includes("\u77e5\u7406"));
const replacement = "ko: '\ub3c4\ucc29 \uc804\uc5d0 \ub2e4\uc6b4\ub85c\ub4dc\ud558\uc138\uc694 \u2014 \uc77c\ubd80 \uc571\uc740 \uc911\uad6d\uc5d0\uc11c \uc81c\ud55c\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'";
t = t.replace(/ko: '[^']*\u77e5\u7406[^']*'/, replacement);
fs.writeFileSync(f, t, "utf8");
console.log("replaced count:", before.length);
console.log("remaining 知理:", (t.match(/\u77e5\u7406/g) || []).length);
