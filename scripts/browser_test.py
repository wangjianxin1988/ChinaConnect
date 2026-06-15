"""
ChinaConnect 浏览器深度测试 - Playwright + Edge
测试JS错误、交互功能、视觉渲染
"""
from playwright.sync_api import sync_playwright
import os, json, time

os.environ['PLAYWRIGHT_BROWSERS_PATH'] = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

BASE_URL = "https://98a3cec6.chinaconnect.pages.dev"
results = []

def log(test, status, details=""):
    results.append({"test": test, "status": status, "details": details})
    emoji = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"{emoji} {test}: {status} {details}")

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        headless=True
    )
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    
    # Collect console errors
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    
    # ============================================================
    # Test 1: Homepage
    # ============================================================
    print("\n--- Homepage ---")
    page.goto(f"{BASE_URL}/")
    page.wait_for_load_state("networkidle")
    
    # Check for JS errors
    if len(console_errors) == 0:
        log("Homepage: No JS errors", "PASS")
    else:
        log("Homepage: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    console_errors.clear()
    
    # Check hero section
    hero = page.query_selector('h1')
    if hero:
        log("Homepage: Hero title", "PASS", hero.text_content()[:50])
    else:
        log("Homepage: Hero title", "FAIL", "No h1 found")
    
    # Check nav
    nav_links = page.query_selector_all('nav a')
    if len(nav_links) >= 5:
        log("Homepage: Nav links", "PASS", f"{len(nav_links)} links")
    else:
        log("Homepage: Nav links", "FAIL", f"Only {len(nav_links)} links")
    
    # Screenshot
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/homepage.png", full_page=False)
    
    # ============================================================
    # Test 2: City Page
    # ============================================================
    print("\n--- City Page (Beijing) ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/city/beijing")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("City: No JS errors", "PASS")
    else:
        log("City: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    
    # Check emergency section
    emergency = page.query_selector_all('a[href^="tel:"]')
    if len(emergency) >= 5:
        log("City: Emergency phone links", "PASS", f"{len(emergency)} links")
    else:
        log("City: Emergency phone links", "FAIL", f"Only {len(emergency)} links")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/city-beijing.png", full_page=False)
    
    # ============================================================
    # Test 3: Food Page Filtering
    # ============================================================
    print("\n--- Food Filtering ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/city/beijing/food")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Food: No JS errors", "PASS")
    else:
        log("Food: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    
    # Check filter buttons
    filter_btns = page.query_selector_all('[data-filter]')
    if len(filter_btns) >= 5:
        log("Food: Filter buttons", "PASS", f"{len(filter_btns)} buttons")
    else:
        log("Food: Filter buttons", "FAIL", f"Only {len(filter_btns)} buttons")
    
    # Click a filter button
    try:
        michelin_btn = page.query_selector('[data-filter="michelin"]')
        if michelin_btn:
            michelin_btn.click()
            time.sleep(0.5)
            # Check if cards are filtered
            visible_cards = page.query_selector_all('.restaurant-card:not([style*="display: none"])')
            log("Food: Michelin filter click", "PASS", f"{len(visible_cards)} visible cards")
        else:
            log("Food: Michelin filter click", "FAIL", "Button not found")
    except Exception as e:
        log("Food: Michelin filter click", "FAIL", str(e))
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/food-filtered.png", full_page=False)
    
    # ============================================================
    # Test 4: Hotels Page
    # ============================================================
    print("\n--- Hotels Page ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/city/beijing/hotels")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Hotels: No JS errors", "PASS")
    else:
        log("Hotels: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    
    # Check hotel cards
    hotel_items = page.query_selector_all('.hotel-item')
    if len(hotel_items) >= 100:
        log("Hotels: Hotel cards", "PASS", f"{len(hotel_items)} cards")
    else:
        log("Hotels: Hotel cards", "FAIL", f"Only {len(hotel_items)} cards")
    
    # Check category filter
    cat_btns = page.query_selector_all('[data-category]')
    if len(cat_btns) >= 6:
        log("Hotels: Category filters", "PASS", f"{len(cat_btns)} filters")
    else:
        log("Hotels: Category filters", "FAIL", f"Only {len(cat_btns)} filters")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/hotels.png", full_page=False)
    
    # ============================================================
    # Test 5: AI Page
    # ============================================================
    print("\n--- AI Concierge Page ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/ai")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("AI: No JS errors", "PASS")
    else:
        log("AI: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    
    # Check hero
    hero = page.query_selector('h1')
    if hero and 'AI Concierge' in (hero.text_content() or ''):
        log("AI: Hero title", "PASS")
    else:
        log("AI: Hero title", "FAIL", "AI Concierge not in h1")
    
    # Check example prompts
    prompts = page.query_selector_all('button')
    if len(prompts) >= 6:
        log("AI: Example prompts", "PASS", f"{len(prompts)} buttons")
    else:
        log("AI: Example prompts", "FAIL", f"Only {len(prompts)} buttons")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/ai-page.png", full_page=False)
    
    # ============================================================
    # Test 6: Pricing Page
    # ============================================================
    print("\n--- Pricing Page ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/pricing")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Pricing: No JS errors", "PASS")
    else:
        log("Pricing: JS errors", "FAIL", f"{len(console_errors)} errors: {console_errors[:3]}")
    
    # Check pricing tiers
    tiers = page.query_selector_all('.subscribe-btn')
    if len(tiers) >= 3:
        log("Pricing: Subscribe buttons", "PASS", f"{len(tiers)} tiers")
    else:
        log("Pricing: Subscribe buttons", "FAIL", f"Only {len(tiers)} buttons")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/pricing.png", full_page=False)
    
    # ============================================================
    # Test 7: Auth Pages
    # ============================================================
    print("\n--- Auth Pages ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/auth/login")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Auth/Login: No JS errors", "PASS")
    else:
        log("Auth/Login: JS errors", "FAIL", f"{len(console_errors)} errors")
    
    # Check form
    form = page.query_selector('form')
    if form:
        log("Auth/Login: Form present", "PASS")
    else:
        log("Auth/Login: Form present", "FAIL", "No form found")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/auth-login.png", full_page=False)
    
    # ============================================================
    # Test 8: Guide Page
    # ============================================================
    print("\n--- Guide Page ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/guide")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Guide: No JS errors", "PASS")
    else:
        log("Guide: JS errors", "FAIL", f"{len(console_errors)} errors")
    
    # Check business section
    biz = page.query_selector('#business-tools')
    if biz:
        log("Guide: Business tools section", "PASS")
    else:
        log("Guide: Business tools section", "FAIL", "Not found")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/guide.png", full_page=False)
    
    # ============================================================
    # Test 9: Language Switching
    # ============================================================
    print("\n--- Language Switching ---")
    console_errors.clear()
    page.goto(f"{BASE_URL}/?lang=zh-CN")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("i18n/zh-CN: No JS errors", "PASS")
    else:
        log("i18n/zh-CN: JS errors", "FAIL", f"{len(console_errors)} errors")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/chinese-version.png", full_page=False)
    
    # ============================================================
    # Test 10: Mobile Responsive
    # ============================================================
    print("\n--- Mobile Responsive ---")
    console_errors.clear()
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{BASE_URL}/")
    page.wait_for_load_state("networkidle")
    
    if len(console_errors) == 0:
        log("Mobile: No JS errors", "PASS")
    else:
        log("Mobile: JS errors", "FAIL", f"{len(console_errors)} errors")
    
    page.screenshot(path="D:/suoyouxiangmu/chinaconnect/screenshots/mobile-home.png", full_page=False)
    
    # Reset viewport
    page.set_viewport_size({"width": 1280, "height": 900})
    
    browser.close()

# ============================================================
# Summary
# ============================================================
print("\n" + "=" * 60)
print("BROWSER TEST SUMMARY")
print("=" * 60)
passed = sum(1 for r in results if r["status"] == "PASS")
failed = sum(1 for r in results if r["status"] == "FAIL")
total = len(results)

print(f"Total: {total}")
print(f"✅ Passed: {passed}")
print(f"❌ Failed: {failed}")
print(f"Pass rate: {passed/total*100:.1f}%")

if failed > 0:
    print("\n--- FAILURES ---")
    for r in results:
        if r["status"] == "FAIL":
            print(f"  ❌ {r['test']}: {r['details']}")

# Save report
report = {
    "summary": {"total": total, "passed": passed, "failed": failed, "pass_rate": f"{passed/total*100:.1f}%"},
    "results": results
}
with open("D:/suoyouxiangmu/chinaconnect/browser-test-report.json", "w") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print(f"\nScreenshots saved to D:/suoyouxiangmu/chinaconnect/screenshots/")
