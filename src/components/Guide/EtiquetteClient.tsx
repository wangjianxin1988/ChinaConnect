import { ETIQUETTE_DATA } from "@/data/guide/business/etiquette";
import { LastVerifiedStamp } from "./LastVerifiedStamp";
import React, { useState } from "react";
import { type Language, translations } from "@/i18n/translations";
import { jaText, Bi } from "./guide-i18n";

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
            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "中国ビジネスマナーの基本" : "Business Etiquette Essentials"}</h2>
            <p className="text-emerald-100 max-w-2xl">
              {lang === "ja" ? "中国のビジネス文化における暗黙のルールをマスターしましょう。第一印象が重要です — これらの規範を知っていれば、信頼を得て長期的な関係を築くことができます。" : "Master the unwritten rules of Chinese business culture. First impressions matter — knowing these norms will help you earn respect and build lasting relationships."}
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
              <div className="font-semibold text-sm">{lang === "ja" ? jaText(cat.titleCn, lang) : cat.title}</div>
              {lang !== "ja" && <div className="text-xs opacity-80">{jaText(cat.titleCn, lang)}</div>}
            </div>
          </button>
        ))}
      </div>

      {/* Category Overview */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{currentCategory.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{lang === "ja" ? jaText(currentCategory.titleCn, lang) : currentCategory.title}</h3>
            {lang !== "ja" && <p className="text-primary font-medium">{jaText(currentCategory.titleCn, lang)}</p>}
          </div>
        </div>
        <p className="text-foreground">{lang === "ja" ? jaText(currentCategory.summaryCn, lang) : currentCategory.summary}</p>
        {lang !== "ja" && <p className="text-muted-foreground mt-2">{jaText(currentCategory.summaryCn, lang)}</p>}
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
                <h4 className="font-semibold">{lang === "ja" ? jaText(rule.titleCn, lang) : rule.title}</h4>
                {lang !== "ja" && <p className="text-sm text-primary">{jaText(rule.titleCn, lang)}</p>}
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
                    <p className="text-sm text-green-900 mb-2">{lang === "ja" ? jaText(rule.correctCn, lang) : rule.correct}</p>
                    {lang !== "ja" && <p className="text-sm text-green-700">{jaText(rule.correctCn, lang)}</p>}
                  </div>

                  {/* Incorrect */}
                  <div className="p-5 bg-red-50">
                    <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">❌</span><Bi en="Avoid" zh="错误做法" lang={lang} /></h5>
                    <p className="text-sm text-red-900 mb-2">{lang === "ja" ? jaText(rule.incorrectCn, lang) : rule.incorrect}</p>
                    {lang !== "ja" && <p className="text-sm text-red-700">{jaText(rule.incorrectCn, lang)}</p>}
                  </div>
                </div>

                {/* Reason */}
                <div className="p-5 bg-slate-50 border-t">
                  <h5 className="font-semibold mb-2 flex items-center gap-2">
                    <span>💡</span><Bi en="Why it matters" zh="为什么重要" lang={lang} /></h5>
                  <p className="text-sm text-foreground">{lang === "ja" ? jaText(rule.reasonCn, lang) : rule.reason}</p>
                  {lang !== "ja" && <p className="text-sm text-muted-foreground mt-1">{jaText(rule.reasonCn, lang)}</p>}
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
            <div className="font-semibold mb-1">{lang === "ja" ? "🎴 名刺" : "🎴 Business Cards"}</div>
            <p className="text-slate-300">{lang === "ja" ? "両手で渡し、受け取ります。カードはよく読みます。決して書き込まないでください。" : "Use both hands. Study the card. Never write on it."}</p>
            {lang !== "ja" && <p className="text-slate-400 text-xs mt-1">双手递接。仔细阅读。切勿写字。</p>}
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{lang === "ja" ? "🥂 乾杯" : "🥂 Toasting"}</div>
            <p className="text-slate-300">{lang === "ja" ? "目上の人よりグラスを低く持ち、相手の目を見て乾杯します。" : "Hold glass lower than seniors. Make eye contact."}</p>
            {lang !== "ja" && <p className="text-slate-400 text-xs mt-1">酒杯低于长者。敬酒时注视对方。</p>}
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{lang === "ja" ? "⏰ 時間厳守" : "⏰ Punctuality"}</div>
            <p className="text-slate-300">{lang === "ja" ? "5〜10分早めに到着します。遅刻は信用を損なうため、避けてください。" : "Arrive 5-10 min early. Being late damages reputation."}</p>
            {lang !== "ja" && <p className="text-slate-400 text-xs mt-1">提前5-10分钟到达。迟到损害声誉。</p>}
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-semibold mb-1">{lang === "ja" ? "🎁 贈り物" : "🎁 Gifts"}</div>
            <p className="text-slate-300">{lang === "ja" ? "両手で渡します。時計や「四」に関わる贈り物は避けましょう。" : "Present with both hands. Avoid clocks and fours."}</p>
            {lang !== "ja" && <p className="text-slate-400 text-xs mt-1">双手递送。避免钟表和"四"相关的礼品。</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EtiquetteClient;
