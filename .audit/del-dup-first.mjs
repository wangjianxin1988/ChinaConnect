import fs from "fs";
const file = "src/data/guide/ja-overrides.ts";
const lines = fs.readFileSync(file,"utf8").split(/\r?\n/);
const remove = new Set([569, 1834,1835,1836,1837,1838,1839,1840,1841,1842,1843,1844,1845,1846,1847,1848,1849,1850,1851,1852,1853,1854,1855,1856,1857,1858,1859,1860,1861,1862,1863,1864,1865,1866,1867,1868,1869, 2195,2196,2197,2198,2199,2200,2201,2202,2203, 2786, 2801]);
const out = lines.filter((_,i)=>!remove.has(i+1));
fs.writeFileSync(file, out.join("\n"), "utf8");
console.log("removed", lines.length - out.length, "lines; new total", out.length);
