# -*- coding: utf-8 -*-
import io, json, re
data3 = io.open('src/pages/[lang]/guide/index.astro', encoding='utf-8').read()
m = re.search(r'const jaStageMap: Record<string, string> = \{([^}]+)\}', data3)
map4 = {'Stage 1':'stage_1','Stages 2 & 10':'stage_2_10','Stage 3':'stage_3','Stages 4-7':'stage_4_7','Stage 8':'stage_8','Stage 9':'stage_9','Stage 11':'stage_11','Stage 12':'stage_12'}
stages = []
for k, v in re.findall(r'"([^"]+)": "([^"]+)"', m.group(1)):
    stages.append({'key': map4[k], 'en': k, 'ja': v})
io.open('.audit/ref-stages.json','w',encoding='utf-8').write(json.dumps(stages, ensure_ascii=False, indent=1))
print('stages', len(stages))
for s in stages: print(' ', s)
