# -*- coding: utf-8 -*-
# Parser v4: clean stack semantics
import io, re, pickle

SRC = 'src/i18n/translations.ts'
s = io.open(SRC, encoding='utf-8').read()
bom = s[0] == '\ufeff'
text = s[1:] if bom else s

m = re.search(r'export const translations\s*(?::[^=]+)?=\s*\{', text)
obj_start = m.end() - 1
keys = []
for mm in re.finditer(r'^  ("?[A-Za-z0-9-]+"?):\s*\{', text[obj_start:], re.M):
    keys.append((mm.group(1).strip('"'), obj_start + mm.start()))
rest = text[keys[-1][1]:]
mc = re.search(r'\n\};', rest)
END = keys[-1][1] + mc.start()

def read_string(sec, i):
    j = i + 1
    while j < len(sec):
        c = sec[j]
        if c == '\\': j += 2; continue
        if c == '"': return sec[i+1:j].replace('\\"','"').replace('\\\\','\\').replace('\\n','\n'), j+1
        j += 1
    return '', len(sec)

def skip_ws(sec, i, incl_nl=True):
    n = len(sec)
    while i < n and (sec[i] in ' \t' or (incl_nl and sec[i] in '\n\r')):
        i += 1
    return i

def parse_section(sec):
    out = {}
    stack = []
    i = 0
    n = len(sec)
    while i < n:
        c = sec[i]
        if c == '{':
            stack.append(None)
            i += 1
        elif c == '}':
            if stack: stack.pop()
            i += 1
        elif c == '"':
            # could be a quoted key followed by ':' or a string value
            j = i + 1
            while j < n and sec[j] != '"':
                if sec[j] == '\\': j += 1
                j += 1
            strval = sec[i+1:j]
            k = skip_ws(sec, j+1)
            if k < n and sec[k] == ':':
                k2 = skip_ws(sec, k+1)
                if k2 < n and sec[k2] == '{':
                    stack.append(strval)
                    i = k2 + 1
                elif k2 < n and sec[k2] == '"':
                    val, j2 = read_string(sec, k2)
                    path = '.'.join([x for x in stack if x] + [strval])
                    out[path] = (val, k2, j2)
                    i = j2
                else:
                    i = k2
            else:
                i = j + 1
        elif c.isalnum() or c == '_':
            j = i
            while j < n and (sec[j].isalnum() or sec[j] == '_'):
                j += 1
            key = sec[i:j]
            k = skip_ws(sec, j)
            if k < n and sec[k] == ':':
                k2 = skip_ws(sec, k+1)
                if k2 < n and sec[k2] == '{':
                    stack.append(key)
                    i = k2 + 1
                elif k2 < n and sec[k2] == '"':
                    val, j2 = read_string(sec, k2)
                    path = '.'.join([x for x in stack if x] + [key])
                    out[path] = (val, k2, j2)
                    i = j2
                else:
                    i = k2
            else:
                i = j
        else:
            i += 1
    return out

all_data = {}
for i, (lang, st) in enumerate(keys):
    endp = keys[i+1][1] if i+1 < len(keys) else END
    all_data[lang] = parse_section(text[st:endp])
    print(lang, len(all_data[lang]))
with open('.audit/translations_parsed.pkl', 'wb') as f:
    pickle.dump({'bom': bom, 'langs': keys, 'end': END, 'data': all_data}, f)
print('saved')
