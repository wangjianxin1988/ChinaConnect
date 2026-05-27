/**
 * Flarum SSO Client for ChinaConnect
 *
 * This module handles Single Sign-On between Supabase Auth and Flarum forum.
 * It generates Flarum-compatible tokens from Supabase user sessions.
 *
 * @module flarum/sso-client
 */

import { createHmac } from "node:crypto";
import type { User } from "@supabase/supabase-js";

/**
 * Flarum SSO configuration
 */
export interface FlarumSSOConfig {
  /** Flarum forum URL (e.g., https://forum.chinaconnect.example.com) */
  baseUrl: string;
  /** SSO secret key configured in Flarum admin panel */
  ssoSecret: string;
  /** Flarum API key */
  apiKey: string;
}

/**
 * SSO payload sent to Flarum
 */
export interface FlarumSSOPayload {
  /** Unique identifier from Supabase */
  userId: string;
  /** User's display name */
  displayName: string;
  /** User's email address */
  email: string;
  /** User's avatar URL (optional) */
  avatarUrl?: string;
  /** User's group/level in ChinaConnect */
  userLevel?: string;
  /** ISO 8601 timestamp */
  timestamp: number;
}

/**
 * SSO redirect URL with signature
 */
export interface FlarumSSORedirect {
  /** Redirect URL to Flarum with SSO parameters */
  url: string;
  /** HMAC signature for validation */
  signature: string;
}

/**
 * Error types for SSO operations
 */
export enum SSORrrorCode {
  INVALID_CONFIG = "SSO_INVALID_CONFIG",
  MISSING_USER = "SSO_MISSING_USER",
  SIGNATURE_FAILED = "SSO_SIGNATURE_FAILED",
  NETWORK_ERROR = "SSO_NETWORK_ERROR",
}

/**
 * Custom SSO error class
 */
export class SSOError extends Error {
  constructor(
    message: string,
    public code: SSORrrorCode,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "SSOError";
  }
}

/**
 * Encode payload to base64 for Flarum SSO
 */
function base64Encode(payload: FlarumSSOPayload): string {
  return Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Create HMAC SHA-256 signature for SSO payload
 */
function createSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Generate Flarum-compatible SSO token from Supabase user
 *
 * @param user - Supabase authenticated user
 * @param config - Flarum SSO configuration
 * @param profile - Optional user profile data from ChinaConnect
 * @returns SSO redirect URL with signature
 *
 * @example
 * ```typescript
 * const { url, signature } = await generateSSOUrl(supabaseUser, {
 *   baseUrl: "https://forum.example.com",
 *   ssoSecret: "your-secret-key",
 *   apiKey: "your-api-key"
 * }, { displayName: "John", userLevel: "探索者" });
 *
 * // Redirect user to url
 * window.location.href = url;
 * ```
 */
export async function generateSSOUrl(
  user: User,
  config: FlarumSSOConfig,
  profile?: { displayName?: string; avatarUrl?: string; userLevel?: string },
): Promise<FlarumSSORedirect> {
  if (!config.baseUrl || !config.ssoSecret) {
    throw new SSOError(
      "Flarum SSO configuration is incomplete. Base URL and SSO secret are required.",
      SSORrrorCode.INVALID_CONFIG,
    );
  }

  if (!user || !user.id || !user.email) {
    throw new SSOError(
      "Valid Supabase user with ID and email is required for SSO.",
      SSORrrorCode.MISSING_USER,
    );
  }

  // Build SSO payload
  const payload: FlarumSSOPayload = {
    userId: user.id,
    displayName:
      profile?.displayName || user.user_metadata?.display_name || user.email.split("@")[0],
    email: user.email,
    avatarUrl: profile?.avatarUrl || user.user_metadata?.avatar_url,
    userLevel: profile?.userLevel,
    timestamp: Math.floor(Date.now() / 1000),
  };

  // Encode payload
  const encodedPayload = base64Encode(payload);

  // Generate signature using HMAC-SHA256
  // Flarum expects: sha256(secret + decoded_payload)
  const signature = createSignature(
    config.ssoSecret + Buffer.from(encodedPayload, "base64").toString("utf8"),
    config.ssoSecret,
  );

  // Build redirect URL
  const ssoParams = new URLSearchParams({
    sso: encodedPayload,
    sig: signature,
  });

  const redirectUrl = `${config.baseUrl}/auth/sso?${ssoParams.toString()}`;

  return {
    url: redirectUrl,
    signature,
  };
}

/**
 * Verify SSO callback from Flarum
 *
 * Flarum sends back an SSO response that must be verified before processing.
 *
 * @param queryParams - URL query parameters from Flarum callback
 * @param config - Flarum SSO configuration
 * @returns Object containing `userId` if valid, or throws SSOError
 *
 * @example
 * ```typescript
 * // In your callback handler
 * const urlParams = new URL(request.url).searchParams;
 * const result = await verifySSOCallback(urlParams, flarumConfig);
 * if (result) {
 *   // SSO login successful, userId is result.userId
 * }
 * ```
 */
export async function verifySSOCallback(
  queryParams: URLSearchParams,
  config: FlarumSSOConfig,
): Promise<{ userId: string }> {
  const sso = queryParams.get("sso");
  const sig = queryParams.get("sig");

  if (!sso || !sig) {
    throw new SSOError("Missing SSO parameters in callback.", SSORrrorCode.SIGNATURE_FAILED);
  }

  // Verify signature
  const expectedSignature = createSignature(config.ssoSecret + atob(sso), config.ssoSecret);

  if (sig !== expectedSignature) {
    throw new SSOError(
      "SSO signature verification failed. Possible tampering detected.",
      SSORrrorCode.SIGNATURE_FAILED,
    );
  }

  // Decode and parse payload
  try {
    const decoded = atob(sso.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(decoded) as FlarumSSOPayload;

    // Validate required fields
    if (!payload.userId || !payload.email) {
      throw new SSOError(
        "Invalid SSO payload: missing required fields.",
        SSORrrorCode.SIGNATURE_FAILED,
      );
    }

    // Check timestamp (SSO tokens should be used within 5 minutes)
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    if (payload.timestamp < fiveMinutesAgo) {
      throw new SSOError("SSO token has expired. Please try again.", SSORrrorCode.SIGNATURE_FAILED);
    }

    return { userId: payload.userId };
  } catch (error) {
    if (error instanceof SSOError) throw error;
    throw new SSOError("Failed to parse SSO callback payload.", SSORrrorCode.SIGNATURE_FAILED);
  }
}

/**
 * Generate logout URL for Flarum
 */
export function generateLogoutUrl(config: FlarumSSOConfig): string {
  return `${config.baseUrl}/auth/logout`;
}

/**
 * Get Flarum SSO configuration from environment variables
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

/**
 * @deprecated Use getFlarumSSOConfig instead
 */
export const getFlarumConfig = getFlarumSSOConfig;
