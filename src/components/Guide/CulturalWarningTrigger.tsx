/**
 * CulturalWarningTrigger Component
 * Automatically triggers cultural warnings based on city/page context
 * Users can dismiss or re-open the warning panel
 */

import { CULTURAL_WARNINGS, IMPORTANCE_STYLES, REGION_TRIGGERS } from "@/data/cultural-warnings";
import React, { useState, useEffect, useCallback } from "react";

interface CulturalWarningTriggerProps {
  currentCity?: string;
  currentPage?: string;
  autoShow?: boolean;
  triggerKeywords?: string[];
}

interface TriggeredWarning {
  warning: (typeof CULTURAL_WARNINGS)[0];
  triggeredBy: string;
}

const DISMISSED_KEY = "chinaconnect-cw-dismissed";
const LAST_SHOWN_KEY = "chinaconnect-cw-last-shown";

function loadDismissedCities(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDismissedCities(cities: string[]): void {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(cities));
}

function getLastShownTime(): number {
  try {
    const raw = localStorage.getItem(LAST_SHOWN_KEY);
    return raw ? Number.parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveLastShownTime(): void {
  localStorage.setItem(LAST_SHOWN_KEY, Date.now().toString());
}

export function CulturalWarningTrigger({
  currentCity = "",
  currentPage = "",
  autoShow = true,
  triggerKeywords = [],
}: CulturalWarningTriggerProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<TriggeredWarning | null>(null);
  const [warningQueue, setWarningQueue] = useState<TriggeredWarning[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [dismissedCities, setDismissedCities] = useState<string[]>([]);

  // Load dismissed cities on mount
  useEffect(() => {
    setDismissedCities(loadDismissedCities());
  }, []);

  // Detect city and auto-trigger warnings
  useEffect(() => {
    if (!autoShow || !currentCity) return;
    if (dismissedCities.includes(currentCity.toLowerCase())) return;

    // Check last shown time - only auto-show once per session (24h)
    const lastShown = getLastShownTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (lastShown > 0 && Date.now() - lastShown < oneDayMs) return;

    const cityLower = currentCity.toLowerCase();
    const triggeredWarnings: TriggeredWarning[] = [];

    // Check city-based triggers
    for (const [region, keywords] of Object.entries(REGION_TRIGGERS)) {
      if (keywords.some((kw) => cityLower.includes(kw))) {
        const regionWarnings = CULTURAL_WARNINGS.filter(
          (w) =>
            w.region?.toLowerCase() === region ||
            (w.importance === "critical" && w.category !== "General"),
        );
        regionWarnings.forEach((w) => {
          triggeredWarnings.push({ warning: w, triggeredBy: `region:${region}` });
        });
      }
    }

    // Check keyword-based triggers
    if (triggerKeywords.length > 0) {
      triggerKeywords.forEach((kw) => {
        const kwLower = kw.toLowerCase();
        CULTURAL_WARNINGS.filter(
          (w) =>
            w.title.toLowerCase().includes(kwLower) ||
            w.description.toLowerCase().includes(kwLower),
        ).forEach((w) => {
          if (!triggeredWarnings.some((t) => t.warning.id === w.id)) {
            triggeredWarnings.push({ warning: w, triggeredBy: `keyword:${kw}` });
          }
        });
      });
    }

    // Add page-based critical warnings
    const criticalWarnings = CULTURAL_WARNINGS.filter(
      (w) => w.importance === "critical" && w.category !== "General",
    );
    criticalWarnings.forEach((w) => {
      if (!triggeredWarnings.some((t) => t.warning.id === w.id)) {
        triggeredWarnings.push({ warning: w, triggeredBy: "critical-general" });
      }
    });

    if (triggeredWarnings.length > 0) {
      setWarningQueue(triggeredWarnings);
      setQueueIndex(0);
      setCurrentWarning(triggeredWarnings[0]);
      setIsVisible(true);
      saveLastShownTime();
    }
  }, [autoShow, currentCity, dismissedCities, triggerKeywords]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleDismissCity = useCallback(() => {
    if (currentCity) {
      const updated = [...dismissedCities, currentCity.toLowerCase()];
      setDismissedCities(updated);
      saveDismissedCities(updated);
    }
    setIsVisible(false);
  }, [currentCity, dismissedCities]);

  const handleNext = useCallback(() => {
    if (queueIndex < warningQueue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      setCurrentWarning(warningQueue[nextIdx]);
    } else {
      setIsVisible(false);
    }
  }, [queueIndex, warningQueue]);

  const handlePrev = useCallback(() => {
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      setCurrentWarning(warningQueue[prevIdx]);
    }
  }, [queueIndex]);

  const handleReopen = useCallback(() => {
    // Reload dismissed cities and re-check
    const dismissed = loadDismissedCities();
    setDismissedCities(dismissed);

    // Show all critical warnings on reopen
    const criticalWarnings: TriggeredWarning[] = CULTURAL_WARNINGS.filter(
      (w) => w.importance === "critical",
    ).map((w) => ({ warning: w, triggeredBy: "critical-reopen" }));

    setWarningQueue(criticalWarnings);
    setQueueIndex(0);
    setCurrentWarning(criticalWarnings[0] || null);
    setIsVisible(true);
  }, []);

  if (!isVisible || !currentWarning) {
    // Return a small trigger button that floats in the corner
    return (
      <button
        onClick={handleReopen}
        className="fixed top-20 right-6 z-40 flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded-full shadow-md transition-colors text-sm font-medium text-amber-800"
        title="Cultural Warnings / 文化预警"
      >
        <span>⚠️</span>
        <span className="hidden sm:inline">
          {typeof navigator !== "undefined" && navigator.language?.startsWith("zh")
            ? "文化提示"
            : "Cultural Tips"}
        </span>
      </button>
    );
  }

  const { warning } = currentWarning;
  const style = IMPORTANCE_STYLES[warning.importance];
  const progress = warningQueue.length > 1
    ? `${queueIndex + 1} / ${warningQueue.length}`
    : "";

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm w-full animate-in slide-in-from-bottom-4">
      <div
        className={`${style.bg} border-2 ${style.text} rounded-2xl shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 border-b border-current/20 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{warning.icon}</span>
            <div>
              <span className="font-bold text-sm">{style.labelCn} Cultural Alert</span>
              {progress && <span className="text-xs ml-2 opacity-60">({progress})</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Re-dismiss button */}
            <button
              onClick={handleDismiss}
              className="hover:bg-black/10 rounded-full p-1.5 transition-colors text-lg"
              title="Dismiss for now"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-base mb-0.5">{warning.title}</h3>
          <p className="text-sm opacity-80 mb-2">{warning.titleCn}</p>
          <p className="text-sm">{warning.description}</p>
          <p className="text-sm opacity-70 mt-1">{warning.descriptionCn}</p>
          {warning.region && (
            <div className="mt-2 text-xs opacity-60">
              📍 {warning.region} ({warning.regionCn})
            </div>
          )}
        </div>

        {/* Navigation & Actions */}
        <div className="px-4 py-3 bg-black/5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={queueIndex === 0}
              className="px-2 py-1 text-sm rounded hover:bg-black/10 disabled:opacity-30 transition-colors"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="px-2 py-1 text-sm rounded hover:bg-black/10 transition-colors"
            >
              {queueIndex < warningQueue.length - 1 ? "→" : "✓"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDismissCity}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${style.text} bg-black/10 hover:bg-black/20 transition-colors`}
              title="Don't show for this city again"
            >
              {typeof navigator !== "undefined" && navigator.language?.startsWith("zh")
                ? "不再显示"
                : "Hide for City"}
            </button>
            <button
              onClick={handleDismiss}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${style.text} bg-black/10 hover:bg-black/20 transition-colors`}
            >
              {typeof navigator !== "undefined" && navigator.language?.startsWith("zh")
                ? "知道了"
                : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CulturalWarningTrigger;