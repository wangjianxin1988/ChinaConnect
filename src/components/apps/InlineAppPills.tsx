/**
 * Inline App Pills Component
 * Compact app recommendations for embedding within content sections
 */

import { APP_RECOMMENDATIONS, type AppCategory } from "@/data/apps/app-recommendations";

interface InlineAppPillProps {
  app: (typeof APP_RECOMMENDATIONS)[0];
}

export function InlineAppPill({ app }: InlineAppPillProps) {
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
          href={app.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 shrink-0 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
        >
          iOS
        </a>
      )}
      {app.androidUrl && (
        <a
          href={app.androidUrl}
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
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {apps.map((app) => (
          <InlineAppPill key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}

/**
 * Get apps by categories for inline display
 */
export function getAppsForSection(categories: AppCategory[]): (typeof APP_RECOMMENDATIONS)[0][] {
  return APP_RECOMMENDATIONS.filter((app) => categories.includes(app.category));
}
