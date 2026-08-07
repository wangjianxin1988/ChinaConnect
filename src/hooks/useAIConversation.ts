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

// ============================================
// Hook Types
// ============================================

export interface UseAIConversationOptions {
  language?: "en" | "zh" | "ja" | "ko";
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
  saveCurrentItinerary: (name: string) => SavedItinerary | null;
  loadItinerary: (id: string) => void;
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
  const [savedItineraries] = useState<SavedItinerary[]>([]);
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
      } else {
        setConversationHistory([]);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        refreshUsage();
        loadConversationHistory();
      } else {
        setConversationHistory([]);
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
  // Itinerary management (kept from old API, local only)
  // ============================================

  const saveCurrentItinerary = useCallback(
    (name: string): SavedItinerary | null => {
      if (!currentItinerary) return null;
      const saved: SavedItinerary = { ...currentItinerary, name };
      setCurrentItinerary(saved);
      return saved;
    },
    [currentItinerary],
  );

  const loadItinerary = useCallback((id: string) => {
    // No local itinerary store; this is a stub for backward compatibility
    void id;
  }, []);

  const deleteItinerary = useCallback((id: string) => {
    void id;
  }, []);

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
    loadConversation,
    deleteConversation,
    createNewConversation,
    exportItinerary,
    shareItinerary,
    getShareLink,
    generateQuickResponse,
  };
}
