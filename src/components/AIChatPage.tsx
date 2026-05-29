/**
 * AIChatPage Component
 * Full-page AI chat interface for ChinaConnect
 * Sidebar with subscription status, tips, and conversation history
 */

import type { SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";

export default function AIChatPage() {
  const [_savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [showItineraryPanel, setShowItineraryPanel] = useState(true);

  const _handleSaveItinerary = useCallback((name: string) => {
    // delegated to AIChat internal state
    void name;
    void setSavedItinerary;
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Travel Assistant</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Get personalized travel advice for your China trip
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowItineraryPanel(!showItineraryPanel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showItineraryPanel
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                {showItineraryPanel ? "Hide Panel" : "Show Panel"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Subscription Status Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <SubscriptionCard language="en" compact={false} />

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">💡 Quick Tips</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  {[
                    "Be specific about dates and interests",
                    "Ask for restaurant recommendations",
                    "Request day-by-day itineraries",
                    "Save your favorite plans",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Capabilities */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">🧠 What I Can Do</h4>
                <div className="space-y-2.5">
                  {[
                    { icon: "🗺️", title: "Trip Planning", desc: "Day-by-day itineraries" },
                    { icon: "🍜", title: "Food & Dining", desc: "Restaurant recommendations" },
                    { icon: "💳", title: "Life Help", desc: "WeChat Pay, SIM, transport" },
                    { icon: "🔍", title: "Real-time Search", desc: "Latest info from the web" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-w-0">
            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
            >
              <AIChat language="en" budgetLevel="medium" showItinerary={showItineraryPanel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
