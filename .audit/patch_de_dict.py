# -*- coding: utf-8 -*-
import io, json, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# EN value -> German (semantics follow ja standard). Only genuine English descriptors.
DICT = {
    'rice-noodles': 'Reisnudeln',
    'home-cooking': 'hausgemachte Küche',
    'hidden-gem': 'Geheimtipp',
    'cheap-eats': 'günstiges Essen',
    'fine-dining': 'gehobene Küche',
    'tianjin-cuisine': 'Tianjin-Küche',
    'suzhou-cuisine': 'Suzhou-Küche',
    'family-run': 'familiengeführt',
    'pan-fried': 'in der Pfanne gebraten',
    'dalian-specialty': 'Dalian-Spezialität',
    'Must-try': 'Muss man probieren',
    'morning-tea': 'Morgen-Tee',
    'chef-table': "Chef's Table",
    'tea-cuisine': 'Tee-Küche',
    'historic-area': 'historisches Viertel',
    'near-temple': 'in Tempelnähe',
    'sour-spicy': 'sauer-scharf',
    'bund-views': 'Bund-Blick',
    'bund-area': 'Bund-Viertel',
    'market-style': 'Markt-Stil',
    'tu-ethnic': 'Tu-Ethnie',
    'beach-area': 'Strandgebiet',
    'rice-rolls': 'Reisrollen',
    'roast-meat': 'Bratenfleisch',
    'rice-bowl': 'Reisschale',
    'historic-hotel': 'historisches Hotel',
    'garden-view': 'Gartenblick',
    'garden-setting': 'Gartenlage',
    'canal-view': 'Kanalblick',
    'private-kitchen': 'Privatküche',
    'ice-cream': 'Speiseeis',
    'russian-style': 'im russischen Stil',
    'harbin-cuisine': 'Harbin-Küche',
    'ice-festival': 'Eisfestival',
    'winter-specialty': 'Winter-Spezialität',
    'mineral-water': 'Mineralwasser',
    'roast-duck': 'Bratente',
    'tibetan-style': 'im tibetischen Stil',
    'student-life': 'Studentenleben',
    'republic-era': 'Republik-Ära',
    'lu-xun': 'Lu Xun',
    'Slow-cooked': 'langsam gegart',
    'dessert-shop': 'Dessertladen',
    'li-cuisine': 'Li-Küche',
    'historic-villa': 'historische Villa',
    'stir-fry': 'Pfannengericht',
    'celebrity-chef': 'Promi-Koch',
    'temple-area': 'Tempelgebiet',
    'salt-lake': 'Salzsee',
    'zhuang-cuisine': 'Zhuang-Küche',
    'yao-ethnic': 'Yao-Ethnie',
    'early-close': 'schließt früh',
    'west-street': 'Weststraße',
    'hong-kong': 'Hongkong',
    'Alpine Vegetation': 'Alpenvegetation',
    'Farm-to-table': 'Farm-to-Table',
}

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

def setpath(obj, pathStr, value):
    tokens = []
    for part in pathStr.split('.'):
        m = re.match(r'^([^[]*)((?:\[\d+\])*)$', part)
        if m.group(1): tokens.append(m.group(1))
        for b in re.findall(r'\[(\d+)\]', m.group(2)):
            tokens.append(int(b))
    cur = obj
    for i, t in enumerate(tokens):
        if i == len(tokens) - 1:
            cur[t] = value
        else:
            cur = cur[t]

base = 'src/data/cities-i18n/de'
fixed = 0
files_changed = set()
for fn in sorted(os.listdir(base)):
    if not fn.endswith('.json'): continue
    fp = os.path.join(base, fn)
    target = json.load(io.open(fp, encoding='utf-8'))
    changed = False
    for p, v in walk(target).items():
        if v in DICT and isinstance(v, str):
            setpath(target, p, DICT[v])
            fixed += 1
            changed = True
    if changed:
        io.open(fp, 'w', encoding='utf-8').write(json.dumps(target, ensure_ascii=False, indent=2))
        files_changed.add(fn)
print('fixed fields:', fixed, '| files:', len(files_changed))
