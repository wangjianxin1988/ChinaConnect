// Emergency Procedures Guide Data - Stage 11: Urgent Situations
export interface EmergencyType {
  type: string;
  icon: string;
  severity: "critical" | "high" | "medium";
  description: string;
  descriptionCn: string;
  immediateActions: string[];
  immediateActionsCn: string[];
  prevention: string[];
  preventionCn: string[];
  recoverySteps: string[];
  recoveryStepsCn: string[];
  usefulPhrases: string[];
  usefulPhrasesCn: string[];
}

export interface EmergencyContact {
  service: string;
  icon: string;
  number: string;
  description: string;
  descriptionCn: string;
  availability: string;
  availabilityCn: string;
}

export interface EmbassyInfo {
  country: string;
  flag: string;
  embassyName: string;
  address: string;
  addressCn: string;
  phone: string;
  emergency: string;
  website: string;
}

// Emergency Scenarios - Stage 11
export const EMERGENCY_TYPES: EmergencyType[] = [
  {
    type: "Lost Passport",
    icon: "📄",
    severity: "critical",
    description:
      "Your passport is lost or stolen and you need to continue your trip or return home.",
    descriptionCn: "您的护照丢失或被盗，需要继续行程或返回本国。",
    immediateActions: [
      "Report to nearest police station immediately",
      "Get a police report (important - you need this for insurance)",
      "Contact your embassy for emergency passport",
      "Contact family/employer to inform situation",
      "Locate nearest embassy/consulate",
      "Prepare documents: photos, ID copies, police report",
    ],
    immediateActionsCn: [
      "立即向最近的派出所报案",
      "获取报案证明（重要——您会需要它）",
      "联系大使馆申请紧急护照",
      "联系家人/雇主告知情况",
      "找到最近的大使馆/领事馆",
      "准备文件：照片、身份证复印件、报案证明",
    ],
    prevention: [
      "Keep passport copy in cloud storage",
      "Leave copy with family member",
      "Carry only necessary ID copies",
      "Use hotel safe for original passport when not traveling",
      "Take photo of passport pages",
      "Register with embassy before travel",
    ],
    preventionCn: [
      "在云端存储护照复印件",
      "留一份给家人",
      "只携带必要的身份证复印件",
      "不旅行时将原件护照存放在酒店保险箱",
      "拍摄护照页照片",
      "旅行前向大使馆登记",
    ],
    recoverySteps: [
      "Apply for Travel Document at embassy",
      "Police report + photos required",
      "Processing time: 1-3 business days",
      "May need to visit twice",
      "Consider emergency travel certificate",
      "Inform airlines about new document",
    ],
    recoveryStepsCn: [
      "在大使馆申请旅行证",
      "需要报案证明+照片",
      "处理时间：1-3个工作日",
      "可能需要访问两次",
      "考虑申请旅行紧急证明",
      "告知航空公司新证件信息",
    ],
    usefulPhrases: [
      "My passport is lost: 我的护照丢了",
      "I need a new passport: 我需要新护照",
      "Where is the police station?: 派出所在哪里?",
      "I need a police report: 我需要报案证明",
      "Emergency passport please: 请给我紧急护照",
    ],
    usefulPhrasesCn: [
      "我的护照丢了",
      "我需要新护照",
      "派出所在哪里?",
      "我需要报案证明",
      "请给我紧急护照",
    ],
  },
  {
    type: "Medical Emergency",
    icon: "🏥",
    severity: "critical",
    description:
      "You or someone with you has a serious medical condition requiring immediate attention.",
    descriptionCn: "您或身边的人有严重疾病需要立即治疗。",
    immediateActions: [
      "Call 120 for ambulance",
      "Go to nearest hospital emergency",
      "Contact hotel for help",
      "Call embassy if seriously ill",
      "Notify travel insurance company",
      "Keep all medical documents",
    ],
    immediateActionsCn: [
      "拨打120叫救护车",
      "去最近的医院急诊",
      "联系酒店寻求帮助",
      "如有严重疾病联系大使馆",
      "通知旅行保险公司",
      "保留所有医疗文件",
    ],
    prevention: [
      "Buy travel insurance with medical coverage",
      "Carry prescription medications with documentation",
      "Know blood type and allergies",
      "Keep emergency contacts in phone",
      "Register with embassy travel notification",
      "Know location of nearest hospitals",
    ],
    preventionCn: [
      "购买含医疗保障的旅行保险",
      "携带带文档的处方药物",
      "了解血型和过敏信息",
      "在手机中保存紧急联系人",
      "在大使馆登记旅行通知",
      "了解最近医院的位置",
    ],
    recoverySteps: [
      "Get medical report from hospital",
      "Contact insurance for direct payment",
      "Keep all receipts for reimbursement",
      "Follow up with doctors as needed",
      "Request medical records for home country",
      "Plan return travel if necessary",
    ],
    recoveryStepsCn: [
      "从医院获取医疗报告",
      "联系保险公司直接支付",
      "保留所有收据以便报销",
      "根据需要跟进医生",
      "要求医疗记录以便回本国使用",
      "如有需要计划返程",
    ],
    usefulPhrases: [
      "I need a doctor: 我需要医生",
      "Call an ambulance: 请叫救护车",
      "Hospital在哪里?: 医院在哪里?",
      "I have medical insurance: 我有医疗保险",
      "I am allergic to...: 我对...过敏",
      "Where is the pharmacy?: 药房在哪里?",
    ],
    usefulPhrasesCn: [
      "我需要医生",
      "请叫救护车",
      "医院在哪里?",
      "我有医疗保险",
      "我对...过敏",
      "药房在哪里?",
    ],
  },
  {
    type: "Theft/Robbery",
    icon: "🚔",
    severity: "high",
    description: "You have been robbed or your belongings have been stolen.",
    descriptionCn: "您被抢劫或财物被盗。",
    immediateActions: [
      "Ensure personal safety first",
      "Go to nearest police station",
      "File detailed police report",
      "Cancel credit cards immediately",
      "Contact embassy if passport stolen",
      "Notify hotel staff",
    ],
    immediateActionsCn: [
      "首先确保个人安全",
      "去最近的派出所",
      "提交详细报案",
      "立即挂失信用卡",
      "护照被盗联系大使馆",
      "通知酒店工作人员",
    ],
    prevention: [
      "Use hotel safe for valuables",
      "Do not carry large amounts of cash",
      "Keep copies of important documents",
      "Be aware of surroundings",
      "Avoid displaying expensive items",
      "Use anti-theft bags in crowded places",
    ],
    preventionCn: [
      "贵重物品存放在酒店保险箱",
      "不要携带大量现金",
      "保留重要文件复印件",
      "注意周围环境",
      "避免展示贵重物品",
      "在拥挤地方使用防盗包",
    ],
    recoverySteps: [
      "Get police report for insurance",
      "Contact insurance company",
      "Replace identification documents",
      "Check CCTV footage if available",
      "Monitor accounts for fraud",
      "Update online account security",
    ],
    recoveryStepsCn: [
      "获取报案证明以便保险",
      "联系保险公司",
      "补办身份证件",
      "如有需要查看监控录像",
      "监控账户欺诈",
      "更新在线账户安全",
    ],
    usefulPhrases: [
      "I was robbed: 我被抢劫了",
      "Call the police: 请报警",
      "My wallet was stolen: 我的钱包被偷了",
      "I need a police report: 我需要报案证明",
      "Cancel my credit card: 请挂失我的信用卡",
    ],
    usefulPhrasesCn: [
      "我被抢劫了",
      "请报警",
      "我的钱包被偷了",
      "我需要报案证明",
      "请挂失我的信用卡",
    ],
  },
  {
    type: "Scammed",
    icon: "⚠️",
    severity: "medium",
    description: "You have been deceived or tricked into giving money or personal information.",
    descriptionCn: "您被骗或被诱骗给出金钱或个人信息。",
    immediateActions: [
      "Stop any ongoing transactions immediately",
      "Document the scam with screenshots/messages",
      "Contact bank to freeze accounts if needed",
      "File police report",
      "Contact platform if online scam",
      "Preserve all evidence",
    ],
    immediateActionsCn: [
      "立即停止任何正在进行交易",
      "用截图/消息记录诈骗情况",
      "如有需要联系银行冻结账户",
      "向警方报案",
      "如是在线诈骗联系平台",
      "保留所有证据",
    ],
    prevention: [
      "Never send money to strangers",
      "Verify identities before transactions",
      "Use official platforms only",
      "Be suspicious of too-good offers",
      "Check reviews before purchases",
      "Trust instincts - if it feels wrong, it probably is",
    ],
    preventionCn: [
      "绝不要向陌生人汇款",
      "交易前核实身份",
      "仅使用官方平台",
      "对太好offer保持怀疑",
      "购买前查看评价",
      "相信直觉——如果感觉不对，可能就是不对",
    ],
    recoverySteps: [
      "File comprehensive police report",
      "Contact platform for buyer protection",
      "Report to consumer protection (12315)",
      "Notify bank for fraud protection",
      "Be aware of recovery scam approaches",
      "Share experience to warn others",
    ],
    recoveryStepsCn: [
      "提交全面的报案",
      "联系平台申请买家保护",
      "向消费者保护部门举报（12315）",
      "通知银行欺诈保护",
      "警惕诈骗恢复骗局",
      "分享经历以警示他人",
    ],
    usefulPhrases: [
      "I was scammed: 我被骗了",
      "I want to report a fraud: 我要举报诈骗",
      "Return my money: 把钱还给我",
      "I called the police: 我已经报警了",
      "This is a scam: 这是诈骗",
    ],
    usefulPhrasesCn: ["我被骗了", "我要举报诈骗", "把钱还给我", "我已经报警了", "这是诈骗"],
  },
  {
    type: "Natural Disaster",
    icon: "🌀",
    severity: "high",
    description: "Earthquake, flood, typhoon, or other natural disaster affects your area.",
    descriptionCn: "地震、洪水、台风或其他自然灾害影响您所在地区。",
    immediateActions: [
      "Follow local authorities instructions",
      "Move to safe location if advised",
      "Contact hotel staff for guidance",
      "Notify family of safety",
      "Monitor official news sources",
      "Keep emergency kit accessible",
    ],
    immediateActionsCn: [
      "遵循当地政府指示",
      "如被建议转移到安全位置",
      "联系酒店工作人员获取指导",
      "通知家人安全情况",
      "关注官方新闻来源",
      "保持应急包方便取用",
    ],
    prevention: [
      "Know emergency exits in hotel",
      "Register with embassy for alerts",
      "Know shelter locations",
      "Keep phone charged",
      "Have emergency cash reserve",
      "Know local emergency number",
    ],
    preventionCn: [
      "了解酒店紧急出口位置",
      "向大使馆登记以便接收警报",
      "了解避难所位置",
      "保持手机电量充足",
      "留有紧急现金储备",
      "了解当地紧急电话号码",
    ],
    recoverySteps: [
      "Wait for official all-clear",
      "Check for injuries",
      "Assess accommodation safety",
      "Contact insurance if damaged",
      "Arrange alternative transport if needed",
      "Update family on status",
    ],
    recoveryStepsCn: [
      "等待官方解除警报",
      "检查是否有伤亡",
      "评估住宿安全性",
      "如有损坏联系保险公司",
      "如有需要安排替代交通",
      "向家人更新状态",
    ],
    usefulPhrases: [
      "Where is the shelter?: 避难所在哪里?",
      "Is it safe to go outside?: 出门安全吗?",
      "Where can I get supplies?: 我可以在哪里获得物资?",
      "The earthquake is...: 地震了...",
      "I need help: 我需要帮助",
    ],
    usefulPhrasesCn: [
      "避难所在哪里?",
      "出门安全吗?",
      "我可以在哪里获得物资?",
      "地震了...",
      "我需要帮助",
    ],
  },
];

// Emergency Contacts - Stage 11
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    service: "Police",
    icon: "🚔",
    number: "110",
    description: "Police emergency number - report crimes, accidents",
    descriptionCn: "报警电话——报案、交通事故",
    availability: "24/7",
    availabilityCn: "24小时",
  },
  {
    service: "Medical Emergency",
    icon: "🏥",
    number: "120",
    description: "Ambulance and medical emergency services",
    descriptionCn: "救护车和医疗急救服务",
    availability: "24/7",
    availabilityCn: "24小时",
  },
  {
    service: "Fire Department",
    icon: "🚒",
    number: "119",
    description: "Fire emergency and rescue services",
    descriptionCn: "火灾急救和救援服务",
    availability: "24/7",
    availabilityCn: "24小时",
  },
  {
    service: "Tourism Hotlines",
    icon: "📞",
    number: "12345",
    description: "Tourism complaints and travel information (merged from 12301)",
    descriptionCn: "旅游投诉和旅行信息",
    availability: "24/7",
    availabilityCn: "24小时",
  },
  {
    service: "Consumer Protection",
    icon: "🛡️",
    number: "12315",
    description: "Consumer rights protection and complaints",
    descriptionCn: "消费者权益保护和投诉",
    availability: "Business hours",
    availabilityCn: "工作时间",
  },
];

// Embassy Information
export const EMBASSY_INFO: EmbassyInfo[] = [
  {
    country: "United States",
    flag: "🇺🇸",
    embassyName: "U.S. Embassy Beijing",
    address: "No. 55 An Jia Lou Road, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区安家楼路55号",
    phone: "+86-10-8531-3000",
    emergency: "+86-10-8531-4000",
    website: "https://www.state.gov/countries-areas/china/",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    embassyName: "British Embassy Beijing",
    address: "11 Guanghua Road, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区光华路11号",
    phone: "+86-10-8529-6600",
    emergency: "+86-10-8529-6600",
    website: "https://www.gov.uk/world/china",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    embassyName: "Canadian Embassy Beijing",
    address: "19 Dongzhimen Beilu, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东直门北大街19号",
    phone: "+86-10-5139-4000",
    emergency: "+86-10-5139-4000",
    website: "https://www.international.gc.ca/country-pays/china-chine/index.aspx?lang=eng",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    embassyName: "Australian Embassy Beijing",
    address: "21 Dongzhimen Beilu, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东直门北大街21号",
    phone: "+86-10-5140-4111",
    emergency: "+86-10-5140-4111",
    website: "https://china.embassy.gov.au",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    embassyName: "German Embassy Beijing",
    address: "17 Dong Zhi Men Wai Da Jie, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东直门外大街17号",
    phone: "+86-10-8532-9000",
    emergency: "+86-10-8532-9000",
    website: "https://china.diplo.de",
  },
  {
    country: "France",
    flag: "🇫🇷",
    embassyName: "French Embassy Beijing",
    address: "60 Tianze Lu, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区天泽路60号",
    phone: "+86-10-8531-2000",
    emergency: "+86-10-8531-2000",
    website: "https://cn.ambafrance.org",
  },
  {
    country: "Japan",
    flag: "🇯🇵",
    embassyName: "Japanese Embassy Beijing",
    address: "1 Liang Ma Qiao, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区亮马桥东街1号",
    phone: "+86-10-8531-9800",
    emergency: "+86-10-8531-9800",
    website: "https://www.cn.emb-japan.go.jp",
  },
  {
    country: "South Korea",
    flag: "🇰🇷",
    embassyName: "Korean Embassy Beijing",
    address: "No. 20 Dongfangdonglu, Chaoyang District, Beijing",
    addressCn: "北京市朝阳区东方东路20号",
    phone: "+86-10-8531-0700",
    emergency: "+86-10-8531-0704",
    website: "https://chn.mofa.go.kr",
  },
];

export const EMERGENCY_HELPERS = {
  essentialPhrases: [
    { english: "Help!", chinese: "救命!" },
    { english: "I need help", chinese: "我需要帮助" },
    { english: "Call the police", chinese: "报警" },
    { english: "I need a doctor", chinese: "我需要医生" },
    { english: "I am in danger", chinese: "我有危险" },
    { english: "Where is the hospital?", chinese: "医院在哪里?" },
    { english: "Where is the police station?", chinese: "派出所在哪里?" },
    { english: "I was robbed", chinese: "我被抢劫了" },
    { english: "My passport is lost", chinese: "我的护照丢了" },
    { english: "Please help me", chinese: "请帮帮我" },
  ],
  quickReference: [
    { action: "Police", number: "110", note: "Crime, accident, emergency" },
    { action: "Ambulance", number: "120", note: "Medical emergency" },
    { action: "Fire", number: "119", note: "Fire, rescue" },
    { action: "Tourism", number: "12345", note: "Tourism complaints (formerly 12301)" },
    { action: "Consumer", number: "12315", note: "Consumer protection" },
  ],
  insuranceChecklist: [
    "Is medical evacuation covered?",
    "What is the claim process?",
    "Is hospital direct payment available?",
    "What documents are needed for claim?",
    "24/7 support number?",
    "Coverage for lost luggage?",
    "Personal liability coverage?",
  ],
};

export const EMERGENCY_FAQS = [
  {
    question: "What should I do first if my passport is lost?",
    answer:
      "Immediately file a police report at the nearest police station. This is essential for obtaining an emergency passport from your embassy. Keep multiple copies of your passport before travel.",
  },
  {
    question: "How do I call an ambulance in China?",
    answer:
      "Dial 120 for ambulance services. Most large hospitals have English-speaking staff. Major cities also have international clinics. Contact your hotel for translation help.",
  },
  {
    question: "Can I use my foreign health insurance in China?",
    answer:
      "Most foreign health insurances do not cover treatment in China directly. You may need to pay upfront and claim later. Check with your insurance about direct payment options or international coverage.",
  },
  {
    question: "What if I get scammed and lose money?",
    answer:
      "File a police report immediately. Contact your bank to try to stop the transfer. Report to the platform if it was an online transaction. Unfortunately, recovery rate is low.",
  },
  {
    question: "How do I contact my embassy in an emergency?",
    answer:
      "Save your embassy's emergency number before travel. Most embassies have 24/7 emergency lines. You can also visit the embassy in person for urgent matters like lost passports.",
  },
];
