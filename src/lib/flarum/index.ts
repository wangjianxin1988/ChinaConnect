/**
 * Flarum Integration Module
 *
 * Exports all Flarum SSO and API functionality for ChinaConnect.
 *
 * @module flarum
 */

// SSO Client
export {
  generateSSOUrl,
  verifySSOCallback,
  generateLogoutUrl,
  getFlarumConfig,
  type FlarumSSOConfig,
  type FlarumSSOPayload,
  type FlarumSSORedirect,
  SSORrrorCode,
  SSOError,
} from "./sso-client";

// API Client
export {
  FlarumApiClient,
  createFlarumClient,
  getFlarumClient,
  getFlarumSSOConfig,
  type FlarumUser,
  type FlarumDiscussion,
  type FlarumPost,
  type FlarumTag,
  type FlarumApiResponse,
  FlarumApiException,
} from "./api-client";
