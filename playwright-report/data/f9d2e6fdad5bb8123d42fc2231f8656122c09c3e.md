# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: seo-infrastructure.spec.ts >> Internationalization (hreflang) >> homepage has hreflang tags
- Location: tests\e2e\seo-infrastructure.spec.ts:76:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e4]:
      - link "CC ChinaConnect Explore China with AI" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e6]: CC
        - generic [ref=e7]:
          - text: ChinaConnect
          - generic [ref=e8]: Explore China with AI
      - generic [ref=e9]:
        - link "Home" [ref=e10] [cursor=pointer]:
          - /url: /
        - link "Cities" [ref=e11] [cursor=pointer]:
          - /url: /cities
        - link "Restaurants" [ref=e12] [cursor=pointer]:
          - /url: /food
        - link "AI Chat" [ref=e13] [cursor=pointer]:
          - /url: /ai
          - generic [ref=e14]: AI Chat
        - link "Business Express" [ref=e15] [cursor=pointer]:
          - /url: /guide/business
        - link "Community" [ref=e16] [cursor=pointer]:
          - /url: /community
      - generic [ref=e17]:
        - button "EN" [ref=e19] [cursor=pointer]:
          - generic [ref=e20]: EN
          - img [ref=e21]
        - link "Explore Restaurants" [ref=e23] [cursor=pointer]:
          - /url: /food
          - generic [ref=e24]: Explore Restaurants
  - main [ref=e25]:
    - generic [ref=e27]:
      - button "Skip" [ref=e29] [cursor=pointer]
      - generic [ref=e30]:
        - img [ref=e32]
        - heading "Discover Great Food" [level=2] [ref=e34]
        - paragraph [ref=e35]: Find Michelin-starred and Black Pearl restaurants in 12 Chinese cities.
      - generic [ref=e36]:
        - generic [ref=e37]:
          - button [ref=e38] [cursor=pointer]
          - button [ref=e39] [cursor=pointer]
          - button [ref=e40] [cursor=pointer]
        - button "Next" [ref=e41] [cursor=pointer]:
          - text: Next
          - img [ref=e42]
    - generic [ref=e49]:
      - heading "Explore China with AI" [level=1] [ref=e50]
      - paragraph [ref=e51]: Your trusted guide to China's best cities
      - paragraph [ref=e52]: Discover restaurants (Michelin & Black Pearl), attractions, transport tips, and emergency info - all powered by AI and curated by locals.
      - generic [ref=e53]:
        - link "Ask AI for Trip Advice" [ref=e54] [cursor=pointer]:
          - /url: /ai
          - img [ref=e55]
          - generic [ref=e57]: Ask AI for Trip Advice
        - link "Explore Cities" [ref=e58] [cursor=pointer]:
          - /url: "#cities"
          - generic [ref=e59]: Explore Cities
          - img [ref=e60]
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]: "12"
          - generic [ref=e65]: Cities Covered
        - generic [ref=e66]:
          - generic [ref=e67]: 30+
          - generic [ref=e68]: Michelin Restaurants
        - generic [ref=e69]:
          - generic [ref=e70]: 100+
          - generic [ref=e71]: Top Attractions
        - generic [ref=e72]:
          - generic [ref=e73]: 24/7
          - generic [ref=e74]: AI Assistance
    - generic [ref=e76]:
      - generic [ref=e77]:
        - heading "Explore Our Cities" [level=2] [ref=e78]
        - paragraph [ref=e79]: From ancient capitals to modern metropolises, discover the best of China with our comprehensive city guides.
      - generic [ref=e80]:
        - link "B 北京 Beijing Ancient capital with the Forbidden City and Great Wall Explore Guide" [ref=e81] [cursor=pointer]:
          - /url: /city/beijing
          - generic [ref=e83]: B
          - generic [ref=e84]:
            - generic [ref=e85]: 北京
            - heading "Beijing" [level=3] [ref=e86]
            - paragraph [ref=e87]: Ancient capital with the Forbidden City and Great Wall
            - generic [ref=e88]:
              - generic [ref=e89]: Explore Guide
              - img [ref=e90]
        - link "S 上海 Shanghai Modern metropolis where East meets West Explore Guide" [ref=e92] [cursor=pointer]:
          - /url: /city/shanghai
          - generic [ref=e94]: S
          - generic [ref=e95]:
            - generic [ref=e96]: 上海
            - heading "Shanghai" [level=3] [ref=e97]
            - paragraph [ref=e98]: Modern metropolis where East meets West
            - generic [ref=e99]:
              - generic [ref=e100]: Explore Guide
              - img [ref=e101]
        - link "G 广州 Guangzhou Cantonese culture and world-class dim sum Explore Guide" [ref=e103] [cursor=pointer]:
          - /url: /city/guangzhou
          - generic [ref=e105]: G
          - generic [ref=e106]:
            - generic [ref=e107]: 广州
            - heading "Guangzhou" [level=3] [ref=e108]
            - paragraph [ref=e109]: Cantonese culture and world-class dim sum
            - generic [ref=e110]:
              - generic [ref=e111]: Explore Guide
              - img [ref=e112]
        - link "X 西安 Xi'an Terracotta Warriors and Silk Road heritage Explore Guide" [ref=e114] [cursor=pointer]:
          - /url: /city/xian
          - generic [ref=e116]: X
          - generic [ref=e117]:
            - generic [ref=e118]: 西安
            - heading "Xi'an" [level=3] [ref=e119]
            - paragraph [ref=e120]: Terracotta Warriors and Silk Road heritage
            - generic [ref=e121]:
              - generic [ref=e122]: Explore Guide
              - img [ref=e123]
        - link "C 成都 Chengdu Giant pandas and spicy Sichuan cuisine Explore Guide" [ref=e125] [cursor=pointer]:
          - /url: /city/chengdu
          - generic [ref=e127]: C
          - generic [ref=e128]:
            - generic [ref=e129]: 成都
            - heading "Chengdu" [level=3] [ref=e130]
            - paragraph [ref=e131]: Giant pandas and spicy Sichuan cuisine
            - generic [ref=e132]:
              - generic [ref=e133]: Explore Guide
              - img [ref=e134]
        - link "G 桂林 Guilin Stunning karst landscapes and Li River Explore Guide" [ref=e136] [cursor=pointer]:
          - /url: /city/guilin
          - generic [ref=e138]: G
          - generic [ref=e139]:
            - generic [ref=e140]: 桂林
            - heading "Guilin" [level=3] [ref=e141]
            - paragraph [ref=e142]: Stunning karst landscapes and Li River
            - generic [ref=e143]:
              - generic [ref=e144]: Explore Guide
              - img [ref=e145]
        - link "H 杭州 Hangzhou West Lake UNESCO site and Longjing tea Explore Guide" [ref=e147] [cursor=pointer]:
          - /url: /city/hangzhou
          - generic [ref=e149]: H
          - generic [ref=e150]:
            - generic [ref=e151]: 杭州
            - heading "Hangzhou" [level=3] [ref=e152]
            - paragraph [ref=e153]: West Lake UNESCO site and Longjing tea
            - generic [ref=e154]:
              - generic [ref=e155]: Explore Guide
              - img [ref=e156]
        - link "C 重庆 Chongqing Mountain city, hot pot capital, Yangtze cruises Explore Guide" [ref=e158] [cursor=pointer]:
          - /url: /city/chongqing
          - generic [ref=e160]: C
          - generic [ref=e161]:
            - generic [ref=e162]: 重庆
            - heading "Chongqing" [level=3] [ref=e163]
            - paragraph [ref=e164]: Mountain city, hot pot capital, Yangtze cruises
            - generic [ref=e165]:
              - generic [ref=e166]: Explore Guide
              - img [ref=e167]
      - link "View All 20 Cities" [ref=e170] [cursor=pointer]:
        - /url: /cities
        - generic [ref=e171]: View All 20 Cities
        - img [ref=e172]
    - generic [ref=e175]:
      - generic [ref=e176]:
        - heading "Everything You Need for Your China Trip" [level=2] [ref=e177]
        - paragraph [ref=e178]: Comprehensive guides for every aspect of your journey
      - generic [ref=e179]:
        - link "Restaurant Guide Michelin stars, Black Pearl rankings, and local favorites with detailed reviews" [ref=e180] [cursor=pointer]:
          - /url: /food
          - img [ref=e182]
          - heading "Restaurant Guide" [level=3] [ref=e184]
          - paragraph [ref=e185]: Michelin stars, Black Pearl rankings, and local favorites with detailed reviews
        - link "Attractions Top-rated attractions with opening hours, tickets, and local tips" [ref=e186] [cursor=pointer]:
          - /url: /guide/attractions
          - img [ref=e188]
          - heading "Attractions" [level=3] [ref=e191]
          - paragraph [ref=e192]: Top-rated attractions with opening hours, tickets, and local tips
        - link "Transport How to get there and around - flights, trains, metro, and local tips" [ref=e193] [cursor=pointer]:
          - /url: /guide/transport
          - img [ref=e195]
          - heading "Transport" [level=3] [ref=e197]
          - paragraph [ref=e198]: How to get there and around - flights, trains, metro, and local tips
        - link "Emergency Hospital, police, embassy contacts and important phone numbers" [ref=e199] [cursor=pointer]:
          - /url: /emergency
          - img [ref=e201]
          - heading "Emergency" [level=3] [ref=e203]
          - paragraph [ref=e204]: Hospital, police, embassy contacts and important phone numbers
        - link "Payment Guide Alipay, WeChat Pay, cash tips, and card acceptance info" [ref=e205] [cursor=pointer]:
          - /url: /guide/payment
          - img [ref=e207]
          - heading "Payment Guide" [level=3] [ref=e209]
          - paragraph [ref=e210]: Alipay, WeChat Pay, cash tips, and card acceptance info
        - link "Accommodation Hotel recommendations for every budget from luxury to budget" [ref=e211] [cursor=pointer]:
          - /url: /guide/accommodation
          - img [ref=e213]
          - heading "Accommodation" [level=3] [ref=e215]
          - paragraph [ref=e216]: Hotel recommendations for every budget from luxury to budget
        - link "Cultural Tips Local customs, etiquette, and cultural insights for each city" [ref=e217] [cursor=pointer]:
          - /url: /guide/cultural-warnings
          - img [ref=e219]
          - heading "Cultural Tips" [level=3] [ref=e221]
          - paragraph [ref=e222]: Local customs, etiquette, and cultural insights for each city
        - link "AI Assistant Ask questions in English, get instant answers about China travel" [ref=e223] [cursor=pointer]:
          - /url: /ai
          - img [ref=e225]
          - heading "AI Assistant" [level=3] [ref=e227]
          - paragraph [ref=e228]: Ask questions in English, get instant answers about China travel
    - generic [ref=e230]:
      - generic [ref=e231]:
        - heading "Recommended for You" [level=2] [ref=e232]
        - paragraph [ref=e233]: Based on popular destinations
      - generic [ref=e234]:
        - link "S Shanghai Modern metropolis where East meets West" [ref=e235] [cursor=pointer]:
          - /url: /city/shanghai
          - generic [ref=e237]: S
          - generic [ref=e238]:
            - heading "Shanghai" [level=3] [ref=e239]
            - paragraph [ref=e240]: Modern metropolis where East meets West
        - link "C Chengdu Giant pandas and spicy Sichuan cuisine" [ref=e241] [cursor=pointer]:
          - /url: /city/chengdu
          - generic [ref=e243]: C
          - generic [ref=e244]:
            - heading "Chengdu" [level=3] [ref=e245]
            - paragraph [ref=e246]: Giant pandas and spicy Sichuan cuisine
        - link "X Xi'an Terracotta Warriors and Silk Road heritage" [ref=e247] [cursor=pointer]:
          - /url: /city/xian
          - generic [ref=e249]: X
          - generic [ref=e250]:
            - heading "Xi'an" [level=3] [ref=e251]
            - paragraph [ref=e252]: Terracotta Warriors and Silk Road heritage
    - generic [ref=e255]:
      - heading "Ready to Explore China?" [level=2] [ref=e256]
      - paragraph [ref=e257]: Start planning your trip with AI-powered recommendations.
      - generic [ref=e258]:
        - link "Explore Beijing" [ref=e259] [cursor=pointer]:
          - /url: /city/beijing
        - link "Chat with AI" [ref=e260] [cursor=pointer]:
          - /url: /ai
          - img [ref=e261]
          - generic [ref=e263]: Chat with AI
  - generic [ref=e264]:
    - generic:
      - generic:
        - generic:
          - button "🚨 SOS":
            - generic: 🚨
            - text: SOS
          - button "📋 Translate":
            - generic: 📋
            - text: Translate
          - button "📍 GPS":
            - generic: 📍
            - text: GPS
          - button "🏛️ Embassy":
            - generic: 🏛️
            - text: Embassy
          - button "👥 Contacts":
            - generic: 👥
            - text: Contacts
        - generic:
          - generic:
            - generic:
              - heading "Emergency Numbers" [level=3]
              - generic:
                - generic:
                  - button "Police - 警察":
                    - generic: 🚔
                    - generic:
                      - generic: "110"
                      - generic: 警察
                    - generic: Tap to call
                  - button "Ambulance - 救护车":
                    - generic: 🚑
                    - generic:
                      - generic: "120"
                      - generic: 救护车
                    - generic: Tap to call
                  - button "Fire - 消防":
                    - generic: 🚒
                    - generic:
                      - generic: "119"
                      - generic: 消防
                    - generic: Tap to call
                  - button "Traffic - 交通事故":
                    - generic: 🚗
                    - generic:
                      - generic: "122"
                      - generic: 交通事故
                    - generic: Tap to call
            - generic:
              - button "📋 Translation":
                - generic: 📋
                - generic: Translation
              - button "📍 My Location":
                - generic: 📍
                - generic: My Location
        - generic:
          - button "Close"
    - generic [ref=e265]:
      - button "Open emergency menu" [ref=e266] [cursor=pointer]: ☰
      - button "SOS Emergency - Tap to call police" [ref=e267] [cursor=pointer]:
        - generic [ref=e270]: 🆘
    - generic:
      - generic:
        - generic: 🆘 Emergency SOS
        - generic:
          - generic: "• Tap: Call Police (110)"
          - generic: "• Menu: Translation, GPS, Embassy"
          - generic: Works offline
  - button "⚠️ Cultural Tips" [ref=e272] [cursor=pointer]:
    - generic [ref=e273]: ⚠️
    - generic [ref=e274]: Cultural Tips
  - contentinfo [ref=e275]:
    - generic [ref=e276]:
      - generic [ref=e277]:
        - generic [ref=e278]:
          - generic [ref=e279]:
            - generic [ref=e280]: CC
            - generic [ref=e281]: ChinaConnect
          - paragraph [ref=e282]: Your trusted guide to exploring China. AI-powered restaurant recommendations, city guides, and travel tips.
        - generic [ref=e283]:
          - heading "Cities" [level=4] [ref=e284]
          - list [ref=e285]:
            - listitem [ref=e286]:
              - link "Beijing" [ref=e287] [cursor=pointer]:
                - /url: /city/beijing
            - listitem [ref=e288]:
              - link "Shanghai" [ref=e289] [cursor=pointer]:
                - /url: /city/shanghai
            - listitem [ref=e290]:
              - link "Guangzhou" [ref=e291] [cursor=pointer]:
                - /url: /city/guangzhou
            - listitem [ref=e292]:
              - link "Xi'an" [ref=e293] [cursor=pointer]:
                - /url: /city/xian
            - listitem [ref=e294]:
              - link "Chengdu" [ref=e295] [cursor=pointer]:
                - /url: /city/chengdu
            - listitem [ref=e296]:
              - link "View All Cities" [ref=e297] [cursor=pointer]:
                - /url: /cities
        - generic [ref=e298]:
          - heading "Resources" [level=4] [ref=e299]
          - list [ref=e300]:
            - listitem [ref=e301]:
              - link "Restaurants" [ref=e302] [cursor=pointer]:
                - /url: /food
            - listitem [ref=e303]:
              - link "Transport" [ref=e304] [cursor=pointer]:
                - /url: /guide/transport
            - listitem [ref=e305]:
              - link "Accommodation" [ref=e306] [cursor=pointer]:
                - /url: /guide/accommodation
            - listitem [ref=e307]:
              - link "Payment" [ref=e308] [cursor=pointer]:
                - /url: /guide/payment
            - listitem [ref=e309]:
              - link "Emergency Contacts" [ref=e310] [cursor=pointer]:
                - /url: /emergency
        - generic [ref=e311]:
          - heading "Travel Guides" [level=4] [ref=e312]
          - list [ref=e313]:
            - listitem [ref=e314]:
              - link "Visa Guide" [ref=e315] [cursor=pointer]:
                - /url: /guide/visa
            - listitem [ref=e316]:
              - link "Dining Guide" [ref=e317] [cursor=pointer]:
                - /url: /guide/dining
            - listitem [ref=e318]:
              - link "Cultural Tips" [ref=e319] [cursor=pointer]:
                - /url: /guide/cultural-warnings
            - listitem [ref=e320]:
              - link "AI Assistant" [ref=e321] [cursor=pointer]:
                - /url: /ai
            - listitem [ref=e322]:
              - link "Community" [ref=e323] [cursor=pointer]:
                - /url: /community
      - generic [ref=e324]:
        - paragraph [ref=e325]: © 2026 ChinaConnect. All rights reserved.
        - generic [ref=e326]:
          - link "Privacy" [ref=e327] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e328] [cursor=pointer]:
            - /url: /terms
          - link "Contact" [ref=e329] [cursor=pointer]:
            - /url: /contact
  - generic [ref=e332]:
    - button "Menu" [ref=e333]:
      - img [ref=e335]
      - generic: Menu
    - button "Inspect" [ref=e339]:
      - img [ref=e341]
      - generic: Inspect
    - button "Audit" [ref=e343]:
      - img [ref=e345]
      - generic: Audit
    - button "Settings" [ref=e348]:
      - img [ref=e350]
      - generic: Settings
```

# Test source

```ts
  1  | // E2E tests for SEO infrastructure
  2  | 
  3  | import { expect, test } from "@playwright/test";
  4  | 
  5  | test.describe("SEO Infrastructure", () => {
  6  |   test("homepage has valid HTML structure", async ({ page }) => {
  7  |     await page.goto("/");
  8  | 
  9  |     const html = page.locator("html");
  10 |     await expect(html).toHaveAttribute("lang");
  11 |   });
  12 | 
  13 |   test("homepage has canonical URL", async ({ page }) => {
  14 |     await page.goto("/");
  15 | 
  16 |     const canonical = page.locator('link[rel="canonical"]');
  17 |     const count = await canonical.count();
  18 |     expect(count).toBeGreaterThanOrEqual(1);
  19 |   });
  20 | 
  21 |   test("structured data is valid JSON", async ({ page }) => {
  22 |     await page.goto("/");
  23 | 
  24 |     const schemaScripts = page.locator('script[type="application/ld+json"]');
  25 |     const count = await schemaScripts.count();
  26 | 
  27 |     if (count > 0) {
  28 |       const isValid = await page.evaluate(() => {
  29 |         const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  30 |         return Array.from(scripts).every((script) => {
  31 |           try {
  32 |             JSON.parse(script.textContent || "");
  33 |             return true;
  34 |           } catch {
  35 |             return false;
  36 |           }
  37 |         });
  38 |       });
  39 |       expect(isValid).toBe(true);
  40 |     }
  41 |   });
  42 | });
  43 | 
  44 | test.describe("Sitemap", () => {
  45 |   test("sitemap.xml is accessible", async ({ page }) => {
  46 |     const response = await page.goto("/sitemap.xml");
  47 |     expect(response?.status()).toBe(200);
  48 |   });
  49 | 
  50 |   test("baidu sitemap is accessible", async ({ page }) => {
  51 |     const response = await page.goto("/sitemap-baidu.xml");
  52 |     expect([200, 404]).toContain(response?.status());
  53 |   });
  54 | });
  55 | 
  56 | test.describe("Robots.txt", () => {
  57 |   test("robots.txt is accessible", async ({ page }) => {
  58 |     const response = await page.goto("/robots.txt");
  59 |     expect(response?.status()).toBe(200);
  60 |   });
  61 | 
  62 |   test("robots.txt allows AI crawlers", async ({ page }) => {
  63 |     const response = await page.goto("/robots.txt");
  64 |     const content = await page.content();
  65 |     expect(content).toContain("GPTBot");
  66 |   });
  67 | 
  68 |   test("robots.txt declares sitemap", async ({ page }) => {
  69 |     const response = await page.goto("/robots.txt");
  70 |     const content = await page.content();
  71 |     expect(content).toContain("Sitemap:");
  72 |   });
  73 | });
  74 | 
  75 | test.describe("Internationalization (hreflang)", () => {
  76 |   test("homepage has hreflang tags", async ({ page }) => {
  77 |     await page.goto("/");
  78 | 
  79 |     const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
  80 |     const count = await hreflangLinks.count();
  81 | 
> 82 |     expect(count).toBeGreaterThanOrEqual(2);
     |                   ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  83 |   });
  84 | });
  85 | 
```