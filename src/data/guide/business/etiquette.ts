export interface EtiquetteCategory {
  id: string;
  icon: string;
  title: string;
  titleCn: string;
  summary: string;
  summaryCn: string;
  rules: EtiquetteRule[];
}

export interface EtiquetteRule {
  id: string;
  icon: string;
  title: string;
  titleCn: string;
  correct: string;
  correctCn: string;
  incorrect: string;
  incorrectCn: string;
  reason: string;
  reasonCn: string;
}

export const ETIQUETTE_DATA: EtiquetteCategory[] = [
  {
    id: "business-cards",
    icon: "🎴",
    title: "Business Card Exchange",
    titleCn: "名片交换礼仪",
    summary:
      "Exchanging business cards (ming片) is a formal ritual in Chinese business culture. Treat cards with respect.",
    summaryCn: "交换名片是中国商务文化中的正式礼节。对待名片要像对待对方本人一样尊重。",
    rules: [
      {
        id: "bc-1",
        icon: "🖐️",
        title: "Use Both Hands",
        titleCn: "双手递接名片",
        correct:
          "Present and receive business cards with both hands, with the text facing the recipient.",
        correctCn: "双手递出和接收名片，文字朝向对方。",
        incorrect: "Grasping the card between thumb and forefinger and flicking it casually.",
        incorrectCn: "单手捏着名片随意拨弄。",
        reason:
          "Two hands = respect. Holding the card disrespectfully implies you view the person casually.",
        reasonCn: "双手递接表示尊重。单手随意拿名片暗示你对对方不够重视。",
      },
      {
        id: "bc-2",
        icon: "👀",
        title: "Study the Card",
        titleCn: "仔细阅读名片",
        correct:
          "After receiving a card, take a moment to read it carefully. Place it on the table in front of you.",
        correctCn: "收到名片后，仔细阅读并放在桌上面前。",
        incorrect: "Pocketing the card immediately without looking, or writing on it.",
        incorrectCn: "收到后立刻放入口袋不查看，或在名片上写字。",
        reason:
          "Shows you value the person's title, company, and role. Placing the card on the table shows you are organized.",
        reasonCn: "表示重视对方的职位、公司。把名片放在桌上表明你做事有条理。",
      },
      {
        id: "bc-3",
        icon: "📋",
        title: "Card Folder or Case",
        titleCn: "使用名片夹或名片盒",
        correct: "Keep business cards in a dedicated card holder or elegant folder.",
        correctCn: "使用专门的名片夹或精致文件夹存放名片。",
        incorrect: "Storing cards loosely in a pocket, wallet, or bag where they can bend.",
        incorrectCn: "随手放在口袋、钱包或包里，容易折损。",
        reason:
          "A dedicated card case projects professionalism and protects the cards from damage.",
        reasonCn: "专用名片夹展现专业形象，同时保护名片不受损坏。",
      },
      {
        id: "bc-4",
        icon: "🔤",
        title: "Language Side",
        titleCn: "文字面朝向对方",
        correct:
          "When presenting, hold the card so the recipient can immediately read it in their preferred language.",
        correctCn: "递出时将名片方向调整好，方便对方直接阅读自己熟悉的语言面。",
        incorrect:
          "Handing a card with the foreign language side facing up when presenting to a Chinese counterpart.",
        incorrectCn: "递给中方伙伴时，将外文面朝上递出。",
        reason:
          "Consideration for the recipient's reading convenience. Flipping the card wastes a few seconds.",
        reasonCn: "为对方阅读方便考虑。翻转名片会浪费几秒钟，给人不流畅的感觉。",
      },
    ],
  },
  {
    id: "dining",
    icon: "🍜",
    title: "Dining Etiquette",
    titleCn: "餐桌礼仪",
    summary:
      "Chinese business dining is a key relationship-building activity. Seating, toasting, and serving all carry deep meaning.",
    summaryCn: "中国商务宴请是建立关系的关键环节。座次、敬酒、上菜都有讲究。",
    rules: [
      {
        id: "de-1",
        icon: "💺",
        title: "Seating Arrangement",
        titleCn: "座次安排",
        correct:
          "The host sits facing the door; the most honored guest sits to the host's right. Wait to be seated.",
        correctCn: "主人面朝门口而坐，最尊贵的客人坐在主人右侧。等候安排座位。",
        incorrect: "Sitting wherever you like or rushing to the best seat.",
        incorrectCn: "随意入座或抢座。",
        reason:
          "Seating reflects hierarchy and respect. Taking an improper seat is a major social mistake.",
        reasonCn: "座次体现等级和尊重。坐错位置是重大失礼。",
      },
      {
        id: "de-2",
        icon: "🥢",
        title: "Wait Before Eating",
        titleCn: "等主人先动筷",
        correct:
          'Wait for the host to say "请 (qǐng)" or make the first toast before picking up chopsticks.',
        correctCn: '等主人说"请"或先举杯敬酒后，再动筷子。',
        incorrect: "Starting to eat immediately when food is served, before any formal signal.",
        incorrectCn: "菜一上桌就立即开吃。",
        reason:
          "Starting first implies you are too eager or that the host's authority is not recognized.",
        reasonCn: "先于主人动筷暗示你太急切，或不认可主人的主导地位。",
      },
      {
        id: "de-3",
        icon: "🥂",
        title: "Toast Exchange",
        titleCn: "敬酒礼仪",
        correct:
          "When toasting, hold your glass lower than the senior person's glass. Make eye contact during the toast.",
        correctCn: "敬酒时酒杯低于对方。敬酒时要注视对方。",
        incorrect:
          "Holding your glass at the same height or above, or looking away while toasting.",
        incorrectCn: "敬酒时举杯与对方平齐或更高，或敬酒时移开视线。",
        reason: "Holding the glass lower = showing respect. Eye contact = sincerity.",
        reasonCn: "杯口低于对方=表示尊敬。对视=表示真诚。",
      },
      {
        id: "de-4",
        icon: "🍶",
        title: "Baijiu Etiquette",
        titleCn: "白酒礼仪",
        correct:
          "In formal settings, baijiu (Chinese liquor) is often the drink of choice. Accept and toast graciously.",
        correctCn: "正式场合白酒往往是首选。优雅地接受并参与敬酒。",
        incorrect: "Refusing alcohol outright in a group setting without explanation.",
        incorrectCn: "在集体场合直接拒绝饮酒且不解释。",
        reason:
          "Declining all alcohol can seem like rejection of the relationship. Offer a polite substitute if needed.",
        reasonCn: "完全拒绝饮酒可能被视为拒绝建立关系。如需婉拒，可提出替代方案。",
      },
      {
        id: "de-5",
        icon: "🐟",
        title: "Fish Finishes",
        titleCn: "鱼不翻面",
        correct:
          "When eating fish, use chopsticks to pick around the bones. Do not flip the fish over.",
        correctCn: "吃鱼时用筷子拨开鱼骨挑取鱼肉，不要把鱼翻面。",
        incorrect: "Flipping a fish over to get the other side, which is considered bad luck.",
        incorrectCn: "把鱼翻过来吃另一边，在商务餐中视为不吉利。",
        reason:
          "Flipping a fish symbolizes capsizing a boat — bad luck in business. Finish one side, then lift the bone.",
        reasonCn: "翻鱼象征翻船，在商务场合被视为不吉利。吃完一面后，用筷子挑起鱼骨继续吃另一面。",
      },
    ],
  },
  {
    id: "meetings",
    icon: "🏢",
    title: "Meeting Etiquette",
    titleCn: "会议礼仪",
    summary:
      "Chinese business meetings value punctuality, hierarchy, and ritual. Understanding these norms earns trust.",
    summaryCn: "中国商务会议重视准时、等级和仪式。了解这些规范有助于赢得信任。",
    rules: [
      {
        id: "me-1",
        icon: "⏰",
        title: "Punctuality",
        titleCn: "准时到达",
        correct:
          "Arrive 5–10 minutes early. Being late is disrespectful and damages your reputation.",
        correctCn: "提前5-10分钟到达。迟到是不尊重，会损害你的声誉。",
        incorrect: "Arriving exactly on time or late, even by a few minutes.",
        incorrectCn: "踩点到达或迟到，哪怕只晚几分钟。",
        reason:
          "In Chinese business culture, punctuality demonstrates seriousness and reliability.",
        reasonCn: "在中国商务文化中，准时体现认真态度和可靠形象。",
      },
      {
        id: "me-2",
        icon: "🎁",
        title: "Gift Protocol",
        titleCn: "礼品礼仪",
        correct: "Present gifts with both hands. Gifts are usually not opened immediately.",
        correctCn: "双手递送礼品。对方通常不会当场打开礼品。",
        incorrect: "Handing over a gift with one hand, or pressuring the recipient to open it.",
        incorrectCn: "单手递礼品，或催促对方当场打开。",
        reason:
          "Gifts carry symbolic meaning. Presenting with two hands = respect. Opening immediately is considered greedy.",
        reasonCn: "礼品有象征意义。双手递送=尊重。当场打开显得贪婪。",
      },
      {
        id: "me-3",
        icon: "🗣️",
        title: "Hierarchy in Speech",
        titleCn: "发言顺序",
        correct:
          "The most senior person speaks first. Allow seniors to set the agenda and direction.",
        correctCn: "职位最高者先发言。允许上级主导议程和方向。",
        incorrect:
          "Starting a presentation or jumping to conclusions before senior colleagues have spoken.",
        incorrectCn: "在上司发言前就开始汇报或下结论。",
        reason:
          "Speaking out of turn disrupts the hierarchy. Wait for the senior person to open the floor.",
        reasonCn: "越级发言打乱等级秩序。等职位高者先开场。",
      },
      {
        id: "me-4",
        icon: "☎️",
        title: "Phone Etiquette",
        titleCn: "手机使用",
        correct: "Silence your phone completely. Step outside if you must take an urgent call.",
        correctCn: "完全静音手机。如必须接听紧急电话，请到外面接听。",
        incorrect: "Checking your phone during a meeting or leaving calls on.",
        incorrectCn: "会议期间查看手机或开着铃声。",
        reason:
          "A ringing phone during a meeting is extremely disrespectful, regardless of who calls.",
        reasonCn: "会议期间手机响铃是极不尊重的行为，无论来电者是谁。",
      },
    ],
  },
  {
    id: "gift-giving",
    icon: "🎀",
    title: "Gift Giving",
    titleCn: "商务送礼",
    summary:
      "Gift giving in Chinese business builds and maintains relationships. The right gift can open doors.",
    summaryCn: "商务送礼在中国是建立和维护关系的重要方式。合适的礼品可以打开局面。",
    rules: [
      {
        id: "gg-1",
        icon: "🔴",
        title: "Avoid Red Packaging for Funerals",
        titleCn: "避免红色包装用于不吉利场合",
        correct:
          "Use red sparingly if at all. Elegant wrapping in muted colors (gold, navy, black) is always safe.",
        correctCn: "慎用红色。优雅的深色包装（金色、深蓝、黑色）永远安全。",
        incorrect:
          "Giving clocks, scissors, umbrellas, or anything in sets of four (unlucky numbers).",
        incorrectCn: '送钟、剪刀、伞，或任何以"四"为单位的东西（不吉利数字）。',
        reason:
          'Clocks (送钟) sounds like "attending a funeral" in Chinese. Four sounds like "death." Avoid these completely.',
        reasonCn: '"钟"与"终"同音，送钟有"送终"之意。四与"死"谐音。完全避免。',
      },
      {
        id: "gg-2",
        icon: "🍫",
        title: "Safe Gift Options",
        titleCn: "安全礼品选择",
        correct:
          "Quality tea, high-end liquor, premium snacks, electronics, or locally unavailable items from your country.",
        correctCn: "优质茶叶、高端酒类、精品小吃、电子产品，或来自你国家的当地特产。",
        incorrect:
          "Giving too personal gifts (perfume, jewelry) unless you have a close personal relationship.",
        incorrectCn: "送太私人的礼品（香水、珠宝），除非你们有很深的私人关系。",
        reason:
          "Culturally neutral or regional specialties are safe. Personal gifts can create uncomfortable obligation.",
        reasonCn: "文化中立或地域特产是安全选择。私人礼品可能造成不舒服的义务感。",
      },
      {
        id: "gg-3",
        icon: "📦",
        title: "Gift Presentation",
        titleCn: "礼品递交",
        correct:
          'Present with both hands. Say "这是我的一点心意" (This is a small token of my appreciation).',
        correctCn: '双手递出，说"这是我的一点心意"。',
        incorrect: "Pressuring the recipient to accept, or presenting in a casual manner.",
        incorrectCn: "强迫对方收下，或随意递出。",
        reason:
          "Two hands = respect. A humble phrase downplays the gift's value to avoid making the recipient feel obligated.",
        reasonCn: "双手=尊重。谦逊的话语降低了礼品的价值感，避免让对方感到有压力。",
      },
    ],
  },
];
