import {
  ACCOMMODATION_FAQS,
  BOOKING_TIPS,
  CHECK_IN_STEPS,
  HOTEL_HELPERS,
  HOTEL_TYPES,
} from "@/data/guide/accommodation";
import React, { useState } from "react";

export function AccommodationGuideClient() {
  const [activeTab, setActiveTab] = useState("types");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const tabs = [
    { id: "types", label: "Hotel Types", icon: "🏨" },
    { id: "booking", label: "Booking Tips", icon: "📝" },
    { id: "checkin", label: "Check-in Process", icon: "🔑" },
    { id: "faqs", label: "FAQs", icon: "❓" },
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

      {/* Hotel Types Tab */}
      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {HOTEL_TYPES.map((hotel) => (
              <div key={hotel.type} className="bg-card rounded-xl border overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b flex items-center gap-4">
                  <span className="text-4xl">{hotel.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{hotel.type}</h3>
                    <p className="text-primary font-medium">{hotel.priceRange}</p>
                    <p className="text-xs text-muted-foreground">{hotel.priceRangeCn}</p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-sm text-foreground">{hotel.description}</p>
                  <p className="text-sm text-muted-foreground">{hotel.descriptionCn}</p>

                  {/* Features */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hotel.features.map((f, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-1 rounded border">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hotel.featuresCn.map((f, i) => (
                        <span key={i} className="text-xs text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended For */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-2">Best For:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hotel.recommendedFor.map((r, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Platforms */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Recommended Booking Platforms</h3>
            </div>
            <div className="divide-y">
              <div className="p-4">
                <h4 className="font-medium">Trip.com (Ctrip International)</h4>
                <p className="text-sm text-muted-foreground">
                  Best English interface, reliable customer service, wide selection
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Booking.com</h4>
                <p className="text-sm text-muted-foreground">
                  Good international support, often has best price guarantees
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Hotels.com</h4>
                <p className="text-sm text-muted-foreground">
                  Rewards program good for frequent travelers
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Agoda</h4>
                <p className="text-sm text-muted-foreground">
                  Often has lowest prices for Asian destinations
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Tips Tab */}
      {activeTab === "booking" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {BOOKING_TIPS.map((tip, idx) => (
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

          {/* Useful Phrases */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Useful Hotel Phrases</h3>
            </div>
            <div className="divide-y">
              {HOTEL_HELPERS.usefulPhrases.map((phrase, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <span className="text-foreground">{phrase.english}</span>
                  <span className="text-primary font-medium">{phrase.chinese}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Check-in Process Tab */}
      {activeTab === "checkin" && (
        <div className="space-y-4">
          {CHECK_IN_STEPS.map((step) => (
            <div key={step.step} className="bg-card rounded-xl border overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent border-b">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.titleCn}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-foreground mb-4">{step.description}</p>
                <p className="text-sm text-muted-foreground mb-4">{step.descriptionCn}</p>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Details:</h4>
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500">{i + 1}.</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t space-y-1">
                    {step.detailsCn.map((detail, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Common Issues */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-amber-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Common Issues & Solutions</h3>
            </div>
            <div className="divide-y">
              {HOTEL_HELPERS.commonIssues.map((issue, idx) => (
                <div key={idx} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">Problem: {issue.issue}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Solution: {issue.solution}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b">
              <h2 className="font-semibold text-xl">Frequently Asked Questions</h2>
            </div>
            <div className="divide-y">
              {ACCOMMODATION_FAQS.map((faq, idx) => (
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

          {/* Amenities List */}
          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b">
              <h3 className="font-semibold text-lg">Common Amenities</h3>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-4">
              {HOTEL_HELPERS.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-foreground">{amenity.english}</span>
                  <span className="text-sm text-muted-foreground">({amenity.chinese})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccommodationGuideClient;
