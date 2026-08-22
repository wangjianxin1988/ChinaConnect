/**
 * AIChat Component - Full AI Conversation Interface
 * Safe rendering (no dangerouslySetInnerHTML), error boundary, AbortController,
 * message dedup, tool-call state display, structured itinerary display.
 */

import type {
  Message,
  ToolCall,
  WorkflowProgress,
  SavedItinerary,
  ConversationSummary,
} from "@/lib/ai/types";
import { CHAT_LABELS, type AiChatLang } from "./chat-labels";
import { getCurrentUser } from "@/lib/auth/supabase-auth";
import { getCurrentTier, TIER_LIMITS, type SubscriptionTier } from "@/lib/subscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import {
  accountT,
  localizedHref,
  toAccountLang,
  type AccountLang,
} from "@/components/account/account-strings";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { ItineraryDisplay } from "./ItineraryDisplay";
import { QuickPrompts } from "./QuickPrompts";
import ItineraryMap from "@/components/Map/ItineraryMap";

// ============================================
// Types
// ============================================

interface AIChatProps {
  language?: AiChatLang;
  theme?: "light" | "dark";
  showItinerary?: boolean;
  initialMessage?: string;
  externalPrompt?: string | null;
  onExternalPromptConsumed?: () => void;
  onConversationStart?: (id: string) => void;
  onConversationEnd?: (id: string) => void;
  // Controlled state + actions - owned by the parent's single useAIConversation instance
  messages: Message[];
  isLoading: boolean;
  workflowProgress: WorkflowProgress | null;
  savedItineraries: SavedItinerary[];
  conversationHistory: ConversationSummary[];
  currentItinerary: SavedItinerary | null;
  isMiniMaxAvailable: boolean;
  usageExceeded: boolean;
  remainingRequests: number;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  saveCurrentItinerary: (name: string) => Promise<SavedItinerary | null>;
  loadItinerary: (id: string) => void;
  deleteItinerary: (id: string) => void;
  loadConversation: (id: string) => Promise<void>;
  exportItinerary: (format: "text" | "json") => string;
  shareItinerary: (id: string) => string;
  getShareLink: (shareCode: string) => string;
  activeConversationId?: string | null;
  onConversationSelect?: (id: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
}

// ============================================
// Error Boundary
// ============================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ChatErrorBoundary extends Component<
  { children: ReactNode; language?: string },
  ErrorBoundaryState
> {
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
      const lang = toAccountLang(this.props.language || "en");
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {accountT(lang, "errorTitle")}
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md">
            {this.state.error?.message || accountT(lang, "errorDesc")}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {accountT(lang, "reloadPage")}
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
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/** Render inline markdown as React elements (no dangerouslySetInnerHTML) */
const renderInline = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  const elements: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`") && token.endsWith("`")) {
      elements.push(
        <code
          key={key++}
          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-red-600 font-mono"
        >
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
          <a
            key={key++}
            href={linkMatch[2]}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
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

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
};

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
                  <th
                    key={ci}
                    className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200"
                  >
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

  lines.forEach((line) => {
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
      elements.push(
        <h1 key={`h1-${key++}`} className="text-xl font-bold mb-2 text-gray-900">
          {renderInline(line.slice(2))}
        </h1>,
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${key++}`}
          className="text-lg font-semibold mt-4 mb-2 text-gray-800 border-b border-gray-100 pb-1"
        >
          {renderInline(line.slice(3))}
        </h2>,
      );
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${key++}`} className="text-base font-semibold mt-3 mb-1 text-gray-700">
          {renderInline(line.slice(4))}
        </h3>,
      );
      return;
    }
    if (/^[-*_]{3,}$/.test(line.trim())) {
      elements.push(<hr key={`hr-${key++}`} className="my-3 border-gray-200" />);
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={`li-${key++}`} className="ml-5 text-gray-600 list-disc leading-relaxed">
          {renderInline(line.slice(2))}
        </li>,
      );
      return;
    }
    if (/^\d+\./.test(line)) {
      elements.push(
        <li key={`oli-${key++}`} className="ml-5 text-gray-600 list-decimal leading-relaxed">
          {renderInline(line.replace(/^\d+\.\s*/, ""))}
        </li>,
      );
      return;
    }
    elements.push(
      <p key={`p-${key++}`} className="text-gray-700 leading-relaxed">
        {renderInline(line)}
      </p>,
    );
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
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
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
        <span className="text-xs font-medium text-blue-700">
          Step {progress.step}/8: {progress.stepName}
        </span>
        <span className="text-xs text-blue-600">{progress.progress}%</span>
      </div>
      <div className="flex gap-1">
        {steps.map((step) => {
          let cls = "bg-gray-200 text-gray-500";
          if (step.num < progress.step) cls = "bg-green-500 text-white";
          else if (step.num === progress.step) cls = "bg-blue-500 text-white";
          return (
            <div
              key={step.key}
              className={`h-1.5 flex-1 rounded-full transition-all ${cls}`}
              title={step.name}
            />
          );
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
  language?: string;
  showFirstUseNotice?: boolean;
}> = ({ message, onRetry, onCitationClick, language, showFirstUseNotice }) => {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;
  const isError =
    message.content.startsWith("⚠️") || message.content.startsWith("Sorry, I encountered");
  const LABELS = CHAT_LABELS[(language as AiChatLang) || "en"] || CHAT_LABELS.en;

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
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              🤖
            </div>
            <span className="text-xs font-medium text-gray-500">ChinaGuide AI</span>
          </div>
        )}

        <div
          className={`text-sm leading-relaxed ${isStreaming ? "streaming-text streaming-content" : ""}`}
        >
          <SafeMarkdown content={message.content} />
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && isStreaming && (
          <ToolCallIndicator toolCalls={message.toolCalls} />
        )}

        {isStreaming && (
          <div className="mt-2">
            {message.content ? (
              <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle streaming-cursor" />
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TypingDots color={isUser ? "bg-blue-300" : "bg-gray-400"} />
                  <span className="text-xs text-gray-400 animate-pulse">{LABELS.thinking}</span>
                </div>
                {showFirstUseNotice && (
                  <span className="text-xs text-amber-600 leading-relaxed max-w-[26rem]">
                    ⏳ {LABELS.firstUseNotice}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {isError && onRetry && !isUser && !isStreaming && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </button>
        )}

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

        <div
          className={`text-xs mt-1.5 ${isUser ? "text-blue-200" : isError ? "text-red-300" : "text-gray-400"} text-right`}
        >
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
  language?: AiChatLang;
}> = ({ conversations, onSelect, onClose, language = "en" }) => {
  const LABELS = CHAT_LABELS[language] || CHAT_LABELS.en;
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{LABELS.history}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{LABELS.noConversationsYet}</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelect(conv.id);
                onClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
            >
              <div className="font-medium text-gray-800 text-sm truncate">{conv.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : LABELS.justNow}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

export const AIChat: React.FC<AIChatProps> = ({
  language = "en",
  showItinerary = true,
  initialMessage,
  externalPrompt,
  onExternalPromptConsumed,
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
  activeConversationId,
  onConversationSelect,
  onNewChat,
  onDeleteConversation,
}) => {
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
  const [sidebarTab, setSidebarTab] = useState<"conversations" | "itineraries">("conversations");

  // Subscription tier enforcement state
  const [upgradePrompt, setUpgradePrompt] = useState<{
    isOpen: boolean;
    featureName: string;
    requiredTier: SubscriptionTier;
  }>({ isOpen: false, featureName: "", requiredTier: "explorer" });

  const LABELS = CHAT_LABELS[language] || CHAT_LABELS.en;
  const isZh = language === "zh-CN" || language === "zh-TW";
  const [currentTier, setCurrentTierState] = useState<SubscriptionTier>(getCurrentTier());

  // Keep the tier used for feature gating in sync with the authoritative
  // server value. The usage tracker updates localStorage + dispatches
  // ai-usage-updated after every server fetch, so a Business/Explorer grant
  // is reflected immediately instead of reading a stale localStorage hint.
  useEffect(() => {
    const refreshTier = () => setCurrentTierState(getCurrentTier());
    window.addEventListener("ai-usage-updated", refreshTier);
    window.addEventListener("storage", refreshTier);
    window.addEventListener("cc-auth-changed", refreshTier);
    return () => {
      window.removeEventListener("ai-usage-updated", refreshTier);
      window.removeEventListener("storage", refreshTier);
      window.removeEventListener("cc-auth-changed", refreshTier);
    };
  }, []);

  // Check tier for feature gating
  const checkTierForFeature = useCallback(
    (feature: string, requiredTier: SubscriptionTier): boolean => {
      const tierOrder: SubscriptionTier[] = ["free", "explorer", "traveler", "business"];
      const currentIdx = tierOrder.indexOf(currentTier);
      const requiredIdx = tierOrder.indexOf(requiredTier);
      if (currentIdx < requiredIdx) {
        setUpgradePrompt({ isOpen: true, featureName: feature, requiredTier });
        return false;
      }
      return true;
    },
    [currentTier],
  );

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

  // Export handler - enforce PDF export restriction (Traveler+)
  const handleExport = useCallback(
    async (format: "text" | "json" | "pdf") => {
      if (!checkTierForFeature("exportPDF", "traveler")) return;

      if (format === "pdf") {
        if (!currentItinerary) {
          alert(LABELS.noRouteData);
          return;
        }
        try {
          const { jsPDF } = await import("jspdf");
          const doc = new jsPDF({ unit: "pt", format: "a4" });
          const W = doc.internal.pageSize.getWidth();
          const M = 48;
          let y = 56;

          doc.setFillColor(37, 99, 235);
          doc.rect(0, 0, W, 92, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          doc.text("ChinaGuide AI", M, 46);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text("Travel Itinerary", W - M, 40, { align: "right" });
          doc.text(new Date().toLocaleDateString(), W - M, 56, { align: "right" });

          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(currentItinerary.name || "Travel Plan", M, 124);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `${currentItinerary.destination || ""}  ·  ${currentItinerary.days} day(s)`,
            M,
            140,
          );
          y = 168;

          const summary = currentItinerary.data?.summary;
          const writeLine = (text: string, size = 9, color: [number, number, number] = [71, 85, 105], indent = 0) => {
            doc.setFontSize(size);
            doc.setTextColor(color[0], color[1], color[2]);
            const maxWidth = W - M * 2 - indent;
            const lines = doc.splitTextToSize(text, maxWidth) as string[];
            for (const ln of lines) {
              if (y > 760) {
                doc.addPage();
                y = 56;
              }
              doc.text(ln, M + indent, y);
              y += size + 6;
            }
          };

          if (summary?.topHighlights && summary.topHighlights.length > 0) {
            doc.setFont("helvetica", "bold");
            writeLine("TOP HIGHLIGHTS", 10, [37, 99, 235]);
            doc.setFont("helvetica", "normal");
            summary.topHighlights.slice(0, 8).forEach((h) => writeLine(`•  ${h}`, 9.5));
            y += 10;
          }

          const daily = currentItinerary.data?.dailyItinerary || [];
          if (daily.length > 0) {
            daily.forEach((day) => {
              doc.setFont("helvetica", "bold");
              writeLine(`Day ${day.day}${day.theme ? " — " + day.theme : ""}`, 11, [30, 64, 175]);
              doc.setFont("helvetica", "normal");
              (day.locations || []).forEach((loc) => {
                writeLine(`•  ${loc.name}${loc.durationHours ? ` (${loc.durationHours}h)` : ""}`, 9.5);
                (loc.highlights || []).slice(0, 3).forEach((h) => writeLine(`      ${h}`, 8.5, [148, 163, 184]));
              });
              const meals = [day.meals?.breakfast, day.meals?.lunch, day.meals?.dinner].filter(Boolean) as Array<{ name?: string }>;
              if (meals.length > 0) {
                writeLine(`Meals: ${meals.map((m) => m.name || "").join("  |  ")}`, 9);
              }
              if (day.transportToAttractions?.route) {
                writeLine(`Transport: ${day.transportToAttractions.route}`, 9);
              }
              if (day.notes && day.notes.length > 0) {
                day.notes.slice(0, 6).forEach((n) => writeLine(n, 8.5, [100, 116, 139]));
              }
              y += 6;
            });
          } else if (currentItinerary.data?.rawPlan) {
            doc.setFont("helvetica", "bold");
            writeLine("PLAN DETAILS", 10, [37, 99, 235]);
            doc.setFont("helvetica", "normal");
            currentItinerary.data.rawPlan
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean)
              .slice(0, 60)
              .forEach((l) => writeLine(l, 9));
          }

          doc.setFontSize(9);
          doc.setTextColor(148, 163, 184);
          doc.text("Generated by ChinaGuide AI — chinaengage.org", M, 800);
          doc.save(`chinaconnect-itinerary-${Date.now()}.pdf`);
          return;
        } catch (err) {
          console.error("PDF export failed", err);
          alert("PDF export failed. Please try again.");
          return;
        }
      }

      const content = exportItinerary(format);
      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chinaconnect-itinerary-${Date.now()}.${format === "json" ? "json" : "txt"}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [exportItinerary, checkTierForFeature, currentItinerary],
  );

  // Cancel in-flight request
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return (
    <ChatErrorBoundary language={language}>
      <div className="flex h-full bg-gray-50">
        {/* Sidebar - Conversations + Itineraries (single panel, tabbed) */}
        {showItinerary && (
          <div className="chat-sidebar w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden hidden md:flex">
            <div className="flex border-b border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setSidebarTab("conversations")}
                className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                  sidebarTab === "conversations"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {LABELS.conversations}
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("itineraries")}
                className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
                  sidebarTab === "itineraries"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {LABELS.itineraries}
              </button>
            </div>

            {sidebarTab === "conversations" ? (
              <div className="flex-1 overflow-y-auto">
                {onNewChat && (
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={onNewChat}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      {LABELS.newChatButton}
                    </button>
                  </div>
                )}
                {conversationHistory.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8 px-4">
                    {LABELS.noConversationsYet}
                  </p>
                ) : (
                  conversationHistory.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center border-b border-gray-50 ${
                        activeConversationId === conv.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onConversationSelect?.(conv.id)}
                        className="flex-1 text-left px-4 py-3 hover:bg-blue-50 transition-colors min-w-0"
                      >
                        <div className="font-medium text-gray-800 text-sm truncate">
                          {conv.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {conv.createdAt
                            ? new Date(conv.createdAt).toLocaleDateString()
                            : LABELS.justNow}
                        </div>
                      </button>
                      {onDeleteConversation && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(LABELS.deleteConfirm)) onDeleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-opacity shrink-0"
                          title={LABELS.deleteTitle}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">{LABELS.savedItineraries}</h3>
                  </div>
                  {savedItineraries.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8 px-4">
                      {LABELS.noSavedItineraries}
                    </p>
                  ) : (
                    savedItineraries.map((it) => (
                      <button
                        key={it.id}
                        onClick={() => loadItinerary(it.id)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition-colors ${
                          currentItinerary?.id === it.id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-gray-800 text-sm truncate">{it.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {it.destination} · {it.days} {LABELS.days}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {currentItinerary && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <ItineraryDisplay
                      itinerary={currentItinerary}
                      language={isZh ? "zh" : "en"}
                      compact
                      onSave={saveCurrentItinerary}
                      onExport={handleExport}
                      onShare={handleShare}
                      onDelete={
                        currentItinerary.id ? () => deleteItinerary(currentItinerary.id) : undefined
                      }
                    />
                  </div>
                )}
              </>
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
                <h2 className="font-semibold text-gray-800">ChinaGuide AI</h2>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 ${isMiniMaxAvailable ? "text-green-600" : "text-gray-400"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isMiniMaxAvailable ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                    />
                    {isMiniMaxAvailable ? LABELS.mcpOnline : LABELS.mcpOffline}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`p-2 rounded-lg transition-colors ${showMap ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"}`}
                title={LABELS.map}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>
              {/* Save Route Button - Task 1: Check tier (Explorer+ required) */}
              {currentItinerary && (
                <button
                  onClick={async () => {
                    if (!checkTierForFeature("saveItineraries", "explorer")) return;

                    const user = await getCurrentUser();
                    if (!user) {
                      alert(LABELS.signInToSave);
                      return;
                    }
                    const saved = await saveCurrentItinerary(
                      currentItinerary.name || "Travel Plan",
                    );
                    if (saved) {
                      alert(LABELS.routeSaved);
                    } else {
                      alert(LABELS.noRouteData);
                    }
                  }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  title={LABELS.saveRoute}
                >
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              )}
              {/* History Button - Task 3: Check tier (Explorer+ required) */}
              <button
                onClick={() => {
                  if (!checkTierForFeature("conversationHistory", "explorer")) return;
                  setShowHistory(!showHistory);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={LABELS.history}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <button
                onClick={clearConversation}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={LABELS.newChat}
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Workflow Progress */}
          {workflowProgress && <WorkflowProgressBar progress={workflowProgress} />}

          {/* History Sidebar (overlay) */}
          {showHistory && (
            <ConversationHistory
              conversations={conversationHistory.map((c) => ({
                id: c.id,
                name: c.name,
                updatedAt: c.createdAt,
              }))}
              onSelect={loadConversation}
              onClose={() => setShowHistory(false)}
              language={language}
            />
          )}

          {/* Map View */}
          {showMap &&
            currentItinerary?.data?.dailyItinerary &&
            (() => {
              const locations = currentItinerary.data.dailyItinerary.flatMap((day) =>
                (day.locations || [])
                  .map((loc, i) => ({
                    name: loc.name,
                    nameZh: loc.nameZh,
                    lat: loc.coordinates?.lat || 0,
                    lng: loc.coordinates?.lng || 0,
                    day: day.day,
                    order: i + 1,
                    time: loc.bestTimeStart,
                    activity: loc.highlights?.[0],
                    cost: loc.ticketInfo?.price,
                  }))
                  .filter((loc) => loc.lat !== 0 && loc.lng !== 0),
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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{LABELS.whereToGo}</h3>
                <p className="text-gray-500 max-w-md mb-4">{LABELS.intro}</p>
                <div className="w-full max-w-md mb-8 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
                  ⏳ {LABELS.firstUseNotice}
                </div>
                <div className="w-full max-w-md">
                  <QuickPrompts
                    language={isZh ? "zh" : "en"}
                    onSelect={sendMessage}
                    variant="expanded"
                  />
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    language={language}
                    showFirstUseNotice={messages.length === 1}
                    onRetry={
                      message.content.startsWith("⚠️") ||
                      message.content.startsWith("Sorry, I encountered")
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
              <QuickPrompts
                language={isZh ? "zh" : "en"}
                onSelect={sendMessage}
                variant="compact"
                showLabels={false}
              />
            </div>
          )}

          {/* Usage Display */}
          {!usageExceeded && remainingRequests !== -1 && (
            <div className="px-4 pb-1 shrink-0">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{LABELS.requestsRemaining.replace("{n}", String(remainingRequests))}</span>
                <a
                  href={localizedHref(language, "/pricing")}
                  className="text-blue-600 hover:underline"
                >
                  {LABELS.upgrade}
                </a>
              </div>
            </div>
          )}

          {/* Usage Exceeded Banner */}
          {usageExceeded && (
            <div className="px-4 pb-2 shrink-0">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="text-sm text-amber-800">{LABELS.monthlyLimitReached}</span>
                </div>
                <a
                  href={localizedHref(language, "/pricing")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {LABELS.upgradePlan} →
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
                placeholder={usageExceeded ? LABELS.upgradeToContinue : LABELS.placeholder}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${
                    inputValue.trim()
                      ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {LABELS.send}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">{LABELS.aiDisclaimer}</p>
          </div>
        </div>

        {/* Share Dialog */}
        {showShareDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowShareDialog(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 w-96 shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-4">{LABELS.shareItinerary}</h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">{LABELS.shareCode}</p>
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
                  {LABELS.close}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {LABELS.copyLink}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Prompt Modal */}
        <UpgradePrompt
          isOpen={upgradePrompt.isOpen}
          onClose={() => setUpgradePrompt((prev) => ({ ...prev, isOpen: false }))}
          currentTier={currentTier}
          requiredTier={upgradePrompt.requiredTier}
          featureName={upgradePrompt.featureName}
          language={language}
        />

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
