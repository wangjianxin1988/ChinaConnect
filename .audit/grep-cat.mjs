import cp from "node:child_process";
const out = cp.execSync('rg -n "restaurant\\.category|emergencyContacts.*category|\.category" src/components/city src/pages --glob "*.tsx" --glob "*.astro"', { encoding: "utf8" });
console.log(out.slice(0, 3000));
