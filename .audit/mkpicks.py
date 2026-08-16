import json,re
d=json.load(open('.audit/guide-strings.json',encoding='utf-8'))
ss=d['strings']
cjk=[s for s in ss if re.search(r'[\u3400-\u9fff]', s)]
eng=[s for s in ss if not re.search(r'[\u3400-\u9fff]', s)]
import random
random.seed(7)
picks = [random.sample(eng,4)+random.sample(cjk,4) for _ in range(3)]
json.dump(picks, open('.audit/picks.json','w',encoding='utf-8'), ensure_ascii=False)
print(len(picks),'batches ready')
