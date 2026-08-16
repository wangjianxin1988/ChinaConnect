import io, re, glob, os
# search guide source .ts files for one pinyin string to see context
target = 'wǒ xūyào yī zhāng SIM kǎ'
for f in ['src/data/guide/communication.ts','src/data/guide/dining.ts','src/data/guide/emergency.ts','src/data/guide/transport.ts','src/data/guide/accommodation.ts']:
    data = io.open(f, encoding='utf-8').read()
    idx = data.find(target)
    if idx >= 0:
        print('=== FOUND in', f, 'at', idx, '===')
        print(data[max(0,idx-600):idx+500])
        print('......')
