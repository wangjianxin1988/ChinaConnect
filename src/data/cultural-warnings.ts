export interface CulturalWarning {
  id: string;
  category: string;
  categoryCn: string;
  icon: string;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  importance: "critical" | "warning" | "note";
  region?: string;
  regionCn?: string;
}

export const CULTURAL_WARNINGS: CulturalWarning[] = [
  // Numbers
  {
    id: "numbers-4",
    category: "Numbers",
    categoryCn: "数字",
    icon: "🔢",
    title: "Number 4 is Unlucky",
    titleCn: "数字4是不吉利的",
    description:
      'The number 4 sounds like "death" (si/死) in Chinese. Avoid giving gifts in sets of 4. Building floors and room numbers often skip 4.',
    descriptionCn: '数字4的发音与"死"相似。避免送4样一套的礼物。建筑楼层和房间号经常跳过4。',
    importance: "critical",
  },
  {
    id: "numbers-8",
    category: "Numbers",
    categoryCn: "数字",
    icon: "8️⃣",
    title: "Number 8 is Lucky",
    titleCn: "数字8是幸运的",
    description:
      '8 sounds like "prosperity" (fa/发). It is extremely lucky and often associated with wealth.',
    descriptionCn: '8的发音像"发"。这是非常吉利的数字，常与财富相关。',
    importance: "note",
  },
  {
    id: "numbers-6",
    category: "Numbers",
    categoryCn: "数字",
    icon: "6️⃣",
    title: "Number 6 is Good",
    titleCn: "数字6是好的",
    description: '6 sounds like "smooth" (liu/顺). It represents smoothness and good luck.',
    descriptionCn: '6的发音像"顺"。代表顺利和好运。',
    importance: "note",
  },

  // Colors
  {
    id: "color-white",
    category: "Colors",
    categoryCn: "颜色",
    icon: "⚪",
    title: "White is for Funerals",
    titleCn: "白色用于葬礼",
    description:
      "White is associated with death and mourning. Avoid wearing white to celebrations or giving white gifts.",
    descriptionCn: "白色与死亡和哀悼相关。避免穿白色参加庆典或送白色礼物。",
    importance: "critical",
  },
  {
    id: "color-red",
    category: "Colors",
    categoryCn: "颜色",
    icon: "🔴",
    title: "Red is Lucky",
    titleCn: "红色是吉祥的",
    description:
      "Red represents luck, happiness, and prosperity. It is used in celebrations and given as gifts (red envelopes).",
    descriptionCn: "红色代表好运、幸福和繁荣。用于庆典和送礼（红包）。",
    importance: "note",
  },
  {
    id: "color-green",
    category: "Colors",
    categoryCn: "颜色",
    icon: "🟢",
    title: "Green Hat is Bad",
    titleCn: "绿帽子是不吉利的",
    description:
      "Wearing a green hat implies your partner is unfaithful. Never give a green hat as a gift.",
    descriptionCn: "戴绿帽子暗示你的伴侣不忠。千万不要送绿帽子作为礼物。",
    importance: "warning",
  },

  // Gifts
  {
    id: "gift-knife",
    category: "Gift Etiquette",
    categoryCn: "送礼礼仪",
    icon: "🔪",
    title: "Never Give Knives",
    titleCn: "不要送刀",
    description:
      'Knives symbolize cutting ties or severing relationships. If given, leave a small coin to "pay" for it.',
    descriptionCn: '刀象征切断联系或关系。如果收到刀，放一枚小额硬币来"购买"它。',
    importance: "critical",
  },
  {
    id: "gift-clock",
    category: "Gift Etiquette",
    categoryCn: "送礼礼仪",
    icon: "🕐",
    title: "Never Give Clocks",
    titleCn: "不要送钟",
    description:
      'Clock sounds like "end" or "funeral" (songzhong). Giving a clock to Chinese hosts is very offensive.',
    descriptionCn: '钟的发音像"终"或"送终"。送钟给中国主人是非常不礼貌的。',
    importance: "critical",
  },
  {
    id: "gift-umbrella",
    category: "Gift Etiquette",
    categoryCn: "送礼礼仪",
    icon: "☂️",
    title: 'Umbrella is "Separation"',
    titleCn: '伞是"散"的谐音',
    description:
      'Umbrella sounds like "separation" (san). Avoid giving as a gift unless you want to suggest parting.',
    descriptionCn: '伞的发音像"散"。避免作为礼物，除非你想暗示分离。',
    importance: "warning",
  },
  {
    id: "gift-pear",
    category: "Gift Etiquette",
    categoryCn: "送礼礼仪",
    icon: "🍐",
    title: "Pear Means Separation",
    titleCn: "梨意味着分离",
    description: 'Pear sounds like "separation" (li). Do not give whole pears as gifts.',
    descriptionCn: '梨的发音像"离"。不要把整梨作为礼物送人。',
    importance: "warning",
  },
  {
    id: "gift-food",
    category: "Gift Etiquette",
    categoryCn: "送礼礼仪",
    icon: "🍎",
    title: "Bring Fruit to Hosts",
    titleCn: "带水果拜访主人",
    description: "Bring fruit (not pear) when visiting homes. Oranges and apples are safe choices.",
    descriptionCn: "拜访时带水果（不要梨）。橘子和苹果是安全的选择。",
    importance: "note",
  },

  // Dining
  {
    id: "dining-chopsticks",
    category: "Dining",
    categoryCn: "餐桌礼仪",
    icon: "🥢",
    title: "Chopstick Etiquette",
    titleCn: "筷子礼仪",
    description:
      "Do not stick chopsticks upright in rice (funeral ritual). Do not point with chopsticks.",
    descriptionCn: "不要把筷子插在米饭里（葬礼仪式）。不要用筷子指人。",
    importance: "critical",
  },
  {
    id: "dining-turntable",
    category: "Dining",
    categoryCn: "餐桌礼仪",
    icon: "🍽️",
    title: "Turntable Etiquette",
    titleCn: "转盘礼仪",
    description:
      "Turn slowly and wait if someone is reaching. Do not take food from someone elses section.",
    descriptionCn: "慢慢转动，如果有人在够菜就等待。不要从别人的区域夹菜。",
    importance: "warning",
  },
  {
    id: "dining-alcohol",
    category: "Dining",
    categoryCn: "餐桌礼仪",
    icon: "🍶",
    title: "Toast Etiquette",
    titleCn: "敬酒礼仪",
    description:
      "When toasting, hold cup lower than elders or seniors. Empty cup means more drinking.",
    descriptionCn: "敬酒时，杯子要比长辈或上司低。空杯意味着继续喝。",
    importance: "warning",
  },
  {
    id: "dining-leftovers",
    category: "Dining",
    categoryCn: "餐桌礼仪",
    icon: "🍚",
    title: "Leave Some Food",
    titleCn: "留点食物",
    description: "Leaving a small amount of food shows the host provided more than enough.",
    descriptionCn: "留少量食物表示主人提供了充足的食物。",
    importance: "note",
  },

  // Social
  {
    id: "social-questions",
    category: "Social",
    categoryCn: "社交",
    icon: "💬",
    title: "Personal Questions are Normal",
    titleCn: "个人问题是正常的",
    description:
      "Asking about salary, age, or marital status is not rude. It shows interest and care.",
    descriptionCn: "询问工资、年龄或婚姻状况不是不礼貌的。这表示关心和兴趣。",
    importance: "note",
  },
  {
    id: "social-bowing",
    category: "Social",
    categoryCn: "社交",
    icon: "🙇",
    title: "Nod or Slight Bow",
    titleCn: "点头或轻微鞠躬",
    description: "A slight nod or bow is polite. Handshakes are also common in business settings.",
    descriptionCn: "轻微点头或鞠躬是礼貌的。握手在商务场合也很常见。",
    importance: "note",
  },
  {
    id: "social-business-cards",
    category: "Social",
    categoryCn: "社交",
    icon: "💼",
    title: "Business Card Exchange",
    titleCn: "交换名片",
    description:
      "Present and receive business cards with both hands. Take time to read the card before putting it away.",
    descriptionCn: "用双手递接名片。收下名片后要仔细阅读再收起。",
    importance: "warning",
  },

  // Tipping
  {
    id: "tipping",
    category: "General",
    categoryCn: "一般",
    icon: "💰",
    title: "Tipping is Not Expected",
    titleCn: "不需要给小费",
    description: "Tipping is not customary in China. Good service is expected as standard.",
    descriptionCn: "在中国小费不是惯例。好的服务是标准期望。",
    importance: "note",
  },

  // Photography
  {
    id: "photo-restricted",
    category: "Photography",
    categoryCn: "摄影",
    icon: "📷",
    title: "Some Places Forbid Photos",
    titleCn: "一些地方禁止拍照",
    description: "Military areas, some museums, and certain attractions prohibit photography.",
    descriptionCn: "军事区域、一些博物馆和某些景点禁止拍照。",
    importance: "warning",
  },
  {
    id: "photo-people",
    category: "Photography",
    categoryCn: "摄影",
    icon: "👤",
    title: "Ask Before Photographing People",
    titleCn: "拍照前先询问",
    description:
      "Always ask permission before photographing individuals, especially elderly or children.",
    descriptionCn: "拍照前要征得同意，尤其是老人或儿童。",
    importance: "warning",
  },
];

export const IMPORTANCE_STYLES = {
  critical: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: "⚠️",
    label: "Critical",
    labelCn: "重要",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: "⚡",
    label: "Warning",
    labelCn: "注意",
  },
  note: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: "💡",
    label: "Note",
    labelCn: "提示",
  },
};

export const REGION_TRIGGERS: Record<string, string[]> = {
  tibet: ["tibet", "拉萨", "lhasa"],
  xinjiang: ["xinjiang", "乌鲁木齐", "urumqi"],
  sichuan: ["sichuan", "成都", "chengdu"],
  guangdong: ["guangdong", "canton", "广州", "guangzhou", "深圳", "shenzhen"],
  beijing: ["beijing", "北京"],
  shanghai: ["shanghai", "上海"],
};

export const REGION_WARNINGS: Record<string, CulturalWarning[]> = {
  tibet: [
    {
      id: "tibet-specific-1",
      category: "Religion",
      categoryCn: "宗教",
      icon: "🙏",
      title: "Respect Buddhist Customs",
      titleCn: "尊重佛教习俗",
      description: "Walk clockwise around monasteries. Remove hats and sunglasses inside temples.",
      descriptionCn: "绕佛寺顺时针行走。在寺内脱帽摘墨镜。",
      importance: "critical",
      region: "Tibet",
      regionCn: "西藏",
    },
  ],
};
