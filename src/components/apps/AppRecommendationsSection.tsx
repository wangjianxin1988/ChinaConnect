// @ts-nocheck
﻿/**
 * App Recommendations Component
 * Displays recommended apps for foreigners with English support.
 *
 * Click behavior:
 *   - On iOS, taps go straight to the App Store app via itms-apps:// scheme.
 *   - On Android, taps go to the Play Store app via intent:// scheme.
 *   - On desktop / unknown OS, taps go to the web URL (https://apps.apple.com/...).
 *   - If the native scheme fails (e.g. App Store blocked in CN), the user is
 *     redirected to the web URL after a short timeout.
 */
import {
  APP_CATEGORIES,
  APP_RECOMMENDATIONS,
  getDownloadLink,
  getEnglishFriendlyApps,
  getEssentialApps,
} from "@/data/apps/app-recommendations";
import { detectMobileOS } from "@/lib/map-links";
import React, { useEffect, useState } from "react";

interface AppRecommendationsSectionProps {
  title?: string;
  subtitle?: string;
  showEssentialOnly?: boolean;
  showCategoryFilter?: boolean;
  compact?: boolean;
  className?: string;
}

export function AppRecommendationsSection({
  title = "Recommended Apps for China",
  subtitle = "Essential apps with English interface for navigating China",
  showEssentialOnly = false,
  showCategoryFilter = true,
  compact = false,
  className = "",
}: AppRecommendationsSectionProps) {
  const essentialApps = getEssentialApps();
  const englishApps = getEnglishFriendlyApps();
  const displayApps = showEssentialOnly ? essentialApps : englishApps;

  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  useEffect(() => {
    setOs(detectMobileOS());
  }, []);

  // Group by category
  const appsByCategory = displayApps.reduce(
    (acc, app) => {
      if (!acc[app.category]) acc[app.category] = [];
      acc[app.category].push(app);
      return acc;
    },
    {} as Record<string, typeof displayApps>,
  );

  /**
   * Try the native scheme first (mobile only). If the store app is installed
   * the browser will hand off and the page will not navigate. If the store
   * app is missing (or blocked, e.g. Google Play in mainland China) the
   * navigation never happens, so we fall back to the web URL after a short
   * delay.
   */
  const handleAppLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    app: (typeof APP_RECOMMENDATIONS)[number],
  ) => {
    if (os === "other") return; // desktop — let <a href> work as-is
    const nativeUrl = getDownloadLink(app, os);
    const webUrl = app.appStoreUrl ?? app.androidUrl;
    if (!nativeUrl || nativeUrl === webUrl) return;

    e.preventDefault();
    const t = window.setTimeout(() => {
      if (webUrl) window.location.assign(webUrl);
    }, 700);
    const onBlur = () => window.clearTimeout(t);
    window.addEventListener("blur", onBlur, { once: true });
    window.location.href = nativeUrl;
  };

  return (
    <section className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📲</span>
          <span>{title}</span>
        </h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-blue-600">
            {englishApps.length} Apps with English
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-green-600">
            {essentialApps.length} Essential
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(appsByCategory).map(([category, apps]) => {
          const catInfo = APP_CATEGORIES[category as keyof typeof APP_CATEGORIES];
          if (!catInfo) return null;

          return (
            <div key={category} className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>{catInfo.icon}</span>
                <span>{catInfo.labelZh}</span>
                <span className="text-gray-400 text-sm font-normal">/ {catInfo.label}</span>
              </h3>

              <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
                {apps.map((app) => {
                  const webUrl = app.appStoreUrl ?? app.androidUrl;
                  const nativeUrl = getDownloadLink(app, os);
                  return (
                    <div
                      key={app.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-3xl shrink-0">{app.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          {app.hasEnglish && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              EN
                            </span>
                          )}
                          {app.isEssential && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                              ESSENTIAL
                            </span>
                          )}
                          {app.commission && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                              {app.commission} commission
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{app.descriptionEn}</p>

                        {webUrl && (
                          <div className="flex items-center gap-2 mt-2">
                            {app.appStoreUrl && (
                              <a
                                href={app.appStoreUrl}
                                onClick={(e) => handleAppLinkClick(e, app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                App Store
                              </a>
                            )}
                            {app.androidUrl && (
                              <a
                                href={app.androidUrl}
                                onClick={(e) => handleAppLinkClick(e, app)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 font-medium"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L15.85,12.15L3.84,22.15C3.34,21.91 3,21.39 3,20.5M13.34,12.15L21.16,3.35L21.34,3.5L13.34,12.15M17,7L22,12L17,17V7Z" />
                                </svg>
                                Android
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Pro Tips</span>
        </h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>· Download apps before arriving in China (App Store/Play Store may be limited)</li>
          <li>· WeChat is essential - most services require it</li>
          <li>· Link your foreign credit card to WeChat/Alipay for easy payments</li>
          <li>· Use Google Translate's camera feature to read Chinese menus and signs</li>
        </ul>
      </div>
    </section>
  );
}

interface AppCardProps {
  app: (typeof APP_RECOMMENDATIONS)[number];
  showDownload?: boolean;
}

export function AppCard({ app, showDownload = true }: AppCardProps) {
  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  useEffect(() => {
    setOs(detectMobileOS());
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (os === "other") return;
    const nativeUrl = getDownloadLink(app, os);
    const webUrl = app.appStoreUrl;
    if (!nativeUrl || nativeUrl === webUrl) return;
    e.preventDefault();
    const t = window.setTimeout(() => {
      if (webUrl) window.location.assign(webUrl);
    }, 700);
    const onBlur = () => window.clearTimeout(t);
    window.addEventListener("blur", onBlur, { once: true });
    window.location.href = nativeUrl;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="text-2xl shrink-0">{app.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{app.name}</span>
          {app.hasEnglish && (
            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">EN</span>
          )}
          {app.isEssential && (
            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
              Essential
            </span>
          )}
          {app.commission && (
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
              {app.commission} comm
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{app.descriptionEn}</p>
      </div>
      {showDownload && app.appStoreUrl && (
        <a
          href={app.appStoreUrl}
          onClick={handleClick}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Download
        </a>
      )}
    </div>
  );
}

export default AppRecommendationsSection;
