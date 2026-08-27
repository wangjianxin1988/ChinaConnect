/**
 * Columns of public.profiles that anon/authenticated roles may SELECT.
 * Sensitive/private columns (wallet_balance, preferences, signup_source,
 * onboarding_completed) are revoked at the database level — see
 * supabase/migrations/20260827_hide_profiles_sensitive_columns.sql.
 * Always query profiles with PROFILE_PUBLIC_SELECT instead of "*" so requests
 * keep working with column-level privileges.
 */
export const PROFILE_PUBLIC_COLUMNS = [
  "id",
  "user_id",
  "display_name",
  "avatar_url",
  "bio",
  "nationality",
  "native_language",
  "travel_level",
  "points",
  "badges",
  "membership_tier",
  "last_active_at",
  "created_at",
  "updated_at",
] as const;

// Literal type on purpose: supabase-js uses the select string to infer the
// returned row shape (a plain `string` would degrade to the generic type).
export const PROFILE_PUBLIC_SELECT =
  "id, user_id, display_name, avatar_url, bio, nationality, native_language, travel_level, points, badges, membership_tier, last_active_at, created_at, updated_at" as const;
