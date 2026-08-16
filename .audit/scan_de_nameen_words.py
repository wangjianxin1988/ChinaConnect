# -*- coding: utf-8 -*-
import io, json, os, re, sys, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
def walk(o, pathStr=""):
    out = {}
    if isinstance(o, list):
        for i, v in enumerate(o):
            out.update(walk(v, "%s[%d]" % (pathStr, i)))
    elif isinstance(o, dict):
        for k, v in o.items():
            out.update(walk(v, "%s.%s" % (pathStr, k) if pathStr else k))
    elif isinstance(o, str):
        out[pathStr] = o
    return out
base = 'src/data/cities-i18n/de'
# English word -> German
EN_WORDS = {
 'Lake':'See','Mountain':'Berg','Mountains':'Berge','Temple':'Tempel','Palace':'Palast','Palaces':'Paläste',
 'Street':'Straße','Bridge':'Brücke','Tower':'Turm','Garden':'Garten','Island':'Insel','Beach':'Strand',
 'Old Town':'Altstadt','Forest':'Wald','Canyon':'Schlucht','Valley':'Tal','Waterfall':'Wasserfall',
 'Museum':'Museum','Park':'Park','City':'Stadt','Resort':'Resort','Center':'Zentrum','Centre':'Zentrum',
 'Hotel':'Hotel','Village':'Dorf','Gate':'Tor','Wall':'Mauer','Cave':'Höhle','Gorge':'Schlucht',
 'Pagoda':'Pagode','Square':'Platz','Ravine':'Schlucht','Peak':'Gipfel','View':'Aussicht',
 'National Park':'Nationalpark','Nature Reserve':'Naturschutzgebiet','Scenic Area':'Landschaftsgebiet',
 'Great':'Große','New':'Neue','North':'Nördliche','South':'Südliche','East':'Östliche','West':'Westliche',
 'Upper':'Obere','Lower':'Untere','Ancient':'Antike','Cultural':'Kulturelles','World':'Welt',
 'Heritage':'Kulturerbe','Site':'Stätte','Grand':'Große','Royal':'Königliche','Imperial':'Kaiserliche',
 'Summer':'Sommer','Winter':'Winter','Spring':'Frühling','Autumn':'Herbst','Bamboo':'Bambus','Stone':'Stein',
 'Yellow':'Gelbe','White':'Weiße','Black':'Schwarze','Red':'Rote','Green':'Grüne','Blue':'Blaue',
 'Little':'Kleine','Big':'Große','Marble':'Marmor','Folk':'Volks','Ethnic':'Ethnische','Minority':'Minderheit',
 'Glass':'Glas','Sea':'Meer','River':'Fluss','Harbor':'Hafen','Bay':'Bucht','Strait':'Meerenge',
}
found = collections.Counter()
rows = []
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    slug = fn[:-5]
    target = json.load(io.open(os.path.join(base, fn), encoding='utf-8'))
    en = json.load(io.open('src/data/cities/%s.json' % slug, encoding='utf-8'))
    ef = walk(en)
    for p, v in walk(target).items():
        if not (p.endswith('.nameEn') or p == 'nameEn'): continue
        ev = ef.get(p)
        if not isinstance(ev, str) or ev != v: continue  # verbatim EN
        for w in EN_WORDS:
            if re.search(r'\b' + w + r'\b', v):
                found[w] += 1
                rows.append((fn, p, v))
                break
print('nameEn with English words:', len(rows), 'unique:', len(set(r[2] for r in rows)))
for w, c in found.most_common():
    print('%3d  %s' % (c, w))
