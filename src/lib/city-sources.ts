// Per-language label helper for the "Authoritative Data Sources" sections on city pages.
// - ja: keeps the verified Japanese display (brand names may include CJK, per ja standard)
// - zh-CN / zh-TW: local Chinese names
// - all other languages: English brand names only (no Chinese)
export function citySourceLabel(lang: string, id: string): string {
  switch (id) {
    case "mafengwo":
      if (lang === "zh-CN") return "马蜂窝";
      if (lang === "zh-TW") return "馬蜂窩";
      if (lang === "ja") return "Mafengwo（馬蜂窩）";
      return "Mafengwo";
    case "chinanews":
      if (lang === "zh-CN") return "新华网";
      if (lang === "zh-TW") return "新華網";
      if (lang === "ja") return "China News（新華網）";
      return "China News";
    case "mct":
      if (lang === "zh-CN") return "文化和旅游部";
      if (lang === "zh-TW") return "文化和旅遊部";
      if (lang === "ja") return "文化・観光部";
      return "Ministry of Culture & Tourism";
    case "dianping":
      if (lang === "zh-CN") return "大众点评";
      if (lang === "zh-TW") return "大眾點評";
      if (lang === "ja") return "ダイアンピン (大众点评 Dianping)";
      return "Dianping";
    case "michelin":
      if (lang === "ja") return "ミシュランガイド Michelin Guide";
      return "Michelin Guide";
    case "meishij":
      if (lang === "zh-CN") return "美食杰";
      if (lang === "zh-TW") return "美食傑";
      if (lang === "ja") return "メイシイ (美食杰 Meishij)";
      return "Meishij";
    case "ctrip":
      if (lang === "zh-CN") return "携程 Ctrip / Trip.com";
      if (lang === "zh-TW") return "攜程 Ctrip / Trip.com";
      if (lang === "ja") return "シートリップ (携程 Ctrip) / Trip.com";
      return "Ctrip / Trip.com";
    default:
      return id;
  }
}
