import {
  APP_RECOMMENDATIONS,
  type AppCategory,
  getDownloadLink,
} from "@/data/apps/app-recommendations";
import { detectMobileOS } from "@/lib/map-links";
/**
 * Inline App Pills Component
 * Compact app recommendations for embedding within content sections.
 * iOS / Android links use native store schemes (itms-apps:// / intent://)
 * so taps on mobile open the App Store / Play Store app directly. Desktop
 * users get the web URL via the same code path.
 */
import React, { useEffect, useState } from "react";

interface InlineAppPillProps {
  app: (typeof APP_RECOMMENDATIONS)[number];
}

export function InlineAppPill({ app }: InlineAppPillProps) {
  const [os, setOs] = useState<"ios" | "android" | "other">("other");
  useEffect(() => {
    setOs(detectMobileOS());
  }, []);

  const iosHref = getDownloadLink(app, "ios") ?? app.appStoreUrl ?? "#";
  const androidHref = getDownloadLink(app, "android") ?? app.androidUrl ?? "#";

  // Click handler: try native scheme first on mobile, fall back to web URL
  const tryNative = (e: React.MouseEvent<HTMLAnchorElement>, webUrl: string | undefined) => {
    if (os === "other" || !webUrl) return;
    const nativeHref = (e.currentTarget as HTMLAnchorElement).href;
    if (!nativeHref || nativeHref === webUrl) return;
    e.preventDefault();
    const t = window.setTimeout(() => {
      window.location.assign(webUrl);
    }, 700);
    const onBlur = () => window.clearTimeout(t);
    window.addEventListener("blur", onBlur, { once: true });
    window.location.href = nativeHref;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-sm">
      <span className="text-lg">{app.icon}</span>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900 text-sm">{app.name}</span>
          {app.hasEnglish && (
            <span className="px-1 py-0.5 bg-green-100 text-green-700 text-xs rounded">EN</span>
          )}
        </div>
        <span className="text-xs text-gray-500 line-clamp-1">{app.descriptionEn}</span>
      </div>
      {app.appStoreUrl && (
        <a
          href={iosHref}
          onClick={(e) => tryNative(e, app.appStoreUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 shrink-0 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
        >
          iOS
        </a>
      )}
      {app.androidUrl && (
        <a
          href={androidHref}
          onClick={(e) => tryNative(e, app.androidUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Android
        </a>
      )}
    </div>
  );
}

interface InlineAppPillsGroupProps {
  apps: typeof APP_RECOMMENDATIONS;
  title?: string;
}

export function InlineAppPillsGroup({ apps, title }: InlineAppPillsGroupProps) {
  return (
    <div className="my-4">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
      <div className="flex flex-wrap gap-2">
        {apps.map((app) => (
          <InlineAppPill key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

// Re-export the getAppsForSection helper so callers (e.g. city/[slug].astro)
// can use it without pulling in the heavier EmbeddedAppRecommendation component.
export function getAppsForSection(categories: AppCategory[]): typeof APP_RECOMMENDATIONS {
  return APP_RECOMMENDATIONS.filter((a) => categories.includes(a.category));
}
