import { PRICE_DATA, TIPS } from "@/data/price-transparency";
import React, { useState } from "react";

export function PriceTransparencyClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showBothPrices, setShowBothPrices] = useState(true);

  const categories = [
    { id: "all", label: "All", icon: "📊" },
    ...PRICE_DATA.map((c) => ({ id: c.category, label: c.categoryCn, icon: c.icon })),
  ];

  const filteredData =
    activeCategory === "all" ? PRICE_DATA : PRICE_DATA.filter((c) => c.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Tips Section */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <span>💡</span> Quick Tips
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPS.map((tip, idx) => (
            <div key={idx} className="bg-white/80 rounded-lg p-4">
              <div className="text-2xl mb-2">{tip.icon}</div>
              <h3 className="font-semibold">{tip.title}</h3>
              <p className="text-xs text-muted-foreground">{tip.titleCn}</p>
              <p className="text-sm mt-2 text-foreground/80">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
        <span className="text-sm font-medium">Price comparison view:</span>
        <button
          onClick={() => setShowBothPrices(!showBothPrices)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showBothPrices ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-700"
          }`}
        >
          {showBothPrices ? "Show comparison" : "Show simplified"}
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
            <span>{cat.label}</span>
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
                <h2 className="font-semibold text-lg">{category.category}</h2>
                <p className="text-sm text-muted-foreground">{category.categoryCn}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                      Item / 物品
                    </th>
                    {showBothPrices && (
                      <>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                          Local Price / 当地价
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                          Foreign Price / 外国人价
                        </th>
                      </>
                    )}
                    {!showBothPrices && (
                      <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                        Fair Price / 公平价格
                      </th>
                    )}
                    <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                      Note / 备注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {category.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.nameCn}</div>
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
                        <div className="text-sm">{item.note}</div>
                        <div className="text-xs text-muted-foreground">{item.noteCn}</div>
                        {item.warning && (
                          <div className="mt-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                            ⚠️ {item.warning}
                            <br />
                            <span className="text-amber-600">{item.warningCn}</span>
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
            <h2 className="font-semibold text-lg">Taxi Meter Tutorial</h2>
            <p className="text-sm text-muted-foreground">出租车计价器教程</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">How Taxi Meters Work</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <div>
                    <p className="font-medium">Base Fare (起步价)</p>
                    <p className="text-muted-foreground">Usually ¥10-14 for first 3km</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <div>
                    <p className="font-medium">Distance Rate (里程费)</p>
                    <p className="text-muted-foreground">¥2-3 per km after base</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <div>
                    <p className="font-medium">Waiting Rate (等候费)</p>
                    <p className="text-muted-foreground">¥2-3 per 5 minutes of waiting</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <div>
                    <p className="font-medium">Night Rate (夜间费)</p>
                    <p className="text-muted-foreground">11PM-6AM: 10-20% higher</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Sample Fares</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3km (short trip)</span>
                  <span className="font-semibold">¥10-15</span>
                </div>
                <div className="flex justify-between">
                  <span>10km (city)</span>
                  <span className="font-semibold">¥25-35</span>
                </div>
                <div className="flex justify-between">
                  <span>25km (suburb)</span>
                  <span className="font-semibold">¥60-80</span>
                </div>
                <div className="flex justify-between">
                  <span>Airport (50km)</span>
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
