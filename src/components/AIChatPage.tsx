/**
 * AIChatPage Component — Premium Redesign
 * Spacious, elegant AI concierge interface
 */

import type { SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback, useEffect } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";
import { MembershipStatusBar } from "./subscription/MembershipStatusBar";
import { UsageExhaustedBanner } from "./subscription/UsageExhaustedBanner";
import { canMakeRequest } from "@/lib/usage-tracker";

// ============================================
// Main Component
// ============================================

export default function AIChatPage() {
  const [_savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [usageExhausted, setUsageExhausted] = useState(!canMakeRequest());
  const [showExhaustedBanner, setShowExhaustedBanner] = useState(false);

  useEffect(() => {
    const checkUsage = () => {
      const exhausted = !canMakeRequest();
      setUsageExhausted(exhausted);
      if (exhausted && chatStarted) setShowExhaustedBanner(true);
    };
    window.addEventListener("ai-usage-updated", checkUsage);
    window.addEventListener("ai-usage-exceeded", checkUsage);
    return () => {
      window.removeEventListener("ai-usage-updated", checkUsage);
      window.removeEventListener("ai-usage-exceeded", checkUsage);
    };
  }, [chatStarted]);

  const handleExamplePrompt = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
    setChatStarted(true);
  }, []);

  const examplePrompts = [
    { icon: "🏛️", text: "Plan a 5-day Beijing trip with imperial history and modern culture" },
    { icon: "🍜", text: "Best local street food in Chengdu that tourists usually miss" },
    { icon: "🚄", text: "How to travel from Shanghai to Xi'an by high-speed rail?" },
    { icon: "💳", text: "Can I use Apple Pay in China? What payment apps do I need?" },
    { icon: "🏨", text: "Recommend boutique hotels in Hangzhou near West Lake" },
    { icon: "🎯", text: "Business etiquette tips for meeting Chinese partners" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* ===== Hero Section ===== */}
      {!chatStarted && (
        <section className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[80px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/5 blur-[120px]" />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='20' cy='20' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative container-custom py-20 md:py-28 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-10">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-white/70 text-sm font-medium tracking-wide">Powered by Advanced AI</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tight">
                <span className="block">ChinaConnect</span>
                <span className="block mt-2 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 bg-clip-text text-transparent">
                  AI Concierge
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-white/50 mb-14 max-w-xl mx-auto leading-relaxed font-light">
                Your personal China travel intelligence — itineraries, local insights, and real-time guidance.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                <button
                  onClick={() => {
                    const el = document.getElementById("ai-chat-input");
                    if (el) el.focus();
                  }}
                  className="group px-10 py-4 bg-white rounded-2xl font-bold text-gray-900 text-lg shadow-2xl shadow-black/20 hover:shadow-3xl hover:-translate-y-0.5 transition-all"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start Planning
                  </span>
                </button>
                <a
                  href="/pricing"
                  className="px-8 py-4 border border-white/20 text-white/80 rounded-2xl font-medium hover:bg-white/5 transition-all"
                >
                  View Plans →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Example Prompts (before chat starts) ===== */}
      {!chatStarted && (
        <section className="bg-gray-50 py-12 md:py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                Try asking...
              </h2>
              <p className="text-gray-500 text-center mb-10">
                Pick a prompt or type your own question below
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleExamplePrompt(p.text)}
                    className="group text-left p-5 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl mb-3 block">{p.icon}</span>
                    <span className="text-sm text-gray-700 leading-relaxed group-hover:text-purple-700 transition-colors">
                      {p.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Three-column Main Grid ===== */}
      <section className="bg-white">
        <div className="container-custom py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
            {/* Main chat area: 70% on desktop */}
            <div className="lg:col-span-7 min-w-0">
              <div className="mb-4">
                <MembershipStatusBar />
              </div>

              {showExhaustedBanner && (
                <div className="mb-4">
                  <UsageExhaustedBanner onDismiss={() => setShowExhaustedBanner(false)} />
                </div>
              )}

              <div
                className={
                  chatStarted
                    ? "bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                    : "bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                }
              >
                <AIChat
                  externalPrompt={externalPrompt}
                  onExternalPromptConsumed={() => setExternalPrompt(null)}
                />
              </div>
            </div>

            {/* Membership sidebar: 30% on desktop, sticky */}
            <aside className="lg:col-span-3 min-w-0">
              <div className="lg:sticky lg:top-20 space-y-4">
                <SubscriptionCard compact />

                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Why Pro?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">&#10003;</span>
                      <span>Up to 40 AI requests / month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">&#10003;</span>
                      <span>Save and export itineraries as PDF</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">&#10003;</span>
                      <span>Conversation history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">&#10003;</span>
                      <span>Premium customization</span>
                    </li>
                  </ul>
                  <a
                    href="/pricing"
                    className="mt-4 block w-full text-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    See all plans &#8594;
                  </a>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900 mb-1">Need human help?</p>
                  <p className="mb-3">Your account dashboard has billing history and invoice downloads.</p>
                  <a
                    href="/account"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Open account &#8594;
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== Subscription Cards (below chat) ===== */}
      {!chatStarted && (
        <section className="bg-white py-16 md:py-24 border-t border-gray-100">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                Choose Your Plan
              </h2>
              <p className="text-gray-500 text-center mb-12">
                Unlock more AI requests, save itineraries, and access premium features
              </p>
              <SubscriptionCard />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
