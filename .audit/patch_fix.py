import io, re
p = '.audit/fix_tr_values.py'
s = io.open(p, encoding='utf-8').read()
s = s.replace("HOST = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1').rstrip('/')",
              "HOST = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1').rstrip('/').replace('/v1', '')")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched')
