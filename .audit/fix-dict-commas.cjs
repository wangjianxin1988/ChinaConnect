const fs = require("fs");
for (const p of ["src/data/food/ja-food-overrides.ts", "src/data/guide/ja-overrides.ts"]) {
  let s = fs.readFileSync(p, "utf8");
  const orig = s;
  // find the pattern: line without comma right before the inserted block. Fix: ensure every non-final line has a comma.
  const lines = s.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    // a dict entry line: "key": "value",  — must end with comma unless it's the last entry before "};"
    if (/^"[^"]+":\s*"[^"]*"$/.test(t) && !t.endsWith(",")) {
      // check next non-empty line is also an entry (not "};")
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length && !lines[j].trim().startsWith("}")) {
        lines[i] = lines[i] + ",";
      }
    }
  }
  s = lines.join("\n");
  if (s !== orig) fs.writeFileSync(p, s);
  console.log(p + ": " + (s !== orig ? "fixed" : "no change"));
}
