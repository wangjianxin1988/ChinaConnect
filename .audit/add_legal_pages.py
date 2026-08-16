# -*- coding: utf-8 -*-
import io, re, os, json, time, urllib.request, sys

SRC = 'src/i18n/translations.ts'
KEY = os.environ['DEEPSEEK_API_KEY']
HOST = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1').rstrip('/').replace('/v1', '')
MODEL = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
TARGETS = {
    'ja': 'Japanese', 'ko': 'Korean', 'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese (Taiwan)',
    'th': 'Thai', 'vi': 'Vietnamese', 'ru': 'Russian', 'fr': 'French', 'de': 'German',
    'ar': 'Modern Standard Arabic', 'fa': 'Modern Persian (Farsi)',
}
SCRIPT_PRESENCE = {
    'ko': re.compile(r'[\uac00-\ud7af]'), 'th': re.compile(r'[\u0e00-\u0e7f]'), 'ru': re.compile(r'[\u0400-\u04ff]'),
    'ar': re.compile(r'[\u0600-\u06ff]'), 'fa': re.compile(r'[\u0600-\u06ff]'),
    'zh-CN': re.compile(r'[\u3400-\u9fff]'), 'zh-TW': re.compile(r'[\u3400-\u9fff]'),
    'ja': re.compile(r'[\u3040-\u30ff\u3400-\u9fff]'),
}

EN = {
  "privacyPage": {
    "pageTitle": "Privacy Policy - ChinaConnect",
    "pageDescription": "How ChinaConnect collects, uses, and protects your data.",
    "lastUpdated": "Last updated: August 2026",
    "intro": "This Privacy Policy explains how ChinaConnect (\"we\", \"us\") collects, uses, and protects your personal information when you use our website and services.",
    "collectTitle": "1. Information We Collect",
    "collect1": "Information you provide: account details, saved favorites, and chat messages with the AI assistant.",
    "collect2": "Usage data: pages visited, language preference, and device type to improve our services.",
    "collect3": "Location data: only when you use location features like GPS sharing or nearby search.",
    "useTitle": "2. How We Use Your Information",
    "use1": "To provide and improve our travel guides, AI assistant, and city information.",
    "use2": "To personalize content and language preferences.",
    "use3": "To respond to your requests and support inquiries.",
    "shareTitle": "3. Sharing of Information",
    "share1": "We do not sell your personal data.",
    "share2": "We may share anonymized data with analytics providers to understand site usage.",
    "share3": "Location searches use OpenStreetMap's Nominatim service; only the coordinates you request are sent.",
    "cookiesTitle": "4. Cookies and Local Storage",
    "cookies1": "We use local storage to remember your language preference and recently viewed cities.",
    "cookies2": "Essential cookies help the website function. No advertising cookies are used.",
    "rightsTitle": "5. Your Rights",
    "rights1": "You can request access to, correction of, or deletion of your personal data by contacting us.",
    "rights2": "You can clear your browsing data at any time through your browser settings.",
    "contactTitle": "6. Contact Us",
    "contact1": "For privacy questions, email us at support@chinaengage.org.",
  },
  "termsPage": {
    "pageTitle": "Terms of Service - ChinaConnect",
    "pageDescription": "The terms governing your use of ChinaConnect.",
    "lastUpdated": "Last updated: August 2026",
    "intro": "By accessing or using ChinaConnect, you agree to be bound by these Terms of Service.",
    "useTitle": "1. Use of Services",
    "use1": "ChinaConnect provides travel guides, AI assistance, and city information for planning purposes.",
    "use2": "You agree to use the service lawfully and not to disrupt or abuse it.",
    "use3": "The AI assistant provides suggestions only; always verify critical travel information independently.",
    "contentTitle": "2. Content and Accuracy",
    "content1": "We strive for accuracy but travel information (prices, hours, contact details) may change. Verify before relying on it.",
    "content2": "Restaurant, attraction, and hotel information is curated from public sources and may contain errors.",
    "ipTitle": "3. Intellectual Property",
    "ip1": "All content, trademarks, and logos on this site are owned by ChinaConnect or its licensors.",
    "ip2": "You may not copy, reproduce, or redistribute site content without permission.",
    "linksTitle": "4. Third-Party Links and Services",
    "links1": "Our site links to third-party services (booking sites, payment apps, maps). We are not responsible for their content.",
    "links2": "Payments and bookings made through external services are governed by those providers' terms.",
    "liabilityTitle": "5. Limitation of Liability",
    "liability1": "ChinaConnect is provided \"as is\" without warranties of any kind.",
    "liability2": "We are not liable for any damages arising from your use of the site or reliance on its content.",
    "changesTitle": "6. Changes to These Terms",
    "changes1": "We may update these terms from time to time. Continued use of the site constitutes acceptance of the updated terms.",
    "contactTitle": "7. Contact",
    "contact1": "Questions about these terms? Email support@chinaengage.org.",
  },
  "contactPage": {
    "pageTitle": "Contact Us - ChinaConnect",
    "pageDescription": "Get in touch with the ChinaConnect team.",
    "intro": "We'd love to hear from you. Reach out for support, feedback, or partnership inquiries.",
    "emailTitle": "Email",
    "responseTitle": "Response Time",
    "response1": "We typically respond within 1-2 business days.",
    "feedbackTitle": "Feedback",
    "feedback1": "Found a translation issue or outdated information? Let us know which page and language.",
    "partnershipTitle": "Partnerships",
    "partnership1": "For business or partnership opportunities, email partnerships@chinaengage.org.",
  },
}

def esc(v):
    return v.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')

def flatten():
    out = []
    for sec, kv in EN.items():
        for k, v in kv.items():
            out.append((sec, k, v))
    return out

def render_section(sec, kv, indent='      '):
    lines = ['    %s: {' % sec]
    for k, v in kv.items():
        lines.append('%s%s: "%s",' % (indent, k, esc(v)))
    lines.append('    },')
    return '\n'.join(lines)

def render_all(kv_by_sec):
    parts = []
    for sec in ['privacyPage', 'termsPage', 'contactPage']:
        parts.append(render_section(sec, kv_by_sec[sec]))
    return '\n'.join(parts)

def build_prompt(values, lang):
    body = '{\n' + ',\n'.join('  "k%d": "%s"' % (i, esc(v)) for i, (_, _, v) in enumerate(values)) + '\n}'
    return ('You are a professional translator for ChinaConnect (chinaengage.org), a Chinese travel website.\n'
            'Translate these English privacy policy, terms of service, and contact page strings into %s.\n'
            'Input JSON:\n%s\n'
            'RULES:\n- Respond ONLY with a JSON object of the same shape (keys k0..k%d).\n'
            '- No markdown, no commentary.\n'
            '- Keep brand names (ChinaConnect, OpenStreetMap, Nominatim), email addresses, and numbers unchanged.\n'
            '- Keep the numbered section prefixes (e.g. "1.") in titles.\n'
            '- Output must be fluent, natural %s.' % (TARGETS[lang], body, len(values) - 1, TARGETS[lang]))

def call_chat(prompt):
    body = json.dumps({'model': MODEL, 'messages': [{'role': 'user', 'content': prompt}], 'temperature': 0.2, 'max_tokens': 8000}).encode()
    req = urllib.request.Request(HOST + '/v1/chat/completions', data=body, headers={
        'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        payload = json.loads(r.read().decode())
    return payload['choices'][0]['message']['content']

def extract_json(content):
    s = str(content or '').strip()
    s = re.sub(r'^```[a-zA-Z]*\n?', '', s)
    s = re.sub(r'\n?```\s*$', '', s)
    try: return json.loads(s)
    except Exception: pass
    m = re.search(r'\{.*\}', s, re.S)
    if m:
        try: return json.loads(m.group(0))
        except Exception: pass
    out = {}
    for k, v in re.findall(r'"k(\d+)"\s*:\s*"((?:[^"\\]|\\.)*)"', s):
        out['k' + k] = v.replace('\\"', '"').replace('\\\\', '\\').replace('\\n', '\n')
    return out

def translate_all(values, lang):
    for attempt in range(1, 6):
        try:
            content = call_chat(build_prompt(values, lang))
            parsed = extract_json(content)
            if len(parsed) < len(values) * 0.9:
                print('  partial response %d/%d, retry' % (len(parsed), len(values)))
                time.sleep(3)
                continue
            sp = SCRIPT_PRESENCE.get(lang)
            if sp:
                bad = [i for i, (_, _, v) in enumerate(values)
                       if not (isinstance(parsed.get('k%d' % i), str) and parsed['k%d' % i].strip() and sp.search(parsed['k%d' % i]))]
                if bad:
                    print('  script-check failures for keys %s, retry' % bad[:6])
                    time.sleep(3)
                    continue
            return {i: parsed.get('k%d' % i) for i in range(len(values))}
        except Exception as e:
            print('  API error: %s' % str(e)[:120])
            time.sleep(5)
    raise RuntimeError('failed to translate %s' % lang)

def main():
    values = flatten()
    with open(SRC, 'rb') as f:
        raw = f.read()
    text = raw.decode('utf-8-sig')
    # find lang blocks
    block_re = re.compile(r'^  "?([a-z]{2}(?:-[A-Z]{2})?)"?:\s*\{', re.M)
    blocks = [(m.group(1), m.start()) for m in block_re.finditer(text)]
    order = [b[0] for b in blocks]
    print('langs:', ','.join(order))
    # Insert at end of each block: before the next block start
    out = text
    # process from last to first so offsets stay valid
    for idx in range(len(blocks) - 1, -1, -1):
        lang, start = blocks[idx]
        end = blocks[idx + 1][1] if idx + 1 < len(blocks) else len(text)
        block_text = text[start:end]
        if lang == 'en':
            kv = {sec: dict(kv) for sec, kv in EN.items()}
        else:
            print('translating %s ...' % lang, flush=True)
            res = translate_all(values, lang)
            kv = {}
            for sec in ['privacyPage', 'termsPage', 'contactPage']:
                kv[sec] = {}
            for i, (sec, k, _) in enumerate(values):
                kv[sec][k] = res[i] if res[i] is not None else EN[sec][k]
        new_section = render_all(kv)
        # Insert before the block's closing "  },"
        # Find last "  }," in block_text (block terminator)
        m = list(re.finditer(r'\n  \},', block_text))
        if not m:
            print('WARN: no closing for %s' % lang)
            continue
        pos = m[-1].start()
        new_block = block_text[:pos] + '\n' + new_section + block_text[pos:]
        out = out[:start] + new_block + out[end:]
        print('  %s inserted (%d keys)' % (lang, len(values)))
    # write back preserving CRLF / BOM
    if '\r\n' in text:
        out = out.replace('\r\n', '\n').replace('\n', '\r\n')
    out_bytes = ('\ufeff' + out).encode('utf-8') if raw.startswith(b'\xef\xbb\xbf') else out.encode('utf-8')
    with open(SRC, 'wb') as f:
        f.write(out_bytes)
    print('done. CRLF count:', out.count('\r\n'))

if __name__ == '__main__':
    main()
