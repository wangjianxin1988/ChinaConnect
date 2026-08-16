# -*- coding: utf-8 -*-
import io
p = 'src/pages/offline.astro'
s = io.open(p, encoding='utf-8').read()
css = """      .phrase-chinese {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }

"""
assert css in s, 'css block not found'
s = s.replace(css, '')
for zh in ['救命!', '叫警察!', '我需要救护车', '着火了', '我迷路了', '我需要帮助', '医院在哪里?']:
    line = '              <div class="phrase-chinese">%s</div>\n' % zh
    assert line in s, 'phrase not found: ' + zh
    s = s.replace(line, '')
io.open(p, 'w', encoding='utf-8', newline='').write(s)
n = sum(1 for ch in s if '\u3400' <= ch <= '\u9fff')
print('done, CJK remaining:', n)
