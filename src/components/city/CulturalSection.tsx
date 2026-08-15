import { InfiniteList } from "@/components/ui/InfiniteList";
import { ct } from "@/i18n/components-strings";
import React from "react";

interface CulturalTip {
  id: string;
  title: string;
  content: string;
  importance: "high" | "medium" | "low";
}

interface CulturalSectionProps {
  culturalTips: CulturalTip[];
  lang?: string;
}

function normalizeImportance(importance: string | undefined): CulturalTip["importance"] {
  const map: Record<string, CulturalTip["importance"]> = {
    high: "high",
    medium: "medium",
    low: "low",
    高: "high",
    中: "medium",
    中程度: "medium",
    低: "low",
  };
  return map[String(importance || "").toLowerCase()] || "medium";
}

function getImportanceStyles(importance: CulturalTip["importance"], lang: string) {
  switch (normalizeImportance(importance)) {
    case "high":
      return {
        bg: "bg-red-100 text-red-700",
        label: ct(lang, "pri_high", "High Priority"),
      };
    case "medium":
      return {
        bg: "bg-amber-100 text-amber-700",
        label: ct(lang, "pri_medium", "Medium Priority"),
      };
    case "low":
      return {
        bg: "bg-gray-100 text-gray-700",
        label: ct(lang, "pri_low", "Low Priority"),
      };
  }
  return {
    bg: "bg-gray-100 text-gray-700",
    label: ct(lang, "pri_medium", "Medium Priority"),
  };
}

export function CulturalSection({ culturalTips, lang = "en" }: CulturalSectionProps) {
  return (
    <InfiniteList
      items={culturalTips}
      initialCount={10}
      loadMoreCount={10}
      renderItem={(tip) => {
        const styles = getImportanceStyles(tip.importance, lang);
        return (
          <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${styles.bg}`}>
                {styles.label}
              </span>
            </div>
            <p className="text-gray-600">{tip.content}</p>
          </div>
        );
      }}
    />
  );
}

export default CulturalSection;
