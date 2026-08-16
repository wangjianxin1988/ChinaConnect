import io
p='scripts/build-guide-strings.mjs'
s=io.open(p,encoding='utf-8').read()
old='''const CSS_CLASS_RE =
  /^(?:[a-z]+-[a-z0-9]+|hover:|focus:|dark:|md:|lg:|sm:|px-\\d|py-\\d)(?:\\s+(?:[a-z]+-[a-z0-9]+|hover:|focus:|dark:|md:|lg:|sm:))*$/;'''
new='''const CSS_CLASS_RE =
  /^(?:[a-z]+(?:-[a-z0-9]+)+|hover:|focus:|dark:|md:|lg:|sm:|px-\\d|py-\\d)(?:\\s+(?:[a-z]+(?:-[a-z0-9]+)+|hover:|focus:|dark:|md:|lg:|sm:))*$/;'''
assert old in s
s=s.replace(old,new)
io.open(p,'w',encoding='utf-8',newline='\n').write(s)
print('patched CSS_CLASS_RE')
