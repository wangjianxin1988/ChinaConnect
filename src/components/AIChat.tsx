/**
 * AIChat Component for ChinaConnect
 * Provides conversational AI travel planning interface
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { type ChinaConnectUserContext, createChinaConnectClient } from "../services/dify";

// ============================================
// Types
// ============================================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  citations?: Array<{ text: string; index: number; score: number }>;
}

interface Conversation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AIChatProps {
  userId?: string;
  language?: "en" | "zh" | "ja" | "ko";
  budgetLevel?: "budget" | "medium" | "luxury";
  travelStyle?: string[];
  theme?: "light" | "dark";
  onConversationStart?: (conversationId: string) => void;
  onConversationEnd?: (conversationId: string) => void;
}

interface WorkflowProgress {
  step: number;
  stepName: string;
  progress: number;
}

// ============================================
// Constants
// ============================================

const QUICK_PROMPTS = {
  en: [
    {
      label: "🏰 Beijing in 5 days",
      prompt:
        "I want to explore Beijing for 5 days, interested in imperial history and modern culture",
    },
    {
      label: "🌆 Shanghai Weekend",
      prompt: "Planning a 3-day weekend trip to Shanghai, first time visitor",
    },
    {
      label: "🍜 Food Tour",
      prompt: "I am a foodie, recommend the best food destinations in China",
    },
    {
      label: "🏔️ Zhangjiajie Adventure",
      prompt: "Looking for nature and adventure, 7 days in Zhangjiajie and surrounding areas",
    },
  ],
  zh: [
    { label: "🏰 北京5日游", prompt: "我想去北京玩5天，对历史文化和现代景观感兴趣" },
    { label: "🌆 上海周末", prompt: "计划周末去上海3天，第一次来中国" },
    { label: "🍜 美食之旅", prompt: "我是美食爱好者，推荐中国美食目的地" },
    { label: "🏔️ 张家界冒险", prompt: "想看自然风光，张家界及周边7天行程" },
  ],
  ja: [
    { label: "🏰 北京5日間", prompt: "北京を5日間観光したい、皇帝の歴史と現代文化に興味がある" },
    { label: "🌆 上海週末", prompt: "上海への3日間の旅行を計画、初めて中国に来る" },
  ],
  ko: [
    {
      label: "🏰 베이징 5일",
      prompt: "베이징에서 5일 동안 관광하고 싶어요, 제국의 역사与现代 문화에 관심",
    },
    { label: "🌆 상하이 주말", prompt: "상하이 3일 여행을 계획 중, 첫 중국 방문" },
  ],
};

const WORKFLOW_STEPS = [
  "Intent Recognition",
  "Parameter Extraction",
  "City Matching",
  "Route Generation",
  "Content Enrichment",
  "Practical Info",
  "Formatting",
  "Saving",
];

// ============================================
// Styles
// ============================================

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    maxHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  header: {
    padding: "16px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "18px",
    fontWeight: 600,
    color: "#1e293b",
  },
  headerBadge: {
    padding: "4px 10px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
  },
  conversationList: {
    width: "280px",
    borderRight: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    overflowY: "auto" as const,
  },
  conversationItem: {
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s",
  },
  conversationItemActive: {
    backgroundColor: "#eff6ff",
    borderLeft: "3px solid #3b82f6",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: "14px 18px",
    borderRadius: "16px",
    lineHeight: 1.6,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    color: "#1e293b",
    borderBottomLeftRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  inputArea: {
    padding: "16px 20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #e2e8f0",
  },
  inputWrapper: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textArea: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    lineHeight: 1.5,
    resize: "none" as const,
    minHeight: "48px",
    maxHeight: "120px",
    fontFamily: "inherit",
  },
  sendButton: {
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  quickPrompts: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  quickPromptButton: {
    padding: "8px 14px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  progressBar: {
    padding: "12px 20px",
    backgroundColor: "#eff6ff",
    borderBottom: "1px solid #dbeafe",
  },
  progressSteps: {
    display: "flex",
    gap: "8px",
    overflowX: "auto" as const,
    paddingBottom: "8px",
  },
  progressStep: {
    padding: "6px 12px",
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    fontSize: "12px",
    whiteSpace: "nowrap" as const,
    color: "#64748b",
  },
  progressStepActive: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderColor: "#3b82f6",
  },
  progressStepComplete: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    borderColor: "#86efac",
  },
  typingIndicator: {
    display: "flex",
    gap: "4px",
    padding: "8px 0",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#94a3b8",
    borderRadius: "50%",
  },
  savedIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    borderRadius: "8px",
    fontSize: "13px",
  },
};

// ============================================
// Components
// ============================================

const TypingIndicator: React.FC = () => (
  <div style={styles.typingIndicator}>
    <div style={{ ...styles.typingDot, animation: "bounce 1.4s infinite ease-in-out" }} />
    <div style={{ ...styles.typingDot, animation: "bounce 1.4s infinite ease-in-out 0.2s" }} />
    <div style={{ ...styles.typingDot, animation: "bounce 1.4s infinite ease-in-out 0.4s" }} />
  </div>
);

const WorkflowProgressBar: React.FC<{ progress: WorkflowProgress | null }> = ({ progress }) => {
  if (!progress) return null;

  return (
    <div style={styles.progressBar}>
      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
        AI Processing: Step {progress.step} of 8 - {progress.stepName}
      </div>
      <div style={styles.progressSteps}>
        {WORKFLOW_STEPS.map((step, index) => {
          let stepStyle = { ...styles.progressStep };
          if (index + 1 < progress.step) {
            stepStyle = { ...stepStyle, ...styles.progressStepComplete };
          } else if (index + 1 === progress.step) {
            stepStyle = { ...stepStyle, ...styles.progressStepActive };
          }
          return (
            <div key={step} style={stepStyle}>
              {index + 1}. {step}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: Message;
  onCitationClick?: (citation: string) => void;
}> = ({ message, onCitationClick }) => {
  const isUser = message.role === "user";

  // Parse markdown-like formatting
  const formatContent = (content: string) => {
    // Basic markdown parsing
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} style={{ fontSize: "1.5em", fontWeight: 600, marginBottom: "0.5em" }}>
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={i}
            style={{ fontSize: "1.25em", fontWeight: 600, marginTop: "1em", marginBottom: "0.5em" }}
          >
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3
            key={i}
            style={{
              fontSize: "1.1em",
              fontWeight: 600,
              marginTop: "0.8em",
              marginBottom: "0.3em",
            }}
          >
            {line.slice(4)}
          </h3>
        );
      }

      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Italic
      line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
      // Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li
            key={i}
            style={{ marginLeft: "1.5em" }}
            dangerouslySetInnerHTML={{ __html: line.slice(2) }}
          />
        );
      }
      if (/^\d+\./.test(line)) {
        return (
          <li
            key={i}
            style={{ marginLeft: "1.5em" }}
            dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, "") }}
          />
        );
      }

      // Tables (basic support)
      if (line.includes("|") && line.trim().startsWith("|")) {
        // Skip table formatting for now
        return null;
      }

      // Checkboxes
      if (line.includes("- [ ]") || line.includes("- [x]")) {
        const checked = line.includes("[x]");
        const text = line.replace(/- \[[ x]\] /, "");
        return (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "1em" }}
          >
            <input
              type="checkbox"
              checked={checked}
              readOnly
              style={{ width: "16px", height: "16px" }}
            />
            <span dangerouslySetInnerHTML={{ __html: text }} />
          </div>
        );
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={i} style={{ marginBottom: "0.5em" }} dangerouslySetInnerHTML={{ __html: line }} />
        );
      }

      return <br key={i} />;
    });
  };

  return (
    <div
      style={{
        ...styles.messageBubble,
        ...(isUser ? styles.userMessage : styles.assistantMessage),
      }}
    >
      {message.isStreaming && <TypingIndicator />}
      <div>{formatContent(message.content)}</div>
      {message.citations && message.citations.length > 0 && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>Sources:</div>
          {message.citations.map((citation, i) => (
            <button
              key={i}
              onClick={() => onCitationClick?.(citation.text)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "#3b82f6",
                cursor: "pointer",
                fontSize: "12px",
                textDecoration: "underline",
              }}
            >
              [{i + 1}] {citation.text.slice(0, 100)}...
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const QuickPrompts: React.FC<{
  language: string;
  onSelect: (prompt: string) => void;
}> = ({ language, onSelect }) => {
  const prompts = QUICK_PROMPTS[language as keyof typeof QUICK_PROMPTS] || QUICK_PROMPTS.en;

  return (
    <div style={styles.quickPrompts}>
      {prompts.map((item, i) => (
        <button
          key={i}
          style={styles.quickPromptButton}
          onClick={() => onSelect(item.prompt)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#eff6ff";
            e.currentTarget.style.borderColor = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

// ============================================
// Main Component
// ============================================

export const AIChat: React.FC<AIChatProps> = ({
  userId,
  language = "en",
  budgetLevel = "medium",
  travelStyle = [],
  theme = "light",
  onConversationStart,
  onConversationEnd,
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);
  const [showConversationList, setShowConversationList] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const clientRef = useRef<ReturnType<typeof createChinaConnectClient> | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current = createChinaConnectClient();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build user context
  const userContext: ChinaConnectUserContext = {
    userId: userId || `user_${Date.now()}`,
    language,
    budgetLevel,
    travelStyle,
  };

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setWorkflowProgress({ step: 0, stepName: "Starting...", progress: 0 });

      const assistantMessageId = `assistant_${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        if (!clientRef.current) {
          throw new Error("Dify client not initialized");
        }

        let fullResponse = "";

        await clientRef.current.planTravel(
          {
            message: content,
            context: userContext,
            conversationId: conversationId || undefined,
          },
          (text, isComplete) => {
            fullResponse = text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: text, isStreaming: !isComplete }
                  : msg,
              ),
            );

            // Update workflow progress based on content
            if (text.includes(" itinerary") || text.includes("行程")) {
              setWorkflowProgress({ step: 4, stepName: "Route Generation", progress: 50 });
            }
            if (text.includes("Practical") || text.includes("实用信息")) {
              setWorkflowProgress({ step: 6, stepName: "Practical Info", progress: 75 });
            }
          },
        );

        // Update conversation ID if new
        // Note: In real implementation, extract from response
        setConversationId((prev) => {
          if (!prev) {
            const newId = `conv_${Date.now()}`;
            onConversationStart?.(newId);
            return newId;
          }
          return prev;
        });

        setWorkflowProgress({ step: 8, stepName: "Complete", progress: 100 });

        // Clear progress after delay
        setTimeout(() => setWorkflowProgress(null), 2000);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  isStreaming: false,
                }
              : msg,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading, userContext, onConversationStart],
  );

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Load conversation
  const loadConversation = (conv: Conversation) => {
    setConversationId(conv.id);
    setMessages([]); // In real implementation, fetch messages
    setShowConversationList(false);
  };

  // Start new conversation
  const startNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setShowConversationList(false);
    onConversationEnd?.(conversationId || "");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span>🇨🇳</span>
          <span>ChinaConnect AI</span>
          <span style={styles.headerBadge}>Beta</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowConversationList(!showConversationList)}
            style={{
              padding: "8px 12px",
              backgroundColor: "#f1f5f9",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            💬 History
          </button>
          <button
            onClick={startNewConversation}
            style={{
              padding: "8px 12px",
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Workflow Progress */}
      <WorkflowProgressBar progress={workflowProgress} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Conversation List Sidebar */}
        {showConversationList && (
          <div style={styles.conversationList}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <input
                type="text"
                placeholder="Search conversations..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              />
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  style={{
                    ...styles.conversationItem,
                    ...(conv.id === conversationId ? styles.conversationItemActive : {}),
                  }}
                  onClick={() => loadConversation(conv)}
                >
                  <div style={{ fontWeight: 500, marginBottom: "4px" }}>{conv.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {conv.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {/* Messages */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  gap: "16px",
                }}
              >
                <div style={{ fontSize: "48px" }}>🌏</div>
                <div style={{ fontSize: "18px", fontWeight: 500, color: "#1e293b" }}>
                  Where do you want to go in China?
                </div>
                <div style={{ fontSize: "14px", textAlign: "center", maxWidth: "400px" }}>
                  I can help you plan your perfect trip, from visa requirements to daily
                  itineraries.
                  <br />
                  Try one of the quick prompts below or tell me about your dream trip!
                </div>
              </div>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCitationClick={(text) => console.log("Citation clicked:", text)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && <QuickPrompts language={language} onSelect={sendMessage} />}

          {/* Input Area */}
          <div style={styles.inputArea}>
            <div style={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me about your China trip plans..."
                style={styles.textArea}
                rows={1}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                style={{
                  ...styles.sendButton,
                  opacity: !inputValue.trim() || isLoading ? 0.5 : 1,
                  cursor: !inputValue.trim() || isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
              AI responses are for reference only. Always verify practical information locally.
            </div>
          </div>
        </div>
      </div>

      {/* CSS for typing animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default AIChat;
