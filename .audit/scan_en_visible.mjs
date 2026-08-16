const base='http://127.0.0.1:4322';
const CJK=/[\u3400-\u9fff]+/g;
async function visible(html){
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<astro-island\b[\s\S]*?<\/astro-island>/g,' ')
    .replace(/\s(?:props|ssr|data-astro-cid)="[^"]*"/g,' ');
}
const paths=[
  '/','/cities/','/city/beijing/','/city/qingdao/','/city/beijing/food/','/city/beijing/attractions/',
  '/food/','/attractions/','/scenic-spots/','/guide/','/emergency/','/guide/dining/','/food/bj-michelin-1/',
  '/blog/','/blog/ultimate-china-travel-guide-2026/','/pricing/','/ai/'
];
for (const p of paths) {
  try {
    const t = await (await fetch(base+p)).text();
    const h = await visible(t);
    const frags = [...new Set(h.match(CJK)||[])];
    if (frags.length) console.log(p, frags.length, frags.slice(0,12).join(' | '));
    else console.log(p, 'CLEAN');
  } catch(e) { console.log(p, 'ERR', e.message); }
}
