import re,io
text=io.open('src/data/guide/overrides-zh-TW.ts',encoding='utf-8').read()
re_=re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$',re.M)
simplified = '门国这为长东车红经间见进说时书万与个来对发会开动东西风头飞云电电话样哪里这里些关问题张专业乡历史严丽举义气'
count=0
for k,v in re_.findall(text):
    hit=[c for c in v if c in simplified]
    if hit:
        count+=1
        if count<=15:
            print(' ', repr(k[:40]), '=>', repr(v[:70]), '| simplified:', ''.join(dict.fromkeys(hit)))
print('total with simplified chars:', count)
