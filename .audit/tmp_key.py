# -*- coding: utf-8 -*-
import os
k = os.environ.get('DEEPSEEK_API_KEY')
print('DEEPSEEK_API_KEY set:', bool(k), 'len:', len(k) if k else 0)
print('DEEPSEEK_BASE_URL:', os.environ.get('DEEPSEEK_BASE_URL'))
print('DEEPSEEK_MODEL:', os.environ.get('DEEPSEEK_MODEL'))
print('TRANSLATE_PROVIDER:', os.environ.get('TRANSLATE_PROVIDER'))
