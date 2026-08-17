/**
 * AIChatPage Component — Authenticated layout with conversation sidebar.
 *
 * Layout (responsive):
 *   Mobile:        [auth gate]        [hero]        [chat]
 *   Desktop:
 *     [sidebar | chat (max width) | membership]
 *
 * Sidebar (left):
 *   - "New chat" button
 *   - List of past conversations (loaded from Supabase `ai_conversations`)
 *   - Click to switch; trash icon to delete
 *
 * Auth gate:
 *   - Unauthenticated visitors see a sign-in card blocking the chat.
 *   - The hint card explains why (monthly usage needs login).
 */

import type { Message, SavedItinerary } from "@/lib/ai/types";
import React, { useState, useCallback, useEffect } from "react";
import { AIChat } from "./ai/AIChat";
import { SubscriptionCard } from "./subscription/SubscriptionCard";
import { MembershipStatusBar } from "./subscription/MembershipStatusBar";
import { UsageExhaustedBanner } from "./subscription/UsageExhaustedBanner";
import { signInWithEmail, signInWithOAuth, signUpWithEmail } from "@/services/auth";
import { supabase } from "@/supabase/config";
import { useTranslation } from "@/i18n/useTranslation";
import { translations as allTranslations } from "@/i18n/translations";
import { useAIConversation } from "@/hooks/useAIConversation";

// ============================================
// i18n helpers
// ============================================
type AiT = (key: string, fallback?: string) => string;
function buildAiT(tLang: ReturnType<typeof useTranslation>["t"]): AiT {
  const en = (allTranslations.en.aiPage || {}) as Record<string, unknown>;
  const cur = (tLang.aiPage || {}) as Record<string, unknown>;
  return (key: string, fallback?: string) => {
    const v = cur[key];
    if (typeof v === "string") return v;
    const e = en[key];
    if (typeof e === "string") return e;
    return fallback ?? "";
  };
}

// ============================================
// Constants
// ============================================

const FALLBACK_PROMPTS = [
  { icon: "🏯", text: "Plan a 5-day Beijing trip with imperial history and modern culture" },
  { icon: "🍜", text: "Best local street food in Chengdu that tourists usually miss" },
  { icon: "🚄", text: "How to travel from Shanghai to Xi'an by high-speed rail?" },
  { icon: "💳", text: "Can I use Apple Pay in China? What payment apps do I need?" },
  { icon: "🏨", text: "Recommend boutique hotels in Hangzhou near West Lake" },
  { icon: "🤝", text: "Business etiquette tips for meeting Chinese partners" },
];

// ============================================
// Auth gate
// ============================================

function AuthGate() {
  const { t } = useTranslation();
  const aiT = buildAiT(t);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res =
        mode === "signin"
          ? await signInWithEmail(email, password)
          : await signUpWithEmail({ email, password, displayName: email.split("@")[0] });
      if (res.error) {
        setError(res.error.message || aiT("authFailed", "Authentication failed"));
      } else if (mode === "signup" && !res.session) {
        setError(aiT("checkEmailConfirm", "Check your email to confirm your account."));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    setError(null);
    setBusy(true);
    try {
      const res = await signInWithOAuth(provider);
      if (res.error) setError(res.error.message || `OAuth ${provider} failed`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === "signin" ? aiT("authGateTitle") : aiT("authGateSignupTitle")}
        </h2>
        <p className="text-sm text-gray-600 mb-6">{aiT("authGateDescription")}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => oauth("google")}
            disabled={busy}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {aiT("googleButton")}
          </button>
          <button
            type="button"
            onClick={() => oauth("github")}
            disabled={busy}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {aiT("githubButton")}
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">{aiT("orContinueWith")}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={aiT("emailPlaceholder")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={aiT("passwordPlaceholder")}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {busy
              ? aiT("signInButton")
              : mode === "signin"
                ? aiT("signInButton")
                : aiT("signUpButton")}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          {mode === "signin" ? aiT("noAccountPrompt") : aiT("haveAccountPrompt")}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-purple-600 hover:underline font-medium"
          >
            {mode === "signin" ? aiT("switchToSignUp") : aiT("switchToSignIn")}
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function AIChatPage() {
  const { t, lang } = useTranslation();
  const aiT = buildAiT(t);
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [_savedItinerary, _setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [showExhaustedBanner, setShowExhaustedBanner] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const {
    conversationHistory,
    sendMessage,
    usageExceeded,
    isAuthenticated,
    isLoading,
    messages,
    loadConversation,
    deleteConversation,
    createNewConversation,
    workflowProgress,
    savedItineraries,
    currentItinerary,
    isMiniMaxAvailable,
    remainingRequests,
    saveCurrentItinerary,
    loadItinerary,
    deleteItinerary,
    exportItinerary,
    shareItinerary,
    getShareLink,
    clearConversation,
  } = useAIConversation({ language: lang });

  // Re-show exhausted banner when usage runs out mid-chat
  useEffect(() => {
    if (usageExceeded && chatStarted) setShowExhaustedBanner(true);
  }, [usageExceeded, chatStarted]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      setActiveConversationId(id);
      await loadConversation(id);
      setChatStarted(true);
    },
    [loadConversation],
  );

  const handleNewConversation = useCallback(() => {
    createNewConversation();
    setActiveConversationId(null);
    setChatStarted(false);
  }, [createNewConversation]);

  const handleExamplePrompt = useCallback((prompt: string) => {
    setExternalPrompt(prompt);
    setChatStarted(true);
  }, []);

  // Public visitors can browse the AI page; sign-in is only required when they
  // actually start chatting. Redirect to the single unified login page.
  const handleStartChat = useCallback(() => {
    const currentLang =
      (window as unknown as { __I18N__?: { serverLang?: string } }).__I18N__?.serverLang || "en";
    const langPrefix = currentLang && currentLang !== "en" ? "/" + currentLang : "";
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = langPrefix + "/auth/login?next=" + next;
  }, []);

  // Public landing view: browseable without an account, no login wall.
  if (!isAuthenticated) {
    const featureCards = [
      {
        icon: "🗺",
        title: aiT("featItineraryTitle", "Custom Itineraries"),
        desc: aiT(
          "featItineraryDesc",
          "Day-by-day plans tailored to your city, budget and travel style.",
        ),
      },
      {
        icon: "🍜",
        title: aiT("featFoodTitle", "Food & Dining"),
        desc: aiT(
          "featFoodDesc",
          "Michelin, Black Pearl and local hidden gems you won’t find in guidebooks.",
        ),
      },
      {
        icon: "🏨",
        title: aiT("featHotelTitle", "Hotels in 3 Tiers"),
        desc: aiT(
          "featHotelDesc",
          "Budget, mid-range and luxury options side by side with nightly rates and booking links.",
        ),
      },
      {
        icon: "🚄",
        title: aiT("featTransportTitle", "Transport & Routes"),
        desc: aiT(
          "featTransportDesc",
          "Real-time train and flight options, metro routes, prices and booking links.",
        ),
      },
      {
        icon: "💳",
        title: aiT("featPayTitle", "Payments & Practical"),
        desc: aiT(
          "featPayDesc",
          "Alipay, WeChat Pay, SIM cards, visa rules and every practical detail.",
        ),
      },
      {
        icon: "🧭",
        title: aiT("featLocalTitle", "Local Know-How"),
        desc: aiT(
          "featLocalDesc",
          "Cultural etiquette, crowd levels, weather, emergency contacts and phrase translations.",
        ),
      },
    ];
    const powerItems = [
      {
        icon: "🎯",
        title: aiT("featPrefsTitle", "Personalized to You"),
        desc: aiT(
          "featPrefsDesc",
          "Tells you exactly what it needs: budget, travel style, transport, hotel type, group size, days and nationality.",
        ),
      },
      {
        icon: "📅",
        title: aiT("featPlanTitle", "Complete Day Plans"),
        desc: aiT(
          "featPlanDesc",
          "Hour-by-hour itinerary tables plus 3-tier hotels, meals, transport and a 3-level daily budget summary.",
        ),
      },
      {
        icon: "📡",
        title: aiT("featRealtimeTitle", "Based on Real-Time Data"),
        desc: aiT(
          "featRealtimeDesc",
          "Connects to live data sources so prices, routes, opening hours and crowd levels stay accurate and current.",
        ),
      },
      {
        icon: "🌐",
        title: aiT("featLangTitle", "Speaks Your Language"),
        desc: aiT(
          "featLangDesc",
          "Chat in English, 日本語, 한국어, 中文, ไทย, Tiếng Việt, Русский, Français, Deutsch, العربية, فارسی and more.",
        ),
      },
    ];
    const examplePrompts =
      t.aiPage?.prompts && t.aiPage.prompts.length > 0 ? t.aiPage.prompts : FALLBACK_PROMPTS;

    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="container-custom py-12 md:py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              {aiT("heroBadge", "Powered by Advanced AI")}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              {aiT("heroTitle", "ChinaGuide AI")}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {aiT(
                "heroSubtitle",
                "Your personal China travel intelligence — itineraries, local insights, and real-time guidance.",
              )}
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {aiT("powersTitle", "What ChinaGuide AI Can Do")}
          </h2>
          <p className="text-gray-500 text-center mb-8">
            {aiT("powersSubtitle", "Every answer is built on real, current China travel data.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-14">
            {featureCards.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {aiT("featuresTitle", "Why ChinaGuide AI")}
          </h2>
          <p className="text-gray-500 text-center mb-8">
            {aiT("featuresSubtitle", "A full China travel concierge — not just a chatbot.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-14">
            {powerItems.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="text-3xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-4">
              {aiT("tryExamplesTitle", "Try asking things like…")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examplePrompts.map((pr: { icon: string; text: string }, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={handleStartChat}
                  className="text-left flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-shadow"
                >
                  <span className="text-xl">{pr.icon}</span>
                  <span className="text-sm text-gray-700">{pr.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleStartChat}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              ✨ {aiT("startChatCta", "Start Chatting")}
            </button>
            <p className="text-sm text-gray-500 mt-3">
              {aiT("loginHint", "Sign in or create a free account to start chatting.")}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex">
      <div className="flex-1 min-w-0">
        {/* Hero (only when chat hasn't started) */}
        {!chatStarted && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950" />
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-48 -right-48 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[100px]" />
              <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[80px]" />
            </div>
            <div className="relative container-custom py-16 md:py-20">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/70 text-sm font-medium tracking-wide">
                    {aiT("heroBadge", "Powered by Advanced AI")}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  {aiT("heroTitle", "ChinaGuide AI")}
                </h1>
                <p className="text-lg md:text-xl text-white/60 mb-8 max-w-xl mx-auto">
                  {aiT(
                    "heroSubtitle",
                    "Your personal China travel intelligence â itineraries, local insights, and real-time guidance.",
                  )}
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById("ai-chat-input");
                    if (el) (el as HTMLTextAreaElement).focus();
                  }}
                  className="px-8 py-3.5 bg-white rounded-2xl font-bold text-gray-900 shadow-2xl hover:-translate-y-0.5 transition-all"
                  type="button"
                >
                  {aiT("startPlanningCTA", "Start Planning")} →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Example prompts before chat starts */}
        {!chatStarted && (
          <section className="bg-gray-50 py-12">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Try asking…</h2>
                <p className="text-gray-500 text-center mb-8">
                  {aiT("promptsSubtitle", "Pick a prompt or type your own below")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(t.aiPage?.prompts && t.aiPage.prompts.length > 0
                    ? t.aiPage.prompts
                    : FALLBACK_PROMPTS
                  ).map((p: { icon: string; text: string }, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleExamplePrompt(p.text)}
                      className="group text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                      type="button"
                    >
                      <span className="text-2xl mb-2 block">{p.icon}</span>
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

        {/* Chat area stretches edge-to-edge inside the right column. */}
        <section className="bg-white">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
            {/* Core panel: usage banner + chat. Always first so the AI surface
                remains the widest block across breakpoints. */}
            <div className="mb-3">
              <MembershipStatusBar language={lang} />
            </div>

            {showExhaustedBanner && (
              <div className="mb-3">
                <UsageExhaustedBanner
                  language={lang}
                  onDismiss={() => setShowExhaustedBanner(false)}
                />
              </div>
            )}

            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <AIChat
                language={lang}
                externalPrompt={externalPrompt}
                onExternalPromptConsumed={() => setExternalPrompt(null)}
                messages={messages}
                isLoading={isLoading}
                workflowProgress={workflowProgress}
                savedItineraries={savedItineraries}
                conversationHistory={conversationHistory}
                currentItinerary={currentItinerary}
                isMiniMaxAvailable={isMiniMaxAvailable}
                usageExceeded={usageExceeded}
                remainingRequests={remainingRequests}
                sendMessage={sendMessage}
                clearConversation={clearConversation}
                saveCurrentItinerary={saveCurrentItinerary}
                loadItinerary={loadItinerary}
                deleteItinerary={deleteItinerary}
                loadConversation={loadConversation}
                exportItinerary={exportItinerary}
                shareItinerary={shareItinerary}
                getShareLink={getShareLink}
                activeConversationId={activeConversationId}
                onConversationSelect={handleSelectConversation}
                onNewChat={handleNewConversation}
                onDeleteConversation={deleteConversation}
              />
            </div>

            {/* Secondary widgets ordered by importance: pricing first so
                unauthenticated visitors see the upgrade path after the chat. */}
            {!chatStarted && (
              <div className="mt-6">
                <SubscriptionCard language={lang} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// Suppress unused import lint warning while keeping the helper for future use
export const _supabaseClient = supabase;
export type { Message };
