import { ETIQUETTE_DATA } from "@/data/guide/business/etiquette";
import { LastVerifiedStamp } from "./LastVerifiedStamp";
import React, { useState } from "react";

export function EtiquetteClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>(ETIQUETTE_DATA[0].id);
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const currentCategory =
    ETIQUETTE_DATA.find((c) => c.id === selectedCategory) || ETIQUETTE_DATA[0];

  const toggleRule = (ruleId: string) => {
    setExpandedRules((prev) => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🎯</span>
          <div>
            <h2 className="text-2xl font-bold mb-2">Business Etiquette Essentials</h2>
            <p className="text-emerald-100 max-w-2xl">
              Master the unwritten rules of Chinese business culture. First impressions matter —
              knowing these norms will help you earn respect and build lasting relationships.
            </p>
            <LastVerifiedStamp dataKey="etiquette" />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {ETIQUETTE_DATA.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setExpandedRules({});
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
            <div className="text-left">
              <div className="font-semibold text-sm">{cat.title}</div>
              <div className="text-xs opacity-80">{cat.titleCn}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Category Overview */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{currentCategory.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{currentCategory.title}</h3>
            <p className="text-primary font-medium">{currentCategory.titleCn}</p>
          </div>
        </div>
        <p className="text-foreground">{currentCategory.summary}</p>
        <p className="text-muted-foreground mt-2">{currentCategory.summaryCn}</p>
      </div>

      {/* Rules */}
      <div className="space-y-4">
        {currentCategory.rules.map((rule) => (
          <div key={rule.id} className="bg-card rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleRule(rule.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl shrink-0">{rule.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold">{rule.title}</h4>
                <p className="text-sm text-primary">{rule.titleCn}</p>
              </div>
              <span className="text-muted-foreground shrink-0">
                {expandedRules[rule.id] ? "▲" : "▼"}
              </span>
            </button>

            {expandedRules[rule.id] && (
              <div className="border-t">
                <div className="grid md:grid-cols-2">
                  {/* Correct */}
                  <div className="p-5 bg-green-50 border-b md:border-b-0 md:border-r border-green-100">
                    <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">✅</span> Do / 正确做法
                    </h5>
                    <p className="text-sm text-green-900 mb-2">{rule.correct}</p>
                    <p className="text-sm text-green-700">{rule.correctCn}</p>
                  </div>

                  {/* Incorrect */}
                  <div className="p-5 bg-red-50">
                    <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">❌</span> Avoid / 错误做法
                    </h5>
                    <p className="text-sm text-red-900 mb-2">{rule.incorrect}</p>
                    <p className="text-sm text-red-700">{rule.incorrectCn}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-5 bg-slate-50 border-t">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span> Why it matters / 为什么重要
                  </h5>
                  <p className="text-sm text-foreground">{rule.reason}</p>
                  <p className="text-sm text-muted-foreground mt-1">{rule.reasonCn}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📌</span> Quick Reference / 快速参考
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">🎴 Business Cards</div>
            <p className="text-slate-300">Use both hands. Study the card. Never write on it.</p>
            <p className="text-slate-400 text-xs mt-1">双手递接。仔细阅读。切勿写字。</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">🥂 Toasting</div>
            <p className="text-slate-300">Hold glass lower than seniors. Make eye contact.</p>
            <p className="text-slate-400 text-xs mt-1">酒杯低于长者。敬酒时注视对方。</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">⏰ Punctuality</div>
            <p className="text-slate-300">Arrive 5-10 min early. Being late damages reputation.</p>
            <p className="text-slate-400 text-xs mt-1">提前5-10分钟到达。迟到损害声誉。</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">🎁 Gifts</div>
            <p className="text-slate-300">Present with both hands. Avoid clocks and fours.</p>
            <p className="text-slate-400 text-xs mt-1">双手递送。避免钟表和"四"相关的礼品。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EtiquetteClient;
