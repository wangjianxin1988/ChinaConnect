import sys
sys.stdout.reconfigure(encoding="utf-8")
p = "src/i18n/translations.ts"
lines = open(p, encoding="utf-8").read().split("\n")
fixes = {
    8646: ('"�겨찾기 없음"', '"즐겨찾기 없음"'),
    9039: ('"미�랭, 흑진주, 로컬 인기"', '"미쉐린, 흑진주, 로컬 인기"'),
    12442: ('"맞� 추천"', '"맞춤 추천"'),
    12447: ('"미�랭 레스토랑"', '"미쉐린 레스토랑"'),
    12502: ('"중국 탐험을 계속해 �시다"', '"중국 탐험을 계속해 보시다"'),
    12562: ('"�륭한 음식 발견"', '"훌륭한 음식 발견"'),
    12737: ('"�13,900"', '"₩13,900"'),
    15922: ('"ตั้งรหัสผ่านการชำระเงินที่ปลอดภัยเพื่ออนุญาต�ธุรกรรม"', '"ตั้งรหัสผ่านการชำระเงินที่ปลอดภัยเพื่ออนุญาตให้ธุรกรรม"'),
    47892: ('"地鐵、計程車、火車、共享單車 — 讓你輕�穿梭各大城市。"', '"地鐵、計程車、火車、共享單車 — 讓你輕鬆穿梭各大城市。"'),
    51267: ('"全球旅客信�"', '"全球旅客信賴"'),
}
n = 0
for lineno, (old, new) in fixes.items():
    idx = lineno - 1
    if old in lines[idx]:
        lines[idx] = lines[idx].replace(old, new)
        n += 1
    else:
        print("MISS at", lineno, repr(lines[idx][:80]))
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("fixed:", n, "of", len(fixes))
