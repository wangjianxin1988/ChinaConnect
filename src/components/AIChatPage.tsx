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
import { useAIConversation } from "@/hooks/useAIConversation";

// ============================================
// Constants
// ============================================

const STATIC_PROMPTS = [
  { icon: "??", text: "Plan a 5-day Beijing trip with imperial history and modern culture" },
  { icon: "??", text: "Best local street food in Chengdu that tourists usually miss" },
  { icon: "??", text: "How to travel from Shanghai to Xi'an by high-speed rail?" },
  { icon: "??", text: "Can I use Apple Pay in China? What payment apps do I need?" },
  { icon: "??", text: "Recommend boutique hotels in Hangzhou near West Lake" },
  { icon: "??", text: "Business etiquette tips for meeting Chinese partners" },
];

// ============================================
// Auth gate
// ============================================

function AuthGate() {
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
        setError(res.error.message || "Authentication failed");
      } else if (mode === "signup" && !res.session) {
        setError("Check your email to confirm your account.");
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
          {mode === "signin" ? "Sign in to chat" : "Create your account"}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          AI Chat requires a free account so we can track your monthly usage and save your
          conversations.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => oauth("google")}
            disabled={busy}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => oauth("github")}
            disabled={busy}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          {mode === "signin" ? "No account yet? " : "Already have one? "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-purple-600 hover:underline font-medium"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================================
// Conversation sidebar
// ============================================

interface ConversationSidebarProps {
  conversations: { id: string; name: string; messageCount: number; createdAt: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  collapsed,
  onToggle,
}: ConversationSidebarProps) {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-30 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50"
        title="Show conversations"
        type="button"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
          title="Hide sidebar"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          type="button"
        >
          + New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No conversations yet</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className={`group flex items-center gap-1 rounded-lg ${
                    activeId === c.id ? "bg-purple-50" : "hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => onSelect(c.id)}
                    className="flex-1 text-left px-3 py-2 text-sm min-w-0"
                    type="button"
                  >
                    <p className="font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {c.messageCount} message{c.messageCount === 1 ? "" : "s"} ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this conversation?")) onDelete(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-opacity"
                    title="Delete"
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

// ============================================
// Main Component
// ============================================

export default function AIChatPage() {
  const [externalPrompt, setExternalPrompt] = useState<string | null>(null);
  const [_savedItinerary, _setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [chatStarted, setChatStarted] = useState(false);
  const [showExhaustedBanner, setShowExhaustedBanner] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  } = useAIConversation({ language: "en" });

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

  // Render the auth gate if not signed in
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="container-custom py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">ChinaGuide AI</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your personal China travel intelligence — itineraries, local insights, and real-time
              guidance.
            </p>
          </div>
          <AuthGate />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex">
      <ConversationSidebar
        conversations={conversationHistory}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={deleteConversation}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

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
                    Powered by Advanced AI
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                  ChinaGuide AI
                </h1>
                <p className="text-lg md:text-xl text-white/60 mb-8 max-w-xl mx-auto">
                  Your personal China travel intelligence — itineraries, local insights, and
                  real-time guidance.
                </p>
                <button
                  onClick={() => {
                    const el = document.getElementById("ai-chat-input");
                    if (el) (el as HTMLTextAreaElement).focus();
                  }}
                  className="px-8 py-3.5 bg-white rounded-2xl font-bold text-gray-900 shadow-2xl hover:-translate-y-0.5 transition-all"
                  type="button"
                >
                  Start Planning →
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
                  Pick a prompt or type your own below
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STATIC_PROMPTS.map((p, i) => (
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
              <MembershipStatusBar />
            </div>

            {showExhaustedBanner && (
              <div className="mb-3">
                <UsageExhaustedBanner onDismiss={() => setShowExhaustedBanner(false)} />
              </div>
            )}

            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <AIChat
                externalPrompt={externalPrompt}
                onExternalPromptConsumed={() => setExternalPrompt(null)}
              />
            </div>

            {/* Secondary widgets ordered by importance: pricing first so
                unauthenticated visitors see the upgrade path after the chat. */}
            {!chatStarted && (
              <div className="mt-6">
                <SubscriptionCard />
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
