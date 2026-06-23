// @ts-nocheck
/**
 * Dify AI Client for ChinaConnect
 * Handles communication with Dify API for workflow execution
 */

import { v4 as uuidv4 } from "uuid";

export interface DifyConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

export interface DifyMessage {
  role: "user" | "assistant" | "system";
  content: string;
  audioUrl?: string;
}

export interface DifyConversation {
  id: string;
  name?: string;
  status: "normal" | "abort";
  from_source?: string;
  created_at?: number;
  updated_at?: number;
}

export interface DifyMessageResponse {
  event: "message" | "agent_message" | "message_end" | "error" | "ping";
  task_id: string;
  id: string;
  message_id: string;
  conversation_id: string;
  mode: "chat" | "completion" | "agent";
  answer?: string;
  created_at: number;
}

export interface DifyWorkflowResponse {
  event: "workflow_started" | "workflow_finished" | "node_started" | "node_finished";
  task_id: string;
  workflow_id: string;
  data?: Record<string, unknown>;
}

export interface DifyStreamingResponse {
  event: string;
  data: {
    text?: string;
    audio?: string;
  };
  error?: string;
}

export interface ChatRequest {
  query: string;
  user_id: string;
  conversation_id?: string;
  response_mode?: "streaming" | "blocking";
  conversation_name?: string;
  inputs?: Record<string, unknown>;
  files?: Array<{
    type: "image" | "file";
    url?: string;
    transfer_method: "remote_url" | "local_file";
    upload_file_id?: string;
  }>;
}

export interface ChatResponse {
  task_id: string;
  conversation_id: string;
  message_id: string;
  answer: string;
  citations?: Array<{
    text: string;
    index: number;
    score: number;
  }>;
  metadata?: Record<string, unknown>;
}

export interface WorkflowRunRequest {
  workflow_id: string;
  inputs: Record<string, unknown>;
  user_id: string;
  response_mode?: "streaming" | "blocking";
}

export interface WorkflowRunResponse {
  task_id: string;
  workflow_id: string;
  data: Record<string, unknown>;
}

export type DifyEventHandler = (event: DifyStreamingResponse) => void;

export class DifyClient {
  private config: DifyConfig;
  private defaultHeaders: Record<string, string>;

  constructor(config: DifyConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.defaultHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Send a chat message and get streaming response
   */
  async chatStream(
    request: ChatRequest,
    onMessage: DifyEventHandler,
    onError?: (error: Error) => void,
  ): Promise<void> {
    const url = `${this.config.baseUrl}/chat-messages`;

    const payload = {
      ...request,
      response_mode: "streaming",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          // Handle both data: prefix and raw JSON
          let dataStr = line;
          if (line.startsWith("data:")) {
            dataStr = line.slice(5);
          }

          try {
            const event = JSON.parse(dataStr) as DifyStreamingResponse;
            onMessage(event);

            if (event.event === "error") {
              onError?.(new Error(event.error || "Unknown error"));
            }
          } catch {
            // Skip malformed JSON lines
            console.warn("Failed to parse SSE line:", line);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error occurred"));
      }
    }
  }

  /**
   * Send a chat message and get blocking response
   */
  async chatBlocking(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.config.baseUrl}/chat-messages`;

    const payload = {
      ...request,
      response_mode: "blocking",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Run a workflow with streaming response
   */
  async runWorkflowStream(
    request: WorkflowRunRequest,
    onMessage: DifyEventHandler,
    onError?: (error: Error) => void,
  ): Promise<void> {
    const url = `${this.config.baseUrl}/workflows/run`;

    const payload = {
      ...request,
      response_mode: "streaming",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.defaultHeaders,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify Workflow API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;

          let dataStr = line;
          if (line.startsWith("data:")) {
            dataStr = line.slice(5);
          }

          try {
            const event = JSON.parse(dataStr) as DifyStreamingResponse;
            onMessage(event);

            if (event.event === "error") {
              onError?.(new Error(event.error || "Unknown error"));
            }
          } catch {
            console.warn("Failed to parse SSE line:", line);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      } else {
        onError?.(new Error("Unknown error occurred"));
      }
    }
  }

  /**
   * Run a workflow and get blocking response
   */
  async runWorkflowBlocking(request: WorkflowRunRequest): Promise<WorkflowRunResponse> {
    const url = `${this.config.baseUrl}/workflows/run`;

    const payload = {
      ...request,
      response_mode: "blocking",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify Workflow API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get conversation history
   */
  async getConversations(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{
    data: DifyConversation[];
    has_more: boolean;
    next_cursor?: string;
  }> {
    const url = new URL(`${this.config.baseUrl}/conversations`);
    url.searchParams.set("user_id", userId);
    url.searchParams.set("limit", limit.toString());
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.defaultHeaders,
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{
    data: DifyMessage[];
    has_more: boolean;
    next_cursor?: string;
  }> {
    const url = new URL(`${this.config.baseUrl}/messages`);
    url.searchParams.set("conversation_id", conversationId);
    url.searchParams.set("user_id", userId);
    url.searchParams.set("limit", limit.toString());
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.defaultHeaders,
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const url = `${this.config.baseUrl}/conversations/${conversationId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.defaultHeaders,
      body: JSON.stringify({ user_id: userId }),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }
  }

  /**
   * Stop a running task
   */
  async stopTask(taskId: string, userId: string): Promise<void> {
    const url = `${this.config.baseUrl}/chat-messages/${taskId}/stop`;

    const response = await fetch(url, {
      method: "POST",
      headers: this.defaultHeaders,
      body: JSON.stringify({ user_id: userId }),
      signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dify API error: ${response.status} - ${errorText}`);
    }
  }

  /**
   * Generate a unique user ID for anonymous users
   */
  static generateUserId(): string {
    return `anon_${uuidv4()}`;
  }
}

// ============================================
// ChinaConnect Specific Client Wrapper
// ============================================

export interface ChinaConnectUserContext {
  userId: string;
  language: "en" | "zh" | "ja" | "ko";
  budgetLevel: "budget" | "medium" | "luxury";
  travelStyle: string[];
}

export interface TravelPlanningRequest {
  message: string;
  context: ChinaConnectUserContext;
  conversationId?: string;
}

export interface TravelPlanningResponse {
  answer: string;
  taskId: string;
  conversationId: string;
  citations?: Array<{ text: string; index: number; score: number }>;
}

export class ChinaConnectDifyClient extends DifyClient {
  private workflowId: string;

  constructor(config: DifyConfig, workflowId: string) {
    super(config);
    this.workflowId = workflowId;
  }

  /**
   * Plan a travel itinerary
   */
  async planTravel(
    request: TravelPlanningRequest,
    onMessage: (text: string, isComplete: boolean) => void,
  ): Promise<TravelPlanningResponse> {
    return new Promise((resolve, reject) => {
      let fullResponse = "";
      let taskId = "";
      let conversationId = "";

      const handleMessage = (event: DifyStreamingResponse) => {
        if (event.event === "message" && event.data?.text) {
          fullResponse += event.data.text;
          onMessage(fullResponse, false);
        }

        if (event.event === "message_end") {
          onMessage(fullResponse, true);
        }

        if (event.event === "message" && (event as unknown as DifyMessageResponse).task_id) {
          const msgEvent = event as unknown as DifyMessageResponse;
          taskId = msgEvent.task_id || taskId;
          conversationId = msgEvent.conversation_id || conversationId;
        }
      };

      const handleError = (error: Error) => {
        reject(error);
      };

      // Use chat-messages API for interactive conversation
      this.chatStream(
        {
          query: request.message,
          user_id: request.context.userId,
          conversation_id: request.conversationId,
          response_mode: "streaming",
          inputs: {
            language: request.context.language,
            budget_level: request.context.budgetLevel,
            travel_style: request.context.travelStyle,
          },
        },
        handleMessage,
        handleError,
      ).then(() => {
        resolve({
          answer: fullResponse,
          taskId,
          conversationId,
        });
      });
    });
  }

  /**
   * Run the complete 8-step workflow
   */
  async runTravelWorkflow(
    inputs: {
      user_input: string;
      user_context: ChinaConnectUserContext;
    },
    onProgress: (step: number, stepName: string, data: unknown) => void,
  ): Promise<{
    itinerary: unknown;
    practical_info: unknown;
  }> {
    return new Promise((resolve, reject) => {
      let currentStep = 0;
      const stepNames = [
        "Intent Recognition",
        "Parameter Extraction",
        "City Matching",
        "Route Generation",
        "Content Enrichment",
        "Practical Info Injection",
        "Formatting Output",
        "Saving",
      ];

      this.runWorkflowStream(
        {
          workflow_id: this.workflowId,
          inputs: {
            user_input: inputs.user_input,
            user_context: inputs.user_context,
          },
          user_id: inputs.user_context.userId,
          response_mode: "streaming",
        },
        (event) => {
          if (event.event === "node_started") {
            currentStep++;
            onProgress(currentStep, stepNames[currentStep - 1] || `Step ${currentStep}`, null);
          }

          if (event.event === "node_finished" && event.data) {
            onProgress(
              currentStep,
              stepNames[currentStep - 1] || `Step ${currentStep}`,
              event.data,
            );
          }
        },
        reject,
      ).then(() => {
        // Workflow complete - fetch results
        resolve({
          itinerary: null,
          practical_info: null,
        });
      });
    });
  }
}

// ============================================
// Factory Function
// ============================================

export function createChinaConnectClient(): ChinaConnectDifyClient {
  const baseUrl = import.meta.env.VITE_DIFY_API_URL || "https://api.dify.ai/v1";
  const apiKey = import.meta.env.VITE_DIFY_API_KEY || "";
  const workflowId = import.meta.env.VITE_DIFY_WORKFLOW_ID || "";

  return new ChinaConnectDifyClient(
    {
      baseUrl,
      apiKey,
    },
    workflowId,
  );
}

export default DifyClient;
