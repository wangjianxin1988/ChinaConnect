// @ts-nocheck
import { CULTURAL_WARNINGS, IMPORTANCE_STYLES, REGION_TRIGGERS } from "@/data/cultural-warnings";
import React, { useState, useEffect } from "react";

interface CulturalWarningPopupProps {
  currentLocation?: string;
  className?: string;
}

export function CulturalWarningPopup({
  currentLocation = "",
  className = "",
}: CulturalWarningPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<(typeof CULTURAL_WARNINGS)[0] | null>(null);
  const [warningIndex, setWarningIndex] = useState(0);

  useEffect(() => {
    // Check if user is in a special region
    const locationLower = currentLocation.toLowerCase();
    const detectedRegions: string[] = [];

    for (const [region, keywords] of Object.entries(REGION_TRIGGERS)) {
      if (keywords.some((kw) => locationLower.includes(kw))) {
        detectedRegions.push(region);
      }
    }

    if (detectedRegions.length > 0) {
      // Show region-specific warning
      const regionWarnings = CULTURAL_WARNINGS.filter((w) =>
        detectedRegions.includes(w.region?.toLowerCase() || ""),
      );
      if (regionWarnings.length > 0) {
        setCurrentWarning(regionWarnings[0]);
        setIsVisible(true);
      }
    }
  }, [currentLocation]);

  const dismiss = () => {
    setIsVisible(false);
  };

  const nextWarning = () => {
    if (currentWarning) {
      const categoryWarnings = CULTURAL_WARNINGS.filter(
        (w) => w.category === currentWarning.category && w.importance === "critical",
      );
      const nextIdx = (warningIndex + 1) % categoryWarnings.length;
      setWarningIndex(nextIdx);
      setCurrentWarning(categoryWarnings[nextIdx] || null);
    }
  };

  if (!isVisible || !currentWarning) {
    return null;
  }

  const style = IMPORTANCE_STYLES[currentWarning.importance];

  return (
    <div className={`fixed bottom-24 right-6 z-40 max-w-md w-full ${className}`}>
      <div className={`${style.bg} border-2 ${style.text} rounded-xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div
          className={`px-4 py-3 border-b ${style.text} border-current/20 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentWarning.icon}</span>
            <span className="font-bold">{style.labelCn} Cultural Alert</span>
          </div>
          <button
            onClick={dismiss}
            className="hover:bg-black/10 rounded-full p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{currentWarning.title}</h3>
          <p className="text-sm opacity-80 mb-2">{currentWarning.titleCn}</p>
          <p className="text-sm">{currentWarning.description}</p>
          <p className="text-sm opacity-70 mt-1">{currentWarning.descriptionCn}</p>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-black/5 flex items-center justify-between">
          <button onClick={nextWarning} className="text-sm font-medium hover:underline">
            Next / 下一个 →
          </button>
          <button
            onClick={dismiss}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${style.text} bg-black/10 hover:bg-black/20 transition-colors`}
          >
            Got it / 知道了
          </button>
        </div>
      </div>
    </div>
  );
}

export default CulturalWarningPopup;
