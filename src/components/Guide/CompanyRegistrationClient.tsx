import {
  COMPANY_REGISTRATION,
  REGISTRATION_TIMELINE,
} from "@/data/guide/business/company-registration";
import React, { useState } from "react";

export function CompanyRegistrationClient() {
  const [selectedType, setSelectedType] = useState<string>(COMPANY_REGISTRATION[0].type);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const currentInfo =
    COMPANY_REGISTRATION.find((r) => r.type === selectedType) || COMPANY_REGISTRATION[0];

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-4">
          <span className="text-5xl">🏢</span>
          <div>
            <h2 className="text-2xl font-bold mb-2">Company Registration Guide</h2>
            <p className="text-orange-100 max-w-2xl">
              Step-by-step guide to registering a business entity in China as a foreign investor.
              Choose the structure that best fits your business needs.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Type Selector */}
      <div className="flex flex-col gap-3">
        {COMPANY_REGISTRATION.map((info) => {
          const timeline = info.type.includes("WFOE")
            ? REGISTRATION_TIMELINE.wfoe
            : info.type.includes("Representative")
              ? REGISTRATION_TIMELINE.ro
              : REGISTRATION_TIMELINE.fcte;
          return (
            <button
              key={info.type}
              onClick={() => {
                setSelectedType(info.type);
                setExpandedSteps({});
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedType === info.type
                  ? "border-orange-500 bg-orange-50"
                  : "border-border bg-card hover:border-orange-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {info.type.includes("WFOE")
                      ? "🏭"
                      : info.type.includes("Representative")
                        ? "🔗"
                        : "📂"}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg">{info.type}</h3>
                    <p className="text-sm text-muted-foreground">{info.typeCn}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Timeline</div>
                  <div className="font-semibold">
                    {timeline.min} – {timeline.max}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Overview */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-xl font-bold mb-2">{currentInfo.type}</h3>
        <p className="text-muted-foreground mb-4">{currentInfo.typeCn}</p>
        <p className="text-foreground">{currentInfo.summary}</p>
        <p className="text-muted-foreground mt-2">{currentInfo.summaryCn}</p>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Registration Steps / 注册步骤</h3>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-4">
            {currentInfo.steps.map((step) => (
              <div key={step.step} className="relative">
                {/* Step circle */}
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white z-10 ${
                      step.step % 2 === 0 ? "bg-orange-500" : "bg-amber-500"
                    }`}
                  >
                    {step.step}
                  </div>

                  <div className="flex-1 bg-card rounded-xl border overflow-hidden">
                    <button
                      onClick={() => toggleStep(step.step)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-lg">{step.title}</h4>
                        <p className="text-sm text-primary">{step.titleCn}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            ⏱ {step.duration}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            ⏱ {step.durationCn}
                          </span>
                          {step.cost && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              💰 {step.cost}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {expandedSteps[step.step] ? "▲" : "▼"}
                      </span>
                    </button>

                    {expandedSteps[step.step] && (
                      <div className="border-t p-5 space-y-5">
                        {/* Description */}
                        <div>
                          <p className="text-sm text-foreground">{step.description}</p>
                          <p className="text-sm text-muted-foreground mt-1">{step.descriptionCn}</p>
                        </div>

                        {/* Documents */}
                        <div>
                          <h5 className="font-semibold mb-2 text-sm">
                            📄 Required Documents / 所需材料
                          </h5>
                          <div className="grid md:grid-cols-2 gap-2">
                            {step.documents.map((doc, idx) => (
                              <div key={idx} className="bg-slate-50 rounded-lg p-3">
                                <p className="text-sm font-medium">{doc.en}</p>
                                <p className="text-xs text-muted-foreground">{doc.cn}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <h5 className="font-semibold mb-2 text-sm">💡 Pro Tips / 专业提示</h5>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-foreground"
                              >
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span>{tip.en}</span>
                              </li>
                            ))}
                          </ul>
                          <ul className="space-y-1 mt-2">
                            {step.tips.map((tip, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <span className="text-green-400 mt-0.5">✓</span>
                                <span>{tip.cn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-slate-800 text-white rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>🔑</span> Key Takeaways / 关键要点
        </h3>
        <ul className="space-y-3">
          {currentInfo.keyPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm">
              <span className="text-amber-400 mt-0.5">◆</span>
              <div>
                <p className="text-slate-200">{point.en}</p>
                <p className="text-slate-400 text-xs mt-1">{point.cn}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h4 className="font-semibold text-amber-900 mb-2">⚠️ Disclaimer</h4>
        <p className="text-sm text-amber-800">
          This guide is for informational purposes only. Registration requirements change frequently
          and vary by city, industry, and nationality. Always consult a licensed Chinese corporate
          service provider or lawyer before starting the registration process.
        </p>
        <p className="text-xs text-amber-600 mt-2">
          本指南仅供参考。注册要求时常变化，因城市、行业和国籍而异。在开始注册流程前，请务必咨询持有执照的中国企业服务商或律师。
        </p>
      </div>
    </div>
  );
}

export default CompanyRegistrationClient;
