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
  /** Japanese label */
  nameJa?: string;
  /** One-line description in English */
  description: string;
  /** One-line description in Japanese */
  descriptionJa?: string;
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
    nameJa: "領事保護ホットライン",
    nameZh: "外交部领事保护热线",
    description:
      "24-hour consular protection hotline for foreigners in China. Call for lost passports, arrest, accidents, or other consular support.",
    descriptionJa: "中国にいる外国人向けの24時間ホットライン。パスポート紛失、逮捕、事故、その他領事関係のサポートが必要な時にご利用ください。",
    icon: "🛂",
    international: true,
  },
  {
    phone: "+86-10-65680000",
    name: "Ministry of Foreign Affairs 24-hour Service",
    nameJa: "中国外交部 24時間サービス",
    nameZh: "外交部 24 小时服务",
    description:
      "24-hour service line of the Chinese Ministry of Foreign Affairs.",
    descriptionJa: "中国外交部の24時間サービス回線。",
    icon: "🏛️",
    international: true,
  },
  {
    phone: "+86-12301",
    shortCode: "12301",
    name: "Tourist Complaint & Help",
    nameJa: "観光苦情・相談ホットライン",
    nameZh: "旅游投诉热线",
    description:
      "National tourism complaint line and tourist assistance.",
    descriptionJa: "全国観光苦情ホットラインおよび観光サポート。",
    icon: "🧳",
    international: true,
  },
  {
    phone: "+86-12318",
    shortCode: "12318",
    name: "Cultural Market (IP)",
    nameJa: "文化市場（知的財産）",
    nameZh: "文化市场举报",
    description:
      "Report cultural-market violations (tourist traps, unlicensed guides).",
    descriptionJa: "文化市場の違反（観光客向けぼったくり、無資格ガイドなど）の通報窓口。",
    icon: "📞",
    international: true,
  },
  {
    phone: "+86-12345",
    shortCode: "12345",
    name: "Government Service",
    nameJa: "政府サービス",
    nameZh: "市民服务热线",
    description:
      "General-purpose government service hotline; many cities answer in basic English.",
    descriptionJa: "一般的な政府サービスホットライン。多くの都市で基本的な英語対応が可能。",
    icon: "📋",
    international: true,
  },
  {
    phone: "+86-12123",
    shortCode: "12123",
    name: "Traffic Police Service",
    nameJa: "交通警察サービス",
    nameZh: "交警服务热线",
    description:
      "Traffic police general service line.",
    descriptionJa: "交通警察の一般サービス回線。",
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
