/**
 * Preset avatar helpers — deterministic pick from the bundled avatar set
 * so accounts without an uploaded/OAuth picture always show a friendly
 * avatar instead of a bare initial.
 */

export const PRESET_AVATAR_PATHS: string[] = [
  "/avatars/avatar-0.svg",
  "/avatars/avatar-1.svg",
  "/avatars/avatar-2.svg",
  "/avatars/avatar-3.svg",
  "/avatars/avatar-4.svg",
  "/avatars/avatar-5.svg",
  "/avatars/avatar-6.svg",
  "/avatars/avatar-7.svg",
  "/avatars/avatar-8.svg",
  "/avatars/avatar-9.svg",
  "/avatars/avatar-10.svg",
  "/avatars/avatar-11.svg",
];

/** Stable hash so the same user always gets the same preset avatar. */
export function presetAvatarIndex(seed: string | null | undefined): number {
  const s = String(seed || "guest");
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash % PRESET_AVATAR_PATHS.length;
}

/** Pick a preset avatar for a user seed (user id, email, or display name). */
export function presetAvatarForSeed(seed: string | null | undefined): string {
  return PRESET_AVATAR_PATHS[presetAvatarIndex(seed)];
}
