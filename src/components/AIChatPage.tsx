/**
 * AIChatPage Component
 * Full-page AI chat interface for ChinaConnect
 * Integrates subscription status and usage tracking
 */

import { getLongTermMemory } from "@/lib/ai/memory";
import type { SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";

export default function AIChatPage() {
  const [_savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [showItineraryPanel, setShowItineraryPanel] = useState(true);

  const _handleSaveItinerary = useCallback((name: string) => {
    const memory = getLongTermMemory();
    // Get the current temporary itinerary and save it
    const itineraries = memory.getItineraries();
    const tempItinerary = itineraries.find((i) => i.id.startsWith("temp_"));
    if (tempItinerary) {
      const saved = memory.saveItinerary({ ...tempItinerary, name });
      setSavedItinerary(saved);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Travel Assistant</h1>
              <p className="text-gray-600 mt-1">
                Get personalized travel advice for your China trip
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setShowItineraryPanel(!showItineraryPanel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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

      {/* Main Chat Interface */}
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
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Be specific about dates and interests
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Ask for restaurant recommendations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Request day-by-day itineraries
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    Save your favorite plans
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1">
            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
            >
              <AIChat language="en" budgetLevel="medium" showItinerary={showItineraryPanel} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-custom pb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h2 className="font-semibold text-gray-900 mb-4">How I Can Help</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <div className="font-medium text-gray-900">Trip Planning</div>
                <div className="text-sm text-gray-600">
                  Day-by-day itineraries with transport & hotels
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🍜</span>
              <div>
                <div className="font-medium text-gray-900">Food & Dining</div>
                <div className="text-sm text-gray-600">Michelin & Black Pearl restaurants</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <div className="font-medium text-gray-900">Life Help</div>
                <div className="text-sm text-gray-600">WeChat Pay, SIM cards, transport tips</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-medium text-gray-900">Real-time Search</div>
                <div className="text-sm text-gray-600">Web search for latest info</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
