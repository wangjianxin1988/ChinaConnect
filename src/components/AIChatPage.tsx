/**
 * AIChatPage Component
 * Full-page AI chat interface for ChinaConnect
 * Sidebar with subscription status and comprehensive AI usage guide
 */

import type { SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";

// ============================================
// Accordion Section Component
// ============================================

const AccordionSection: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}> = ({ icon, title, children, defaultOpen = false, color = "bg-white" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`${color} rounded-xl border border-gray-200 overflow-hidden transition-all`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg flex-shrink-0">{icon}</span>
        <span className="font-semibold text-gray-900 text-sm flex-1">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
};

// ============================================
// Example Prompt Chip
// ============================================

const PromptChip: React.FC<{
  text: string;
  icon: string;
  onClick: () => void;
}> = ({ text, icon, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all hover:shadow-sm group"
  >
    <span className="text-sm group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium truncate max-w-[180px]">{text}</span>
  </button>
);

// ============================================
// Capability Item
// ============================================

const CapabilityItem: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start gap-3 py-2">
    <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
    <div>
      <div className="font-medium text-gray-800 text-sm">{title}</div>
      <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

export default function AIChatPage() {
  const [_savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [showItineraryPanel, setShowItineraryPanel] = useState(true);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);

  const _handleSaveItinerary = useCallback((name: string) => {
    void name;
    void setSavedItinerary;
  }, []);

  const handleExamplePrompt = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
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
          {/* Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-3">
              {/* Subscription Status */}
              <SubscriptionCard language="en" compact={false} />

              {/* AI Usage Guide - Accordion */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                  AI Usage Guide
                </h3>

                {/* 1. Getting Started */}
                <AccordionSection
                  icon="🚀"
                  title="Getting Started"
                  defaultOpen={true}
                  color="bg-gradient-to-br from-blue-50 to-indigo-50"
                >
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="leading-relaxed">
                      Simply type your travel question in the chat box below. The AI understands natural English
                      and can help with any China travel topic.
                    </p>
                    <div className="bg-white/70 rounded-lg p-2.5 space-y-1.5">
                      <p className="font-medium text-gray-700">You can ask about:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Trip itineraries for any city</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Restaurant & food recommendations</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Transport & directions</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Local tips & practical info</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionSection>

                {/* 2. Example Prompts */}
                <AccordionSection
                  icon="💬"
                  title="Example Prompts"
                  defaultOpen={false}
                  color="bg-white"
                >
                  <p className="text-xs text-gray-500 mb-3">
                    Click any prompt to start a conversation:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <PromptChip
                      icon="🗺️"
                      text="Plan a 3-day trip to Beijing for a foodie"
                      onClick={() => handleExamplePrompt("Plan a 3-day trip to Beijing for a foodie")}
                    />
                    <PromptChip
                      icon="🍜"
                      text="Best restaurants near the Bund in Shanghai"
                      onClick={() => handleExamplePrompt("Best restaurants near the Bund in Shanghai")}
                    />
                    <PromptChip
                      icon="🚄"
                      text="How to get from Guangzhou to Shenzhen by high-speed rail"
                      onClick={() => handleExamplePrompt("How to get from Guangzhou to Shenzhen by high-speed rail")}
                    />
                    <PromptChip
                      icon="💰"
                      text="Create a budget itinerary for Xi'an, 2 days"
                      onClick={() => handleExamplePrompt("Create a budget itinerary for Xi'an, 2 days")}
                    />
                    <PromptChip
                      icon="🌶️"
                      text="What should I eat in Chengdu? I love spicy food"
                      onClick={() => handleExamplePrompt("What should I eat in Chengdu? I love spicy food")}
                    />
                    <PromptChip
                      icon="💼"
                      text="Help me plan a business trip to Shenzhen"
                      onClick={() => handleExamplePrompt("Help me plan a business trip to Shenzhen")}
                    />
                  </div>
                </AccordionSection>

                {/* 3. What I Can Do */}
                <AccordionSection
                  icon="✨"
                  title="What I Can Do"
                  defaultOpen={false}
                  color="bg-white"
                >
                  <div className="divide-y divide-gray-100">
                    <CapabilityItem
                      icon="🗺️"
                      title="Trip Planning"
                      description="Day-by-day itineraries with budget options, must-see attractions, and hidden gems for any Chinese city."
                    />
                    <CapabilityItem
                      icon="🍜"
                      title="Food & Dining"
                      description="Restaurant recommendations with ratings, prices, dietary options, and local specialties you shouldn't miss."
                    />
                    <CapabilityItem
                      icon="🏨"
                      title="Accommodation"
                      description="Hotel, hostel, and Airbnb suggestions sorted by budget, location, and traveler reviews."
                    />
                    <CapabilityItem
                      icon="🚄"
                      title="Transport"
                      description="Train, flight, metro, and bus routing with real-time schedules, ticket prices, and booking tips."
                    />
                    <CapabilityItem
                      icon="🔍"
                      title="Real-time Search"
                      description="Get the latest information from the web — opening hours, events, entry requirements, and more."
                    />
                    <CapabilityItem
                      icon="🌤️"
                      title="Weather"
                      description="Current weather forecasts for any Chinese city, plus packing suggestions based on the season."
                    />
                    <CapabilityItem
                      icon="📍"
                      title="Maps"
                      description="Visualize routes and points of interest on an interactive map with your itinerary."
                    />
                    <CapabilityItem
                      icon="💳"
                      title="Life Help"
                      description="Practical guides for WeChat Pay setup, SIM cards, transport cards, VPN tips, and daily life in China."
                    />
                  </div>
                </AccordionSection>

                {/* 4. Tips for Best Results */}
                <AccordionSection
                  icon="💡"
                  title="Tips for Best Results"
                  defaultOpen={false}
                  color="bg-gradient-to-br from-amber-50 to-yellow-50"
                >
                  <div className="space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                      <p><strong className="text-gray-800">Be specific</strong> — mention dates, number of travelers, budget level, and interests for tailored recommendations.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                      <p><strong className="text-gray-800">Ask follow-ups</strong> — refine your plan by asking "What about museums?" or "Add a half-day for shopping".</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                      <p><strong className="text-gray-800">Request formats</strong> — say "make it a table" or "add a budget breakdown" for structured output.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                      <p><strong className="text-gray-800">Ask for local tips</strong> — request insider knowledge like "hidden gems" or "where locals eat".</p>
                    </div>
                  </div>
                </AccordionSection>

                {/* 5. Save Your Routes */}
                <AccordionSection
                  icon="💾"
                  title="Save Your Routes"
                  defaultOpen={false}
                  color="bg-gradient-to-br from-green-50 to-emerald-50"
                >
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="leading-relaxed">
                      When the AI creates an itinerary you like, click the <strong className="text-gray-800">Save Route</strong> button
                      to save it to your account.
                    </p>
                    <div className="bg-white/70 rounded-lg p-2.5 space-y-1.5">
                      <p className="font-medium text-gray-700">Your saved routes are:</p>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-500">✓</span>
                          <span>Stored locally (works offline)</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-500">✓</span>
                          <span>Synced to your account (if signed in)</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-500">✓</span>
                          <span>Viewable on the <a href="/account" className="text-blue-600 hover:underline">Account page</a></span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-green-500">✓</span>
                          <span>Displayable on an interactive map</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionSection>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 min-w-0">
            <div
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
            >
              <AIChat
                language="en"
                budgetLevel="medium"
                showItinerary={showItineraryPanel}
                externalPrompt={externalPrompt}
                onExternalPromptConsumed={() => setExternalPrompt(null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
