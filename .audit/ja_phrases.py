import io, re
data = io.open('src/data/guide/overrides-ja.ts', encoding='utf-8').read()
pat = re.compile(r'^\s*"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)",?\s*$', re.M)
m = {x.group(1):x.group(2) for x in pat.finditer(data)}
# show ja entries around the SIM phrase
for k in ['I need a SIM card','我需要一张SIM卡','wǒ xūyào yī zhāng SIM kǎ','How much data do I have?','我有多少流量?','wǒ yǒu duōshǎo liúliàng?']:
    print(repr(k), '=>', repr(m.get(k, '<MISSING>')))
