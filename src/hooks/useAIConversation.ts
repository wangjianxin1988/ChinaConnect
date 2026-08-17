/**
 * useAIConversation Hook
 *
 * Talks to the Supabase Edge Function `chat` (which runs MiniMax + tools + usage tracking).
 * Conversation history is persisted in `public.ai_conversations` / `public.ai_messages`,
 * keyed by the authenticated user. Sidebar summaries come from the same table.
 *
 * Removed: long-term localStorage memory, client-side tool execution (now server-side).
 */

import { getAnySearch } from "@/lib/ai/anysearch";
import { ALL_TOOL_DEFINITIONS } from "@/lib/ai/tools";
import type {
  ConversationSummary,
  Message,
  SavedItinerary,
  WorkflowProgress,
} from "@/lib/ai/types";
import {
  CITY_CONTEXT,
  MiniMaxClient,
  type MiniMaxMessage,
  TRAVEL_PLANNING_SYSTEM,
  cleanModelResponse,
} from "@/services/minimax";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  bumpLocalCount,
  canMakeRequest,
  checkUsageLimit,
  fetchUsageFromServer,
  getRemainingRequests as getRemainingAIRequests,
} from "@/lib/usage-tracker";
import { supabase } from "@/supabase/config";
import type { AiChatLang } from "@/components/ai/chat-labels";
import { saveRoute } from "@/lib/ai/route-saver";
import {
  buildSavedItineraryFromConversation,
  extractedRouteToSavedItinerary,
  routeRowToSavedItinerary,
  savedItineraryToExtractedRoute,
} from "@/lib/ai/itinerary-builder";

// ============================================
// Hook Types
// ============================================

export interface UseAIConversationOptions {
  language?: AiChatLang;
  budgetLevel?: "budget" | "medium" | "luxury";
  userId?: string;
  autoSave?: boolean;
  maxMessages?: number;
}

export interface UseAIConversationReturn {
  messages: Message[];
  isLoading: boolean;
  workflowProgress: WorkflowProgress | null;
  savedItineraries: SavedItinerary[];
  conversationHistory: ConversationSummary[];
  currentItinerary: SavedItinerary | null;
  isMCPAvailable: boolean;
  isMiniMaxAvailable: boolean;
  usageExceeded: boolean;
  remainingRequests: number;
  isAuthenticated: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  refreshUsage: () => Promise<void>;
  saveCurrentItinerary: (name: string) => Promise<SavedItinerary | null>;
  loadItinerary: (id: string) => void;
  loadSavedItineraries: () => Promise<void>;
  deleteItinerary: (id: string) => void;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  createNewConversation: () => void;
  exportItinerary: (format: "text" | "json") => string;
  shareItinerary: (id: string) => string;
  getShareLink: (shareCode: string) => string;
  generateQuickResponse: (type: string) => Promise<void>;
}

// ============================================
// Helpers
// ============================================

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function dbMessageToMessage(row: {
  id: string;
  role: string;
  content: string;
  created_at: string;
}): Message {
  return {
    id: row.id,
    role: row.role as Message["role"],
    content: row.content,
    timestamp: new Date(row.created_at),
  };
}

function dbConversationToSummary(row: {
  id: string;
  title: string | null;
  summary: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}): ConversationSummary {
  return {
    id: row.id,
    name: row.title || row.summary || "New conversation",
    createdAt: row.created_at,
    messageCount: row.message_count ?? 0,
    hasItinerary: false,
  };
}

// ============================================
// Hook
// ============================================

export function useAIConversation(options: UseAIConversationOptions = {}): UseAIConversationReturn {
  const {
    language = "en",
    budgetLevel = "medium",
    autoSave: _autoSave = true,
    maxMessages = 100,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<SavedItinerary | null>(null);
  const [isMCPAvailable, setIsMCPAvailable] = useState(false);
  const [isMiniMaxAvailable, setIsMiniMaxAvailable] = useState(true);
  const [usageExceeded, setUsageExceeded] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(getRemainingAIRequests());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const miniMaxClientRef = useRef<MiniMaxClient | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const anySearchRef = useRef(getAnySearch());

  // Initialize MiniMax client
  useEffect(() => {
    miniMaxClientRef.current = new MiniMaxClient("");
  }, []);

  // Resolve auth state, refresh usage, and load conversation history
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      setIsAuthenticated(!!userData?.user);

      if (userData?.user) {
        await refreshUsage();
        await loadConversationHistory();
        await loadSavedItineraries();
      } else {
        setConversationHistory([]);
        setSavedItineraries([]);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        refreshUsage();
        loadConversationHistory();
        loadSavedItineraries();
      } else {
        setConversationHistory([]);
        setSavedItineraries([]);
        setMessages([]);
        conversationIdRef.current = null;
      }
    });

    // Check MCP availability
    anySearchRef.current.initialize().then(() => {
      if (!cancelled) setIsMCPAvailable(anySearchRef.current.isMCPAvailable());
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ============================================
  // Conversation history (server-backed)
  // ============================================

  const loadConversationHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, summary, message_count, last_message_at, created_at, updated_at")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(50);
    if (error) {
      console.warn("Failed to load conversations:", error);
      return;
    }
    setConversationHistory((data ?? []).map(dbConversationToSummary));
  }, []);

  const loadConversationMessages = useCallback(
    async (conversationId: string) => {
      const { data, error } = await supabase
        .from("ai_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(maxMessages);
      if (error) {
        console.warn("Failed to load messages:", error);
        setMessages([]);
        return;
      }
      setMessages((data ?? []).map(dbMessageToMessage));
    },
    [maxMessages],
  );

  const createConversation = useCallback(async (firstUserText: string): Promise<string | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;
    const title = firstUserText.length > 60 ? `${firstUserText.slice(0, 57)}...` : firstUserText;
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: userData.user.id,
        title,
        message_count: 0,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) {
      console.warn("Failed to create conversation:", error);
      return null;
    }
    return data.id;
  }, []);

  // ============================================
  // Usage refresh
  // ============================================

  const refreshUsage = useCallback(async () => {
    const usage = await fetchUsageFromServer();
    if (usage) {
      const limit = {
        allowed: usage.count < usage.max,
        remaining: Math.max(0, usage.max - usage.count),
        max: usage.max,
      };
      setUsageExceeded(!limit.allowed);
      setRemainingRequests(limit.remaining);
    } else {
      // Fallback to local cache so the UI is never blank
      const local = checkUsageLimit();
      setUsageExceeded(!local.allowed);
      setRemainingRequests(local.remaining);
    }
  }, []);

  // ============================================
  // sendMessage — the core action
  // ============================================

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isLoading) return;

      const userMsg: Message = {
        id: uuid(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const client = miniMaxClientRef.current ?? new MiniMaxClient("");
        miniMaxClientRef.current = client;

        // Build MiniMax messages
        const mmMessages: MiniMaxMessage[] = [
          { role: "system", content: TRAVEL_PLANNING_SYSTEM + "\n\n" + CITY_CONTEXT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ];

        // Resolve conversation id (create new one if needed)
        let conversationId = conversationIdRef.current;
        if (!conversationId) {
          conversationId = await createConversation(text);
          conversationIdRef.current = conversationId;
        }

        // Streaming assistant placeholder
        const assistantId = uuid();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
          },
        ]);

        const fullResponse = await client.chatStream({
          messages: mmMessages,
          tools: ALL_TOOL_DEFINITIONS,
          language,
          conversationId: conversationId ?? undefined,
          onChunk: (partial) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
            );
          },
          onComplete: (finalText) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: finalText, isStreaming: false } : m,
              ),
            );
            const fullConversation: Message[] = [
              ...messages,
              userMsg,
              { id: assistantId, role: "assistant", content: finalText, timestamp: new Date() },
            ];
            const built = buildSavedItineraryFromConversation(fullConversation);
            if (built) setCurrentItinerary(built);
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: cleanModelResponse(err.message || "Error"),
                      isStreaming: false,
                    }
                  : m,
              ),
            );
          },
        });

        // Bump local usage count (Edge Function has already incremented server-side)
        bumpLocalCount();
        await refreshUsage();
        await loadConversationHistory();

        void fullResponse;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setMessages((prev) => [
          ...prev,
          {
            id: uuid(),
            role: "assistant",
            content:
              msg.includes("usage_exceeded") || msg.includes("reached")
                ? msg
                : `Sorry, I encountered an error: ${msg}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        setWorkflowProgress(null);
      }
    },
    [isLoading, messages, language, createConversation, refreshUsage, loadConversationHistory],
  );

  // ============================================
  // Conversation management
  // ============================================

  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentItinerary(null);
    setWorkflowProgress(null);
    conversationIdRef.current = null;
  }, []);

  const loadConversation = useCallback(
    async (id: string) => {
      conversationIdRef.current = id;
      await loadConversationMessages(id);
    },
    [loadConversationMessages],
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      await supabase.from("ai_conversations").delete().eq("id", id);
      if (conversationIdRef.current === id) {
        clearConversation();
      }
      await loadConversationHistory();
    },
    [loadConversationHistory, clearConversation],
  );

  const createNewConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  // ============================================
  // ============================================
  // Itinerary management (real: ai_routes + localStorage)
  // ============================================

  const loadSavedItineraries = useCallback(async () => {
    const merged: SavedItinerary[] = [];

    // localStorage routes (offline-first cache written by route-saver)
    try {
      const raw = localStorage.getItem("cc_ai_saved_routes");
      if (raw) {
        const local = JSON.parse(raw) as Array<Record<string, unknown>>;
        for (const r of local) {
          const route = r as unknown as {
            id?: string;
            destination?: string;
            titleZh?: string;
            title?: string;
            days?: number;
            createdAt?: string;
            dailyPlans?: Array<Record<string, unknown>>;
            totalEstimatedCost?: number;
            currency?: string;
            highlights?: string[];
            tips?: string[];
          };
          if (!route.destination && !route.dailyPlans) continue;
          const it = extractedRouteToSavedItinerary(route as never);
          if (route.id) it.id = route.id;
          if (route.createdAt) it.createdAt = route.createdAt;
          if (!merged.some((m) => m.id === it.id)) merged.push(it);
        }
      }
    } catch {
      // ignore malformed cache
    }

    // Supabase ai_routes for the current user
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data, error } = await supabase
        .from("ai_routes")
        .select(
          "id, title, title_zh, summary, summary_zh, days, route_data, created_at, updated_at",
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) {
        for (const row of data) {
          const it = routeRowToSavedItinerary(row as never);
          if (!merged.some((m) => m.id === it.id)) merged.push(it);
        }
      }
    }

    setSavedItineraries(merged);
  }, []);

  const saveCurrentItinerary = useCallback(
    async (name: string): Promise<SavedItinerary | null> => {
      if (!currentItinerary) return null;
      const updated: SavedItinerary = { ...currentItinerary, name };

      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && !currentItinerary.id.startsWith("local_")) {
        // Already persisted -> rename in ai_routes
        try {
          await supabase
            .from("ai_routes")
            .update({ title: name, title_zh: name })
            .eq("id", currentItinerary.id);
        } catch (err) {
          console.warn("[useAIConversation] rename route failed:", err);
        }
      } else if (userData?.user) {
        // New route -> persist via route-saver
        const route = savedItineraryToExtractedRoute(updated);
        try {
          const result = await saveRoute(userData.user.id, conversationIdRef.current ?? "", route);
          if (result.routeId) updated.id = result.routeId;
        } catch (err) {
          console.warn("[useAIConversation] save route failed:", err);
        }
      }

      setCurrentItinerary(updated);
      await loadSavedItineraries();
      return updated;
    },
    [currentItinerary, loadSavedItineraries],
  );

  const loadItinerary = useCallback(
    async (id: string) => {
      const found = savedItineraries.find((it) => it.id === id);
      if (found) {
        setCurrentItinerary(found);
        return;
      }
      // Fall back to ai_routes by id
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data } = await supabase
          .from("ai_routes")
          .select(
            "id, title, title_zh, summary, summary_zh, days, route_data, created_at, updated_at",
          )
          .eq("id", id)
          .single();
        if (data) {
          setCurrentItinerary(routeRowToSavedItinerary(data as never));
        }
      }
    },
    [savedItineraries],
  );

  const deleteItinerary = useCallback(
    async (id: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && !id.startsWith("local_")) {
        await supabase.from("ai_routes").delete().eq("id", id).eq("user_id", userData.user.id);
      }
      try {
        const raw = localStorage.getItem("cc_ai_saved_routes");
        if (raw) {
          const routes = JSON.parse(raw) as Array<{ id: string }>;
          localStorage.setItem(
            "cc_ai_saved_routes",
            JSON.stringify(routes.filter((r) => r.id !== id)),
          );
        }
      } catch {
        // ignore
      }
      if (currentItinerary?.id === id) setCurrentItinerary(null);
      await loadSavedItineraries();
    },
    [currentItinerary, loadSavedItineraries],
  );

  const exportItinerary = useCallback(
    (format: "text" | "json"): string => {
      if (!currentItinerary) return "";
      if (format === "json") return JSON.stringify(currentItinerary, null, 2);
      const lines: string[] = [];
      lines.push(`# ${currentItinerary.name}`);
      lines.push(`Destination: ${currentItinerary.destination}`);
      lines.push(`Duration: ${currentItinerary.days} days`);
      lines.push("");
      lines.push("Generated by ChinaConnect AI");
      return lines.join("\n");
    },
    [currentItinerary],
  );

  const shareItinerary = useCallback((id: string): string => {
    void id;
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }, []);

  const getShareLink = useCallback((shareCode: string): string => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/ai?share=${shareCode}`;
  }, []);

  // ============================================
  // Quick actions
  // ============================================

  const generateQuickResponse = useCallback(
    async (type: string) => {
      const quickMessages: Record<string, string> = {
        beijing_5days:
          "I want to explore Beijing for 5 days, interested in imperial history and modern culture",
        shanghai_3days: "Planning a 3-day weekend trip to Shanghai, first time visitor",
        food_tour: "I am a foodie, recommend the best food destinations in China",
        nature_7days: "Looking for nature and adventure, Zhangjiajie or Guilin for 7 days",
      };
      const message = quickMessages[type];
      if (message) await sendMessage(message);
    },
    [sendMessage],
  );

  return {
    messages,
    isLoading,
    workflowProgress,
    savedItineraries,
    conversationHistory,
    currentItinerary,
    isMCPAvailable,
    isMiniMaxAvailable,
    usageExceeded,
    remainingRequests,
    isAuthenticated,
    sendMessage,
    clearConversation,
    refreshUsage,
    saveCurrentItinerary,
    loadItinerary,
    deleteItinerary,
    loadSavedItineraries,
    loadConversation,
    deleteConversation,
    createNewConversation,
    exportItinerary,
    shareItinerary,
    getShareLink,
    generateQuickResponse,
  };
}
