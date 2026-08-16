# -*- coding: utf-8 -*-
import io, json, re
# attractions
data = io.open('src/pages/[lang]/guide/attractions.astro', encoding='utf-8').read()
items = []
keys = ['atx_forbidden','atx_greatwall','atx_temple','atx_bund','atx_yu','atx_tower','atx_terracotta','atx_citywall','atx_muslim','atx_panda','atx_jinli','atx_buddha']
for m, key in zip(re.finditer(r'lang === "ja" \? `([^`]+)` : `([^`]+)`', data), keys):
    items.append({'key': key, 'en': m.group(2), 'ja': m.group(1)})
io.open('.audit/ref-attractions.json','w',encoding='utf-8').write(json.dumps(items, ensure_ascii=False, indent=1))
print('attractions', len(items))

# business: from the astro file's tools array
data2 = io.open('src/pages/[lang]/guide/business/index.astro', encoding='utf-8').read()
tools = []
for m in re.finditer(r'title: "([^"]+)",\s*\n\s*titleJa: "([^"]+)",\s*\n\s*titleCn: "([^"]+)",[\s\S]*?description:\s*\n?\s*"([\s\S]*?)",\s*\n\s*descriptionJa: "([^"]+)",', data2):
    tools.append({'title': m.group(1), 'titleJa': m.group(2), 'titleCn': m.group(3), 'desc': m.group(4).strip(), 'descJa': m.group(5)})
print('tools parsed', len(tools))
io.open('.audit/ref-business.json','w',encoding='utf-8').write(json.dumps(tools, ensure_ascii=False, indent=1))

# stages
data3 = io.open('src/pages/[lang]/guide/index.astro', encoding='utf-8').read()
m = re.search(r'const jaStageMap: Record<string, string> = \{([^}]+)\}', data3)
stages = []
for k, v in re.findall(r'"([^"]+)": "([^"]+)"', m.group(1)):
    stages.append({'key': 'stage_' + k.replace(' & ', '_').replace('-', '_').replace(' ', '_').lower(), 'en': k, 'ja': v})
io.open('.audit/ref-stages.json','w',encoding='utf-8').write(json.dumps(stages, ensure_ascii=False, indent=1))
print('stages', len(stages))
for s in stages: print(' ', s)
