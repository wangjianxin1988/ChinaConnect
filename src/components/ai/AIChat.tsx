/**
 * AIChat Component - Full AI Conversation Interface
 * Safe rendering (no dangerouslySetInnerHTML), error boundary, AbortController,
 * message dedup, tool-call state display, structured itinerary display.
 */

import { useAIConversation } from "@/hooks/useAIConversation";
import type { Message, ToolCall, WorkflowProgress } from "@/lib/ai/types";
import { extractRouteFromConversation, saveRoute } from "@/lib/ai/route-saver";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import React, { useState, useRef, useEffect, useCallback, Component, type ReactNode, type ErrorInfo } from "react";
import { ItineraryDisplay } from "./ItineraryDisplay";
import { QuickPrompts } from "./QuickPrompts";
import ItineraryMap from "@/components/Map/ItineraryMap";

// ============================================
// Types
// ============================================

interface AIChatProps {
  language?: "en" | "zh" | "ja" | "ko";
  budgetLevel?: "budget" | "medium" | "luxury";
  theme?: "light" | "dark";
  showItinerary?: boolean;
  initialMessage?: string;
  externalPrompt?: string | null;
  onExternalPromptConsumed?: () => void;
  onConversationStart?: (id: string) => void;
  onConversationEnd?: (id: string) => void;
}

// ============================================
// Error Boundary
// ============================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ChatErrorBoundary extends Component<{ children: ReactNode; language?: string }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; language?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AIChat Error Boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      const isZh = this.props.language === "zh";
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isZh ? "出了点问题" : "Something went wrong"}
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            {this.state.error?.message || (isZh ? "发生了一个意外错误" : "An unexpected error occurred")}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {isZh ? "重新加载" : "Reload Page"}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================
// Safe Markdown Renderer
// ============================================

const escapeHtml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

/** Render inline markdown as React elements (no dangerouslySetInnerHTML) */
const renderInline = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  const elements: React.ReactNode[] = [];
  // Tokenize: links, code, bold, italic
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`") && token.endsWith("`")) {
      elements.push(
        <code key={key++} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-red-600 font-mono">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      elements.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      elements.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        elements.push(
          <a key={key++} href={linkMatch[2]} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>,
        );
      } else {
        elements.push(token);
      }
    } else {
      elements.push(token);
    }

    lastIndex = match.index + token.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
};

/** Safe markdown → React elements (replaces dangerouslySetInnerHTML) */
const SafeMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let key = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.filter((_, idx) => {
        if (idx === 1 && tableRows[idx].every((c) => /^[-:]+$/.test(c.trim()))) return false;
        return idx > 0;
      });

      elements.push(
        <div key={`table-${key++}`} className="overflow-x-auto my-3">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead>
              <tr className="bg-gray-50">
                {headerRow.map((cell, ci) => (
                  <th key={ci} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-600 border-b border-gray-100">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, i) => {
    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        inTable = true;
        tableRows.push(cells);
        return;
      }
      inTable = true;
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable();
    }

    if (!line.trim()) {
      elements.push(<div key={`br-${key++}`} className="h-2" />);
      return;
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={`h1-${key++}`} className="text-xl font-bold mb-2 text-gray-900">{renderInline(line.slice(2))}</h1>);
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={`h2-${key++}`} className="text-lg font-semibold mt-4 mb-2 text-gray-800 border-b border-gray-100 pb-1">{renderInline(line.slice(3))}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(<h3 key={`h3-${key++}`} className="text-base font-semibold mt-3 mb-1 text-gray-700">{renderInline(line.slice(4))}</h3>);
      return;
    }
    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={`hr-${key++}`} className="my-3 border-gray-200" />);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={`li-${key++}`} className="ml-5 text-gray-600 list-disc leading-relaxed">{renderInline(line.slice(2))}</li>);
      return;
    }
    if (/^\d+\./.test(line)) {
      elements.push(<li key={`oli-${key++}`} className="ml-5 text-gray-600 list-decimal leading-relaxed">{renderInline(line.replace(/^\d+\.\s*/, ""))}</li>);
      return;
    }
    elements.push(<p key={`p-${key++}`} className="text-gray-700 leading-relaxed">{renderInline(line)}</p>);
  });

  if (inTable) flushTable();

  return <>{elements}</>;
};

// ============================================
// Sub-components
// ============================================

const TypingDots: React.FC<{ color?: string }> = ({ color = "bg-gray-400" }) => (
  <div className="flex items-center gap-1.5 py-2 px-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`w-2 h-2 ${color} rounded-full`}
        style={{ animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite` }}
      />
    ))}
  </div>
);

const ToolCallIndicator: React.FC<{ toolCalls: ToolCall[] }> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) return null;
  const latest = toolCalls[toolCalls.length - 1];

  const toolLabels: Record<string, string> = {
    CitySearch: "Searching cities...",
    AttractionSearch: "Searching for attractions...",
    FoodSearch: "Finding restaurants...",
    HotelSearch: "Searching hotels...",
    TransportSearch: "Finding transport options...",
    WeatherSearch: "Checking weather...",
    WebSearch: "Searching the web...",
    anysearch: "Searching the web...",
    VisaCheck: "Checking visa requirements...",
    SaveItinerary: "Saving itinerary...",
    ExchangeRate: "Getting exchange rates...",
    RouteSearch: "Calculating routes...",
  };

  return (
    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5 mt-2">
      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{toolLabels[latest.name] || `Using ${latest.name}...`}</span>
    </div>
  );
};

const WorkflowProgressBar: React.FC<{ progress: WorkflowProgress }> = ({ progress }) => {
  const steps = [
    { num: 1, name: "Intent", key: "intent_recognition" },
    { num: 2, name: "Params", key: "parameter_extraction" },
    { num: 3, name: "City", key: "city_matching" },
    { num: 4, name: "Route", key: "route_generation" },
    { num: 5, name: "Enrich", key: "content_enrichment" },
    { num: 6, name: "Info", key: "practical_info" },
    { num: 7, name: "Format", key: "formatting" },
    { num: 8, name: "Save", key: "saving" },
  ];

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-blue-700">Step {progress.step}/8: {progress.stepName}</span>
        <span className="text-xs text-blue-600">{progress.progress}%</span>
      </div>
      <div className="flex gap-1">
        {steps.map((step) => {
          let cls = "bg-gray-200 text-gray-500";
          if (step.num < progress.step) cls = "bg-green-500 text-white";
          else if (step.num === progress.step) cls = "bg-blue-500 text-white";
          return <div key={step.key} className={`h-1.5 flex-1 rounded-full transition-all ${cls}`} title={step.name} />;
        })}
      </div>
    </div>
  );
};

// ============================================
// Message Bubble
// ============================================

const MessageBubble: React.FC<{
  message: Message;
  onRetry?: () => void;
  onCitationClick?: (text: string) => void;
}> = ({ message, onRetry, onCitationClick }) => {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const isError = message.content.startsWith("⚠️") || message.content.startsWith("Sorry, I encountered");

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} message-enter`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : isError
              ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">🤖</div>
            <span className="text-xs font-medium text-gray-500">ChinaConnect AI</span>
          </div>
        )}

        {/* Content — safe markdown */}
        <div className={`text-sm leading-relaxed ${isStreaming ? "streaming-text streaming-content" : ""}`}>
          <SafeMarkdown content={message.content} />
        </div>

        {/* Tool call indicators */}
        {message.toolCalls && message.toolCalls.length > 0 && isStreaming && (
          <ToolCallIndicator toolCalls={message.toolCalls} />
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mt-2">
            {message.content ? (
              <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle streaming-cursor" />
            ) : (
              <div className="flex items-center gap-2">
                <TypingDots color={isUser ? "bg-blue-300" : "bg-gray-400"} />
                <span className="text-xs text-gray-400 animate-pulse">Thinking...</span>
              </div>
            )}
          </div>
        )}

        {/* Error retry button */}
        {isError && onRetry && !isUser && !isStreaming && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && !isUser && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Sources:</p>
            {message.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCitationClick?.(c.text)}
                className="text-xs text-blue-600 hover:underline block truncate max-w-full text-left"
              >
                [{i + 1}] {c.text}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1.5 ${isUser ? "text-blue-200" : isError ? "text-red-300" : "text-gray-400"} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Conversation History Sidebar
// ============================================

const ConversationHistory: React.FC<{
  conversations: { id: string; name: string; updatedAt?: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
}> = ({ conversations, onSelect, onClose }) => (
  <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">History</h3>
      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No conversations yet</p>
      ) : (
        conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => { onSelect(conv.id); onClose(); }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
          >
            <div className="font-medium text-gray-800 text-sm truncate">{conv.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : "Just now"}
            </div>
          </button>
        ))
      )}
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

export const AIChat: React.FC<AIChatProps> = ({
  language = "en",
  budgetLevel = "medium",
  showItinerary = true,
  initialMessage,
  externalPrompt,
  onExternalPromptConsumed,
}) => {
  // Hook
  const {
    messages,
    isLoading,
    workflowProgress,
    savedItineraries,
    conversationHistory,
    currentItinerary,
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
  } = useAIConversation({ language, budgetLevel });

  // Local state
  const [inputValue, setInputValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [routeSaving, setRouteSaving] = useState(false);
  const [routeSaved, setRouteSaved] = useState(false);
  const [routeSaveError, setRouteSaveError] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll chat container
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial message (dedup: only fire once)
  const initialSentRef = useRef(false);
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  // Handle external prompt (from sidebar example chips)
  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      onExternalPromptConsumed?.();
    }
  }, [externalPrompt, onExternalPromptConsumed, sendMessage]);

  // Send handler with dedup
  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    // Dedup: prevent rapid double-send (within 500ms)
    const now = Date.now();
    if (now - lastSentAt < 500) return;
    setLastSentAt(now);

    setInputValue("");
    sendMessage(text);
    inputRef.current?.focus();
  }, [inputValue, isLoading, sendMessage, lastSentAt]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Retry last user message
  const handleRetry = useCallback(() => {
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  // Share handler
  const handleShare = useCallback(() => {
    if (!currentItinerary?.id) return;
    const code = shareItinerary(currentItinerary.id);
    setShareCode(code);
    setShowShareDialog(true);
  }, [currentItinerary, shareItinerary]);

  // Copy share link
  const handleCopyLink = useCallback(() => {
    const link = getShareLink(shareCode);
    navigator.clipboard.writeText(link).catch(console.error);
  }, [shareCode, getShareLink]);

  // Export handler
  const handleExport = useCallback(
    (format: "text" | "json") => {
      const content = exportItinerary(format);
      const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chinaconnect-itinerary-${Date.now()}.${format === "json" ? "json" : "txt"}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [exportItinerary],
  );

  // Cancel in-flight request
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Labels
  const LABELS =
    language === "zh"
      ? {
          placeholder: "输入您的中国旅行问题...",
          send: "发送",
          history: "历史",
          newChat: "新建对话",
          savedItineraries: "已保存的行程",
          mcpOnline: "AI 在线",
          mcpOffline: "AI 离线",
          cancel: "取消",
          thinking: "思考中...",
        }
      : {
          placeholder: "Ask about your China trip...",
          send: "Send",
          history: "History",
          newChat: "New Chat",
          savedItineraries: "Saved Itineraries",
          mcpOnline: "AI Online",
          mcpOffline: "AI Offline",
          cancel: "Cancel",
          thinking: "Thinking...",
        };

  return (
    <ChatErrorBoundary language={language}>
      <div className="flex h-full bg-gray-50">
        {/* Sidebar - Itinerary */}
        {showItinerary && (
          <div className="chat-sidebar w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden hidden md:flex">
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">{LABELS.savedItineraries}</h3>
              </div>
              {savedItineraries.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8 px-4">
                  {language === "zh" ? "还没有保存的行程" : "No saved itineraries yet"}
                </p>
              ) : (
                savedItineraries.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => loadItinerary(it.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition-colors ${
                      currentItinerary?.id === it.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="font-medium text-gray-800 text-sm truncate">{it.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{it.destination} · {it.days} days</div>
                  </button>
                ))
              )}
            </div>

            {/* Current Itinerary Preview */}
            {currentItinerary && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <ItineraryDisplay
                  itinerary={currentItinerary}
                  language={language}
                  compact
                  onSave={saveCurrentItinerary}
                  onExport={handleExport}
                  onShare={handleShare}
                  onDelete={currentItinerary.id ? () => deleteItinerary(currentItinerary.id) : undefined}
                />
              </div>
            )}
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇨🇳</span>
              <div>
                <h2 className="font-semibold text-gray-800">ChinaConnect AI</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 ${isMiniMaxAvailable ? "text-green-600" : "text-gray-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${isMiniMaxAvailable ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                    {isMiniMaxAvailable ? LABELS.mcpOnline : LABELS.mcpOffline}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 rounded-lg transition-colors ${showMap ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"}`}
                title={language === "zh" ? "地图" : "Map"}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
              {/* Save Route Button */}
              {currentItinerary && (
                <button
                  onClick={async () => {
                    const user = await getCurrentUser();
                    if (!user) {
                      alert('Please sign in to save routes.');
                      return;
                    }
                    const routeData = extractRouteFromConversation(messages, currentItinerary?.data);
                    if (!routeData) {
                      alert('No route data to save.');
                      return;
                    }
                    const result = await saveRoute(user.id, conversationStateRef.current.conversationId, routeData);
                    if (result.success) {
                      alert(result.error || 'Route saved successfully!');
                    } else {
                      alert('Failed to save route: ' + result.error);
                    }
                  }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  title="Save Route"
                >
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={LABELS.history}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={clearConversation}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={LABELS.newChat}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Workflow Progress */}
          {workflowProgress && <WorkflowProgressBar progress={workflowProgress} />}

          {/* History Sidebar (overlay) */}
          {showHistory && (
            <ConversationHistory
              conversations={conversationHistory.map((c) => ({ id: c.id, name: c.name, updatedAt: c.createdAt }))}
              onSelect={loadConversation}
              onClose={() => setShowHistory(false)}
            />
          )}

          {/* Map View */}
          {showMap && currentItinerary?.data?.dailyItinerary && (() => {
            const locations = currentItinerary.data.dailyItinerary.flatMap((day) =>
              (day.locations || []).map((loc, i) => ({
                name: loc.name,
                nameZh: loc.nameZh,
                lat: loc.coordinates?.lat || 0,
                lng: loc.coordinates?.lng || 0,
                day: day.day,
                order: i + 1,
                time: loc.bestTimeStart,
                activity: loc.highlights?.[0],
                cost: loc.ticketInfo?.price,
              })).filter(loc => loc.lat !== 0 && loc.lng !== 0)
            );
            if (locations.length === 0) return null;
            return (
              <div className="px-4 pt-3 shrink-0">
                <ItineraryMap
                  locations={locations}
                  height="280px"
                  className="rounded-xl overflow-hidden border border-gray-200"
                />
              </div>
            );
          })()}

          {/* Messages */}
          <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="text-5xl mb-4">🌏</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {language === "zh" ? "您想去中国的哪里？" : "Where do you want to go in China?"}
                </h3>
                <p className="text-gray-500 max-w-md mb-8">
                  {language === "zh"
                    ? "我可以帮您规划行程、推荐美食、解答生活问题。试试快捷提示或直接问我！"
                    : "I can help you plan itineraries, recommend restaurants, and answer life questions. Try quick prompts or just ask!"}
                </p>
                <div className="w-full max-w-md">
                  <QuickPrompts language={language} onSelect={sendMessage} variant="expanded" />
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onRetry={
                      message.content.startsWith("⚠️") || message.content.startsWith("Sorry, I encountered")
                        ? handleRetry
                        : undefined
                    }
                    onCitationClick={(text) => console.log("Citation:", text)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 pb-2 shrink-0">
              <QuickPrompts language={language} onSelect={sendMessage} variant="compact" showLabels={false} />
            </div>
          )}

          {/* Usage Display */}
          {!usageExceeded && remainingRequests !== -1 && (
            <div className="px-4 pb-1 shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {language === "zh" ? `本月剩余 ${remainingRequests} 次AI请求` : `${remainingRequests} AI requests remaining this month`}
                </span>
                <a href="/pricing" className="text-blue-600 hover:underline">
                  {language === "zh" ? "升级" : "Upgrade"}
                </a>
              </div>
            </div>
          )}

          {/* Usage Exceeded Banner */}
          {usageExceeded && (
            <div className="px-4 pb-2 shrink-0">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-sm text-amber-800">
                    {language === "zh" ? "本月AI请求次数已用完" : "AI requests limit reached for this month"}
                  </span>
                </div>
                <a href="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                  {language === "zh" ? "升级套餐" : "Upgrade Plan"} →
                </a>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4 shrink-0">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={usageExceeded ? (language === "zh" ? "请升级以继续使用AI助手..." : "Upgrade to continue using AI...") : LABELS.placeholder}
                rows={1}
                disabled={usageExceeded}
                className={`flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${usageExceeded ? "bg-gray-100 cursor-not-allowed" : ""}`}
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
              {isLoading ? (
                <button
                  onClick={handleCancel}
                  className="px-5 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-all text-sm"
                  title={LABELS.cancel}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${
                    inputValue.trim() ? "bg-blue-600 hover:bg-blue-700 active:scale-95" : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {LABELS.send}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {language === "zh" ? "AI回复仅供参考，请以当地实际信息为准" : "AI responses are for reference only. Always verify locally."}
            </p>
          </div>
        </div>

        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowShareDialog(false)}>
            <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-lg mb-4">
                {language === "zh" ? "分享行程" : "Share Itinerary"}
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Share Code:</p>
                <p className="font-mono text-lg font-bold text-blue-600">{shareCode}</p>
              </div>
              <input
                type="text"
                value={getShareLink(shareCode)}
                readOnly
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {language === "zh" ? "关闭" : "Close"}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {language === "zh" ? "复制链接" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Animation styles */}
        <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes streamText {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        @keyframes smoothReveal {
          0% { opacity: 0; filter: blur(2px); }
          100% { opacity: 1; filter: blur(0); }
        }
        .message-enter { animation: fadeIn 0.2s ease-out; }
        .streaming-cursor { animation: cursorBlink 0.6s ease-in-out infinite; }
        .streaming-text {
          animation: streamText 0.15s ease-out;
          transition: all 0.1s ease-out;
        }
        .streaming-content {
          animation: smoothReveal 0.2s ease-out;
          will-change: contents;
        }
        .streaming-content p,
        .streaming-content li,
        .streaming-content h1,
        .streaming-content h2,
        .streaming-content h3 {
          animation: fadeInUp 0.15s ease-out;
        }
        @media (max-width: 768px) {
          .chat-sidebar { display: none !important; }
        }
      `}</style>
      </div>
    </ChatErrorBoundary>
  );
};

export default AIChat;
