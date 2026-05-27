/**
 * DashScope (Qwen) Client for ChinaConnect
 * Alibaba Cloud's Qwen LLM API integration
 */

import type { LLMMessage, LLMResponse, LLMStreamEvent } from "@/types/llm";

// ============================================
// Types
// ============================================

interface DashScopeMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DashScopeRequest {
  model: string;
  messages: DashScopeMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  parameters?: {
    top_p?: number;
    top_k?: number;
    repetition_penalty?: number;
  };
}

interface DashScopeStreamResponse {
  id: string;
  choices: Array<{
    delta: { content?: string; role?: string };
    finish_reason?: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================
// DashScope Client
// ============================================

export class DashScopeClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl?: string, model = "qwen-max") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || "https://dashscope.aliyuncs.com/compatible-mode/v1";
    this.model = model;
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
    const requestId = `qwen_${Date.now()}`;

    const request: DashScopeRequest = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
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
          if (dataStr === "[DONE]") {
            onEvent({ type: "complete" });
            break;
          }

          try {
            const event: DashScopeStreamResponse = JSON.parse(dataStr);
            const content = event.choices[0]?.delta?.content;

            if (content) {
              fullContent += content;
              onEvent({ type: "content", content: fullContent });
            }

            if (event.choices[0]?.finish_reason) {
              if (event.usage) {
                inputTokens = event.usage.input_tokens;
                outputTokens = event.usage.output_tokens;
              }
              onEvent({ type: "complete" });
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
        provider: "qwen",
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
        provider: "qwen",
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
    const requestId = `qwen_${Date.now()}`;

    const request: DashScopeRequest = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
      max_tokens: 4000,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DashScope API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      const inputTokens = data.usage?.input_tokens || 0;
      const outputTokens = data.usage?.output_tokens || 0;

      return {
        id: requestId,
        provider: "qwen",
        model: this.model,
        content: data.choices[0]?.message?.content || "",
        finishReason: data.choices[0]?.finish_reason || "stop",
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
        provider: "qwen",
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
    // Qwen pricing: $0.02/1M input, $0.06/1M output
    const inputCost = (inputTokens / 1_000_000) * 0.02;
    const outputCost = (outputTokens / 1_000_000) * 0.06;
    return inputCost + outputCost;
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
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

export function createDashScopeClient(): DashScopeClient | null {
  const apiKey = import.meta.env.DASHSCOPE_API_KEY || "";
  if (!apiKey) {
    console.warn("DASHSCOPE_API_KEY not configured");
    return null;
  }
  const baseUrl = import.meta.env.DASHSCOPE_BASE_URL;
  const model = import.meta.env.DASHSCOPE_MODEL || "qwen-max";
  return new DashScopeClient(apiKey, baseUrl, model);
}
