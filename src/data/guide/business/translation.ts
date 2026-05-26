export interface TranslationService {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  category: "interpretation" | "translation" | "certified" | " localisation";
  languages: string[];
  priceRange: string;
  priceRangeCn: string;
  features: string[];
  featuresCn: string[];
  delivery: string;
  deliveryCn: string;
}

export interface TranslationFAQ {
  q: string;
  qCn: string;
  a: string;
  aCn: string;
}

export const TRANSLATION_SERVICES: TranslationService[] = [
  {
    id: "consecutive-interpreting",
    name: "Consecutive Interpreting",
    nameCn: "交替传译",
    description:
      "The interpreter listens to the speaker and then translates after each pause. Common in meetings, negotiations, and dining.",
    descriptionCn: "译员聆听讲话者发言，在每次停顿后进行翻译。适用于会议、谈判和宴请等场合。",
    category: "interpretation",
    languages: [
      "English ↔ Chinese",
      "Japanese ↔ Chinese",
      "Korean ↔ Chinese",
      "French ↔ Chinese",
      "German ↔ Chinese",
    ],
    priceRange: "CNY 1,500–4,000/day",
    priceRangeCn: "人民币 1,500–4,000/天",
    features: [
      "Day rate covers 8 hours of interpreting",
      "Overtime charged at CNY 200–500/hour",
      "Transportation and accommodation for off-site events",
      "Industry-specific vocabulary preparation",
    ],
    featuresCn: [
      "日费涵盖8小时口译",
      "加班按人民币200-500/小时收费",
      "场外活动的交通和住宿",
      "行业专有词汇准备",
    ],
    delivery: "Real-time during the event",
    deliveryCn: "活动期间实时进行",
  },
  {
    id: "simultaneous-interpreting",
    name: "Simultaneous Interpreting",
    nameCn: "同声传译",
    description:
      "The interpreter translates in real time while the speaker continues, requiring specialized equipment. Used in large conferences and summits.",
    descriptionCn: "译员在讲话者继续发言的同时实时翻译，需要专业设备。适用于大型会议和峰会。",
    category: "interpretation",
    languages: ["English ↔ Chinese", "Multilingual packages available"],
    priceRange: "CNY 6,000–15,000/day/interpreter",
    priceRangeCn: "人民币 6,000–15,000/天/译员",
    features: [
      "Requires booth, headsets, and equipment",
      "Two interpreters per language pair (shifts every 20 min)",
      "Equipment rental: CNY 3,000–8,000/day",
      "Technical operator required",
    ],
    featuresCn: [
      "需要翻译间、耳机和设备",
      "每语言对需要两名译员（每20分钟轮换）",
      "设备租赁费：人民币3,000-8,000/天",
      "需要技术操作员",
    ],
    delivery: "Real-time with 2–5 second delay",
    deliveryCn: "实时进行，延迟2-5秒",
  },
  {
    id: "document-translation",
    name: "Document Translation",
    nameCn: "文件笔译",
    description:
      "Translation of business documents, contracts, reports, and marketing materials. Standard turnaround is 1–3 working days per 3,000 words.",
    descriptionCn: "商务文件、合同、报告、营销材料翻译。标准交付周期为每3,000字1-3个工作日。",
    category: "translation",
    languages: [
      "English ↔ Chinese",
      "Japanese ↔ Chinese",
      "Korean ↔ Chinese",
      "Spanish ↔ Chinese",
      "Arabic ↔ Chinese",
    ],
    priceRange: "CNY 300–800/1,000 words",
    priceRangeCn: "人民币 300–800/千字",
    features: [
      "Industry-specialized translators available",
      "Two rounds of editing and quality check",
      "Glossary consistency for long documents",
      "Rush service available (50–100% surcharge)",
    ],
    featuresCn: [
      "可提供行业专业译员",
      "两轮编辑和质检",
      "长文档术语一致性保障",
      "加急服务可选（加收50-100%）",
    ],
    delivery: "3,000 Chinese characters or 1,000 English words per working day",
    deliveryCn: "每工作日处理3,000中文字或1,000英文词",
  },
  {
    id: "legal-certification",
    name: "Legal & Certified Translation",
    nameCn: "法律公证翻译",
    description:
      "Translation of legal documents with official certification for visa applications, company registration, and court submissions. Documents must be stamped by an accredited translation agency.",
    descriptionCn:
      "法律文件翻译附带官方认证，用于签证申请、公司注册和法院提交。文件须由认证翻译机构盖章。",
    category: "certified",
    languages: ["English ↔ Chinese", "All major languages"],
    priceRange: "CNY 500–2,000/document",
    priceRangeCn: "人民币 500–2,000/份文件",
    features: [
      "Official stamp from an accredited translation agency",
      "Notarization available (公证) at additional cost",
      "Apostille service for international use",
      "Accepted by Chinese embassies and government offices",
    ],
    featuresCn: [
      "认证翻译机构盖章",
      "可提供公证（费用另计）",
      "海牙认证服务（国际使用）",
      "为中国驻外使领馆和政府机构接受",
    ],
    delivery: "2–5 working days (standard), 1–2 days (rush)",
    deliveryCn: "2-5个工作日（标准），1-2天（加急）",
  },
  {
    id: "business-localisation",
    name: "Business Localization Service",
    nameCn: "商务本地化",
    description:
      "Full adaptation of business materials for the Chinese market — websites, marketing campaigns, product descriptions, and app content — with cultural adaptation.",
    descriptionCn:
      "为中国市场全面本地化商务材料——网站、营销活动、产品描述和APP内容——包括文化适配。",
    category: "localisation",
    languages: [
      "English → Chinese (Simplified & Traditional)",
      "Japanese → Chinese",
      "Korean → Chinese",
    ],
    priceRange: "CNY 5,000–50,000/project",
    priceRangeCn: "人民币 5,000–50,000/项目",
    features: [
      "Native Chinese writers with cultural expertise",
      "Website/app localization with QA testing",
      "Marketing copy written for Chinese audiences",
      "Cultural consultation included",
    ],
    featuresCn: [
      "具备文化专业知识的中文母语写作者",
      "含QA测试的网站/APP本地化",
      "面向中国受众撰写的营销文案",
      "包含文化咨询",
    ],
    delivery: "Per agreed project milestones",
    deliveryCn: "按约定的项目里程碑交付",
  },
];

export const TRANSLATION_FAQS: TranslationFAQ[] = [
  {
    q: "How do I book a translator on short notice?",
    qCn: "如何紧急预约翻译服务？",
    a: "Many agencies offer rush services with 24–48 hours notice. For consecutive interpreting, a same-day booking is possible in major cities (Beijing, Shanghai, Guangzhou) with a 50–100% rush surcharge. Simultaneous interpreting requires at least 3–5 days for equipment preparation.",
    aCn: "许多翻译机构提供24-48小时通知的加急服务。同声传译在大城市（北京、上海、广州）可当天预约，需加收50-100%加急费。同声传译需要至少3-5天准备设备。",
  },
  {
    q: "What credentials should I look for in a translator?",
    qCn: "选择翻译员应该看哪些资质？",
    a: "Look for: (1) A recognized translation qualification (e.g., CATTI — China Accreditation Test for Translators and Interpreters), (2) Industry experience — a legal translator should have law background, (3) Native-level fluency in the target language, (4) Reviews from previous corporate clients.",
    aCn: "查看：(1) 认可的翻译资质（如CATTI——全国翻译专业资格水平考试），(2) 行业经验——法律翻译需有法律背景，(3) 目标语言的母语水平，(4) 此前企业客户评价。",
  },
  {
    q: "Can translators help with WeChat communication during meetings?",
    qCn: "翻译员能在会议期间协助微信沟通吗？",
    a: "Yes. Some interpreters also provide on-site WeChat support, helping with translating messages, explaining local payment apps, and assisting with any real-time digital communication needs during the visit.",
    aCn: "可以。部分译员也提供现场微信支持，在访问期间帮助翻译消息、解释本地支付APP，以及协助任何实时数字沟通需求。",
  },
  {
    q: "How are travel expenses calculated for off-site interpreting?",
    qCn: "场外口译的差旅费用如何计算？",
    a: "Travel expenses are typically added on top of the day rate. This includes round-trip transportation (flights, trains, car rental) and accommodation if the event is outside the interpreter's city. Get a full cost breakdown before confirming.",
    aCn: "差旅费用通常在日费基础上另计。包括往返交通（机票、高铁、包车）和住宿（如活动在译员所在城市以外）。确认前请获取完整费用明细。",
  },
  {
    q: "Do I need certified translation for my visa application?",
    qCn: "申请签证需要认证翻译吗？",
    a: "Most Chinese embassies and visa centers require certified translation for all supporting documents. The certification must come from a licensed translation agency with an official seal. Documents must include the translator's name and certification number.",
    aCn: "大多数中国驻外使领馆和签证中心要求所有证明文件提供认证翻译。认证须来自持有许可证的翻译机构并加盖公章。文件须包含译员姓名和认证编号。",
  },
];
