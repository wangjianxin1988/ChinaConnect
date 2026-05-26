// Accommodation Guide Data - Stage 9: Hotels & Booking
export interface HotelType {
  type: string;
  icon: string;
  priceRange: string;
  priceRangeCn: string;
  description: string;
  descriptionCn: string;
  features: string[];
  featuresCn: string[];
  recommendedFor: string[];
  recommendedForCn: string[];
}

export interface BookingTip {
  category: string;
  icon: string;
  tip: string;
  tipCn: string;
  warning?: string;
  warningCn?: string;
}

export interface CheckInStep {
  step: number;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  details: string[];
  detailsCn: string[];
}

// Hotel Types - Stage 9
export const HOTEL_TYPES: HotelType[] = [
  {
    type: "Budget Hotels",
    icon: "🏨",
    priceRange: "100-300 CNY/night",
    priceRangeCn: "每晚100-300元",
    description:
      "Basic clean rooms, suitable for short stays. Chain brands like 7 Days, Home Inn, etc.",
    descriptionCn: "基本干净的房间，适合短期入住。如7天、如家等连锁品牌。",
    features: [
      "Basic amenities",
      "Free WiFi",
      "Air conditioning",
      "Private bathroom",
      "24h reception",
    ],
    featuresCn: ["基本设施", "免费WiFi", "空调", "独立卫生间", "24小时前台"],
    recommendedFor: ["Solo travelers", "Short stays", "Budget conscious"],
    recommendedForCn: ["独自旅行者", "短期住宿", "预算有限的旅客"],
  },
  {
    type: "Business Hotels",
    icon: "🏢",
    priceRange: "300-600 CNY/night",
    priceRangeCn: "每晚300-600元",
    description:
      "Comfortable rooms with business facilities. Brands like Holiday Inn, Sheraton, local chains.",
    descriptionCn: "舒适的客房和商务设施。如假日酒店、喜来登等国际品牌和国内连锁。",
    features: [
      "Business center",
      "Meeting rooms",
      "Fitness center",
      "Restaurant",
      "Laundry service",
    ],
    featuresCn: ["商务中心", "会议室", "健身中心", "餐厅", "洗衣服务"],
    recommendedFor: ["Business travelers", "Comfort seekers", "Longer stays"],
    recommendedForCn: ["商务旅客", "追求舒适的旅客", "长期住宿"],
  },
  {
    type: "Luxury Hotels",
    icon: "✨",
    priceRange: "800-3000+ CNY/night",
    priceRangeCn: "每晚800-3000+元",
    description: "Premium service and facilities. International brands in major cities.",
    descriptionCn: "优质服务和设施。主要城市的国际品牌酒店。",
    features: ["Premium bedding", "Spa and pool", "Fine dining", "Concierge", "Airport transfer"],
    featuresCn: ["优质床品", "水疗和泳池", "美食餐厅", "礼宾服务", "机场接送"],
    recommendedFor: ["Luxury travelers", "Honeymoon couples", "Special occasions"],
    recommendedForCn: ["奢华旅客", "蜜月情侣", "特殊场合"],
  },
  {
    type: "Boutique Hotels",
    icon: "🏡",
    priceRange: "400-1200 CNY/night",
    priceRangeCn: "每晚400-1200元",
    description:
      "Stylish unique properties with personalized service. Often in historic buildings.",
    descriptionCn: "时尚独特的设计，个性化服务。常位于历史建筑中。",
    features: [
      "Unique design",
      "Personalized service",
      "Local character",
      "Great location",
      "Breakfast included",
    ],
    featuresCn: ["独特设计", "个性化服务", "当地特色", "位置优越", "含早餐"],
    recommendedFor: ["Design lovers", "Couples", "Instagram-worthy stays"],
    recommendedForCn: ["设计爱好者", "情侣", "适合拍照分享"],
  },
  {
    type: "Hostels",
    icon: "🎒",
    priceRange: "50-150 CNY/night",
    priceRangeCn: "每晚50-150元",
    description: "Shared dorms and social atmosphere. Great for meeting other travelers.",
    descriptionCn: "共享宿舍和社交氛围。非常适合认识其他旅客。",
    features: [
      "Shared rooms",
      "Common areas",
      "Kitchen access",
      "Social events",
      "Luggage storage",
    ],
    featuresCn: ["共享房间", "公共区域", "厨房", "社交活动", "行李寄存"],
    recommendedFor: ["Backpackers", "Solo travelers", "Social butterflies"],
    recommendedForCn: ["背包客", "独自旅行者", "社交达人"],
  },
  {
    type: "Airbnb/Vacation Rentals",
    icon: "🏠",
    priceRange: "200-800 CNY/night",
    priceRangeCn: "每晚200-800元",
    description: "Apartments and homes for longer stays or groups. Kitchen and living space.",
    descriptionCn: "公寓和房屋，适合长期住宿或团体。配有厨房和客厅。",
    features: [
      "Full kitchen",
      "Living space",
      "Local neighborhood",
      "More privacy",
      "Washer/dryer",
    ],
    featuresCn: ["完整厨房", "客厅空间", "当地社区", "更多隐私", "洗衣机/烘干机"],
    recommendedFor: ["Families", "Groups", "Long stays"],
    recommendedForCn: ["家庭", "团体", "长期住宿"],
  },
];

// Check-in Process - Stage 9
export const CHECK_IN_STEPS: CheckInStep[] = [
  {
    step: 1,
    title: "Preparation Before Arrival",
    titleCn: "到达前准备",
    description: "Gather all necessary documents and confirm booking details.",
    descriptionCn: "准备好所有必要文件并确认预订详情。",
    details: [
      "Print or screenshot booking confirmation",
      "Note check-in time (usually 14:00)",
      "Download hotel app if available",
      "Save hotel address in Chinese",
      "Prepare ID/passport",
      "Have payment method ready",
    ],
    detailsCn: [
      "打印或截图预订确认",
      "注意入住时间（通常14:00）",
      "下载酒店应用（如有）",
      "用中文保存酒店地址",
      "准备好身份证/护照",
      "准备好支付方式",
    ],
  },
  {
    step: 2,
    title: "Arrival at Hotel",
    titleCn: "到达酒店",
    description: "Proceed to reception and present required documents.",
    descriptionCn: "到前台并提交所需文件。",
    details: [
      "Approach reception desk",
      "Present passport + booking confirmation",
      "Fill out registration form if required",
      "Provide contact details",
      "Confirm stay dates and room type",
      "Ask about amenities and breakfast",
    ],
    detailsCn: [
      "走到前台",
      "提交护照+预订确认",
      "如需要填写登记表",
      "提供联系方式",
      "确认入住日期和房型",
      "询问设施和早餐",
    ],
  },
  {
    step: 3,
    title: "Payment & Deposit",
    titleCn: "付款与押金",
    description: "Understand payment terms and provide deposit if required.",
    descriptionCn: "了解付款条款并按需要缴纳押金。",
    details: [
      "Confirm total cost and payment method",
      "Credit card imprint or cash deposit",
      "Understand deposit refund policy",
      "Get receipt for deposit",
      "Note checkout time",
      "Ask about early check-in/late checkout",
    ],
    detailsCn: [
      "确认总费用和支付方式",
      "刷信用卡预授权或付现金押金",
      "了解押金退款政策",
      "获取押金收据",
      "记下退房时间",
      "询问提前入住/延迟退房",
    ],
  },
  {
    step: 4,
    title: "Room Assignment",
    titleCn: "房间分配",
    description: "Receive room key and basic orientation.",
    descriptionCn: "领取房卡并了解基本情况。",
    details: [
      "Receive key card and room number",
      "Confirm WiFi password",
      "Understand elevator usage",
      "Note breakfast time and location",
      "Ask about check-out procedure",
      "Save emergency exits location",
    ],
    detailsCn: [
      "领取房卡和房间号",
      "确认WiFi密码",
      "了解电梯使用",
      "注意早餐时间和地点",
      "询问退房流程",
      "保存紧急出口位置",
    ],
  },
  {
    step: 5,
    title: "Room Inspection",
    titleCn: "房间检查",
    description: "Check room condition and report any issues immediately.",
    descriptionCn: "检查房间状况，有问题立即报告。",
    details: [
      "Check bed cleanliness",
      "Test bathroom facilities",
      "Verify AC and TV work",
      "Check WiFi connectivity",
      "Inspect for damages",
      "Report issues within 30 minutes",
    ],
    detailsCn: [
      "检查床铺清洁度",
      "测试浴室设施",
      "确认空调和电视正常",
      "检查WiFi连接",
      "检查是否有损坏",
      "30分钟内报告问题",
    ],
  },
];

// Booking Tips - Stage 9
export const BOOKING_TIPS: BookingTip[] = [
  {
    category: "Booking Platforms",
    icon: "💻",
    tip: "Use Trip.com, Ctrip, or Booking.com for English interface and better support.",
    tipCn: "使用携程、Trip.com或Booking.com获取英文界面和更好的支持。",
    warning: "Verify hotel ratings and reviews before booking",
    warningCn: "预订前核实酒店评分和评价",
  },
  {
    category: "Location",
    icon: "📍",
    tip: "Stay near metro stations for easy access. Popular areas: city center, near attractions.",
    tipCn: "住在地铁站附近方便出行。热门区域：市中心、景点附近。",
    warning: "Check actual distance from metro, not just neighborhood",
    warningCn: "检查与地铁的实际距离，不要只看区域名称",
  },
  {
    category: "Cancellation Policy",
    icon: "📅",
    tip: "Choose flexible booking when uncertain. Free cancellation saves stress.",
    tipCn: "不确定时选择灵活预订。免费取消可以减轻压力。",
    warning: "Non-refundable rates are cheaper but inflexible",
    warningCn: "不可退款的房价更便宜但不灵活",
  },
  {
    category: "Reviews",
    icon: "⭐",
    tip: "Check recent reviews (within 6 months) for accurate picture.",
    tipCn: "查看近期（6个月内）的评价以获得准确信息。",
    warning: "Be cautious of newly renovated hotels with few reviews",
    warningCn: "对翻新的酒店要谨慎，评价少的情况下",
  },
  {
    category: "Communication",
    icon: "💬",
    tip: "Contact hotel via WeChat or email before arrival to confirm booking.",
    tipCn: "到达前通过微信或邮件联系酒店确认预订。",
    warning: "Keep booking confirmation number handy",
    warningCn: "保留预订确认号以便使用",
  },
  {
    category: "Price Comparison",
    icon: "💰",
    tip: "Check price on multiple platforms before booking. Same room may vary 20-30%.",
    tipCn: "预订前在多个平台比较价格。同样的房间可能相差20-30%。",
    warning: "Watch out for bait-and-switch with very low prices",
    warningCn: "注意极低价格的诱骗陷阱",
  },
];

export const HOTEL_HELPERS = {
  usefulPhrases: [
    { english: "I have a reservation for...", chinese: "我有预订..." },
    { english: "What time is breakfast?", chinese: "早餐几点?" },
    { english: "Can I have a late checkout?", chinese: "可以晚点退房吗?" },
    { english: "Where is the elevator?", chinese: "电梯在哪里?" },
    { english: "The WiFi is not working", chinese: "WiFi上不去" },
    { english: "Can I store my luggage?", chinese: "可以寄存行李吗?" },
    { english: "Please clean the room", chinese: "请打扫房间" },
    { english: "I need extra towels", chinese: "我需要额外的毛巾" },
  ],
  amenities: [
    { english: "Air conditioning", chinese: "空调" },
    { english: "Hot water", chinese: "热水" },
    { english: "WiFi", chinese: "无线网络" },
    { english: "Breakfast", chinese: "早餐" },
    { english: "Luggage storage", chinese: "行李寄存" },
    { english: "Laundry", chinese: "洗衣" },
    { english: "Parking", chinese: "停车" },
    { english: "Pool", chinese: "游泳池" },
    { english: "Gym", chinese: "健身房" },
  ],
  commonIssues: [
    { issue: "No hot water", solution: "Contact reception, may be scheduled maintenance" },
    { issue: "WiFi too slow", solution: "Ask for password reset, try different location" },
    { issue: "Room too noisy", solution: "Request room change, ask for quieter floor" },
    { issue: "AC not working", solution: "Request maintenance or room change" },
  ],
};

export const ACCOMMODATION_FAQS = [
  {
    question: "Do I need to register with police when checking in?",
    answer:
      "Yes, all foreign guests must complete a registration form. Hotels usually handle this automatically with your passport. Keep the registration receipt during your stay.",
  },
  {
    question: "Can I pay with foreign credit card?",
    answer:
      "Most hotels accept major international credit cards (Visa, Mastercard, Amex). Budget hotels may prefer cash or Chinese payment apps. Confirm payment methods when booking.",
  },
  {
    question: "Is tipping expected?",
    answer:
      "Tipping is not common or expected in Chinese hotels. A small tip for exceptional service is appreciated but not necessary.",
  },
  {
    question: "Can I check in early or checkout late?",
    answer:
      "Early check-in depends on availability. Late checkout is usually possible for a fee. Contact the hotel in advance to arrange.",
  },
  {
    question: "What should I do if there is a problem with my room?",
    answer:
      "Contact the front desk immediately via phone or in person. For urgent issues like AC failure, request a room change. Document issues with photos for reference.",
  },
  {
    question: "Are hostel dorms safe for solo travelers?",
    answer:
      "Most hostels provide lockers for valuables and have 24h reception. Read recent reviews for specific safety practices. Female-only dorms available at many hostels.",
  },
];
