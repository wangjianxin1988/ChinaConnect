/**
 * Flarum API Client for ChinaConnect
 *
 * This module provides typed API client for Flarum forum operations.
 * Supports forum data fetching, user info, and post management.
 *
 * @module flarum/api-client
 */

import type { FlarumSSOConfig } from "./sso-client";

/**
 * Flarum API response wrapper
 */
export interface FlarumApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      currentPage: number;
      lastPage: number;
      perPage: number;
      total: number;
    };
  };
}

/**
 * Flarum user data
 */
export interface FlarumUser {
  id: string;
  attributes: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    email: string;
    groups: string[];
    joinedAt: string;
    discussionCount: number;
    commentCount: number;
  };
}

/**
 * Flarum discussion (thread)
 */
export interface FlarumDiscussion {
  id: string;
  attributes: {
    title: string;
    slug: string;
    createdAt: string;
    lastPostedAt: string;
    lastPostNumber: number;
    commentCount: number;
    participantCount: number;
    viewCount: number;
    isPinned: boolean;
    isLocked: boolean;
    isSticky: boolean;
  };
  relationships?: {
    author: { data: { id: string; type: "users" } };
    lastPostedUser: { data: { id: string; type: "users" } };
    tags?: { data: Array<{ id: string; type: "tags" }> };
  };
}

/**
 * Flarum post/comment
 */
export interface FlarumPost {
  id: string;
  attributes: {
    content: string;
    createdAt: string;
    editedAt: string | null;
    number: number;
    isPinned: boolean;
    isLocked: boolean;
  };
  relationships?: {
    author: { data: { id: string; type: "users" } };
    discussion: { data: { id: string; type: "discussions" } };
  };
}

/**
 * Flarum tag/category
 */
export interface FlarumTag {
  id: string;
  attributes: {
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    position: number;
    discussionCount: number;
    postCount: number;
    isRestricted: boolean;
  };
}

/**
 * API error response
 */
export interface FlarumApiError {
  errors: Array<{
    status: string;
    code: string;
    detail: string;
  }>;
}

/**
 * Custom API error class
 */
export class FlarumApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
    this.name = "FlarumApiException";
  }
}

/**
 * Flarum API Client
 *
 * Provides methods for interacting with Flarum's REST API.
 *
 * @example
 * ```typescript
 * const client = new FlarumApiClient({
 *   baseUrl: "https://forum.example.com",
 *   ssoSecret: "secret",
 *   apiKey: "api-key"
 * });
 *
 * // Get recent discussions
 * const { data } = await client.getDiscussions({ limit: 10 });
 *
 * // Get user profile
 * const user = await client.getUser("123");
 * ```
 */
export class FlarumApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: FlarumSSOConfig) {
    if (!config.baseUrl || !config.apiKey) {
      throw new Error("Flarum API client requires baseUrl and apiKey");
    }
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;

    const headers: HeadersInit = {
      Authorization: `Token ${this.apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as FlarumApiError;
        throw new FlarumApiException(
          errorBody.errors?.[0]?.detail || `API request failed with status ${response.status}`,
          response.status,
          errorBody.errors?.[0]?.code,
        );
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof FlarumApiException) throw error;
      throw new FlarumApiException(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        0,
      );
    }
  }

  // ==================== User Operations ====================

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<FlarumUser> {
    const response = await this.request<FlarumApiResponse<FlarumUser>>("/users");
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<FlarumUser> {
    const response = await this.request<FlarumApiResponse<FlarumUser>>(`/users/${userId}`);
    return response.data;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<FlarumUser> {
    const response = await this.request<FlarumApiResponse<FlarumUser>>(
      `/users?filter[username]=${encodeURIComponent(username)}`,
    );
    if (!response.data || !("data" in response) || !Array.isArray(response.data)) {
      throw new FlarumApiException(`User not found: ${username}`, 404);
    }
    return (response.data as Array<FlarumUser>)[0];
  }

  /**
   * List users with pagination
   */
  async listUsers(
    options: {
      limit?: number;
      page?: number;
    } = {},
  ): Promise<{ users: FlarumUser[]; meta: FlarumApiResponse<null>["meta"] }> {
    const params = new URLSearchParams({
      "page[limit]": String(options.limit || 20),
      "page[number]": String(options.page || 1),
    });

    const response = await this.request<FlarumApiResponse<FlarumUser[]>>(
      `/users?${params.toString()}`,
    );

    return {
      users: Array.isArray(response.data) ? response.data : [response.data],
      meta: response.meta,
    };
  }

  // ==================== Discussion Operations ====================

  /**
   * Get recent discussions
   */
  async getDiscussions(
    options: {
      limit?: number;
      page?: number;
      filter?: {
        tag?: string;
        author?: string;
        search?: string;
      };
      sort?: string;
    } = {},
  ): Promise<{ discussions: FlarumDiscussion[]; meta: FlarumApiResponse<null>["meta"] }> {
    const params = new URLSearchParams({
      "page[limit]": String(options.limit || 20),
      "page[number]": String(options.page || 1),
    });

    if (options.filter?.tag) {
      params.append("filter[tag]", options.filter.tag);
    }
    if (options.filter?.author) {
      params.append("filter[author]", options.filter.author);
    }
    if (options.filter?.search) {
      params.append("filter[search]", options.filter.search);
    }
    if (options.sort) {
      params.append("sort", options.sort);
    }

    const response = await this.request<FlarumApiResponse<FlarumDiscussion[]>>(
      `/discussions?${params.toString()}`,
    );

    return {
      discussions: Array.isArray(response.data) ? response.data : [response.data],
      meta: response.meta,
    };
  }

  /**
   * Get discussion by ID
   */
  async getDiscussion(discussionId: string): Promise<FlarumDiscussion> {
    const response = await this.request<FlarumApiResponse<FlarumDiscussion>>(
      `/discussions/${discussionId}`,
    );
    return response.data;
  }

  /**
   * Get discussion by slug
   */
  async getDiscussionBySlug(slug: string): Promise<FlarumDiscussion> {
    const response = await this.request<FlarumApiResponse<FlarumDiscussion[]>>(
      `/discussions?filter[slug]=${encodeURIComponent(slug)}`,
    );
    if (!response.data || !("data" in response) || !Array.isArray(response.data)) {
      throw new FlarumApiException(`Discussion not found: ${slug}`, 404);
    }
    return (response.data as FlarumDiscussion[])[0];
  }

  /**
   * Create new discussion
   */
  async createDiscussion(data: {
    title: string;
    content: string;
    tagIds?: string[];
  }): Promise<FlarumDiscussion> {
    const response = await this.request<FlarumApiResponse<FlarumDiscussion>>("/discussions", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "discussions",
          attributes: {
            title: data.title,
            content: data.content,
          },
          relationships: data.tagIds
            ? {
                tags: {
                  data: data.tagIds.map((id) => ({ id, type: "tags" })),
                },
              }
            : undefined,
        },
      }),
    });

    return response.data;
  }

  // ==================== Post Operations ====================

  /**
   * Get posts for a discussion
   */
  async getPosts(
    discussionId: string,
    options: {
      limit?: number;
      page?: number;
    } = {},
  ): Promise<{ posts: FlarumPost[]; meta: FlarumApiResponse<null>["meta"] }> {
    const params = new URLSearchParams({
      "page[limit]": String(options.limit || 20),
      "page[number]": String(options.page || 1),
    });

    const response = await this.request<FlarumApiResponse<FlarumPost[]>>(
      `/posts?filter[discussion]=${discussionId}&${params.toString()}`,
    );

    return {
      posts: Array.isArray(response.data) ? response.data : [response.data],
      meta: response.meta,
    };
  }

  /**
   * Get single post
   */
  async getPost(postId: string): Promise<FlarumPost> {
    const response = await this.request<FlarumApiResponse<FlarumPost>>(`/posts/${postId}`);
    return response.data;
  }

  /**
   * Create reply in discussion
   */
  async createPost(discussionId: string, content: string): Promise<FlarumPost> {
    const response = await this.request<FlarumApiResponse<FlarumPost>>("/posts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "posts",
          attributes: {
            content,
          },
          relationships: {
            discussion: {
              data: {
                id: discussionId,
                type: "discussions",
              },
            },
          },
        },
      }),
    });

    return response.data;
  }

  // ==================== Tag Operations ====================

  /**
   * Get all tags/categories
   */
  async getTags(): Promise<FlarumTag[]> {
    const response = await this.request<FlarumApiResponse<FlarumTag[]>>("/tags");
    return Array.isArray(response.data) ? response.data : [response.data];
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string): Promise<FlarumTag> {
    const response = await this.request<FlarumApiResponse<FlarumTag[]>>(
      `/tags?filter[slug]=${encodeURIComponent(slug)}`,
    );
    if (!response.data || !("data" in response) || !Array.isArray(response.data)) {
      throw new FlarumApiException(`Tag not found: ${slug}`, 404);
    }
    return (response.data as FlarumTag[])[0];
  }

  /**
   * Get discussions by tag
   */
  async getDiscussionsByTag(
    tagSlug: string,
    options: {
      limit?: number;
      page?: number;
    } = {},
  ): Promise<{ discussions: FlarumDiscussion[]; meta: FlarumApiResponse<null>["meta"] }> {
    return this.getDiscussions({
      ...options,
      filter: { tag: tagSlug },
    });
  }
}

/**
 * Create Flarum API client from environment config
 */
export function createFlarumClient(config: FlarumSSOConfig): FlarumApiClient {
  return new FlarumApiClient(config);
}

/**
 * Get Flarum API client from environment variables
 */
export function getFlarumClient(): FlarumApiClient | null {
  const config = getFlarumSSOConfig();
  if (!config) return null;
  return createFlarumClient(config);
}

/**
 * Get Flarum SSO config helper (re-exported for convenience)
 */
export function getFlarumSSOConfig(): FlarumSSOConfig | null {
  const baseUrl = import.meta.env.PUBLIC_FLARUM_URL;
  const ssoSecret = import.meta.env.FLARUM_SSO_SECRET;
  const apiKey = import.meta.env.FLARUM_API_KEY;

  if (!baseUrl || !ssoSecret || !apiKey) {
    console.warn(
      "Flarum configuration is incomplete. Set PUBLIC_FLARUM_URL, FLARUM_SSO_SECRET, and FLARUM_API_KEY in your .env file.",
    );
    return null;
  }

  return { baseUrl, ssoSecret, apiKey };
}
