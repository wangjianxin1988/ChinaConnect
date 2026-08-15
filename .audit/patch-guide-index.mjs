import fs from "node:fs";
const path = "src/pages/[lang]/guide/index.astro";
let s = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const start = s.indexOf("const guides = [");
const end = s.indexOf("const colorClasses = {");
if (start < 0 || end < 0 || end <= start) { console.error("markers not found", start, end); process.exit(1); }
const newBlock = `const gp = (translations[lang] || translations.en).guidePage || translations.en.guidePage;
const bgp = (translations[lang] || translations.en).businessGuidePage || translations.en.businessGuidePage;
const learnMore = (translations[lang] || translations.en).common?.learnMore || "Learn More";
const jaStageMap: Record<string, string> = {
  "Stage 1": "第1段階",
  "Stages 2 & 10": "第2・10段階",
  "Stage 3": "第3段階",
  "Stages 4-7": "第4〜7段階",
  "Stage 8": "第8段階",
  "Stage 9": "第9段階",
  "Stage 11": "第11段階",
  "Stage 12": "第12段階",
};
const stageLabel = (st: string) => (lang === "ja" ? jaStageMap[st] || st : st);
const guides = [
  {
    title: gp.visaTitleShort || "Visa Guide",
    titleCn: "签证指南",
    icon: "📋",
    description: gp.visaSubtitle || "Visa requirements, application process, and essential documents for entering China",
    href: "/guide/visa",
    stage: stageLabel("Stage 1"),
    stageDescription: gp.visaStageDescription || "Pre-departure Preparation",
    color: "blue",
  },
  {
    title: gp.paymentTitleShort || "Payment Guide",
    titleCn: "支付指南",
    icon: "💳",
    description: gp.paymentSubtitle || "Alipay, WeChat Pay, cash, and tax refund procedures in China",
    href: "/guide/payment",
    stage: stageLabel("Stages 2 & 10"),
    stageDescription: gp.paymentStageDescription || "Payment & Shopping",
    color: "green",
  },
  {
    title: gp.communicationTitleShort || "Communication Guide",
    titleCn: "通讯指南",
    icon: "📱",
    description: gp.communicationSubtitle || "SIM/eSIM options, VPN setup, and essential apps for staying connected",
    href: "/guide/communication",
    stage: stageLabel("Stage 3"),
    stageDescription: gp.communicationStageDescription || "Communication Setup",
    color: "purple",
  },
  {
    title: gp.transportTitleShort || "Transport Guide",
    titleCn: "交通指南",
    icon: "🚄",
    description: gp.transportSubtitle || "Airport arrival, metro, bus, taxi, and inter-city transport options",
    href: "/guide/transport",
    stage: stageLabel("Stages 4-7"),
    stageDescription: gp.transportStageDescription || "Arrival to Inter-city",
    color: "orange",
  },
  {
    title: gp.accommodationTitleShort || "Accommodation Guide",
    titleCn: "住宿指南",
    icon: "🏨",
    description: gp.accommodationSubtitle || "Hotel types, booking tips, check-in process, and staying comfortably",
    href: "/guide/accommodation",
    stage: stageLabel("Stage 9"),
    stageDescription: gp.accommodationStageDescription || "Accommodation",
    color: "pink",
  },
  {
    title: gp.emergencyTitleShort || "Emergency Procedures",
    titleCn: "紧急情况处理",
    icon: "🚨",
    description: gp.emergencySubtitle || "Lost passport, medical emergency, theft, scams, and embassy contacts",
    href: "/guide/emergency-procedures",
    stage: stageLabel("Stage 11"),
    stageDescription: gp.emergencyStageDescription || "Emergency Response",
    color: "red",
  },
  {
    title: gp.departureTitleShort || "Departure Guide",
    titleCn: "离境指南",
    icon: "✈️",
    description: gp.departureSubtitle || "Tax refunds, airport transport, duty-free shopping, and departure checklist",
    href: "/guide/departure",
    stage: stageLabel("Stage 12"),
    stageDescription: gp.departureStageDescription || "Leaving China",
    color: "indigo",
  },
  {
    title: gp.diningTitleShort || "Dining Guide",
    titleCn: "餐饮指南",
    icon: "🍜",
    description: gp.diningSubtitle || "Local cuisines, ordering tips, food safety, and dining etiquette in China",
    href: "/guide/dining",
    stage: stageLabel("Stage 8"),
    stageDescription: gp.diningStageDescription || "Food & Restaurants",
    color: "teal",
  },
];

const businessGuides = [
  {
    title: bgp.invitationShort || "Invitation Letter Templates",
    titleCn: "商务邀请函模板",
    icon: "✉️",
    description: bgp.invitationSubtitle || "Download ready-to-use bilingual invitation letters for visa applications",
    href: "/guide/business/invitation-letter",
  },
  {
    title: bgp.expoShort || "Expo & Event Calendar",
    titleCn: "展会与活动日历",
    icon: "📅",
    description: bgp.expoSubtitle || "Plan your trips around China's top trade shows and industry events",
    href: "/guide/business/expo-calendar",
  },
  {
    title: bgp.registrationShort || "Company Registration Guide",
    titleCn: "工商注册指南",
    icon: "🏢",
    description: bgp.registrationSubtitle || "Step-by-step guide for WFOE, Representative Office, and other entities",
    href: "/guide/business/company-registration",
  },
  {
    title: bgp.etiquetteShort || "Business Etiquette Essentials",
    titleCn: "商务礼仪速成",
    icon: "🎯",
    description: bgp.etiquetteSubtitle || "Master Chinese business culture, dining etiquette, and meeting protocols",
    href: "/guide/business/etiquette",
  },
  {
    title: bgp.translationShort || "Translation & Interpreting",
    titleCn: "翻译服务预约",
    icon: "🌍",
    description: bgp.translationSubtitle || "Professional interpreters and translators for business visits",
    href: "/guide/business/translation",
  },
];

`;
s = s.slice(0, start) + newBlock + s.slice(end);
const arrowOld = "                Learn More →";
const arrowNew = "                {learnMore} →";
if (!s.includes(arrowOld)) { console.error("MISSING arrow text"); process.exit(1); }
s = s.replace(arrowOld, arrowNew);
const plainOld = "              Learn More\n              <svg";
const plainNew = "              {learnMore}\n              <svg";
if (!s.includes(plainOld)) { console.error("MISSING plain Learn More"); process.exit(1); }
s = s.replace(plainOld, plainNew);
const tmp = path + ".tmp";
fs.writeFileSync(tmp, s);
fs.renameSync(tmp, path);
console.log("patched", path);
