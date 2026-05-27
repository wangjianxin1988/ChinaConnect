/**
 * Claude Client for ChinaConnect
 * Anthropic's Claude LLM API integration
 */

import type { LLMMessage, LLMResponse, LLMStreamEvent } from "@/types/llm";

// ============================================
// Types
// ============================================

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text: string }>;
}

interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  temperature?: number;
  stream?: boolean;
  system?: string;
}

interface ClaudeStreamEvent {
  type: "content_block_delta" | "message_stop" | "error";
  index?: number;
  delta?: {
    type: string;
    text?: string;
  };
  content_block?: {
    type: string;
    text?: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: {
    type: string;
    message: string;
  };
}

// ============================================
// Claude Client
// ============================================

export class ClaudeClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private apiVersion: string;

  constructor(
    apiKey: string,
    baseUrl?: string,
    model = "claude-sonnet-4-20250514",
    apiVersion = "2023-06-01",
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://api.anthropic.com/v1";
    this.model = model;
    this.apiVersion = apiVersion;
  }

  /**
   * Send chat request and get streaming response
   */
  async chatStream(
    messages: LLMMessage[],
    onEvent: (event: LLMStreamEvent) => void,
    onError?: (error: Error) => void,
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const requestId = `claude_${Date.now()}`;

    // Extract system message if present
    let systemPrompt: string | undefined;
    const claudeMessages: ClaudeMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        claudeMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    const request: ClaudeRequest = {
      model: this.model,
      messages: claudeMessages,
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
      system: systemPrompt,
    };

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": this.apiVersion,
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";
      let inputTokens = 0;
      let outputTokens = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || !line.startsWith("data:")) continue;

          const dataStr = line.slice(5);

          try {
            const event: ClaudeStreamEvent = JSON.parse(dataStr);

            if (event.type === "content_block_delta" && event.delta?.text) {
              fullContent += event.delta.text;
              onEvent({ type: "content", content: fullContent });
            }

            if (event.type === "message_stop" && event.usage) {
              inputTokens = event.usage.input_tokens;
              outputTokens = event.usage.output_tokens;
              onEvent({ type: "complete" });
            }

            if (event.type === "error" && event.error) {
              throw new Error(event.error.message);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      const latencyMs = Date.now() - startTime;
      const cost = this.calculateCost(inputTokens, outputTokens);

      return {
        id: requestId,
        provider: "claude",
        model: this.model,
        content: fullContent,
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        latencyMs,
        cost,
        timestamp: new Date(),
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      onEvent({ type: "error", error: errorMessage });
      onError?.(error instanceof Error ? error : new Error(errorMessage));

      return {
        id: requestId,
        provider: "claude",
        model: this.model,
        content: "",
        finishReason: "error",
        latencyMs,
        cost: 0,
        timestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Send blocking chat request
   */
  async chatBlocking(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    const requestId = `claude_${Date.now()}`;

    // Extract system message if present
    let systemPrompt: string | undefined;
    const claudeMessages: ClaudeMessage[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        claudeMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        });
      }
    }

    const request: ClaudeRequest = {
      model: this.model,
      messages: claudeMessages,
      max_tokens: 4096,
      temperature: 0.7,
      stream: false,
      system: systemPrompt,
    };

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": this.apiVersion,
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;

      const content =
        typeof data.content === "string" ? data.content : data.content?.[0]?.text || "";

      return {
        id: requestId,
        provider: "claude",
        model: this.model,
        content,
        finishReason: "stop",
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        latencyMs,
        cost: this.calculateCost(inputTokens, outputTokens),
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        id: requestId,
        provider: "claude",
        model: this.model,
        content: "",
        finishReason: "error",
        latencyMs: Date.now() - startTime,
        cost: 0,
        timestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    // Claude Sonnet pricing: $3/1M input, $15/1M output
    const inputCost = (inputTokens / 1_000_000) * 3.0;
    const outputCost = (outputTokens / 1_000_000) * 15.0;
    return inputCost + outputCost;
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Simple validation by making a minimal request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": this.apiVersion,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// ============================================
// Factory Function
// ============================================

export function createClaudeClient(): ClaudeClient | null {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || "";
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY not configured");
    return null;
  }
  const baseUrl = import.meta.env.ANTHROPIC_BASE_URL;
  const model = import.meta.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
  return new ClaudeClient(apiKey, baseUrl, model);
}
