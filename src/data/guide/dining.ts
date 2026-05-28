// Dining Guide Data - Stage 8: Food & Restaurants
export interface CuisineType {
  cuisine: string;
  icon: string;
  description: string;
  descriptionCn: string;
  popularDishes: string[];
  popularDishesCn: string[];
  tips: string[];
  tipsCn: string[];
  priceRange: string;
  priceRangeCn: string;
}

export interface DiningTip {
  category: string;
  icon: string;
  tip: string;
  tipCn: string;
  warning?: string;
  warningCn?: string;
}

export interface OrderingHelper {
  english: string;
  chinese: string;
  pronunciation: string;
  usage: string;
}

// Cuisine Types - Stage 8
export const CUISINE_TYPES: CuisineType[] = [
  {
    cuisine: "Sichuan (川菜)",
    icon: "🌶️",
    description:
      "Famous for bold flavors and famous mala (numbing-spicy) taste. Rich, hot, and bursting with flavor.",
    descriptionCn: "以大胆的风味和著名的麻辣（麻-辣）味道著称。浓郁、辛辣、充满风味。",
    popularDishes: [
      "Mapo Tofu (麻婆豆腐)",
      "Kung Pao Chicken (宫保鸡丁)",
      "Twice Cooked Pork (回锅肉)",
      "Spicy Hot Pot (麻辣火锅)",
    ],
    popularDishesCn: ["麻婆豆腐", "宫保鸡丁", "回锅肉", "麻辣火锅"],
    tips: [
      "Ask for mild if you cannot handle spice",
      "Mala numbs your lips temporarily",
      "Rice helps with the heat",
    ],
    tipsCn: ["如果不能吃辣可以要求微辣", "麻辣会让嘴唇暂时发麻", "米饭可以帮助解辣"],
    priceRange: "¥50-200/person",
    priceRangeCn: "每人50-200元",
  },
  {
    cuisine: "Cantonese (粤菜)",
    icon: "Dim Sum",
    description:
      "Light, fresh flavors with emphasis on natural taste. Famous for dim sum, seafood, and delicate preparation.",
    descriptionCn: "清淡、新鲜的风味，强调天然味道。以点心、海鲜和精致的制作著称。",
    popularDishes: [
      "Dim Sum (点心)",
      "Steamed Fish (清蒸鱼)",
      "Char Siu (叉烧)",
      "Shrimp Dumplings (虾饺)",
    ],
    popularDishesCn: ["点心", "清蒸鱼", "叉烧", "虾饺"],
    tips: [
      "Best dim sum in morning (7-11 AM)",
      "Try various small dishes",
      "Green tea aids digestion",
    ],
    tipsCn: ["点心早上最好（7-11点）", "尝试各种小菜", "绿茶帮助消化"],
    priceRange: "¥80-300/person",
    priceRangeCn: "每人80-300元",
  },
  {
    cuisine: "Beijing (京菜)",
    icon: "🥬",
    description:
      "Rich imperial cuisine with famous Peking Duck. Bold flavors and substantial portions.",
    descriptionCn: "以著名的北京烤鸭为代表的丰富宫廷菜。风味浓郁，分量足。",
    popularDishes: [
      "Peking Duck (北京烤鸭)",
      "Fried Scallion Pancake (葱油饼)",
      "Lamb Hotpot (涮羊肉)",
      "Jianbing (煎饼)",
    ],
    popularDishesCn: ["北京烤鸭", "葱油饼", "涮羊肉", "煎饼"],
    tips: [
      "Book Peking Duck restaurant in advance",
      "First visit to duck restaurant is a must",
      "Street food is excellent for snacks",
    ],
    tipsCn: ["提前预订烤鸭店", "第一次去烤鸭店是必须的", "街边小吃作为零食非常棒"],
    priceRange: "¥60-400/person",
    priceRangeCn: "每人60-400元",
  },
  {
    cuisine: "Hotpot (火锅)",
    icon: "🍲",
    description:
      "Interactive dining where you cook ingredients in a bubbling broth. Social and customizable.",
    descriptionCn: "互动式用餐，在沸腾的汤底中煮食材。社交性强，可定制。",
    popularDishes: [
      "Mala (Spicy) Hotpot",
      "Yin Yang (Half spicy/half plain)",
      "Beef slices",
      "Mushrooms and vegetables",
    ],
    popularDishesCn: ["麻辣火锅", "鸳鸯锅（一半辣一半清汤）", "牛肉片", "蘑菇和蔬菜"],
    tips: ["Dip beef in egg yolk for tenderness", "Try mala oil sauce", "Beware of bone pieces"],
    tipsCn: ["牛肉沾蛋黄更嫩", "尝试麻辣油碟", "注意骨头碎片"],
    priceRange: "¥80-200/person",
    priceRangeCn: "每人80-200元",
  },
  {
    cuisine: "Street Food",
    icon: "🍢",
    description: "Affordable, tasty, and everywhere. Great for quick bites and local experiences.",
    descriptionCn: "便宜、美味、到处都有。非常适合快速小吃和当地体验。",
    popularDishes: [
      "Jianbing (煎饼)",
      "Baozi (包子)",
      "Stinky Tofu (臭豆腐)",
      "Lamb Skewers (羊肉串)",
    ],
    popularDishesCn: ["煎饼", "包子", "臭豆腐", "羊肉串"],
    tips: [
      "Choose stalls with long queues (fresh)",
      "Wash with bottled water",
      "Best after sunset",
    ],
    tipsCn: ["选择排队长的摊位（新鲜）", "用瓶装水清洗", "日落后最佳"],
    priceRange: "¥5-30/item",
    priceRangeCn: "每件5-30元",
  },
];

// Dining Tips - Stage 8
export const DINING_TIPS: DiningTip[] = [
  {
    category: "Ordering",
    icon: "📋",
    tip: "Point at pictures or use translation apps. Many restaurants have photo menus.",
    tipCn: "指图片或使用翻译应用。许多餐厅有图片菜单。",
    warning: "Confirm prices before ordering at tourist restaurants",
    warningCn: "在旅游餐厅点餐前确认价格",
  },
  {
    category: "Utensils",
    icon: "🥢",
    tip: "Chopsticks are standard. Use spoon for soup and serving dishes.",
    tipCn: "筷子是标准的。用勺子喝汤和分菜。",
    warning: "Never stick chopsticks upright in rice (funeral ritual)",
    warningCn: "切勿将筷子插在米饭中（葬礼仪式）",
  },
  {
    category: "Tipping",
    icon: "💰",
    tip: "Tipping is not expected and rarely done. Service charge may be included.",
    tipCn: "不需要付小费，也很少这样做。可能已包含服务费。",
  },
  {
    category: "Seating",
    icon: "💺",
    tip: "Some restaurants require minimum order or charge per person. Check before sitting.",
    tipCn: "一些餐厅有最低消费或按人收费。入座前确认。",
  },
  {
    category: "BYOB",
    icon: "🍺",
    tip: "Most restaurants charge high prices for drinks. Can often bring your own.",
    tipCn: "大多数餐厅饮料价格高。经常可以自带。",
  },
  {
    category: "Payment",
    icon: "💳",
    tip: "Use mobile payment (Alipay/WeChat) at most restaurants. Cash at street stalls.",
    tipCn: "大多数餐厅使用移动支付（支付宝/微信）。街边小吃用现金。",
  },
  {
    category: "Reservations",
    icon: "📅",
    tip: "Popular restaurants get full. Book via Dianping app or ask hotel to call.",
    tipCn: "热门餐厅经常满座。通过大众点评预订或请酒店打电话。",
  },
  {
    category: "Dietary",
    icon: "🥜",
    tip: 'Use Chinese translations: "不要辣" (no spice), "不要味精" (no MSG), "素食" (vegetarian).',
    tipCn: '使用中文翻译："不要辣"、"不要味精"、"素食"。',
  },
];

// Dietary restriction guide
export interface DietaryRestriction {
  type: string;
  typeCn: string;
  icon: string;
  chinesePhrase: string;
  pronunciation: string;
  explanation: string;
  explanationCn: string;
  exampleDishes?: string[];
  exampleDishesCn?: string[];
}

export const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  {
    type: "Vegetarian",
    typeCn: "素食",
    icon: "🥬",
    chinesePhrase: "我是素食者",
    pronunciation: "wǒ shì sùshí zhě",
    explanation:
      "Vegetarian in China can be challenging as many dishes contain meat stock or are cooked with meat.",
    explanationCn: "在中国吃素可能比较困难，因为许多菜都含有肉汤或与肉一起烹调。",
    exampleDishes: [
      "Vegetable fried rice (ask for no egg if vegan)",
      "Steamed vegetables",
      "Tofu dishes",
    ],
    exampleDishesCn: ["蔬菜炒饭（如果是纯素不要鸡蛋）", "蒸蔬菜", "豆腐菜"],
  },
  {
    type: "Vegan",
    typeCn: "纯素",
    icon: "🌱",
    chinesePhrase: "我不吃肉、蛋、奶",
    pronunciation: "wǒ bù chī ròu, dàn, nǎi",
    explanation:
      "Avoid dishes with animal products including oyster sauce, fish sauce, and meat broth.",
    explanationCn: "避免含有动物产品的菜肴，包括蚝油、鱼露和肉汤。",
    exampleDishes: ["Plain rice and vegetables", "Tofu with chili sauce", "Vegetable dumplings"],
    exampleDishesCn: ["白饭和蔬菜", "麻辣豆腐", "蔬菜饺子"],
  },
  {
    type: "Halal",
    typeCn: "清真",
    icon: "☪️",
    chinesePhrase: "我吃清真食品",
    pronunciation: "wǒ chī qīngzhēn shípǐn",
    explanation:
      'Halal food is available in Muslim areas. Look for "清真" signs. Pork is prohibited.',
    explanationCn: '清真食品在穆斯林聚居区有售。寻找"清真"标识。猪肉禁止食用。',
    exampleDishes: ["Lamb skewers (羊肉串)", "Laghman (Pulled noodles)", "Hand-grilled mutton"],
    exampleDishesCn: ["羊肉串", "拉面", "手抓羊肉"],
  },
  {
    type: "Kosher",
    typeCn: "犹太洁食",
    icon: "✡️",
    chinesePhrase: "我需要犹太洁食",
    pronunciation: "wǒ xūyào yóutài jiéshí",
    explanation:
      "Kosher food is very limited in China. Most major cities have international restaurants.",
    explanationCn: "犹太洁食在中国非常有限。大多数主要城市有国际餐厅。",
    exampleDishes: [
      "International hotel restaurants",
      "Western chain restaurants",
      "Prepared food from home",
    ],
    exampleDishesCn: ["国际酒店餐厅", "西式连锁餐厅", "从家准备的食品"],
  },
];

export const ALLERGEN_CARDS = [
  {
    allergen: "Seafood/Shellfish",
    allergenCn: "海鲜/贝类",
    icon: "🦐",
    chinesePhrase: "我过敏海鲜",
    pronunciation: "wǒ guòmǐn hǎixiān",
    note: "Many Chinese dishes use fish sauce or shrimp paste",
    noteCn: "许多中国菜使用鱼露或虾酱",
  },
  {
    allergen: "Peanuts",
    allergenCn: "花生",
    icon: "🥜",
    chinesePhrase: "我过敏花生",
    pronunciation: "wǒ guòmǐn huāshēng",
    note: "Peanuts are common in Chinese cooking, especially in Sichuan cuisine",
    noteCn: "花生在中国烹饪中很常见，尤其是川菜",
  },
  {
    allergen: "Tree Nuts",
    allergenCn: "坚果",
    icon: "🌰",
    chinesePhrase: "我过敏坚果",
    pronunciation: "wǒ guòmǐn jiānguǒ",
    note: "Almonds, cashews, and chestnuts are common ingredients",
    noteCn: "杏仁、腰果和栗子是常见配料",
  },
  {
    allergen: "Eggs",
    allergenCn: "鸡蛋",
    icon: "🥚",
    chinesePhrase: "我过敏鸡蛋",
    pronunciation: "wǒ guòmǐn jīdàn",
    note: "Eggs are used in many dishes including noodles and buns",
    noteCn: "鸡蛋用于许多菜肴，包括面条和包子",
  },
  {
    allergen: "Dairy/Lactose",
    allergenCn: "乳制品/乳糖",
    icon: "🥛",
    chinesePhrase: "我不喝牛奶",
    pronunciation: "wǒ bù hē niúnǎi",
    note: "Many Chinese dishes contain milk or cheese (especially in fusion restaurants)",
    noteCn: "许多中国菜含有牛奶或奶酪（融合餐厅尤其如此）",
  },
  {
    allergen: "Gluten/Wheat",
    allergenCn: "麸质/小麦",
    icon: "🌾",
    chinesePhrase: "我对面筋过敏",
    pronunciation: "wǒ duì miànjīn guòmǐn",
    note: "Wheat is the basis of noodles, dumplings, and buns",
    noteCn: "小麦是面条、饺子和包子的基础",
  },
];

export const POPULAR_FOOD_CATEGORIES = [
  {
    category: "Street Food Tours",
    icon: "🍢",
    description: "Must-try: Jianbing, Chuanchuan, lamb skewers",
  },
  {
    category: "Fine Dining",
    icon: "✨",
    description: "Michelin starred restaurants and famous local institutions",
  },
  {
    category: "Local Markets",
    icon: "🏪",
    description: "Wet markets and food streets for authentic experiences",
  },
  {
    category: "Hotpot Chains",
    icon: "🍲",
    description: "Haidilao, Xiaofang, and local hotpot favorites",
  },
  { category: "Dim Sum", icon: "🥟", description: "Morning tea culture in Cantonese cities" },
  {
    category: "Night Markets",
    icon: "🌙",
    description: "Evening food streets with diverse offerings",
  },
];

// Ordering Helpers
export const ORDERING_HELPERS: OrderingHelper[] = [
  {
    english: "Menu please",
    chinese: "请给我菜单",
    pronunciation: "qǐng gěi wǒ cài dān",
    usage: "When seated",
  },
  {
    english: "I want this",
    chinese: "我要这个",
    pronunciation: "wǒ yào zhège",
    usage: "Pointing at menu item",
  },
  {
    english: "No spicy please",
    chinese: "不要辣",
    pronunciation: "bù yào là",
    usage: "Avoiding spice",
  },
  { english: "Less oil", chinese: "少油", pronunciation: "shǎo yóu", usage: "Dietary preference" },
  { english: "Half spicy", chinese: "微辣", pronunciation: "wēi là", usage: "Light spice" },
  {
    english: "Vegetable please",
    chinese: "请给我蔬菜",
    pronunciation: "qǐng gěi wǒ shūcài",
    usage: "Ordering vegetables",
  },
  { english: "Rice please", chinese: "米饭", pronunciation: "mǐfàn", usage: "With meal" },
  {
    english: "The bill please",
    chinese: "买单",
    pronunciation: "mǎidān",
    usage: "Requesting payment",
  },
  {
    english: "Can I pay by card?",
    chinese: "可以刷卡吗?",
    pronunciation: "kěyǐ shuākǎ ma?",
    usage: "Payment method",
  },
  {
    english: "Delicious, thank you",
    chinese: "很好吃,谢谢",
    pronunciation: "hěn hǎochī, xièxiè",
    usage: "Compliment",
  },
  {
    english: "Any MSG?",
    chinese: "有味精吗?",
    pronunciation: "yǒu wèijīng ma?",
    usage: "Checking ingredients",
  },
  {
    english: "No MSG please",
    chinese: "不要味精",
    pronunciation: "bù yào wèijīng",
    usage: "Dietary request",
  },
  {
    english: "Is this vegetarian?",
    chinese: "这是素食吗?",
    pronunciation: "zhè shì sùshí ma?",
    usage: "Checking ingredients",
  },
  { english: "Too spicy!", chinese: "太辣了!", pronunciation: "tài là le!", usage: "Emergency!" },
];

// Food Safety Tips
export const FOOD_SAFETY = [
  {
    icon: "💧",
    title: "Water Safety",
    titleCn: "饮水安全",
    tip: "Drink bottled water. Tap water is not recommended for drinking.",
    tipCn: "喝瓶装水。不建议直接饮用自来水。",
  },
  {
    icon: "🍜",
    title: "Hot Food Priority",
    titleCn: "优先热食",
    tip: "Eat food while hot. Buffet items left out may be risky.",
    tipCn: "趁热吃。暴露在外的自助餐食物可能有风险。",
  },
  {
    icon: "🥗",
    title: "Salad Caution",
    titleCn: "沙拉注意",
    tip: "Salads may have unboiled water. Peel fruits or choose cooked options.",
    tipCn: "沙拉可能用了未煮沸的水。剥皮水果或选择熟食。",
  },
  {
    icon: "🍦",
    title: "Ice Cream",
    titleCn: "冰淇淋",
    tip: "Commercial ice cream is safe. Avoid unknown street vendors.",
    tipCn: "商业冰淇淋是安全的。避免不明街边商贩。",
  },
];

export const DINING_FAQS = [
  {
    question: "How do I find good local restaurants?",
    answer:
      "Use Dianping (大众点评) app for reviews and rankings. Look for places with long queues of locals. Michelin and Black Pearl symbols indicate quality.",
  },
  {
    question: "Is it safe to eat street food?",
    answer:
      "Generally yes, if you choose stalls with good hygiene and high turnover. Look for locals eating there - if they are healthy, it is usually fine. Avoid food that has been sitting out.",
  },
  {
    question: "Do I need to tip in China?",
    answer:
      "No, tipping is not expected and not common in local restaurants. Some upscale international restaurants may add a service charge.",
  },
  {
    question: "What if I cannot eat spicy food?",
    answer:
      'Say "不要辣" (bù yào là) when ordering. Most restaurants can accommodate mild or no spice. Sichuan cuisine may still have some peppercorn flavor even without chili.',
  },
  {
    question: "How much should I budget for food?",
    answer:
      "Street food: 20-50 CNY/day, Casual restaurants: 50-150 CNY/meal, Mid-range: 100-300 CNY/meal, High-end: 500+ CNY/meal. Prices vary by city.",
  },
];
