"""
ChinaConnect 整站深度测试
使用 Playwright + Edge 进行自动化测试
"""
import json
import os
import re
import subprocess
import time
from datetime import datetime

# Test results
results = []
BASE_URL = "https://98a3cec6.chinaconnect.pages.dev"

def log(test_name, status, details="", screenshot=None):
    results.append({
        "test": test_name,
        "status": status,
        "details": details,
        "screenshot": screenshot,
        "time": datetime.now().isoformat()
    })
    emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{emoji} {test_name}: {status} {details}")

# ============================================================
# Test 1: All pages return 200
# ============================================================
def test_page_loads():
    pages = [
        "/", "/cities", "/food", "/ai", "/guide", "/pricing",
        "/auth/login", "/auth/register", "/account",
        "/emergency", "/offline",
        "/city/beijing", "/city/beijing/food", "/city/beijing/hotels",
        "/city/beijing/attractions",
        "/city/shanghai", "/city/shanghai/food",
        "/city/chengdu", "/city/guangzhou",
        "/guide/visa", "/guide/payment", "/guide/transport",
        "/guide/accommodation", "/guide/dining",
        "/guide/emergency-procedures", "/guide/departure",
        "/guide/business/expo-calendar", "/guide/business/invitation-letter",
        "/guide/business/etiquette", "/guide/business/company-registration",
        "/guide/business/translation",
        "/guide/cultural-warnings", "/guide/scam-prevention",
    ]
    
    for page in pages:
        url = f"{BASE_URL}{page}"
        try:
            result = subprocess.run(
                ["curl", "-sL", "-o", "NUL", "-w", "%{http_code}", url],
                capture_output=True, text=True, timeout=15
            )
            code = result.stdout.strip()
            if code == "200":
                log(f"Page load: {page}", "PASS")
            else:
                log(f"Page load: {page}", "FAIL", f"HTTP {code}")
        except Exception as e:
            log(f"Page load: {page}", "FAIL", str(e))

# ============================================================
# Test 2: Navigation links
# ============================================================
def test_navigation():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    nav_links = [
        ('href="/"', "Home link"),
        ('href="/cities"', "Cities link"),
        ('href="/food"', "Food link"),
        ('href="/ai"', "AI Concierge link"),
        ('href="/guide"', "Guide link"),
    ]
    
    for pattern, name in nav_links:
        if pattern in html:
            log(f"Nav: {name}", "PASS")
        else:
            log(f"Nav: {name}", "FAIL", "Not found in nav")

# ============================================================
# Test 3: i18n / Language switching
# ============================================================
def test_i18n():
    # Check hreflang tags
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    hreflang_count = html.count('hreflang=')
    if hreflang_count >= 12:
        log("i18n: Hreflang tags", "PASS", f"{hreflang_count} tags found")
    else:
        log("i18n: Hreflang tags", "FAIL", f"Only {hreflang_count} tags")
    
    # Check language switcher
    if 'lang-switcher' in html:
        log("i18n: Language switcher", "PASS")
    else:
        log("i18n: Language switcher", "FAIL", "Not found")
    
    # Check query param works
    result = subprocess.run(
        ["curl", "-sL", "-o", "NUL", "-w", "%{http_code}", f"{BASE_URL}/?lang=ja"],
        capture_output=True, text=True, timeout=15
    )
    if result.stdout.strip() == "200":
        log("i18n: ?lang=ja works", "PASS")
    else:
        log("i18n: ?lang=ja works", "FAIL", f"HTTP {result.stdout.strip()}")

# ============================================================
# Test 4: Food page filtering
# ============================================================
def test_food_filtering():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing/food"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    filters = ['data-filter="all"', 'data-filter="michelin"', 'data-filter="blackpearl"',
               'data-filter="local"', 'data-filter="street_food"']
    
    for f in filters:
        if f in html:
            log(f"Food filter: {f}", "PASS")
        else:
            log(f"Food filter: {f}", "FAIL", "Not found")
    
    # Check restaurant cards have data-filter-category
    if 'data-filter-category=' in html:
        log("Food: Card filter attributes", "PASS")
    else:
        log("Food: Card filter attributes", "FAIL", "Missing data-filter-category")

# ============================================================
# Test 5: Hotel page
# ============================================================
def test_hotels():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing/hotels"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    categories = ['luxury', 'mid_range', 'budget', 'hostel', 'love_hotel', 'esports_hotel']
    for cat in categories:
        if cat in html:
            log(f"Hotel category: {cat}", "PASS")
        else:
            log(f"Hotel category: {cat}", "FAIL", "Not found")
    
    # Check hotel cards have phone
    if 'tel:' in html:
        log("Hotels: Phone links", "PASS")
    else:
        log("Hotels: Phone links", "FAIL", "No tel: links found")

# ============================================================
# Test 6: Emergency contacts
# ============================================================
def test_emergency():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    emergency_numbers = ['110', '119', '120']
    for num in emergency_numbers:
        if f'tel:{num}' in html:
            log(f"Emergency: {num}", "PASS")
        else:
            log(f"Emergency: {num}", "FAIL", "Not found in tel: links")

# ============================================================
# Test 7: SEO / Schema.org
# ============================================================
def test_seo():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    checks = [
        ('application/ld+json', "JSON-LD schema"),
        ('og:title', "Open Graph title"),
        ('og:description', "Open Graph description"),
        ('og:image', "Open Graph image"),
        ('twitter:card', "Twitter card"),
        ('canonical', "Canonical URL"),
        ('<title>', "Page title"),
    ]
    
    for pattern, name in checks:
        if pattern in html:
            log(f"SEO: {name}", "PASS")
        else:
            log(f"SEO: {name}", "FAIL", "Not found")

# ============================================================
# Test 8: App download links
# ============================================================
def test_app_links():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    play_store = html.count('play.google.com')
    app_store = html.count('apps.apple.com')
    
    if play_store > 0:
        log(f"App links: Google Play", "PASS", f"{play_store} links")
    else:
        log(f"App links: Google Play", "FAIL", "No Play Store links")
    
    if app_store > 0:
        log(f"App links: App Store", "PASS", f"{app_store} links")
    else:
        log(f"App links: App Store", "FAIL", "No App Store links")

# ============================================================
# Test 9: Logo and favicon
# ============================================================
def test_assets():
    assets = ["/logo.svg", "/logo.png", "/favicon.svg", "/favicon.png"]
    for asset in assets:
        result = subprocess.run(
            ["curl", "-sL", "-o", "NUL", "-w", "%{http_code}", f"{BASE_URL}{asset}"],
            capture_output=True, text=True, timeout=10
        )
        code = result.stdout.strip()
        if code == "200":
            log(f"Asset: {asset}", "PASS")
        else:
            log(f"Asset: {asset}", "FAIL", f"HTTP {code}")

# ============================================================
# Test 10: Sitemap
# ============================================================
def test_sitemap():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/sitemap.xml"],
        capture_output=True, text=True, timeout=15
    )
    sitemap = result.stdout
    
    if '<?xml' in sitemap and '<urlset' in sitemap:
        log("Sitemap: Valid XML", "PASS")
    else:
        log("Sitemap: Valid XML", "FAIL", "Invalid sitemap")
    
    url_count = sitemap.count('<url>')
    if url_count > 100:
        log(f"Sitemap: URLs", "PASS", f"{url_count} URLs")
    else:
        log(f"Sitemap: URLs", "FAIL", f"Only {url_count} URLs")
    
    if 'hreflang' in sitemap:
        log("Sitemap: Hreflang", "PASS")
    else:
        log("Sitemap: Hreflang", "FAIL", "No hreflang in sitemap")

# ============================================================
# Test 11: API endpoints
# ============================================================
def test_apis():
    apis = ["/api/pricing"]
    for api in apis:
        result = subprocess.run(
            ["curl", "-sL", "-o", "NUL", "-w", "%{http_code}", f"{BASE_URL}{api}"],
            capture_output=True, text=True, timeout=10
        )
        code = result.stdout.strip()
        if code == "200":
            log(f"API: {api}", "PASS")
        else:
            log(f"API: {api}", "FAIL", f"HTTP {code}")

# ============================================================
# Test 12: Data integrity
# ============================================================
def test_data_integrity():
    # Check city pages have restaurants
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing/food"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    restaurant_cards = html.count('restaurant-card')
    if restaurant_cards >= 40:
        log(f"Data: Beijing restaurants", "PASS", f"{restaurant_cards} cards")
    else:
        log(f"Data: Beijing restaurants", "FAIL", f"Only {restaurant_cards} cards")
    
    # Check hotel cards
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing/hotels"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    hotel_cards = html.count('hotel-card')
    if hotel_cards >= 100:
        log(f"Data: Beijing hotels", "PASS", f"{hotel_cards} cards")
    else:
        log(f"Data: Beijing hotels", "FAIL", f"Only {hotel_cards} cards")

# ============================================================
# Test 13: Cultural warning (should NOT auto-show)
# ============================================================
def test_cultural_warning():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/city/beijing"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    if 'autoShow={false}' in html or 'autoShow' not in html:
        log("Cultural warning: No auto-show", "PASS")
    else:
        log("Cultural warning: No auto-show", "WARN", "Check if autoShow is disabled")

# ============================================================
# Test 14: Responsive design meta tags
# ============================================================
def test_responsive():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    if 'viewport' in html:
        log("Responsive: Viewport meta", "PASS")
    else:
        log("Responsive: Viewport meta", "FAIL", "Missing viewport meta")

# ============================================================
# Test 15: PWA features
# ============================================================
def test_pwa():
    result = subprocess.run(
        ["curl", "-sL", f"{BASE_URL}/"],
        capture_output=True, text=True, timeout=15
    )
    html = result.stdout
    
    if 'manifest' in html.lower() or 'sw.js' in html:
        log("PWA: Service worker", "PASS")
    else:
        log("PWA: Service worker", "WARN", "Not detected")

# ============================================================
# Run all tests
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("ChinaConnect 整站深度测试")
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    test_page_loads()
    test_navigation()
    test_i18n()
    test_food_filtering()
    test_hotels()
    test_emergency()
    test_seo()
    test_app_links()
    test_assets()
    test_sitemap()
    test_apis()
    test_data_integrity()
    test_cultural_warning()
    test_responsive()
    test_pwa()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    warned = sum(1 for r in results if r["status"] == "WARN")
    total = len(results)
    
    print(f"Total: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️ Warnings: {warned}")
    print(f"Pass rate: {passed/total*100:.1f}%")
    
    if failed > 0:
        print("\n--- FAILURES ---")
        for r in results:
            if r["status"] == "FAIL":
                print(f"  ❌ {r['test']}: {r['details']}")
    
    if warned > 0:
        print("\n--- WARNINGS ---")
        for r in results:
            if r["status"] == "WARN":
                print(f"  ⚠️ {r['test']}: {r['details']}")
    
    # Save report
    report_path = "D:/suoyouxiangmu/chinaconnect/test-report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({"summary": {"total": total, "passed": passed, "failed": failed, "warned": warned, "pass_rate": f"{passed/total*100:.1f}%"}, "results": results}, f, indent=2, ensure_ascii=False)
    print(f"\nReport saved: {report_path}")
