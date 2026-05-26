import React, { useCallback } from "react";

interface EmergencyContact {
  name: string;
  nameCn: string;
  number: string;
  icon: string;
  bgColor: string;
  label: string;
}

interface QuickDialProps {
  compact?: boolean;
  onCall?: (number: string) => void;
}

const EMERGENCY_NUMBERS: EmergencyContact[] = [
  {
    name: "Police",
    nameCn: "警察",
    number: "110",
    icon: "🚔",
    bgColor: "bg-blue-600",
    label: "Police - 警察",
  },
  {
    name: "Ambulance",
    nameCn: "救护车",
    number: "120",
    icon: "🚑",
    bgColor: "bg-red-600",
    label: "Ambulance - 救护车",
  },
  {
    name: "Fire",
    nameCn: "消防",
    number: "119",
    icon: "🚒",
    bgColor: "bg-orange-500",
    label: "Fire - 消防",
  },
  {
    name: "Traffic",
    nameCn: "交通事故",
    number: "122",
    icon: "🚗",
    bgColor: "bg-green-600",
    label: "Traffic - 交通事故",
  },
];

// Map bgColor strings to Tailwind arbitrary values for inline style usage
const BG_COLOR_MAP: Record<string, string> = {
  "bg-blue-600": "#2563eb",
  "bg-red-600": "#dc2626",
  "bg-orange-500": "#f97316",
  "bg-green-600": "#16a34a",
};

export function QuickDial({ compact = false, onCall }: QuickDialProps) {
  const handleCall = useCallback(
    (number: string) => {
      if (onCall) {
        onCall(number);
      } else {
        window.location.href = `tel:${number}`;
      }
    },
    [onCall],
  );

  if (compact) {
    // Compact list for expanded menu
    return (
      <div className="space-y-1">
        {EMERGENCY_NUMBERS.map((contact) => (
          <button
            key={contact.number}
            onClick={() => handleCall(contact.number)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-white hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: BG_COLOR_MAP[contact.bgColor] || "#6b7280" }}
            aria-label={contact.label}
          >
            <span className="text-xl">{contact.icon}</span>
            <div className="text-left flex-1">
              <div className="font-bold text-lg">{contact.number}</div>
              <div className="text-xs opacity-90">{contact.nameCn}</div>
            </div>
            <span className="text-sm opacity-80">Tap to call</span>
          </button>
        ))}
      </div>
    );
  }

  // Full grid layout for emergency page
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {EMERGENCY_NUMBERS.map((contact) => (
        <button
          key={contact.number}
          onClick={() => handleCall(contact.number)}
          className={`${contact.bgColor} text-white p-6 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl`}
          aria-label={contact.label}
        >
          <div className="text-4xl mb-3">{contact.icon}</div>
          <div className="font-bold text-xl">{contact.number}</div>
          <div className="text-white/90 text-sm mt-1">{contact.name}</div>
          <div className="text-white/70 text-xs">{contact.nameCn}</div>
        </button>
      ))}
    </div>
  );
}

export default QuickDial;
