/**
 * useAIConversation Hook with MiniMax AI Integration
 * Manages AI conversation state with tools, memory and MiniMax API
 */

import { cities } from "@/data/cities";
import { getAnySearch } from "@/lib/ai/anysearch";
import { ShortTermMemoryStore, getLongTermMemory } from "@/lib/ai/memory";
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
import { checkUsageLimit, incrementUsage, getRemainingRequests as getRemainingAIRequests } from "@/lib/usage-tracker";

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
  // State
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

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  refreshUsage: () => void;
  saveCurrentItinerary: (name: string) => SavedItinerary | null;
  loadItinerary: (id: string) => void;
  deleteItinerary: (id: string) => void;
  loadConversation: (id: string) => void;
  exportItinerary: (format: "text" | "json") => string;
  shareItinerary: (id: string) => string;
  getShareLink: (shareCode: string) => string;

  // Quick actions
  generateQuickResponse: (type: string) => Promise<void>;
}

interface ConversationState {
  conversationId: string;
}

// ============================================
// Hook Implementation
// ============================================

export function useAIConversation(options: UseAIConversationOptions = {}): UseAIConversationReturn {
  const { language = "en", budgetLevel = "medium", autoSave = true, maxMessages = 100 } = options;

  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<SavedItinerary | null>(null);
  const [isMCPAvailable, setIsMCPAvailable] = useState(false);
  const [isMiniMaxAvailable, setIsMiniMaxAvailable] = useState(false);
  const [usageExceeded, setUsageExceeded] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(getRemainingAIRequests());

  // Client instances
  const miniMaxClientRef = useRef<MiniMaxClient | null>(null);
  const shortTermMemoryRef = useRef<ShortTermMemoryStore | null>(null);
  const longTermMemoryRef = useRef(getLongTermMemory());
  const anySearchRef = useRef(getAnySearch());
  const conversationStateRef = useRef<ConversationState>({
    conversationId: `conv_${Date.now()}`,
  });
  const conversationMessagesRef = useRef<MiniMaxMessage[]>([]);

  // Initialize on mount
  useEffect(() => {
    shortTermMemoryRef.current = new ShortTermMemoryStore();

    // Initialize MiniMax client
    const apiKey = import.meta.env.PUBLIC_MINIMAX_API_KEY;
    const baseUrl = import.meta.env.PUBLIC_MINIMAX_BASE_URL || "https://api.minimax.chat/v1";
    if (apiKey) {
      miniMaxClientRef.current = new MiniMaxClient(apiKey, baseUrl);
      // Verify API connectivity with a lightweight health check
      fetch(`${baseUrl}/models`, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(8000),
      })
        .then((res) => {
          setIsMiniMaxAvailable(res.ok || res.status === 401 || res.status === 403);
        })
        .catch(() => {
          // If fetch fails but key exists, assume available (network may be fine for chat)
          setIsMiniMaxAvailable(true);
        });
    }

    // Load saved data
    const longTerm = longTermMemoryRef.current;
    setSavedItineraries(longTerm.getItineraries());
    setConversationHistory(longTerm.getConversationHistory());

    // Check MCP availability
    anySearchRef.current.initialize().then(() => {
      setIsMCPAvailable(anySearchRef.current.isMCPAvailable());
    });

    // Subscribe to long-term memory changes
    const unsubscribe = longTerm.subscribe(() => {
      setSavedItineraries(longTermMemoryRef.current.getItineraries());
      setConversationHistory(longTermMemoryRef.current.getConversationHistory());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // ============================================
  // Usage Tracking
  // ============================================

  const refreshUsage = useCallback(() => {
    const limit = checkUsageLimit();
    setUsageExceeded(!limit.allowed);
    setRemainingRequests(limit.remaining);
  }, []);

  // ============================================
  // Message Handling
  // ============================================

  const addMessage = useCallback(
    (message: Omit<Message, "id" | "timestamp">): Message => {
      const newMessage: Message = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, newMessage];
        if (updated.length > maxMessages) {
          return updated.slice(-maxMessages);
        }
        return updated;
      });

      // Add to short-term memory
      shortTermMemoryRef.current?.addMessage(newMessage);

      return newMessage;
    },
    [maxMessages],
  );

  // ============================================
  // MiniMax AI Response
  // ============================================

  const getMiniMaxResponse = useCallback(
    async (userMessage: string, onChunk: (text: string) => void, onComplete: () => void) => {
      const client = miniMaxClientRef.current;
      if (!client) {
        throw new Error("MiniMax client not initialized");
      }

      // Build conversation messages with system prompt
      const systemPrompt = `${TRAVEL_PLANNING_SYSTEM}

${CITY_CONTEXT}

Current user context:
- Language: ${language}
- Budget level: ${budgetLevel}
- Travel style preferences noted in conversation

Remember:
- Always respond in the user's language
- Provide specific restaurant names, prices, and locations
- Include emergency numbers relevant to the city
- Suggest timing and estimated costs using ¥ symbol (never CNY)
- CRITICAL: If user specifies a number of days, generate EXACTLY that many days`;

      const conversationMessages: MiniMaxMessage[] = [
        { role: "system", content: systemPrompt },
        ...conversationMessagesRef.current,
        { role: "user", content: userMessage },
      ];

      // No throttle — send every chunk immediately for fastest streaming

      const finalCleanedResponse = await client.chatStream(
        conversationMessages,
        (text, isComplete) => {
          if (!isComplete) {
            onChunk(text);
          } else {
            // Always send final update
            onChunk(text);
            onComplete();
          }
        },
        (error) => {
          console.error("MiniMax error:", error);
        },
      );

      // Store the final cleaned response for later use
      return finalCleanedResponse;
    },
    [language, budgetLevel],
  );

  // ============================================
  // Main Send Message
  // ============================================

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Check usage limit before sending
      const usageLimit = checkUsageLimit();
      if (!usageLimit.allowed) {
        setUsageExceeded(true);
        addMessage({
          role: "assistant",
          content: language === "zh"
            ? "⚠️ 您本月的AI请求次数已用完。请升级您的套餐以继续使用AI助手。\n\n[查看定价方案](/pricing)"
            : "⚠️ You've used all your AI requests for this month. Please upgrade your plan to continue using the AI assistant.\n\n[View Pricing](/pricing)",
          isStreaming: false,
        });
        return;
      }

      setIsLoading(true);
      setWorkflowProgress(null);

      const startTime = Date.now();

      try {
        // 1. Add user message
        addMessage({
          role: "user",
          content: content.trim(),
        });

        // Add to MiniMax conversation history
        conversationMessagesRef.current.push({ role: "user", content: content.trim() });

        // 2. Create streaming assistant message
        const assistantMsg = addMessage({
          role: "assistant",
          content: "",
          isStreaming: true,
        });

        // 3. Use MiniMax AI
        let responseText = "";

        if (!miniMaxClientRef.current) {
          throw new Error("MiniMax client not initialized. Please set PUBLIC_MINIMAX_API_KEY.");
        }

        // Use MiniMax AI - get the final cleaned response
        const miniMaxResponse = await getMiniMaxResponse(
          content,
          (chunk) => {
            // Update streaming message
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: chunk } : m)),
            );
          },
          () => {
            // Complete
          },
        );

        // Use the cleaned response from MiniMax
        responseText = miniMaxResponse || '';

        // Double-clean any residual think/tool_call tags
        responseText = cleanModelResponse(responseText);

        // Simulate streaming effect with smooth typewriter for non-streaming responses
        const duration = Date.now() - startTime;
        if (duration < 800 && responseText) {
          // Split into word-aware chunks for natural typing feel
          const totalLen = responseText.length;
          const targetChunks = Math.min(20, Math.max(5, Math.floor(totalLen / 50)));
          const baseChunkSize = Math.floor(totalLen / targetChunks);
          let pos = 0;
          while (pos < totalLen) {
            // Try to break at word/sentence boundaries for natural feel
            let end = Math.min(pos + baseChunkSize + 5, totalLen);
            if (end < totalLen) {
              const breakChars = [' ', String.fromCharCode(10), '，', '。', ',', '.', '!', '?'];
              for (let b = end; b > pos + baseChunkSize - 5 && b < totalLen; b--) {
                if (breakChars.includes(responseText[b])) {
                  end = b + 1;
                  break;
                }
              }
            }
            pos = Math.min(end, totalLen);
            const chunk = responseText.slice(0, pos);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: chunk } : m)),
            );
            await new Promise((resolve) => setTimeout(resolve, 2));
          }
        }

        // 4. Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content: responseText,
                  isStreaming: false,
                }
              : m,
          ),
        );

        // Add assistant response to MiniMax conversation history
        conversationMessagesRef.current.push({ role: "assistant", content: cleanModelResponse(responseText) });

        // Increment usage count after successful AI response
        incrementUsage();
        refreshUsage();

        // 5. Parse itinerary from response text
        const destinationMatch = responseText.match(
          /(?:visit|go to|travel to|in|for)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
        );
        const daysMatch = responseText.match(/(\d+)\s*(?:day|days|天)/i);

        if (destinationMatch && daysMatch) {
          const dest = destinationMatch[1];
          const days = Number.parseInt(daysMatch[1]);
          const city = cities.find(
            (c) =>
              c.nameEn?.toLowerCase() === dest?.toLowerCase() ||
              c.name?.toLowerCase() === dest?.toLowerCase(),
          );

          if (city) {
            const itinerary: SavedItinerary = {
              id: `temp_${Date.now()}`,
              name: `${dest} ${days}-day trip`,
              destination: dest,
              days: days,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              data: {
                summary: {
                  destination: dest,
                  totalDays: days,
                  bestSeason: "Spring",
                  estimatedTotalCost:
                    budgetLevel === "luxury"
                      ? days * 1500
                      : budgetLevel === "medium"
                        ? days * 600
                        : days * 300,
                  currency: "CNY",
                  costBreakdown: { accommodation: 0, food: 0, transport: 0, attractions: 0 },
                  topHighlights: city.attractions?.slice(0, 5).map((a) => a.name) || [],
                  travelTips: [],
                },
                dailyItinerary: [],
              },
            };
            setCurrentItinerary(itinerary);
          }
        }

        // 6. Save conversation summary to long-term memory
        if (autoSave) {
          const summary: ConversationSummary = {
            id: conversationStateRef.current.conversationId,
            name: `Conversation ${new Date().toLocaleDateString()}`,
            createdAt: new Date().toISOString(),
            messageCount: messages.length + 2,
            hasItinerary: !!currentItinerary,
          };
          longTermMemoryRef.current.saveConversationSummary(summary);
        }
      } catch (error) {
        console.error("AI Conversation error:", error);

        // Add error message
        addMessage({
          role: "assistant",
          content:
            language === "zh"
              ? "抱歉，我遇到了一个错误。请稍后再试，或者换个方式描述您的需求。"
              : "Sorry, I encountered an error. Please try again or rephrase your request.",
          isStreaming: false,
        });
      } finally {
        setIsLoading(false);
        setWorkflowProgress(null);
      }
    },
    [
      isLoading,
      language,
      addMessage,
      autoSave,
      getMiniMaxResponse,
      budgetLevel,
      messages,
      currentItinerary,
    ],
  );

  // ============================================
  // Conversation Management
  // ============================================

  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentItinerary(null);
    setWorkflowProgress(null);
    shortTermMemoryRef.current?.reset();
    conversationMessagesRef.current = [];
    conversationStateRef.current = {
      conversationId: `conv_${Date.now()}`,
    };
  }, []);

  const loadConversation = useCallback(
    (id: string) => {
      const summary = conversationHistory.find((c) => c.id === id);
      if (summary) {
        conversationStateRef.current.conversationId = id;
        clearConversation();
      }
    },
    [conversationHistory, clearConversation],
  );

  // ============================================
  // Itinerary Management
  // ============================================

  const saveCurrentItinerary = useCallback(
    (name: string): SavedItinerary | null => {
      if (!currentItinerary) return null;

      const saved = longTermMemoryRef.current.saveItinerary({
        ...currentItinerary,
        name,
      });

      setCurrentItinerary(saved);
      return saved;
    },
    [currentItinerary],
  );

  const loadItinerary = useCallback((id: string) => {
    const loaded = longTermMemoryRef.current.getItineraryById(id);
    if (loaded) {
      setCurrentItinerary(loaded);
    }
  }, []);

  const deleteItinerary = useCallback(
    (id: string) => {
      longTermMemoryRef.current.deleteItinerary(id);
      if (currentItinerary?.id === id) {
        setCurrentItinerary(null);
      }
    },
    [currentItinerary],
  );

  const exportItinerary = useCallback(
    (format: "text" | "json"): string => {
      if (!currentItinerary) return "";

      if (format === "json") {
        return JSON.stringify(currentItinerary, null, 2);
      }

      const lines: string[] = [];
      lines.push(`# ${currentItinerary.name}`);
      lines.push(`Destination: ${currentItinerary.destination}`);
      lines.push(`Duration: ${currentItinerary.days} days`);
      lines.push(`Created: ${new Date(currentItinerary.createdAt).toLocaleDateString()}`);
      lines.push("");
      lines.push("## Itinerary");
      lines.push(currentItinerary.data.summary.topHighlights.join(", "));
      lines.push("");
      lines.push("Generated by ChinaConnect AI");

      return lines.join("\n");
    },
    [currentItinerary],
  );

  const shareItinerary = useCallback((id: string): string => {
    const itinerary = longTermMemoryRef.current.getItineraryById(id);
    if (!itinerary) return "";

    const shareCode = itinerary.shareCode || Math.random().toString(36).slice(2, 8).toUpperCase();
    longTermMemoryRef.current.updateItinerary(id, { shareCode });

    return shareCode;
  }, []);

  const getShareLink = useCallback((shareCode: string): string => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/ai?share=${shareCode}`;
  }, []);

  // ============================================
  // Quick Actions
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
      if (message) {
        await sendMessage(message);
      }
    },
    [sendMessage],
  );

  // ============================================
  // Return Hook Value
  // ============================================

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
    sendMessage,
    clearConversation,
    saveCurrentItinerary,
    loadItinerary,
    deleteItinerary,
    loadConversation,
    exportItinerary,
    shareItinerary,
    getShareLink,
    generateQuickResponse,
    refreshUsage,
  };
}
