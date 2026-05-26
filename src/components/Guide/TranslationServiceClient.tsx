import { TRANSLATION_FAQS, TRANSLATION_SERVICES } from "@/data/guide/business/translation";
import React, { useState } from "react";

export function TranslationServiceClient() {
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
            <h2 className="text-2xl font-bold mb-2">Translation Services in China</h2>
            <p className="text-violet-100 max-w-2xl">
              Book professional interpreters and translators for your business visits. From
              consecutive interpreting at dinners to certified document translation for visas.
            </p>
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
              <div className="font-semibold text-sm">{svc.name}</div>
              <div className="text-xs opacity-80">{svc.nameCn}</div>
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
              <h3 className="text-xl font-bold">{currentService.name}</h3>
              <p className="text-primary font-medium">{currentService.nameCn}</p>
              <div className="text-2xl font-bold text-violet-700 mt-1">
                {currentService.priceRange}
              </div>
              <p className="text-sm text-muted-foreground">{currentService.priceRangeCn}</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">📝 Description</h4>
            <p className="text-sm text-foreground">{currentService.description}</p>
            <p className="text-sm text-muted-foreground mt-2">{currentService.descriptionCn}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">🗣️ Languages</h4>
              <div className="flex flex-wrap gap-2">
                {currentService.languages.map((lang) => (
                  <span
                    key={lang}
                    className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">⏱️ Delivery</h4>
              <p className="text-sm text-foreground">{currentService.delivery}</p>
              <p className="text-sm text-muted-foreground">{currentService.deliveryCn}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h4 className="font-semibold mb-3">✅ What&apos;s Included</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {currentService.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-sm text-foreground">{feat}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-2">
            {currentService.featuresCn.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Services Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Services at a Glance / 服务总览</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3 border">Service</th>
                <th className="text-left p-3 border">Price Range</th>
                <th className="text-left p-3 border">Turnaround</th>
                <th className="text-left p-3 border">Best For</th>
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
                    <div className="font-medium">{svc.name}</div>
                    <div className="text-xs text-muted-foreground">{svc.nameCn}</div>
                  </td>
                  <td className="p-3 border font-medium text-violet-700">{svc.priceRange}</td>
                  <td className="p-3 border text-muted-foreground">{svc.delivery}</td>
                  <td className="p-3 border text-muted-foreground">
                    {svc.description.split(".")[0]}.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions / 常见问题</h3>
        <div className="space-y-3">
          {TRANSLATION_FAQS.map((faq, idx) => (
            <div key={idx} className="bg-card rounded-xl border overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{faq.q}</p>
                  <p className="text-sm text-primary">{faq.qCn}</p>
                </div>
                <span className="text-muted-foreground shrink-0 ml-2">
                  {expandedFAQ === idx ? "▲" : "▼"}
                </span>
              </button>
              {expandedFAQ === idx && (
                <div className="border-t px-4 pb-4">
                  <p className="text-sm text-foreground">{faq.a}</p>
                  <p className="text-sm text-muted-foreground mt-2">{faq.aCn}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Tips */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
        <h4 className="font-semibold text-violet-900 mb-3 flex items-center gap-2">
          <span>📋</span> Booking Tips
        </h4>
        <ul className="space-y-2 text-sm text-violet-800">
          <li>
            • Book consecutive interpreters at least <strong>3–5 days in advance</strong>
          </li>
          <li>
            • Book simultaneous interpreters at least <strong>1–2 weeks in advance</strong>{" "}
            (equipment prep required)
          </li>
          <li>
            • For certified legal translation, <strong>add 3–5 days</strong> for notarization if
            needed
          </li>
          <li>• Always request a CV or portfolio before confirming an interpreter</li>
          <li>• Confirm if transportation and accommodation are included in the quote</li>
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
