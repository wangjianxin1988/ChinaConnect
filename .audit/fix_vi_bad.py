# -*- coding: utf-8 -*-
import io, json, re, os

# load exact bad keys
bad = json.loads(io.open('.audit/vi-bad-keys.json', encoding='utf-8').read())
badkeys = [x['key'] for x in bad['badKeys']]
assert len(badkeys) == 20, len(badkeys)

# Vietnamese meaning translations for the pinyin phrasebook entries (following ja/fr/de/th approach)
MAP = {
    'wǒ xūyào yī zhāng SIM kǎ': 'Tôi cần một thẻ SIM',
    'wǒ yǒu duōshǎo liúliàng?': 'Tôi còn bao nhiêu dữ liệu?',
    'shàngwǎng shàng bù qù': 'Không kết nối được Internet',
    'zhèlǐ kěyǐ yòng shǒujī ma?': 'Ở đây có dùng được điện thoại không?',
    'wǒ xūyào gèng duō liúliàng': 'Tôi cần thêm dữ liệu',
    'yùnyíng shāng méndiǎn zài nǎlǐ?': 'Cửa hàng của nhà mạng ở đâu?',
    'wǒ guòmǐn jiānguǒ': 'Tôi bị dị ứng với các loại hạt',
    'wǒ guòmǐn jīdàn': 'Tôi bị dị ứng trứng',
    'wǒ bù chī ròu, dàn, nǎi': 'Tôi không ăn thịt, trứng và sữa',
    'wǒ xūyào yóutài jiéshí': 'Tôi cần đồ ăn kiêng kosher',
    'bù yào là': 'Không cay',
    'shǎo yóu': 'Ít dầu',
    'wēi là': 'Cay nhẹ',
    'qǐng gěi wǒ shūcài': 'Cho tôi xin rau',
    'mǐfàn': 'Cơm',
    'mǎidān': 'Tính tiền',
    'zhè shì sùshí ma?': 'Đây có phải là món chay không?',
    'tài là le!': 'Cay quá!',
    'qǐng dài wǒ qù...': 'Làm ơn đưa tôi đến...',
    'kěyǐ dǎ biǎo ma?': 'Có thể bật đồng hồ tính tiền taxi không?',
}
assert set(MAP) == set(badkeys), (set(badkeys)-set(MAP), set(MAP)-set(badkeys))

path = 'src/data/guide/overrides-vi.ts'
data = io.open(path, encoding='utf-8').read()

def esc(s):
    return s.replace('\\', '\\\\').replace('"', '\\"')

changed = 0
for k, v in MAP.items():
    ke = esc(k)
    # exact line match: "key": "value",
    pat = re.compile(r'^(\s*")' + re.escape(ke) + r'("\s*:\s*")((?:[^"\\]|\\.)*)(",)', re.M)
    m = pat.search(data)
    if not m:
        # maybe value is on same line but with escaped chars; fallback: find by key only
        pat2 = re.compile(r'^(\s*")' + re.escape(ke) + r'("\s*:\s*")((?:[^"\\]|\\.)*)(")', re.M)
        m = pat2.search(data)
    if not m:
        print('NOT FOUND:', repr(k))
        continue
    data = data[:m.start()] + m.group(1) + ke + m.group(2) + esc(v) + m.group(4) + data[m.end():]
    changed += 1

io.open(path, 'w', encoding='utf-8', newline='\n').write(data)
print('patched', changed, '/', len(MAP))
