import io
p = r'scripts/fix-city-data-residual.mjs'
c = io.open(p, encoding='utf-8').read()
bad = '''      actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });
      if (deepOnly && !/\\[\\d+\\]\\[\\d+\\]/.test(p)) continue;'''
good = '''      if (deepOnly && !/\\[\\d+\\]\\[\\d+\\]/.test(p)) continue;
      actionable.push({ file: fn, path: p, value: v, enValue: enV, jaValue: jaV });'''
assert bad in c, 'bad block not found'
c = c.replace(bad, good)
io.open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('fixed order')
