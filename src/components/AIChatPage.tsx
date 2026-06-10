/**
 * AIChatPage Component
 * Premium AI chat interface for ChinaConnect
 * Redesigned with hero section, feature cards, and professional layout
 */

import type { SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";

// ============================================
// Feature Card Component
// ============================================

const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon, title, description, gradient }) => (
  <div className={`relative group rounded-2xl p-[1px] ${gradient} hover:shadow-lg transition-all duration-300`}>
    <div className="bg-white rounded-2xl p-5 h-full">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-gray-900 text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

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
  const [chatStarted, setChatStarted] = useState(false);

  const _handleSaveItinerary = useCallback((name: string) => {
    void name;
    void setSavedItinerary;
  }, []);

  const handleExamplePrompt = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
    setChatStarted(true);
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      {/* ===== Hero Section ===== */}
      {!chatStarted && (
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900" />
          
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative container-custom py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-xs font-medium tracking-wide uppercase">Powered by Advanced AI</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                ChinaConnect
                <span className="block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                  AI Travel Expert
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                Your personal China travel intelligence. Get expert itinerary planning, 
                real-time recommendations, and local insights — all powered by AI.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button
                  onClick={() => {
                    const chatEl = document.getElementById('ai-chat-input');
                    if (chatEl) chatEl.focus();
                  }}
                  className="group relative px-8 py-3.5 bg-white rounded-xl font-semibold text-gray-900 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start Chatting — It's Free
                  </span>
                </button>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No sign-up required &bull; Instant responses
                </div>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <FeatureCard
                  icon="🗺️"
                  title="Smart Itineraries"
                  description="AI-crafted day-by-day plans tailored to your interests, budget, and travel style."
                  gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
                />
                <FeatureCard
                  icon="🍜"
                  title="Food Discovery"
                  description="Local restaurant gems, street food guides, and dining recommendations from real data."
                  gradient="bg-gradient-to-br from-orange-400 to-red-500"
                />
                <FeatureCard
                  icon="🔍"
                  title="Real-time Intel"
                  description="Live weather, opening hours, events, and transport updates from verified sources."
                  gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
                />
                <FeatureCard
                  icon="🌏"
                  title="Cultural Guide"
                  description="Language tips, etiquette, payment setup, and everything you need to navigate China."
                  gradient="bg-gradient-to-br from-purple-400 to-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
      )}

      {/* ===== Chat Section ===== */}
      <div className={`container-custom ${chatStarted ? 'pt-4 pb-6' : 'py-6'}`}>
        {/* Compact Header when chat started */}
        {chatStarted && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ChinaConnect AI</h1>
                <p className="text-xs text-gray-500">Your Intelligent Travel Expert</p>
              </div>
            </div>
            <button
              onClick={() => setChatStarted(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show features
            </button>
          </div>
        )}

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
                          <span>Restaurant &amp; food recommendations</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Transport &amp; directions</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-blue-500">•</span>
                          <span>Local tips &amp; practical info</span>
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
                    <PromptChip
                      icon="☁️"
                      text="成都今天天气怎么样？"
                      onClick={() => handleExamplePrompt("成都今天天气怎么样？")}
                    />
                    <PromptChip
                      icon="🏨"
                      text="推荐成都的酒店，预算300-500元"
                      onClick={() => handleExamplePrompt("推荐成都的酒店，预算300-500元")}
                    />
                    <PromptChip
                      icon="📍"
                      text="北京故宫附近有什么好吃的？"
                      onClick={() => handleExamplePrompt("北京故宫附近有什么好吃的？")}
                    />
                    <PromptChip
                      icon="🌤️"
                      text="What's the weather like in Guilin this week?"
                      onClick={() => handleExamplePrompt("What's the weather like in Guilin this week?")}
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
                      title="Food &amp; Dining"
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

                {/* 3.5 Real-time Data Sources */}
                <AccordionSection
                  icon="📡"
                  title="Real-time Data Sources"
                  defaultOpen={false}
                  color="bg-gradient-to-br from-green-50 to-emerald-50"
                >
                  <div className="space-y-2 text-xs text-gray-600">
                    <p className="text-gray-700 font-medium mb-2">All data below is fetched live during your conversation:</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">☁️</span>
                        <span><strong>Weather</strong> — OpenMeteo API (global, free, real-time)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">🍜</span>
                        <span><strong>Restaurants</strong> — 高德地图 POI Search (300+ Chinese cities)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">🏨</span>
                        <span><strong>Hotels</strong> — 高德地图 POI Search (real-time availability)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">📍</span>
                        <span><strong>Nearby POI</strong> — 高德地图 POI Search (attractions, shopping, etc.)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">🔍</span>
                        <span><strong>Web Search</strong> — AnySearch API (latest travel info, events, news)</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
                        <span className="text-green-600">🚄</span>
                        <span><strong>Transport</strong> — Web Search + 高德路线 (trains, flights, metro)</span>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-2 italic">💡 Look for "📡 Based on real-time data" in responses to confirm live data was used.</p>
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
              style={{ height: chatStarted ? "calc(100vh - 140px)" : "calc(100vh - 250px)", minHeight: "500px" }}
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
