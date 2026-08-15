// Simplified-Chinese-only char detection for ja content.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dir = path.dirname(fileURLToPath(import.meta.url));
const list = JSON.parse(fs.readFileSync(path.join(__dir, 'simplified-set.json'), 'utf8'));
const set = new Set(list);
export { set };
export function simplifiedCount(s) { let n = 0; for (const ch of s) { if (set.has(ch)) n++; } return n; }
export function hasSimplified(s, min = 1) { return simplifiedCount(s) >= min; }
export function simplifiedChars(s) { const o = []; for (const ch of s) { if (set.has(ch) && !o.includes(ch)) o.push(ch); } return o; }
export function kanaCount(s) { return (s.match(/[\u3040-\u30ff]/g) || []).length; }
export function hanCount(s) { return (s.match(/[\u4e00-\u9fff]/g) || []).length; }
