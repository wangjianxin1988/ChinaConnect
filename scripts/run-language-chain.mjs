// Run translate-data-fast for a sequence of languages (serial, resumable per city).
// Usage: node scripts/run-language-chain.mjs ko th ru de fa
import { execFileSync } from "node:child_process";

const langs = process.argv.slice(2).filter((lang) => lang && !lang.startsWith("--"));
if (!langs.length) {
  console.error("usage: node scripts/run-language-chain.mjs ko th ru de fa");
  process.exit(1);
}
for (const lang of langs) {
  console.log(`\n===== CHAIN: starting ${lang} (${new Date().toISOString()}) =====`);
  try {
    execFileSync(process.execPath, ["scripts/translate-data-fast.mjs", `--lang=${lang}`, "--source-lang=en"], {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log(`===== CHAIN: ${lang} done (${new Date().toISOString()}) =====`);
  } catch (error) {
    console.error(`===== CHAIN: ${lang} FAILED (${error?.message || error}) =====`);
    process.exitCode = 1;
    break;
  }
}
