# -*- coding: utf-8 -*-
import io
p = '.audit/scan_full_pages.mjs'
s = io.open(p, encoding='utf-8').read()
old = """    if (focus === "priority" || focus === "all") {
      urls.push(`${BASE}${p}/`);
      urls.push(`${BASE}${p}/cities/`);
      for (const g of GUIDES) urls.push(`${BASE}${p}/guide${g ? "/" + g : ""}`);
      urls.push(`${BASE}${p}/emergency/`);
      for (const slug of CITY_SLUGS) for (const s of SECTIONS) urls.push(`${BASE}${p}/city/${slug}/${s}/`);
    }"""
new = """    if (focus === "priority" || focus === "all") {
      urls.push(`${BASE}${p}/`);
      urls.push(`${BASE}${p}/cities/`);
      for (const g of GUIDES) urls.push(`${BASE}${p}/guide${g ? "/" + g : ""}`);
      urls.push(`${BASE}${p}/emergency/`);
      for (const slug of CITY_SLUGS) for (const s of SECTIONS) urls.push(`${BASE}${p}/city/${slug}/${s}/`);
    }
    if (focus === "quick") {
      urls.push(`${BASE}${p}/`);
      urls.push(`${BASE}${p}/cities/`);
      for (const g of GUIDES) urls.push(`${BASE}${p}/guide${g ? "/" + g : ""}`);
      urls.push(`${BASE}${p}/emergency/`);
      for (const slug of CITY_SLUGS) urls.push(`${BASE}${p}/city/${slug}/`);
    }"""
assert old in s
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8', newline='').write(s)
print('patched quick mode')
