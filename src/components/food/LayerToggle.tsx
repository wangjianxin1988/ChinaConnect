// @ts-nocheck
import { foodFilterStore } from "@/lib/food-context";
import type { RestaurantType } from "@/types/food";
import { useEffect, useState } from "react";

interface LayerToggleProps {
  counts: Record<RestaurantType, number>;
}

const LAYER_CONFIG: Record<RestaurantType, { label: string; icon: string; color: string }> = {
  michelin: { label: "米其林指南", icon: "⭐", color: "bg-[#1E3A5F]" },
  blackpearl: { label: "黑珍珠榜单", icon: "💎", color: "bg-[#2D1B4E]" },
  local: { label: "本地人推荐", icon: "🔥", color: "bg-[#B8383D]" },
};

export default function LayerToggle({ counts }: LayerToggleProps) {
  const [selectedTypes, setSelectedTypes] = useState<RestaurantType[]>(
    foodFilterStore.getState().selectedTypes,
  );

  useEffect(() => {
    const unsubscribe = foodFilterStore.subscribe((state) => {
      setSelectedTypes(state.selectedTypes);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (type: RestaurantType) => {
    foodFilterStore.toggleType(type);
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl shadow-md">
      {(Object.keys(LAYER_CONFIG) as RestaurantType[]).map((type) => {
        const config = LAYER_CONFIG[type];
        const isSelected = selectedTypes.includes(type);

        return (
          <button
            key={type}
            onClick={() => handleToggle(type)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-all
              ${isSelected ? `${config.color} text-white shadow-md` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
            `}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="font-medium">{config.label}</span>
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full
              ${isSelected ? "bg-white/20" : "bg-gray-200"}
            `}
            >
              {counts[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
