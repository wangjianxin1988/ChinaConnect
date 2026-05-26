import {
  ALLERGEN_CARDS,
  CUISINE_TYPES,
  DIETARY_RESTRICTIONS,
  DINING_FAQS,
  DINING_TIPS,
  FOOD_SAFETY,
  ORDERING_HELPERS,
  POPULAR_FOOD_CATEGORIES,
} from "@/data/guide/dining";
import React, { useState } from "react";

export function DiningGuideClient() {
  const [activeTab, setActiveTab] = useState("cuisines");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "cuisines", label: "Cuisines", icon: "🍜" },
    { id: "tips", label: "Dining Tips", icon: "💡" },
    { id: "dietary", label: "Dietary", icon: "🥗" },
    { id: "allergens", label: "Allergens", icon: "⚠️" },
    { id: "ordering", label: "Ordering", icon: "📋" },
    { id: "safety", label: "Safety", icon: "🛡️" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cuisines Tab */}
      {activeTab === "cuisines" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {CUISINE_TYPES.map((cuisine) => (
              <div key={cuisine.cuisine} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{cuisine.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{cuisine.cuisine}</h3>
                    <p className="text-sm text-muted-foreground">{cuisine.priceRangeCn}</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-foreground">{cuisine.description}</p>
                  <p className="text-sm text-muted-foreground">{cuisine.descriptionCn}</p>

                  {/* Popular Dishes */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Popular Dishes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {cuisine.popularDishes.map((dish, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border">
                          {dish}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {cuisine.popularDishesCn.map((dish, i) => (
                        <span key={i} className="text-xs text-muted-foreground">
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Pro Tips:</h4>
                    <ul className="space-y-1">
                      {cuisine.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t space-y-1">
                      {cuisine.tipsCn.map((tip, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Ranges */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Budget Guide (Per Person)</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4 p-6">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">20-50 CNY</div>
                <div className="text-sm text-muted-foreground">Street Food</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">50-150 CNY</div>
                <div className="text-sm text-muted-foreground">Casual Restaurant</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">100-300 CNY</div>
                <div className="text-sm text-muted-foreground">Mid-range</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">500+ CNY</div>
                <div className="text-sm text-muted-foreground">High-end</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dining Tips Tab */}
      {activeTab === "tips" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {DINING_TIPS.map((tip, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <h3 className="font-semibold">{tip.category}</h3>
                </div>
                <p className="text-sm text-foreground">{tip.tip}</p>
                <p className="text-sm text-muted-foreground mt-2">{tip.tipCn}</p>
                {tip.warning && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium text-amber-700">Warning:</span> {tip.warning}
                    </p>
                    <p className="text-sm text-muted-foreground">{tip.warningCn}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Etiquette */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-purple-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Dining Etiquette</h3>
            </div>
            <div className="divide-y">
              <div className="p-4">
                <h4 className="font-medium">Do:</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Wait for host to be seated first
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Try a bit of everything served
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Use serving spoons for shared dishes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Say "干杯" (ganbei) and clink glasses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span> Compliment the food and host
                  </li>
                </ul>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Avoid:</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span> Sticking chopsticks upright in rice
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span> Pouring your own drink (pour for others)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span> Leaving empty plates (finish what you
                    take)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span> Turning fish over (bad luck for
                    business)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ordering Tab */}
      {activeTab === "ordering" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Ordering Phrases</h3>
            </div>
            <div className="divide-y">
              {ORDERING_HELPERS.map((phrase, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">{phrase.english}</span>
                    <span className="text-primary">{phrase.chinese}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground italic">{phrase.pronunciation}</span>
                    <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                      {phrase.usage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Dietary Restrictions</h3>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Chinese Phrases:</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">不要辣</span> = No spicy
                  </li>
                  <li>
                    <span className="font-medium">不要味精</span> = No MSG
                  </li>
                  <li>
                    <span className="font-medium">不要盐</span> = No salt
                  </li>
                  <li>
                    <span className="font-medium">素食</span> = Vegetarian
                  </li>
                  <li>
                    <span className="font-medium">清真</span> = Halal
                  </li>
                  <li>
                    <span className="font-medium">不喝酒</span> = No alcohol
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Common Allergies:</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-medium">过敏海鲜</span> = Seafood allergy
                  </li>
                  <li>
                    <span className="font-medium">过敏花生</span> = Peanut allergy
                  </li>
                  <li>
                    <span className="font-medium">过敏贝类</span> = Shellfish allergy
                  </li>
                  <li>
                    <span className="font-medium">过敏鸡蛋</span> = Egg allergy
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Safety Tab */}
      {activeTab === "safety" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {FOOD_SAFETY.map((item, idx) => (
              <div key={idx} className="bg-card rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{item.titleCn}</p>
                <p className="text-sm text-foreground mt-2">{item.tip}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.tipCn}</p>
              </div>
            ))}
          </div>

          {/* FAQs */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
            </div>
            <div className="divide-y">
              {DINING_FAQS.map((faq, idx) => (
                <div key={idx}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-left pr-4">{faq.question}</span>
                    <span className="text-muted-foreground">{expandedFaq === idx ? "▲" : "▼"}</span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4">
                      <p className="text-foreground">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dietary Restrictions Tab */}
      {activeTab === "dietary" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {DIETARY_RESTRICTIONS.map((diet) => (
              <div key={diet.type} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{diet.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{diet.type}</h3>
                    <p className="text-sm text-muted-foreground">{diet.typeCn}</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-mono bg-white inline-block px-2 py-1 rounded">
                      {diet.chinesePhrase}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{diet.pronunciation}</p>
                  </div>
                  <p className="text-sm">{diet.explanation}</p>
                  <p className="text-sm text-muted-foreground">{diet.explanationCn}</p>
                  {diet.exampleDishes && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-medium text-sm mb-2">Safe Options:</h4>
                      <div className="space-y-1">
                        {diet.exampleDishes.map((d, i) => (
                          <p key={i} className="text-sm">
                            • {d}{" "}
                            <span className="text-muted-foreground">
                              ({diet.exampleDishesCn?.[i]})
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Popular Food Categories</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {POPULAR_FOOD_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="font-medium">{cat.category}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Allergen Cards Tab */}
      {activeTab === "allergens" && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Important Allergy Information</h3>
                <p className="text-sm text-red-700 mt-1">
                  Allergen labeling is not mandatory in China. Always communicate your allergies
                  clearly using the Chinese phrases below.
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {ALLERGEN_CARDS.map((card) => (
              <div key={card.allergen} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-red-50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{card.icon}</span>
                  <div>
                    <h3 className="font-semibold">{card.allergen}</h3>
                    <p className="text-sm text-muted-foreground">{card.allergenCn}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-mono bg-white inline-block px-2 py-1 rounded">
                      {card.chinesePhrase}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{card.pronunciation}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">Note:</span> {card.note}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{card.noteCn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Allergen Translation Card</h2>
            </div>
            <div className="p-6 bg-white">
              <div className="border-2 border-red-300 rounded-xl p-6 max-w-md mx-auto bg-red-50">
                <h3 className="text-lg font-bold text-center mb-2">
                  Please note: I have food allergies
                </h3>
                <p className="text-center text-sm mb-4 text-muted-foreground">
                  请注意：我有食物过敏
                </p>
                <div className="space-y-2">
                  {ALLERGEN_CARDS.map((card) => (
                    <div
                      key={card.allergen}
                      className="flex items-center gap-3 border-b border-red-200 pb-2"
                    >
                      <span className="text-xl">{card.icon}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {card.allergen} / {card.allergenCn}
                        </p>
                        <p className="text-xs font-mono">{card.chinesePhrase}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs mt-4 text-muted-foreground">
                  Thank you / 谢谢您的帮助
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiningGuideClient;
