import urllib.request, io, re
req = urllib.request.Request('http://127.0.0.1:4322/vi/guide/communication/', headers={'User-Agent':'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=120).read().decode('utf-8', errors='replace')
# strip scripts/styles
html2 = re.sub(r'<script[\s\S]*?</script>', ' ', html)
html2 = re.sub(r'<style[\s\S]*?</style>', ' ', html2)
txt = re.sub(r'<[^>]+>', ' ', html2)
txt = re.sub(r'\s+', ' ', txt)
for kw in ['thẻ SIM', 'Cơm', 'Tính tiền', 'Không cay', 'Cay quá', 'Tôi cần thêm dữ liệu', 'Cửa hàng của nhà mạng']:
    print(kw, '=>', kw in txt)
# count leftover pinyin (wǒ / xūyào / mǐfàn etc as standalone words in visible text)
pinyin_leftover = re.findall(r'wǒ |xūyào|shūcài|mǐfàn|mǎidān|yóutài|sùshí|dǎ biǎo|tài là', txt)
print('pinyin leftover count:', len(pinyin_leftover))
