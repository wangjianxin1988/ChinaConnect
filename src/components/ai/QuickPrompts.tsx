/**
 * QuickPrompts Component
 * Displays quick action buttons for common travel queries
 */

import React, { useCallback } from "react";

interface QuickPrompt {
  label: string;
  prompt: string;
  icon?: string;
}

interface QuickPromptsProps {
  language?: "en" | "zh" | "ja" | "ko";
  onSelect: (prompt: string) => void;
  variant?: "default" | "compact" | "expanded";
  showLabels?: boolean;
}

const QUICK_PROMPTS: Record<string, QuickPrompt[]> = {
  en: [
    {
      label: "Beijing 5 Days",
      prompt:
        "I want to explore Beijing for 5 days, interested in imperial history and modern culture",
      icon: "🏰",
    },
    {
      label: "Shanghai Weekend",
      prompt: "Planning a 3-day weekend trip to Shanghai, first time visitor",
      icon: "🌆",
    },
    {
      label: "Food Tour",
      prompt: "I am a foodie, recommend the best food destinations in China",
      icon: "🍜",
    },
    {
      label: "Nature Adventure",
      prompt: "Looking for nature and adventure, Zhangjiajie or Guilin for 7 days",
      icon: "🏔️",
    },
    {
      label: "Business Trip",
      prompt: "I have a business meeting in Shenzhen next week, need visa info and transport tips",
      icon: "💼",
    },
    {
      label: "How to Pay",
      prompt: "How do I use WeChat Pay and Alipay as a foreign tourist?",
      icon: "💳",
    },
    {
      label: "Visa Requirements",
      prompt: "What visa do I need to visit China? Can I get a visa on arrival?",
      icon: "📋",
    },
    {
      label: "Great Wall Trip",
      prompt: "Best way to visit the Great Wall of China? Which section is best for first-timers?",
      icon: "🏯",
    },
    {
      label: "Transport in City",
      prompt: "How to get around in Chinese cities? Metro, taxi, or bike?",
      icon: "🚇",
    },
    {
      label: "Chinese Etiquette",
      prompt: "What cultural etiquette should I know before visiting China?",
      icon: "🙏",
    },
    {
      label: "Emergency Info",
      prompt: "What emergency numbers and services are available in China?",
      icon: "🚑",
    },
    {
      label: "SIM & Internet",
      prompt: "How to get a SIM card and internet access in China as a tourist?",
      icon: "📱",
    },
  ],
  zh: [
    {
      label: "北京5日游",
      prompt: "我想去北京玩5天，对历史文化和现代景观感兴趣",
      icon: "🏰",
    },
    {
      label: "上海周末",
      prompt: "计划周末去上海3天，第一次来中国",
      icon: "🌆",
    },
    {
      label: "美食之旅",
      prompt: "我是美食爱好者，推荐中国美食目的地",
      icon: "🍜",
    },
    {
      label: "自然风光",
      prompt: "想看自然风光，张家界或桂林7天行程",
      icon: "🏔️",
    },
    {
      label: "商务出行",
      prompt: "下周要去深圳出差，需要签证和交通信息",
      icon: "💼",
    },
    {
      label: "支付方式",
      prompt: "外国游客如何使用微信支付和支付宝？",
      icon: "💳",
    },
    {
      label: "签证要求",
      prompt: "来中国需要什么签证？可以落地签吗？",
      icon: "📋",
    },
    {
      label: "长城游览",
      prompt: "游览长城最佳方式？第一次去哪个段落最好？",
      icon: "🏯",
    },
    {
      label: "城市交通",
      prompt: "在中国城市如何出行？地铁、打车还是骑车？",
      icon: "🚇",
    },
    {
      label: "文化礼仪",
      prompt: "访华前需要了解哪些文化礼仪？",
      icon: "🙏",
    },
    {
      label: "紧急求助",
      prompt: "在中国有哪些紧急号码和服务？",
      icon: "🚑",
    },
    {
      label: "SIM卡网络",
      prompt: "外国游客如何在中国办理SIM卡和上网？",
      icon: "📱",
    },
  ],
  ja: [
    {
      label: "北京5日間",
      prompt: "北京を5日間観光したい、皇帝の歴史と現代文化に興味がある",
      icon: "🏰",
    },
    {
      label: "上海週末",
      prompt: "上海への3日間の旅行を計画、初めて中国に来る",
      icon: "🌆",
    },
    {
      label: "美食の旅",
      prompt: "フード好きとして、中国の美食目的地を教えて",
      icon: "🍜",
    },
  ],
  ko: [
    {
      label: "베이징 5일",
      prompt: "베이징에서 5일 동안 관광하고 싶어요, 제국의 역사与现代 문화에 관심",
      icon: "🏰",
    },
    {
      label: "상하이 주말",
      prompt: "상하이 3일 여행을 계획 중, 첫 중국 방문",
      icon: "🌆",
    },
    {
      label: "미식 여행",
      prompt: "미식가로서 중국의 음식 목적지를 추천해줘",
      icon: "🍜",
    },
  ],
};

const CATEGORY_GROUPS: Record<string, string[]> = {
  en: ["travel", "food", "help"],
  zh: ["旅游", "美食", "帮助"],
};

const PROMPT_CATEGORIES = {
  en: {
    travel: { label: "Trip Planning", color: "bg-blue-100 text-blue-700 border-blue-200" },
    food: { label: "Food & Dining", color: "bg-orange-100 text-orange-700 border-orange-200" },
    help: { label: "Life Help", color: "bg-green-100 text-green-700 border-green-200" },
  },
  zh: {
    travel: { label: "行程规划", color: "bg-blue-100 text-blue-700 border-blue-200" },
    food: { label: "美食餐饮", color: "bg-orange-100 text-orange-700 border-orange-200" },
    help: { label: "生活帮助", color: "bg-green-100 text-green-700 border-green-200" },
  },
};

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  language = "en",
  onSelect,
  variant = "default",
  showLabels = true,
}) => {
  const prompts = QUICK_PROMPTS[language] || QUICK_PROMPTS.en;

  const handleSelect = useCallback(
    (prompt: string) => {
      onSelect(prompt);
    },
    [onSelect],
  );

  // Compact variant - horizontal scrollable pills
  if (variant === "compact") {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {prompts.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSelect(item.prompt)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all whitespace-nowrap"
          >
            {item.icon && <span>{item.icon}</span>}
            {showLabels && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    );
  }

  // Expanded variant - grouped by category
  if (variant === "expanded") {
    const categories = PROMPT_CATEGORIES[language] || PROMPT_CATEGORIES.en;
    const _categoryGroups = CATEGORY_GROUPS[language] || CATEGORY_GROUPS.en;

    // Split prompts into groups
    const travelPrompts = prompts.slice(0, 2);
    const foodPrompts = prompts.slice(2, 3);
    const helpPrompts = prompts.slice(3);

    return (
      <div className="space-y-4">
        {/* Trip Planning */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {categories.travel?.label || "Trip Planning"}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {travelPrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSelect(item.prompt)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-sm ${categories.travel?.color || "bg-gray-50"}`}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Food & Dining */}
        {foodPrompts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {categories.food?.label || "Food & Dining"}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {foodPrompts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.prompt)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-sm ${categories.food?.color || "bg-orange-50"}`}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Life Help */}
        {helpPrompts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {categories.help?.label || "Life Help"}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {helpPrompts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.prompt)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-sm ${categories.help?.color || "bg-green-50"}`}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - horizontal chips with descriptions
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 font-medium px-1">
        {language === "zh" ? "试试这些快捷提示" : "Try these quick prompts"}
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSelect(item.prompt)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all hover:shadow-sm group"
          >
            {item.icon && (
              <span className="text-lg group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
            )}
            <span className="font-medium">{item.label}</span>
            <svg
              className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
