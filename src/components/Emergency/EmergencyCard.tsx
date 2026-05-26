import React, { useState, useCallback } from "react";

interface Phrase {
  english: string;
  chinese: string;
  pronunciation: string;
  category: string;
  pinyinNumber?: string; // For more accurate pronunciation reference
}

const EMERGENCY_PHRASES: Phrase[] = [
  // Medical - Critical (8 phrases)
  {
    english: "I need an ambulance",
    chinese: "我需要救护车",
    pronunciation: "Wǒ xūyào jiùhù chē",
    category: "medical",
  },
  {
    english: "I am sick / I feel unwell",
    chinese: "我生病了",
    pronunciation: "Wǒ shēngbìng le",
    category: "medical",
  },
  {
    english: "I need a doctor",
    chinese: "我需要医生",
    pronunciation: "Wǒ xūyào yīshēng",
    category: "medical",
  },
  {
    english: "Where is the hospital?",
    chinese: "医院在哪里?",
    pronunciation: "Yīyuàn zài nǎlǐ?",
    category: "medical",
  },
  {
    english: "Please call an ambulance",
    chinese: "请叫救护车",
    pronunciation: "Qǐng jiào jiùhù chē",
    category: "medical",
  },
  {
    english: "I have a headache",
    chinese: "我头疼",
    pronunciation: "Wǒ tóuténg",
    category: "medical",
  },
  {
    english: "I have a stomachache",
    chinese: "我肚子疼",
    pronunciation: "Wǒ dùzi téng",
    category: "medical",
  },
  {
    english: "I am allergic to...",
    chinese: "我对...过敏",
    pronunciation: "Wǒ duì...guòmǐn",
    category: "medical",
  },

  // Police / Emergency (8 phrases)
  { english: "Help!", chinese: "救命!", pronunciation: "Jiùmìng!", category: "police" },
  {
    english: "Call the police!",
    chinese: "叫警察!",
    pronunciation: "Jiào jǐngchá!",
    category: "police",
  },
  {
    english: "I have been robbed",
    chinese: "我被抢劫了",
    pronunciation: "Wǒ bèi qiǎngjié le",
    category: "police",
  },
  {
    english: "I lost my passport",
    chinese: "我的护照丢了",
    pronunciation: "Wǒ de hùzhào diū le",
    category: "police",
  },
  {
    english: "Stop! Thief!",
    chinese: "抓小偷!",
    pronunciation: "Zhuā xiǎotōu!",
    category: "police",
  },
  {
    english: "I have been assaulted",
    chinese: "我被袭击了",
    pronunciation: "Wǒ bèi xíjī le",
    category: "police",
  },
  {
    english: "There is a fire",
    chinese: "着火了",
    pronunciation: "Zháo huǒ le",
    category: "police",
  },
  {
    english: "I need help",
    chinese: "我需要帮助",
    pronunciation: "Wǒ xūyào bāngzhù",
    category: "police",
  },

  // Directions / Navigation (6 phrases)
  {
    english: "Where is the embassy?",
    chinese: "大使馆在哪里?",
    pronunciation: "Dàshǐguǎn zài nǎlǐ?",
    category: "directions",
  },
  {
    english: "How do I get to the hospital?",
    chinese: "怎么去医院?",
    pronunciation: "Zěnme qù yīyuàn?",
    category: "directions",
  },
  { english: "Turn left", chinese: "左转", pronunciation: "Zuǒ zhuǎn", category: "directions" },
  { english: "Turn right", chinese: "右转", pronunciation: "Yòu zhuǎn", category: "directions" },
  { english: "Go straight", chinese: "直走", pronunciation: "Zhí zǒu", category: "directions" },
  {
    english: "Where is the police station?",
    chinese: "派出所在哪里?",
    pronunciation: "Pàichūsuǒ zài nǎlǐ?",
    category: "directions",
  },

  // Basic Communication (8 phrases)
  {
    english: "I do not understand",
    chinese: "我不明白",
    pronunciation: "Wǒ bù míngbái",
    category: "basic",
  },
  {
    english: "Please speak slowly",
    chinese: "请说慢一点",
    pronunciation: "Qǐng shuō màn yīdiǎn",
    category: "basic",
  },
  {
    english: "Do you speak English?",
    chinese: "你会说英语吗?",
    pronunciation: "Nǐ huì shuō Yīngyǔ ma?",
    category: "basic",
  },
  {
    english: "Please help me",
    chinese: "请帮帮我",
    pronunciation: "Qǐng bāng bāng wǒ",
    category: "basic",
  },
  {
    english: "I need a translator",
    chinese: "我需要翻译",
    pronunciation: "Wǒ xūyào fānyì",
    category: "basic",
  },
  {
    english: "Where is the restroom?",
    chinese: "厕所在哪里?",
    pronunciation: "Cèsuǒ zài nǎlǐ?",
    category: "basic",
  },
  {
    english: "Please call my family",
    chinese: "请打电话给我的家人",
    pronunciation: "Qǐng dǎ diànhuà gěi wǒ de jiārén",
    category: "basic",
  },
  { english: "I am lost", chinese: "我迷路了", pronunciation: "Wǒ mílù le", category: "basic" },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: "📋" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "police", label: "Police", icon: "🚔" },
  { id: "directions", label: "Directions", icon: "🧭" },
  { id: "basic", label: "Basic", icon: "💬" },
];

interface EmergencyCardProps {
  className?: string;
  compact?: boolean;
}

export function EmergencyCard({ className = "", compact = false }: EmergencyCardProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);

  const filteredPhrases =
    activeCategory === "all"
      ? EMERGENCY_PHRASES
      : EMERGENCY_PHRASES.filter((p) => p.category === activeCategory);

  const displayPhrases = compact ? filteredPhrases.slice(0, 8) : filteredPhrases;

  const speakText = useCallback((phrase: Phrase) => {
    if (!("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    setSpeakingPhrase(phrase.chinese);

    // Create Chinese utterance
    const utterance = new SpeechSynthesisUtterance(phrase.chinese);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8; // Slower for clarity
    utterance.pitch = 1;

    // Try to find a Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find((v) => v.lang.includes("zh"));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    utterance.onend = () => {
      setSpeakingPhrase(null);
    };

    utterance.onerror = () => {
      setSpeakingPhrase(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speakEnglish = useCallback((phrase: Phrase) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    setSpeakingPhrase(phrase.english);

    const utterance = new SpeechSynthesisUtterance(phrase.english);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setSpeakingPhrase(null);
    };

    utterance.onerror = () => {
      setSpeakingPhrase(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🚨</span> Emergency Translation Card
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {compact ? "Tap to hear pronunciation" : "20+ essential phrases for emergencies"}
            </p>
          </div>
          <button
            onClick={() => setShowPronunciation(!showPronunciation)}
            className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-colors"
          >
            {showPronunciation ? "Hide" : "Show"} Pinyin
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b bg-slate-50">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? "bg-white text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span>{cat.icon}</span>
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Phrase List */}
      <div className={`overflow-y-auto ${compact ? "max-h-[300px]" : "max-h-[500px]"}`}>
        <div className="p-2 grid gap-1">
          {displayPhrases.map((phrase, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
            >
              <button
                onClick={() => speakText(phrase)}
                className="flex-1 text-left"
                disabled={speakingPhrase === phrase.chinese}
              >
                <div className="text-sm text-gray-500 mb-1">{phrase.english}</div>
                <div className="font-semibold text-slate-900 text-lg">{phrase.chinese}</div>
                {showPronunciation && (
                  <div className="text-xs text-gray-400 mt-1 font-mono">{phrase.pronunciation}</div>
                )}
              </button>

              {/* Audio Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => speakText(phrase)}
                  disabled={speakingPhrase === phrase.chinese}
                  className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors disabled:opacity-50"
                  aria-label="Hear Chinese pronunciation"
                >
                  {speakingPhrase === phrase.chinese ? (
                    <span className="animate-pulse">🔊</span>
                  ) : (
                    <span className="text-lg">🔊</span>
                  )}
                </button>
                {!compact && (
                  <button
                    onClick={() => speakEnglish(phrase)}
                    className="w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                    aria-label="Hear English pronunciation"
                  >
                    <span className="text-lg">🇬🇧</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Notice */}
      <div className="bg-amber-50 border-t border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
        <span>💡</span>
        <span>Works offline - phrases are cached. Tap any phrase to hear pronunciation.</span>
      </div>
    </div>
  );
}

export default EmergencyCard;
