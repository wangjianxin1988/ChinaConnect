const base='http://127.0.0.1:4322';
async function visible(html){
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g,' ')
    .replace(/<!--[\s\S]*?-->/g,' ')
    .replace(/<astro-island\b[\s\S]*?<\/astro-island>/g,' ')
    .replace(/\s(?:props|ssr|data-astro-cid)="[^"]*"/g,' ');
}
for (const p of ['/ko/city/chengdu/food/','/ko/food/','/ko/city/qingdao/']) {
  const t = await (await fetch(base+p)).text();
  const h = await visible(t);
  let i = h.indexOf('免费'), n=0;
  console.log('====', p, '免费 visible count:', h.split('免费').length-1);
  while (i>=0 && n<3) {
    console.log('  ctx:', h.slice(Math.max(0,i-160), i+40).replace(/\s+/g,' ').slice(-200));
    i = h.indexOf('免费', i+1); n++;
  }
}
