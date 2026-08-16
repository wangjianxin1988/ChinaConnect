import { ETIQUETTE_DATA } from "@/data/guide/business/etiquette";
import { LastVerifiedStamp } from "./LastVerifiedStamp";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi, localized } from "./guide-i18n";;

export function EtiquetteClient({ lang = "en" }: { lang?: Language } = {}) { const t = translations[lang] || translations.en; const tg = (t.etiquette || translations.en.etiquette || {}) as Record<string, string>;
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
            <h2 className="text-2xl font-bold mb-2">{localized("Business Etiquette Essentials", "中国ビジネスマナーの基本", lang)}</h2>
            <p className="text-emerald-100 max-w-2xl">
              {localized("Master the unwritten rules of Chinese business culture. First impressions matter — knowing these norms will help you earn respect and build lasting relationships.", "中国のビジネス文化における暗黙のルールをマスターしましょう。第一印象が重要です — これらの規範を知っていれば、信頼を得て長期的な関係を築くことができます。", lang)}
            </p>
            <LastVerifiedStamp dataKey="etiquette" lang={lang} />
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
              <div className="font-semibold text-sm">{localized(cat.title, cat.titleCn, lang)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Category Overview */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{currentCategory.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{localized(currentCategory.title, currentCategory.titleCn, lang)}</h3>
          </div>
        </div>
        <p className="text-foreground">{localized(currentCategory.summary, currentCategory.summaryCn, lang)}</p>
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
                <h4 className="font-semibold">{localized(rule.title, rule.titleCn, lang)}</h4>
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
                      <span className="text-lg">✅</span><Bi en="Do" zh="正确做法" lang={lang} /></h5>
                    <p className="text-sm text-green-900 mb-2">{localized(rule.correct, rule.correctCn, lang)}</p>
                  </div>

                  {/* Incorrect */}
                  <div className="p-5 bg-red-50">
                    <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">❌</span><Bi en="Avoid" zh="错误做法" lang={lang} /></h5>
                    <p className="text-sm text-red-900 mb-2">{localized(rule.incorrect, rule.incorrectCn, lang)}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-5 bg-slate-50 border-t">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span><Bi en="Why it matters" zh="为什么重要" lang={lang} /></h5>
                  <p className="text-sm text-foreground">{localized(rule.reason, rule.reasonCn, lang)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📌</span><Bi en="Quick Reference" zh="快速参考" lang={lang} /></h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{localized("🎴 Business Cards", "🎴 名刺", lang)}</div>
            <p className="text-slate-300">{localized("Use both hands. Study the card. Never write on it.", "両手で渡し、受け取ります。カードはよく読みます。決して書き込まないでください。", lang)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{localized("🥂 Toasting", "🥂 乾杯", lang)}</div>
            <p className="text-slate-300">{localized("Hold glass lower than seniors. Make eye contact.", "目上の人よりグラスを低く持ち、相手の目を見て乾杯します。", lang)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{localized("⏰ Punctuality", "⏰ 時間厳守", lang)}</div>
            <p className="text-slate-300">{localized("Arrive 5-10 min early. Being late damages reputation.", "5〜10分早めに到着します。遅刻は信用を損なうため、避けてください。", lang)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{localized("🎁 Gifts", "🎁 贈り物", lang)}</div>
            <p className="text-slate-300">{localized("Present with both hands. Avoid clocks and fours.", "両手で渡します。時計や「四」に関わる贈り物は避けましょう。", lang)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EtiquetteClient;
