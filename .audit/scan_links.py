import io, re
data = io.open('src/layouts/BaseLayout.astro', encoding='utf-8').read()
links = set()
for m in re.finditer(r'href=\{?`\$\{lp\}([^`]*)`\}?', data):
    links.add(m.group(1))
for l in sorted(links):
    print(l)
