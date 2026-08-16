import re
import io

path = r"src/i18n/translations.ts"
with open(path, "rb") as f:
    raw = f.read()

text = raw.decode("utf-8-sig")
# Locate blocks
en_start = text.index("  en: {")
ja_start = text.index("  ja: {")
zh_cn_start = text.index('  "zh-CN": {')

# EN block only: from en_start to ja_start
en_region = text[en_start:ja_start]

fixes = {
    "aiPage": {"subtitle": "AI helps you plan your China trip"},
    "attractions": {
        "allCities": "All cities with attractions",
        "browseCategory": "Browse by Category",
        "featuredCities": "Featured cities",
        "subtitle": "Must-visit tourist spots across China \u2014 from ancient landmarks to natural wonders",
        "title": "China Attractions",
    },
    "auth": {
        "myAccount": "My Account",
        "profileCenter": "Profile Center",
        "signIn": "Sign In",
        "signOut": "Sign Out",
    },
    "authPage": {"errorTitle": "Verification failed"},
    "cityPage": {"recommendedPaymentApps": "Recommended payment apps"},
    "emergencyPage": {
        "contactsDesc": "Save your hotel, tour guide, or family contacts for quick access during emergencies.",
        "embassyDesc": "Find your embassy for passport replacement, emergency assistance, and legal help.",
        "gpsDesc": "Get your current location and share it with emergency services. The system also helps you find nearby hospitals, pharmacies, and police stations.",
        "sosButtonDesc": "The emergency SOS button is always available in the bottom-right corner of every page.",
    },
    "empty": {"tryDifferent": "Nothing here. Try different search criteria."},
    "errors": {
        "generic": "Something went wrong",
        "network": "Network error",
        "unauthorized": "Unauthorized",
    },
    "features": {"restaurantGuideDesc": "Michelin stars, Black Pearl rankings, and local favorites with detailed reviews"},
    "footer": {
        "accommodation": "Accommodation",
        "aiAssistant": "AI Assistant",
        "attractions": "Attractions",
        "cities": "Cities",
        "culturalTips": "Cultural Tips",
        "description": "Your trusted guide to exploring China. AI-powered restaurant recommendations, city guides, and travel tips.",
        "emergency": "Emergency Contacts",
        "guides": "Travel Guides",
        "payment": "Payment",
        "resources": "Resources",
        "restaurants": "Restaurants",
        "transport": "Transport",
        "viewAllCities": "View All Cities",
    },
    "guidePage": {
        "attractionsSubtitle": "Discover the most amazing attractions across 12 Chinese cities",
        "backHome": "\u2190 Back to Home",
        "indexBusinessSubtitle": "From invitation letters to business etiquette \u2014 five practical tools for foreign business travelers.",
        "indexHeroSubtitle": "Complete Travel Guide to China \u2014 from preparation to departure, covering every aspect of travel, including business, dining, and safety.",
        "viewAllBusinessToolsDesc": "See all business tools with detailed stats and quick-start guides.",
    },
    "home": {
        "citiesSubtitle": "From ancient capitals to modern metropolises, discover the best of China with our comprehensive city guides.",
        "exploreGuide": "Explore Guide",
        "heroDesc": "Discover restaurants (Michelin & Black Pearl), attractions, transport tips, and emergency info - all powered by AI and curated by locals.",
    },
    "language": {
        "code": "en",
        "dir": "ltr",
        "name": "English",
        "nativeName": "English",
    },
    "nav": {
        "attractions": "Attractions",
        "selectLanguage": "Select Language",
    },
    "notFound": {
        "descriptionText": "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
        "letsContinue": "Let's get you back on track.",
    },
    "pricing": {
        "autoRenewNote": "Auto-renew, cancel anytime",
        "billingMonthlyNote": "Billed monthly \u00b7 auto-renew each month",
        "compareSubtitle": "See exactly what is included in each plan. All plans include access to our AI-powered travel assistant.",
        "ctaSubtitle": "Join thousands of travelers using AI to plan their perfect China trip. Start free today.",
        "heroSubtitle": "One plan for every traveler - start free, upgrade when you need more AI power.",
        "savingsHint": "Save up to $72/year with annual billing",
    },
    "recents": {
        "clearAll": "Clear all",
        "empty": "No recent visits",
        "title": "Recent visits",
    },
    "register": {
        "emailLabel": "Email address",
        "passwordLabel": "Password",
        "title": "Register",
    },
    "tooltips": {
        "close": "Close",
        "more": "More",
        "open": "Open",
    },
}

def patch_region(region, fixes):
    count = 0
    for section, kv in fixes.items():
        for key, val in kv.items():
            # pattern: key: "section.key"  (value may be exactly section.key)
            pat = re.compile(r'(^\s*)(' + re.escape(key) + r')(\s*:\s*)"' + re.escape(section) + r'\.[A-Za-z0-9_]+"(\s*,?\s*)$', re.M)
            newval = val.replace("\\", "\\\\").replace('"', '\\"')
            region, n = pat.subn(lambda m: m.group(1) + m.group(2) + m.group(3) + '"' + newval + '"' + m.group(4), region)
            count += n
    return region, count

new_en, n1 = patch_region(en_region, fixes)
print(f"EN block replaced: {n1}")

# ja language.* fix
ja_region = text[ja_start:zh_cn_start]
ja_fixes = {"language": {"code": "ja", "dir": "ltr", "name": "Japanese", "nativeName": "\u65e5\u672c\u8a9e"}}
new_ja, n2 = patch_region(ja_region, ja_fixes)
print(f"ja block replaced: {n2}")

# ko language.* fix (need ko block start; zh-CN is after ko)
ko_start = text.index("  ko: {")
ko_end = text.index("  th: {")
ko_region = text[ko_start:ko_end]
ko_fixes = {"language": {"code": "ko", "dir": "ltr"}}
new_ko, n3 = patch_region(ko_region, ko_fixes)
print(f"ko block replaced: {n3}")

out = text[:en_start] + new_en + text[ja_start:zh_cn_start].replace(ja_region, new_ja, 1) if False else None

# Rebuild
result = text[:en_start] + new_en
# ja region is inside text[en_start:zh_cn_start]? No: text[ja_start:zh_cn_start] is ja block. Replace inside.
tail = text[zh_cn_start:]
# fix ja block within original text
middle = text[en_start:zh_cn_start]
middle = middle.replace(ja_region, new_ja, 1)
# fix ko block
ko_full_start = text.index("  ko: {")
ko_full_end = text.index("  th: {")
middle = middle[:ko_full_start - en_start] + new_ko + middle[ko_full_end - en_start:]
result = text[:en_start] + middle + tail

# Write back preserving CRLF
out_bytes = result.encode("utf-8-sig") if raw.startswith(b"\xef\xbb\xbf") else result.encode("utf-8")
with open(path, "wb") as f:
    f.write(out_bytes)
print("written. CRLF count:", result.count("\r\n"), "| LF-only:", result.count("\n") - result.count("\r\n"))
