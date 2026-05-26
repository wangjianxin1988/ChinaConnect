/**
 * useAIConversation Hook with MiniMax AI Integration
 * Manages AI conversation state with ReAct engine, tools, memory and MiniMax API
 */

import { cities } from "@/data/cities";
import { getAnySearch } from "@/lib/ai/anysearch";
import { ShortTermMemoryStore, getLongTermMemory } from "@/lib/ai/memory";
import { ReActEngine } from "@/lib/ai/react-engine";
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
} from "@/services/minimax";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
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

  // Engine instances
  const engineRef = useRef<ReActEngine | null>(null);
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
    engineRef.current = new ReActEngine();
    shortTermMemoryRef.current = new ShortTermMemoryStore();

    // Initialize MiniMax client
    const apiKey = import.meta.env.MINIMAX_API_KEY;
    if (apiKey) {
      miniMaxClientRef.current = new MiniMaxClient(apiKey);
      setIsMiniMaxAvailable(true);
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
- Suggest timing and estimated costs in CNY`;

      const conversationMessages: MiniMaxMessage[] = [
        { role: "system", content: systemPrompt },
        ...conversationMessagesRef.current,
        { role: "user", content: userMessage },
      ];

      await client.chatStream(
        conversationMessages,
        (text, isComplete) => {
          if (!isComplete) {
            onChunk(text);
          } else {
            onComplete();
          }
        },
        (error) => {
          console.error("MiniMax error:", error);
        },
      );
    },
    [language, budgetLevel],
  );

  // ============================================
  // Main Send Message
  // ============================================

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

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

        // 3. Try MiniMax first, fall back to ReAct
        let responseText = "";

        if (isMiniMaxAvailable && miniMaxClientRef.current) {
          try {
            // Use MiniMax AI
            await getMiniMaxResponse(
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

            // Get final response from MiniMax
            const fullResponse = conversationMessagesRef.current
              .filter((m) => m.role === "assistant")
              .map((m) => m.content)
              .join("");

            responseText =
              fullResponse || messages.find((m) => m.id === assistantMsg.id)?.content || "";
          } catch (miniMaxError) {
            console.warn("MiniMax failed, falling back to ReAct:", miniMaxError);
            // Fall back to ReAct engine
            const engine = engineRef.current!;
            const result = await engine.execute(content, language, (progress) => {
              setWorkflowProgress(progress);
            });
            responseText = result.response;
          }
        } else {
          // Use ReAct engine directly
          const engine = engineRef.current!;

          // Enrich with web search if available
          let enrichedQuery = content;
          if (isMCPAvailable || anySearchRef.current.isMCPAvailable()) {
            try {
              const enrichment = await anySearchRef.current.enrichWithWebData(content);
              if (enrichment) {
                enrichedQuery = content + enrichment;
              }
            } catch {
              // Continue without enrichment
            }
          }

          const result = await engine.execute(enrichedQuery, language, (progress) => {
            setWorkflowProgress(progress);
          });
          responseText = result.response;
        }

        // Simulate streaming effect for ReAct response if too fast
        const duration = Date.now() - startTime;
        if (duration < 500 && responseText) {
          const chunkSize = Math.max(5, Math.floor(responseText.length / 20));
          for (let i = chunkSize; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(0, i);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: chunk } : m)),
            );
            await new Promise((resolve) => setTimeout(resolve, 20));
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
        conversationMessagesRef.current.push({ role: "assistant", content: responseText });

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
      isMCPAvailable,
      isMiniMaxAvailable,
      getMiniMaxResponse,
      budgetLevel,
      messages.length,
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
  };
}
