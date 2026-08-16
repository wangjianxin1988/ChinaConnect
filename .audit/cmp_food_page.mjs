const base='http://127.0.0.1:4322';
async function visible(html){
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<astro-island\b[\s\S]*?<\/astro-island>/g,' ')
    .replace(/\s(?:props|ssr|data-astro-cid)="[^"]*"/g,' ');
}
for (const p of ['/ja/food/xa-local-2/','/ko/food/xa-local-2/']) {
  const t = await (await fetch(base+p)).text();
  const h = await visible(t);
  const m = h.match(/[\u3400-\u9fff]{2,}/g)||[];
  console.log('====', p);
  const uniq=[...new Set(m)];
  console.log(' CJK runs:', uniq.length, uniq.slice(0,25).join(' | '));
  // show title + address area
  const title = h.match(/<title>([^<]*)<\/title>/); console.log(' title:', title?.[1]);
  const addr = h.indexOf('西安市');
  if (addr>=0) console.log(' addr ctx:', h.slice(addr-60, addr+40).replace(/\s+/g,' '));
}
