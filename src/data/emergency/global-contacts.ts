/**
 * National-level emergency contacts that apply to ALL cities in China.
 * These are the numbers a foreign visitor should know beyond the per-city
 * 110 / 120 / 119 / 122 (which only work inside mainland China and only
 * when called from a Chinese SIM or with international roaming).
 *
 * The 24-hour consular protection hotline 12308 is the most important
 * entry point for foreigners anywhere in China.
 */
export interface EmergencyNumber {
  /** International format, e.g. "+86-10-12308" — what `tel:` will dial. */
  phone: string;
  /** Short code for in-China calls (only works on Chinese SIMs). */
  shortCode?: string;
  /** English label */
  name: string;
  /** Chinese label */
  nameZh: string;
  /** One-line description in English */
  description: string;
  /** Icon emoji */
  icon: string;
  /** Whether the number can be reached from outside mainland China */
  international: boolean;
}

export const NATIONAL_EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    phone: "+86-10-12308",
    shortCode: "12308",
    name: "Consular Protection Hotline",
    nameZh: "外交部领事保护热线",
    description:
      "24/7 hotline for foreign nationals in China. Use for lost passports, arrests, accidents, or any consular assistance.",
    icon: "🛂",
    international: true,
  },
  {
    phone: "+86-10-65680000",
    name: "MFA 24h Service",
    nameZh: "外交部 24 小时服务",
    description: "Chinese Ministry of Foreign Affairs 24-hour service line.",
    icon: "🏛️",
    international: true,
  },
  {
    phone: "+86-12301",
    shortCode: "12301",
    name: "Tourist Complaint & Help",
    nameZh: "旅游投诉热线",
    description: "National tourism complaint line and tourist assistance.",
    icon: "🧳",
    international: true,
  },
  {
    phone: "+86-12318",
    shortCode: "12318",
    name: "Cultural Market (IP)",
    nameZh: "文化市场举报",
    description: "Report cultural-market violations (tourist traps, unlicensed guides).",
    icon: "📞",
    international: true,
  },
  {
    phone: "+86-12345",
    shortCode: "12345",
    name: "Government Service",
    nameZh: "市民服务热线",
    description: "General-purpose government service hotline; many cities answer in basic English.",
    icon: "📋",
    international: true,
  },
  {
    phone: "+86-12123",
    shortCode: "12123",
    name: "Traffic Police Service",
    nameZh: "交警服务热线",
    description: "Traffic police general service line.",
    icon: "🚓",
    international: true,
  },
];

/**
 * Get the list of national emergency numbers that a foreign visitor should
 * always see, regardless of which city page they are on. Order matters —
 * 12308 (consular protection) is the most important.
 */
export function getNationalEmergencyNumbers(): EmergencyNumber[] {
  return NATIONAL_EMERGENCY_NUMBERS;
}
