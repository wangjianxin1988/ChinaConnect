import { type Language, translations } from "@/i18n/translations";
// Recently Viewed Component
import { useEffect, useState } from "react";
import "./RecentlyViewed.css";

const STORAGE_KEY = "chinaconnect_recent_views";
const MAX_ITEMS = 6;

interface ViewedItem {
  id: string;
  name: string;
  nameEn: string;
  type: "city" | "restaurant" | "attraction";
  image?: string;
  timestamp: number;
}

interface Props {
  lang?: Language;
  onItemClick?: (item: ViewedItem) => void;
}

export function RecentlyViewed({ lang = "en", onItemClick }: Props) {
  const [items, setItems] = useState<ViewedItem[]>([]);
  const [_isVisible, setIsVisible] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ViewedItem[];
        setItems(parsed);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
    setIsVisible(false);
  };

  if (items.length === 0) return null;

  return (
    <section class="recently-viewed">
      <div class="recently-viewed-header">
        <h3>{t.recents.recentlyViewed}</h3>
        <button class="clear-history" onClick={handleClear}>
          {t.recents.clearHistory}
        </button>
      </div>
      <div class="recently-viewed-grid">
        {items.slice(0, MAX_ITEMS).map((item) => (
          <button key={item.id} class="recently-viewed-item" onClick={() => onItemClick?.(item)}>
            <div class="recently-viewed-img">
              {item.image ? (
                <img src={item.image} alt={lang === "zh" ? item.name : item.nameEn} />
              ) : (
                <div class="recently-viewed-placeholder">
                  {(lang === "zh" ? item.name : item.nameEn)[0]}
                </div>
              )}
            </div>
            <span class="recently-viewed-name">{lang === "zh" ? item.name : item.nameEn}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Utility function to track a viewed item (can be called from other components)
export function trackView(item: Omit<ViewedItem, "timestamp">) {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let items: ViewedItem[] = [];
  if (stored) {
    try {
      items = JSON.parse(stored);
    } catch {
      items = [];
    }
  }

  // Remove existing entry with same id
  items = items.filter((i) => i.id !== item.id);

  // Add to front
  items.unshift({ ...item, timestamp: Date.now() });

  // Limit to MAX_ITEMS
  items = items.slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
