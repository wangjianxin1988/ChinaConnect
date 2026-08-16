const base='http://127.0.0.1:4322';
const t = await (await fetch(base+'/ko/city/beijing/')).text();
let h = t.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ')
         .replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ')
         .replace(/<!--[\s\S]*?-->/g,' ')
         .replace(/<astro-island[^>]*>/g,' ')
         .replace(/<\/astro-island>/g,' ')
         .replace(/\sprops="[^"]*"/g,' ')
         .replace(/\sssr="[^"]*"/g,' ');
console.log('after strip, mianfei count:', h.split("免费").length-1);
const m = h.match(/[\u3400-\u9fff]+/g)||[];
console.log('remaining CJK fragments:', m.length);
console.log(m.slice(0,30));
