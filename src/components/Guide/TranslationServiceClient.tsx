import { TRANSLATION_FAQS, TRANSLATION_SERVICES } from "@/data/guide/business/translation";
import { LastVerifiedStamp } from "./LastVerifiedStamp";
import React, { useState } from "react";
import { jaText, Bi, guideText } from "./guide-i18n";

export function TranslationServiceClient({ lang = "en" }: { lang?: string }) {
  const [selectedService, setSelectedService] = useState<string>(TRANSLATION_SERVICES[0].id);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const currentService =
    TRANSLATION_SERVICES.find((s) => s.id === selectedService) || TRANSLATION_SERVICES[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🌍</span>
          <div>
            <h2 className="text-2xl font-bold mb-2">{lang === "ja" ? "中国の翻訳・通訳サービス" : "Translation Services in China"}</h2>
            <p className="text-violet-100 max-w-2xl">
              {lang === "ja" ? "出張時にプロの通訳者・翻訳者を手配できます。夕食会での逐次通訳から、ビザ用の公認文書翻訳まで対応。" : "Book professional interpreters and translators for your business visits. From consecutive interpreting at dinners to certified document translation for visas."}
            </p>
            <LastVerifiedStamp dataKey="translation" lang={lang} />
          </div>
        </div>
      </div>

      {/* Service Selector */}
      <div className="flex flex-wrap gap-2">
        {TRANSLATION_SERVICES.map((svc) => (
          <button
            key={svc.id}
            onClick={() => setSelectedService(svc.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
              selectedService === svc.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <span className="text-2xl">{getServiceIcon(svc.category)}</span>
            <div className="text-left">
              <div className="font-semibold text-sm">{lang === "ja" ? jaText(svc.nameCn, lang) : svc.name}</div>
              {lang !== "ja" && <div className="text-xs opacity-80">{jaText(svc.nameCn, lang)}</div>}
            </div>
          </button>
        ))}
      </div>

      {/* Service Detail */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getServiceIcon(currentService.category)}</span>
            <div>
              <h3 className="text-xl font-bold">{lang === "ja" ? jaText(currentService.nameCn, lang) : currentService.name}</h3>
              {lang !== "ja" && <p className="text-primary font-medium">{jaText(currentService.nameCn, lang)}</p>}
              <div className="text-2xl font-bold text-violet-700 mt-1">
                {guideText(currentService.priceRange, lang)}
              </div>
              <p className="text-sm text-muted-foreground">{jaText(currentService.priceRangeCn, lang)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">📝 {lang === "ja" ? "説明" : "Description"}</h4>
            <p className="text-sm text-foreground">{lang === "ja" ? jaText(currentService.descriptionCn, lang) : currentService.description}</p>
            {lang !== "ja" && <p className="text-sm text-muted-foreground mt-2">{jaText(currentService.descriptionCn, lang)}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">🗣️ {lang === "ja" ? "対応言語" : "Languages"}</h4>
              <div className="flex flex-wrap gap-2">
                {currentService.languages.map((pair) => (
                  <span
                    key={pair}
                    className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {lang === "ja" ? jaText(pair, lang) : pair}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">⏱️ {lang === "ja" ? "納期" : "Delivery"}</h4>
              <p className="text-sm text-foreground">{lang === "ja" ? jaText(currentService.delivery, lang) : currentService.delivery}</p>
              <p className="text-sm text-muted-foreground">{jaText(currentService.deliveryCn, lang)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h4 className="font-semibold mb-3">✅ {lang === "ja" ? "含まれる内容" : "What&apos;s Included"}</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {currentService.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-sm text-foreground">{guideText(feat, lang)}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {currentService.featuresCn.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-sm text-muted-foreground">{jaText(feat, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Services Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4"><Bi en="All Services at a Glance" zh="服务总览" lang={lang} /></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3 border">{lang === "ja" ? "サービス" : "Service"}</th>
                <th className="text-left p-3 border">{lang === "ja" ? "料金" : "Price Range"}</th>
                <th className="text-left p-3 border">{lang === "ja" ? "納期" : "Turnaround"}</th>
                <th className="text-left p-3 border">{lang === "ja" ? "おすすめ用途" : "Best For"}</th>
              </tr>
            </thead>
            <tbody>
              {TRANSLATION_SERVICES.map((svc) => (
                <tr
                  key={svc.id}
                  className={`hover:bg-slate-50 cursor-pointer ${selectedService === svc.id ? "bg-violet-50" : ""}`}
                  onClick={() => setSelectedService(svc.id)}
                >
                  <td className="p-3 border">
                    <div className="font-medium">{lang === "ja" ? jaText(svc.nameCn, lang) : svc.name}</div>
                    {lang !== "ja" && <div className="text-xs text-muted-foreground">{jaText(svc.nameCn, lang)}</div>}
                  </td>
                  <td className="p-3 border font-medium text-violet-700">{guideText(svc.priceRange, lang)}</td>
                  <td className="p-3 border text-muted-foreground">{guideText(svc.delivery, lang)}</td>
                  <td className="p-3 border text-muted-foreground">
                    {lang === "ja" ? (jaText(svc.descriptionCn, lang).split("。")[0] + "。") : (svc.description.split(".")[0] + ".")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-lg font-semibold mb-4"><Bi en="Frequently Asked Questions" zh="常见问题" lang={lang} /></h3>
        <div className="space-y-3">
          {TRANSLATION_FAQS.map((faq, idx) => (
            <div key={idx} className="bg-card rounded-xl border overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{lang === "ja" ? jaText(faq.qCn, lang) : faq.q}</p>
                  {lang !== "ja" && <p className="text-sm text-primary">{jaText(faq.qCn, lang)}</p>}
                </div>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {expandedFAQ === idx ? "▲" : "▼"}
                </span>
              </button>
              {expandedFAQ === idx && (
                <div className="border-t px-4 pb-4">
                  <p className="text-sm text-foreground">{lang === "ja" ? jaText(faq.aCn, lang) : faq.a}</p>
                  {lang !== "ja" && <p className="text-sm text-muted-foreground mt-2">{jaText(faq.aCn, lang)}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Tips */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
        <h4 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
          <span>📋</span> {lang === "ja" ? "予約のコツ" : "Booking Tips"}
        </h4>
        <ul className="space-y-2 text-sm text-violet-800">
          {lang === "ja" && (<>
            <li>• 逐次通訳は少なくとも<strong>3〜5日前</strong>までに予約</li>
            <li>• 同時通訳は少なくとも<strong>1〜2週間前</strong>までに予約（機材準備が必要）</li>
            <li>• 公認法務翻訳の場合、認証に<strong>3〜5日</strong>追加</li>
            <li>• 通訳者確定前に履歴書や実績ポートフォリオを必ず確認</li>
            <li>• 交通費・宿泊費が見積もりに含まれるか確認</li>
          </>)}
          {lang !== "ja" && <li>
            • Book consecutive interpreters at least <strong>3–5 days in advance</strong>
          </li>}
          {lang !== "ja" && <li>
            • Book simultaneous interpreters at least <strong>1–2 weeks in advance</strong>{" "}
            (equipment prep required)
          </li>}
          {lang !== "ja" && <li>
            • For certified legal translation, <strong>add 3–5 days</strong> for notarization if
            needed
          </li>}
          {lang !== "ja" && <li>• Always request a CV or portfolio before confirming an interpreter</li>}
          {lang !== "ja" && <li>• Confirm if transportation and accommodation are included in the quote</li>}
        </ul>
      </div>
    </div>
  );
}

function getServiceIcon(category: string): string {
  const map: Record<string, string> = {
    interpretation: "🎤",
    translation: "📄",
    certified: "✅",
    localisation: "🌐",
  };
  return map[category] || "💬";
}

export default TranslationServiceClient;