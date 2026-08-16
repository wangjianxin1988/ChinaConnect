const base='http://127.0.0.1:4322';
const t = await (await fetch(base+'/ko/city/qingdao/')).text();
// strip scripts/styles/comments/astro-island
let h = t.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ')
         .replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ')
         .replace(/<!--[\s\S]*?-->/g,' ')
         .replace(/<astro-island[^>]*>[\s\S]*?<\/astro-island>/g,' ');
for (const frag of ['免费','温带海洋性气候','灯塔文化','青岛']) {
  const idx = h.indexOf(frag);
  if (idx>=0) {
    const seg = h.slice(Math.max(0,idx-200), idx+80).replace(/\s+/g,' ');
    console.log('===', frag, '===');
    console.log(seg.slice(-260));
  } else console.log('===', frag, 'NOT in visible');
}
