import { PRICE_DATA, TIPS } from "@/data/price-transparency";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi, guideText, localized } from "./guide-i18n";;

export function PriceTransparencyClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.priceTransparency || translations.en.priceTransparency || {}) as Record<string, string>;
  const [activeCategory, setActiveCategory] = useState("all");
  const [showBothPrices, setShowBothPrices] = useState(true);

  const categories = [
    { id: "all", label: tg.all || "All", icon: "📊" },
    ...PRICE_DATA.map((c) => ({ id: c.category, label: localized(c.category, c.categoryCn, lang), icon: c.icon })),
  ];

  const filteredData =
    activeCategory === "all" ? PRICE_DATA : PRICE_DATA.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
{<>💡 {localized("Quick Tips", "クイックヒント", lang)}</>}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPS.map((tip, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg p-4">
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h3 className="font-semibold">{localized(tip.title, tip.titleCn, lang)}</h3>
              <p className="text-sm mt-2 text-foreground/80">{localized(tip.content, tip.contentCn, lang)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
{<span className="text-sm font-medium">{localized("Price comparison view:", "価格比較表示:", lang)}</span>}
        <button
          onClick={() => setShowBothPrices(!showBothPrices)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showBothPrices ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700"
          }`}
        >
          {showBothPrices ? (localized("Show comparison", "比較表示", lang)) : (localized("Show simplified", "簡易表示", lang))}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 bg-card p-2 rounded-lg">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{guideText(cat.label, lang)}</span>
          </button>
        ))}
      </div>

      {/* Price Tables */}
      <div className="space-y-6">
        {filteredData.map((category) => (
          <div key={category.category} className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b flex items-center gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div>
                <h2 className="font-semibold text-lg">{localized(category.category, category.categoryCn, lang)}</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground"><Bi en="Item" zh="物品" lang={lang} /></th>
                    {showBothPrices && (
                      <>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground"><Bi en="Local Price" zh="当地价" lang={lang} /></th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground"><Bi en="Foreign Price" zh="外国人价" lang={lang} /></th>
                      </>
                    )}
                    {!showBothPrices && (
                      <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground"><Bi en="Fair Price" zh="公平价格" lang={lang} /></th>
                    )}
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground"><Bi en="Note" zh="备注" lang={lang} /></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {category.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{localized(item.name, item.nameCn, lang)}</div>
                      </td>
                      {showBothPrices && (
                        <>
                          <td className="text-center px-4 py-4">
                            <span className="font-semibold text-green-600">¥{item.localPrice}</span>
                          </td>
                          <td className="text-center px-4 py-4">
                            <span className="font-semibold text-green-600">
                              ¥{item.foreignPrice}
                            </span>
                          </td>
                        </>
                      )}
                      {!showBothPrices && (
                        <td className="text-center px-4 py-4">
                          <span className="font-semibold text-green-600">¥{item.localPrice}</span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm">{localized(item.note, item.noteCn, lang)}</div>
                        {item.warning && (
                          <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                            ⚠️ {localized(item.warning, item.warningCn, lang)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Meter Tutorial */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b flex items-center gap-3">
          <span className="text-2xl">🚕</span>
          <div>
            <h2 className="font-semibold text-lg">{localized("Taxi Meter Tutorial", "タクシーメーターの解説", lang)}</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">{localized("How Taxi Meters Work", "タクシーメーターの仕組み", lang)}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <div>
                    <p className="font-medium">{localized("Base Fare", "初乗り料金", lang)}</p>
                    <p className="text-muted-foreground">{localized("Usually ¥10-14 for first 3km", "最初の3kmで通常¥10〜14", lang)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <div>
                    <p className="font-medium">{localized("Distance Rate", "距離料金", lang)}</p>
                    <p className="text-muted-foreground">{localized("¥2-3 per km after base", "基本料金超過後、1kmあたり¥2〜3", lang)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <div>
                    <p className="font-medium">{localized("Waiting Rate", "待機料金", lang)}</p>
                    <p className="text-muted-foreground">{localized("¥2-3 per 5 minutes of waiting", "待機5分ごとに¥2〜3", lang)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <div>
                    <p className="font-medium">{localized("Night Rate", "深夜料金", lang)}</p>
                    <p className="text-muted-foreground">{localized("11PM-6AM: 10-20% higher", "23時〜6時：10〜20%割増", lang)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{localized("Sample Fares", "料金例", lang)}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{localized("3km (short trip)", "3km（短距離）", lang)}</span>
                  <span className="font-semibold">¥10-15</span>
                </div>
                <div className="flex justify-between">
                  <span>{localized("10km (city)", "10km（市内）", lang)}</span>
                  <span className="font-semibold">¥25-35</span>
                </div>
                <div className="flex justify-between">
                  <span>{localized("25km (suburb)", "25km（郊外）", lang)}</span>
                  <span className="font-semibold">¥60-80</span>
                </div>
                <div className="flex justify-between">
                  <span>{localized("Airport (50km)", "空港（50km）", lang)}</span>
                  <span className="font-semibold">¥150-200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceTransparencyClient;
