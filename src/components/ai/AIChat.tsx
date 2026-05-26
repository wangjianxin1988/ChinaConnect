/**
 * AIChat Component - Full AI Conversation Interface
 * Integrates ReAct engine, tools, memory, and AnySearch
 */

import { useAIConversation } from "@/hooks/useAIConversation";
import type { Message, WorkflowProgress } from "@/lib/ai/types";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ItineraryDisplay } from "./ItineraryDisplay";
import { QuickPrompts } from "./QuickPrompts";

// ============================================
// Types
// ============================================

interface AIChatProps {
  language?: "en" | "zh" | "ja" | "ko";
  budgetLevel?: "budget" | "medium" | "luxury";
  theme?: "light" | "dark";
  showItinerary?: boolean;
  initialMessage?: string;
  onConversationStart?: (id: string) => void;
  onConversationEnd?: (id: string) => void;
}

interface TypingDotsProps {
  color?: string;
}

// ============================================
// Sub-components
// ============================================

const TypingDots: React.FC<TypingDotsProps> = ({ color = "bg-gray-400" }) => (
  <div className="flex gap-1.5 py-2">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`w-2 h-2 ${color} rounded-full animate-bounce`}
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.6s" }}
      />
    ))}
  </div>
);

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

const MessageBubble: React.FC<{
  message: Message;
  onCitationClick?: (text: string) => void;
}> = ({ message, onCitationClick }) => {
  const isUser = message.role === "user";
  const isStreaming = message.isStreaming;

  // Parse markdown-ish content
  const formatContent = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      if (!line.trim()) {
        elements.push(<br key={i} />);
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-xl font-bold mb-2 text-gray-900">
            {line.slice(2)}
          </h1>,
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-lg font-semibold mt-3 mb-1.5 text-gray-800">
            {line.slice(3)}
          </h2>,
        );
        return;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-base font-semibold mt-2 mb-1 text-gray-700">
            {line.slice(4)}
          </h3>,
        );
        return;
      }

      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>");

      // Unordered list
      if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li
            key={i}
            className="ml-4 text-gray-600"
            dangerouslySetInnerHTML={{ __html: processed.slice(2) }}
          />,
        );
        return;
      }

      // Ordered list
      if (/^\d+\./.test(line)) {
        elements.push(
          <li
            key={i}
            className="ml-4 text-gray-600 list-decimal"
            dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+\.\s*/, "") }}
          />,
        );
        return;
      }

      // Table (simple detection)
      if (line.includes("|") && line.trim().startsWith("|")) {
        // Skip table rendering for now
        return;
      }

      // Paragraph
      elements.push(
        <p
          key={i}
          className="text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processed }}
        />,
      );
    });

    return elements;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-gray-100">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs">
              🤖
            </div>
            <span className="text-xs font-medium text-gray-500">ChinaConnect AI</span>
          </div>
        )}

        {/* Content */}
        <div className="text-sm leading-relaxed">{formatContent(message.content)}</div>

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="mt-2">
            <TypingDots color={isUser ? "bg-blue-300" : "bg-gray-400"} />
          </div>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && !isUser && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Sources:</p>
            {message.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCitationClick?.(c.text)}
                className="text-xs text-blue-600 hover:underline block truncate max-w-full"
              >
                [{i + 1}] {c.text}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-gray-400"} text-right`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

const ConversationHistory: React.FC<{
  conversations: { id: string; name: string; updatedAt?: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
}> = ({ conversations, onSelect, onClose }) => (
  <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">History</h3>
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
        <p className="text-sm text-gray-400 text-center py-8">No conversations yet</p>
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
  theme = "light",
  showItinerary = true,
  initialMessage,
  onConversationStart,
  onConversationEnd,
}) => {
  // Hook
  const {
    messages,
    isLoading,
    workflowProgress,
    savedItineraries,
    conversationHistory,
    currentItinerary,
    isMCPAvailable,
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

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  // Send handler
  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue("");
    await sendMessage(text);
    inputRef.current?.focus();
  }, [inputValue, isLoading, sendMessage]);

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
    [exportItinerary],
  );

  // Load saved itinerary
  const handleLoadItinerary = useCallback(
    (id: string) => {
      loadItinerary(id);
      setShowHistory(false);
    },
    [loadItinerary],
  );

  // Labels
  const LABELS =
    language === "zh"
      ? {
          placeholder: "输入您的中国旅行问题...",
          send: "发送",
          history: "历史",
          newChat: "新建对话",
          savedItineraries: "已保存的行程",
          mcpOnline: "实时搜索已启用",
          mcpOffline: "离线模式",
        }
      : {
          placeholder: "Ask about your China trip...",
          send: "Send",
          history: "History",
          newChat: "New Chat",
          savedItineraries: "Saved Itineraries",
          mcpOnline: "Real-time search enabled",
          mcpOffline: "Offline mode",
        };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar - History or Itinerary */}
      {showItinerary && (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Saved Itineraries */}
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
                  onClick={() => handleLoadItinerary(it.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition-colors ${
                    currentItinerary?.id === it.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm truncate">{it.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {it.destination} · {it.days} days
                  </div>
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
                onDelete={
                  currentItinerary.id ? () => deleteItinerary(currentItinerary.id) : undefined
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇨🇳</span>
            <div>
              <h2 className="font-semibold text-gray-800">ChinaConnect AI</h2>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1 ${isMCPAvailable ? "text-green-600" : "text-gray-400"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isMCPAvailable ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                  />
                  {isMCPAvailable ? LABELS.mcpOnline : LABELS.mcpOffline}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
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

        {/* History Sidebar */}
        {showHistory && (
          <ConversationHistory
            conversations={conversationHistory.map((c) => ({
              id: c.id,
              name: c.name,
              updatedAt: c.createdAt,
            }))}
            onSelect={loadConversation}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                  onCitationClick={(text) => console.log("Citation:", text)}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Prompts (when has messages) */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 pb-2">
            <QuickPrompts
              language={language}
              onSelect={sendMessage}
              variant="compact"
              showLabels={false}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={LABELS.placeholder}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`px-6 py-3 rounded-xl font-medium text-white transition-all ${
                inputValue.trim() && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                </span>
              ) : (
                LABELS.send
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {language === "zh"
              ? "AI回复仅供参考，请以当地实际信息为准"
              : "AI responses are for reference only. Always verify locally."}
          </p>
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowShareDialog(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-96 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === "zh" ? "关闭" : "Close"}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === "zh" ? "复制链接" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bounce animation style */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AIChat;
