/**
 * Embedded App Recommendation Component
 * Context-aware app recommendations that embed inline within guide sections.
 * Auto-detects Android/iOS and shows appropriate download buttons.
 * Prioritizes apps with English support.
 */

import {
  APP_RECOMMENDATIONS,
  type AppCategory,
  type AppRecommendation,
} from "@/data/apps/app-recommendations";
import { getDownloadLink } from "@/data/apps/app-recommendations";
import { useEffect, useState } from "react";

interface EmbeddedAppRecommendationProps {
  /** App categories to show */
  categories: AppCategory[];
  /** Optional title override */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Max number of apps to display (default: all matching) */
  maxApps?: number;
  /** Show only essential apps */
  essentialOnly?: boolean;
  /** Compact mode — single row pills */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type Platform = "ios" | "android" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (ua.includes("Android")) return "android";
  return "unknown";
}

function getDownloadUrl(app: AppRecommendation, platform: Platform): string | null {
  // Prefer the native scheme on iOS / Android so taps open the store app directly.
  // Falls back to the web URL if no scheme is derivable.
  if (platform === "ios") {
    return getDownloadLink(app, "ios") ?? app.appStoreUrl ?? null;
  }
  if (platform === "android") {
    return getDownloadLink(app, "android") ?? app.androidUrl ?? null;
  }
  return app.appStoreUrl || app.androidUrl || null;
}

function getPlatformLabel(platform: Platform): string {
  if (platform === "ios") return "App Store";
  if (platform === "android") return "Google Play";
  return "Download";
}

function PlatformIcon({ platform }: { platform: Platform }) {
  if (platform === "ios") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    );
  }
  if (platform === "android") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L15.85,12.15L3.84,22.15C3.34,21.91 3,21.39 3,20.5M13.34,12.15L21.16,3.35L21.34,3.5L13.34,12.15M17,7L22,12L17,17V7Z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

/** Single app card for embedded display */
function AppCard({ app, platform }: { app: AppRecommendation; platform: Platform }) {
  const downloadUrl = getDownloadUrl(app, platform);

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      {/* App Icon */}
      <div className="text-2xl shrink-0 mt-0.5">{app.icon}</div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{app.nameEn || app.name}</span>
          {app.hasEnglish && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded">
              EN
            </span>
          )}
          {app.isEssential && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
              Essential
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {app.descriptionEn || app.description}
        </p>
      </div>

      {/* Download Button */}
      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          title={`Download ${app.name} on ${getPlatformLabel(platform)}`}
        >
          <PlatformIcon platform={platform} />
          <span>{getPlatformLabel(platform)}</span>
        </a>
      )}
    </div>
  );
}

/**
 * EmbeddedAppRecommendation
 *
 * Drop-in component for guide pages. Shows relevant apps based on category
 * with automatic platform detection and English-first sorting.
 *
 * @example
 * ```astro
 * <EmbeddedAppRecommendation
 *   client:visible
 *   categories={["payment"]}
 *   title="Payment Apps"
 *   essentialOnly
 * />
 * ```
 */
export default function EmbeddedAppRecommendation({
  categories,
  title,
  subtitle,
  maxApps,
  essentialOnly = false,
  compact = false,
  className = "",
}: EmbeddedAppRecommendationProps) {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Filter apps by categories
  let apps = APP_RECOMMENDATIONS.filter((app) => categories.includes(app.category));

  // Filter essential only
  if (essentialOnly) {
    apps = apps.filter((app) => app.isEssential);
  }

  // Sort: English-capable first, then essential first
  apps.sort((a, b) => {
    if (a.hasEnglish !== b.hasEnglish) return a.hasEnglish ? -1 : 1;
    if (a.isEssential !== b.isEssential) return a.isEssential ? -1 : 1;
    return 0;
  });

  // Limit
  if (maxApps) {
    apps = apps.slice(0, maxApps);
  }

  if (apps.length === 0) return null;

  const categoryLabels: Record<AppCategory, string> = {
    payment: "Payment",
    transport: "Transport",
    social: "Social",
    travel: "Travel",
    food: "Food & Delivery",
    utilities: "Utilities",
    language: "Language & Translation",
    maps: "Maps & Navigation",
    connectivity: "Connectivity",
  };

  const displayTitle =
    title || `Recommended ${categories.map((c) => categoryLabels[c] || c).join(" & ")} Apps`;

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {apps.map((app) => {
          const downloadUrl = getDownloadUrl(app, platform);
          return (
            <a
              key={app.id}
              href={downloadUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm"
            >
              <span>{app.icon}</span>
              <span className="font-medium text-gray-800">{app.nameEn || app.name}</span>
              {app.hasEnglish && (
                <span className="px-1 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">
                  EN
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 ${className}`}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>📱</span>
          <span>{displayTitle}</span>
        </h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-green-600 font-medium">
            {apps.filter((a) => a.hasEnglish).length} with English
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-amber-600 font-medium">
            {apps.filter((a) => a.isEssential).length} Essential
          </span>
        </div>
      </div>

      {/* App List */}
      <div className="space-y-2">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} platform={platform} />
        ))}
      </div>

      {/* Tip */}
      <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
        <span>💡</span>
        <span>Download before arriving in China — app stores may be restricted.</span>
      </p>
    </div>
  );
}
